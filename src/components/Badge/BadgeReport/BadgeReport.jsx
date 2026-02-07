import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  ButtonGroup,
  Input,
  Card,
  CardTitle,
  CardBody,
  CardImg,
  CardText,
  DropdownToggle,
  FormGroup,
  UncontrolledDropdown,
  UncontrolledPopover,
  DropdownMenu,
  DropdownItem,
  UncontrolledTooltip,
} from 'reactstrap';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from 'html-to-pdfmake';
import moment from 'moment';
import 'moment-timezone';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { boxStyle, boxStyleDark } from '~/styles';
import { formatDate } from '~/utils/formatDate';
import hasPermission from '~/utils/permissions';
import { changeBadgesByUserID } from '../../../actions/badgeManagement';
import '../../../styles/badges.module.css';
import { getUserProfile } from '../../../actions/userProfile';
import { PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE } from '~/utils/constants';
import BadgeImage from '../BadgeImage';
import PropTypes from 'prop-types';
import DeleteBadgeModal from './DeleteBadgeModal';

pdfMake.vfs = pdfFonts.vfs;

export async function imageToUri(url, callback) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const baseImage = new Image();
  baseImage.crossOrigin = 'anonymous';

  // Fallback image URL or blank image data URL
  // const fallbackImage =
  //   'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAwAB/4H6YwAAAABJRU5ErkJggg=='; // 1x1 transparent PNG

  baseImage.src = url.replace('dropbox.com', 'dl.dropboxusercontent.com');
  baseImage.src = baseImage.src.replace('www.dropbox.com', 'dl.dropboxusercontent.com');

  baseImage.onload = function handleImageLoad() {
    canvas.width = baseImage.width;
    canvas.height = baseImage.height;

    ctx.drawImage(baseImage, 0, 0);
    const uri = canvas.toDataURL('image/png');
    callback(uri);

    canvas.remove();
  };

  baseImage.onerror = function handleImageError() {
    // Use fallback image on error
    canvas.width = 1;
    canvas.height = 1;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 1, 1);
    const uri = canvas.toDataURL('image/png');
    callback(uri);

    canvas.remove();
  };
}

function createBadgeHtml(badge) {
  const imageUrl = badge.badge?.imageUrl || '';
  const badgeName = badge.badge?.badgeName || 'Unknown Badge';
  const description = badge.badge?.description || 'No description available';

  return new Promise(resolve => {
    imageToUri(imageUrl, uri => {
      const badgeHtml = `
      <table>
        <thead>
          <tr>
            <th>Badge Image</th>
            <th>Badge Name, Count Awarded & Badge Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><img src="${uri}" /></td>
            <td>${badgeName} - ${description}</td>
          </tr>
        </tbody>
      </table>`;
      resolve(badgeHtml);
    });
  });
}

async function FormatReportForPdf(badges, callback) {
  const bgReport = [];
  bgReport[0] = `<h3>Badge Report (Page 1 of ${Math.ceil(badges.length / 4)})</h3>`;

  const badgePromises = badges.map(badge => createBadgeHtml(badge));
  const badgesHtml = await Promise.all(badgePromises);

  callback(bgReport.concat(badgesHtml).join(''));
}

function BadgeReport(props) {
  const [sortBadges, setSortBadges] = useState([]);
  const [numFeatured, setNumFeatured] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [badgeToDelete, setBadgeToDelete] = useState([]);
  const [savingChanges, setSavingChanges] = useState(false);

  const canDeleteBadges = props.hasPermission('deleteBadges');
  const canUpdateBadges = props.hasPermission('updateBadges');

  const darkMode = props.darkMode;

  const canAssignBadges = props.hasPermission('assignBadges');
  const canModifyBadgeAmount = props.hasPermission('modifyBadgeAmount');

  const pdfDocGenerator = async () => {
    const currentDate = moment().format('MM-DD-YYYY-HH-mm-ss');
    const badges = sortBadges.slice();

    FormatReportForPdf(badges, formattedReport => {
      const html = htmlToPdfmake(formattedReport, { tableAutoSize: true });

      const docDefinition = {
        content: [html],
        pageBreakBefore: currentNode => currentNode.style?.includes('pdf-pagebreak-before'),
        styles: {
          'html-div': { margin: [0, 4, 0, 4] },
          name: { background: 'white' },
        },
      };
      pdfMake.createPdf(docDefinition).download(`Badge-Report-${currentDate}`);
    });
  };

  const pdfFeaturedDocGenerator = async () => {
    const currentDate = moment().format('MM-DD-YYYY-HH-mm-ss');
    const featuredBadges = sortBadges.filter(badge => badge.featured);

    FormatReportForPdf(featuredBadges, formattedReport => {
      const html = htmlToPdfmake(formattedReport, { tableAutoSize: true });

      const docDefinition = {
        content: [html],
        pageBreakBefore: currentNode => currentNode.style?.includes('pdf-pagebreak-before'),
        styles: {
          'html-div': { margin: [0, 4, 0, 4] },
          name: { background: 'white' },
        },
      };
      pdfMake.createPdf(docDefinition).download(`Featured-Badge-Report-${currentDate}`);
    });
  };

  const handlePDFOnClick = () => {
    // Ensure pdfFeaturedDocGenerator function is correctly defined and imported
    if (pdfDocGenerator) pdfDocGenerator();
    else console.error('pdfDocGenerator is not defined');
  };

  useEffect(() => {
    let isMounted = true; // flag to track if component is mounted

    const initializeBadges = () => {
      const badges = structuredClone(props.badges) || [];
      const newBadges = badges.slice();

      if (isMounted) {
        newBadges.sort((a, b) => {
          if (a.badge.ranking === 0) return 1;
          if (b.badge.ranking === 0) return -1;
          if (a.badge.ranking > b.badge.ranking) return 1;
          if (a.badge.ranking < b.badge.ranking) return -1;
          if (a.badge.badgeName > b.badge.badgeName) return 1;
          if (a.badge.badgeName < b.badge.badgeName) return -1;
          return 0;
        });

        setNumFeatured(0);
        for (const badge of newBadges) {
          if (badge.featured) {
            setNumFeatured(prev => prev + 1);
          }
          if (typeof badge === 'string') {
            badge.lastModified = new Date(badge.lastModified);
          }
        }
        setSortBadges(newBadges);
      }
    };

    initializeBadges();

    return () => {
      isMounted = false; // cleanup function
    };
  }, [props.badges]);

  const countChange = (badge, index, newValue) => {
    let copyOfExisitingBadges = [...sortBadges];
    newValue = newValue === null || newValue === undefined ? -1 : Number.parseInt(newValue);
    if (newValue < 0 || !copyOfExisitingBadges || copyOfExisitingBadges.length === 0) {
      toast.error(
        'Error: Invalid badge count or the badge does not exist in the badge records. Please refresh the page. If the problem persists, please contact the administrator.',
      );
      return;
    }

    const recordBeforeUpdate = props.badges.filter(item => item.badge._id === badge.badge._id);
    if (recordBeforeUpdate.length) {
      const badgePrevState = badge;
      if (newValue === 0) {
        handleDeleteBadge(badgePrevState);
        return;
      } else {
        const badgeCountFromExistingRecord = Number.parseInt(recordBeforeUpdate[0].count);
        const currentDate = new Date(Date.now());
        const formattedDate = formatDate(currentDate);

        copyOfExisitingBadges = copyOfExisitingBadges.map(item => {
          if (item._id === badge._id) {
            if (newValue > badgePrevState.count && newValue >= badgeCountFromExistingRecord) {
              if (recordBeforeUpdate[0].hasBadgeDeletionImpact === false) {
                item.hasBadgeDeletionImpact = false;
              }
              if (newValue > badgeCountFromExistingRecord) {
                item.earnedDate = [...item.earnedDate, formattedDate];
              }
            } else if (newValue < badgePrevState.count && newValue < badgeCountFromExistingRecord) {
              item.hasBadgeDeletionImpact = true;
            } else if (
              newValue < badgePrevState.count &&
              newValue >= badgeCountFromExistingRecord
            ) {
              item.earnedDate = item.earnedDate.slice(0, -1);
            }
            item.count = newValue;
            return item;
          }
          return item;
        });
      }
      setSortBadges(copyOfExisitingBadges);
    } else {
      toast.error(
        'Error: The badge may not exist in the badge records. Please refresh the page. If the problem persists, please contact the administrator.',
      );
    }
  };

  const featuredChange = (badge, index, e) => {
    const newBadges = sortBadges.slice();

    if ((e.target.checked && numFeatured < 5) || !e.target.checked) {
      newBadges[index].featured = e.target.checked;

      let count = 0;
      for (const badge of newBadges) {
        if (badge.featured) count++;
      }
      setNumFeatured(count);
    } else {
      e.target.checked = false;
      toast.error('Unfortunately, you may only select five badges to be featured.');
    }
    setSortBadges(newBadges);
  };

  const handleDeleteBadge = oldBadge => {
    setShowModal(true);
    setBadgeToDelete(oldBadge);
  };

  const handleCancel = () => {
    setShowModal(false);
    if (badgeToDelete) {
      const index = sortBadges.findIndex(badge => badge.badge._id === badgeToDelete.badge._id);
      countChange(badgeToDelete, index, badgeToDelete.count);
    }
    setBadgeToDelete([]);
  };

  const deleteBadge = () => {
    let newBadges = sortBadges.filter(badge => badge._id !== badgeToDelete._id);
    if (badgeToDelete.featured) {
      setNumFeatured(prevCount => prevCount - 1);
    }
    setSortBadges(newBadges);
    toast.success('Badges deleted successfully.');
    setShowModal(false);
    setBadgeToDelete([]);
  };

  const saveChanges = async () => {
    setSavingChanges(true);

    try {
      const newBadgeCollection = structuredClone(sortBadges);

      for (const badge of newBadgeCollection) {
        badge.badge = badge.badge._id;
      }

      await props.changeBadgesByUserID(props.userId, newBadgeCollection);
      await props.getUserProfile(props.userId);

      props.setUserProfile(prevProfile => ({
        ...prevProfile,
        badgeCollection: sortBadges,
      }));

      props.setOriginalUserProfile(prevProfile => ({
        ...prevProfile,
        badgeCollection: sortBadges,
      }));

      toast.success('Badges successfully saved.');

      props.handleSubmit();
      props.close();
    } catch (error) {
      console.error('Error saving badges:', error);
      toast.error('Failed to save badges. Please try again.');
    } finally {
      setSavingChanges(false);
    }
  };

  return (
    <div>
      <div className="desktop">
        <div style={{ overflowY: 'auto', height: '75vh' }}>
          <Table className={darkMode ? 'text-light' : ''}>
            <thead style={{ zIndex: '10' }}>
              <tr style={{ zIndex: '10' }}>
                <th style={{ width: '90px' }}>Badge</th>
                <th>Name</th>
                <th style={{ width: '110px' }}>Modified</th>
                <th style={{ width: '110px' }}>Earned Dates</th>
                <th style={{ width: '90px' }}>Count</th>
                {canDeleteBadges ? <th>Delete</th> : null}
                <th style={{ width: '70px', zIndex: '1' }}>Featured</th>
              </tr>
            </thead>
            <tbody>
              {sortBadges?.length ? (
                sortBadges.map((value, index) => (
                  <tr key={value._id}>
                    <td className="badge_image_sm">
                      <span id={'popover_' + index} style={{ display: 'inline-block' }}>
                        <BadgeImage
                          personalBestMaxHrs={props.personalBestMaxHrs}
                          className
                          count={value.count}
                          badgeData={value.badge}
                          index={index}
                          cssSuffix="_report"
                        />
                      </span>
                    </td>

                    <UncontrolledPopover trigger="hover" target={'popover_' + index}>
                      <Card className="text-center">
                        <CardImg className="badge_image_lg" src={value.badge?.imageUrl} />
                        <CardBody>
                          <CardTitle
                            style={{
                              fontWeight: 'bold',
                              fontSize: 18,
                              color: '#285739',
                              marginBottom: 15,
                            }}
                          >
                            {value.badge?.badgeName}
                          </CardTitle>
                          <CardText>{value.badge?.description}</CardText>
                        </CardBody>
                      </Card>
                    </UncontrolledPopover>

                    <td>{value.badge.badgeName}</td>
                    <td>
                      {typeof value.lastModified === 'string'
                        ? formatDate(value.lastModified)
                        : value.lastModified.toLocaleString('en-US', {
                            timeZone: 'America/Los_Angeles',
                          })}
                    </td>

                    <td style={{ display: 'flex', alignItems: 'center' }}>
                      <UncontrolledDropdown className="me-2" direction="down">
                        <DropdownToggle
                          caret
                          color="primary"
                          style={darkMode ? boxStyleDark : boxStyle}
                        >
                          Dates
                        </DropdownToggle>
                        <DropdownMenu className="badge_dropdown">
                          {value.earnedDate.map((date, i) => (
                            <DropdownItem key={`${date}-${i}`}>{date}</DropdownItem>
                          ))}
                        </DropdownMenu>
                      </UncontrolledDropdown>

                      {value.hasBadgeDeletionImpact && (
                        <>
                          <span id="mismatchExplainationTooltip" style={{ paddingLeft: '3px' }}>
                            *
                          </span>
                          <UncontrolledTooltip
                            placement="bottom"
                            target="mismatchExplainationTooltip"
                            style={{ maxWidth: '300px' }}
                          >
                            This record contains a mismatch in the badge count and associated dates.
                            It indicates that a badge has been deleted. Despite the deletion, we
                            retain the earned date to ensure a record of the badge earned for
                            historical purposes.
                          </UncontrolledTooltip>
                        </>
                      )}
                    </td>

                    <td>
                      {canUpdateBadges ? (
                        <Input
                          type="number"
                          value={Math.round(value.count)}
                          min={0}
                          step={1}
                          onChange={e => countChange(value, index, e.target.value)}
                        />
                      ) : (
                        Math.round(value.count)
                      )}
                    </td>

                    {canDeleteBadges && (
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => handleDeleteBadge(value)}
                          style={darkMode ? boxStyleDark : boxStyle}
                        >
                          Delete
                        </button>
                      </td>
                    )}

                    <td style={{ textAlign: 'center' }}>
                      <FormGroup check inline style={{ zIndex: 0 }}>
                        <Input
                          type="checkbox"
                          id={value.badge._id}
                          checked={value.featured}
                          onChange={e => featuredChange(value, index, e)}
                          disabled={canModifyBadgeAmount && !(canUpdateBadges || canAssignBadges)}
                        />
                      </FormGroup>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center' }}>
                    {`${props.isUserSelf ? 'You have' : 'This person has'} no badges.`}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
        <Button
          className="btn--dark-sea-green float-right"
          style={darkMode ? { ...boxStyleDark, margin: 5 } : { ...boxStyle, margin: 5 }}
          disabled={savingChanges}
          onClick={saveChanges}
        >
          Save Changes
        </Button>
        <Button
          className="btn--dark-sea-green float-right"
          style={darkMode ? { ...boxStyleDark, margin: 5 } : { ...boxStyle, margin: 5 }}
          onClick={handlePDFOnClick}
        >
          Export All Badges to PDF
        </Button>
        <Button
          className="btn--dark-sea-green float-right"
          style={darkMode ? { ...boxStyleDark, margin: 5 } : { ...boxStyle, margin: 5 }}
          onClick={handlePDFOnClick}
        >
          Export Selected/Featured Badges to PDF
        </Button>

        <DeleteBadgeModal
          isOpen={showModal}
          onCancel={handleCancel}
          onDelete={deleteBadge}
          darkMode={darkMode}
          boxStyle={boxStyle}
          boxStyleDark={boxStyleDark}
        />
      </div>

      <div className="tablet">
        <div style={{ overflow: 'auto', height: '68vh' }}>
          <Table className={darkMode ? 'text-light' : ''}>
            <thead style={{ zIndex: '10' }}>
              <tr style={{ zIndex: '10' }}>
                <th style={{ width: '93px' }}>Badge</th>
                <th>Name</th>
                <th style={{ width: '110px' }}>Modified</th>
                <th style={{ width: '110px' }} data-testid="tablet-earned-dates">
                  Earned Dates
                </th>{' '}
                {/*Earned dates for tablet view*/}
                <th style={{ width: '80px' }}></th> {/* Ensure Options column is included here */}
              </tr>
            </thead>
            <tbody>
              {sortBadges?.length ? (
                sortBadges.map((value, index) => (
                  <tr key={value._id}>
                    <td className="badge_image_sm">
                      {' '}
                      <BadgeImage
                        personalBestMaxHrs={props.personalBestMaxHrs}
                        count={value.count}
                        badgeData={value.badge}
                        index={index}
                        cssSuffix={'_report'}
                      />
                    </td>
                    <td>{value.badge.badgeName}</td>
                    <td>
                      {typeof value.lastModified == 'string'
                        ? formatDate(value.lastModified)
                        : value.lastModified.toLocaleString('en-US', {
                            timeZone: 'America/Los_Angeles',
                          })}
                    </td>
                    <td>
                      {' '}
                      {/* Add Dates */}
                      <UncontrolledDropdown className="me-2" direction="down">
                        <DropdownToggle
                          caret
                          color="primary"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '80px',
                          }}
                        >
                          Dates
                        </DropdownToggle>
                        <DropdownMenu className="badge_dropdown">
                          {value.earnedDate.map((date, i) => (
                            <DropdownItem key={`${date}-${i}`}>{date}</DropdownItem>
                          ))}
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </td>{' '}
                    {/* Add dates */}
                    <td>
                      <ButtonGroup style={{ marginLeft: '8px' }}>
                        <UncontrolledDropdown>
                          <DropdownToggle
                            caret
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '80px',
                            }}
                          >
                            Options
                          </DropdownToggle>

                          <DropdownMenu>
                            <DropdownItem
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                whiteSpace: 'now-rap',
                                gap: '8px',
                                height: '60px',
                              }}
                              toggle={false}
                            >
                              <span style={{ fontWeight: 'bold' }}>Count:</span>
                              {canUpdateBadges ? (
                                <Input
                                  type="number"
                                  value={Math.round(value.count)}
                                  min={0}
                                  step={1}
                                  onChange={e => {
                                    countChange(value, index, e.target.value);
                                  }}
                                  style={{ width: '70px' }}
                                ></Input>
                              ) : (
                                Math.round(value.count)
                              )}
                            </DropdownItem>
                            <DropdownItem divider />
                            <DropdownItem
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                whiteSpace: 'now-rap',
                                gap: '8px',
                                height: '60px',
                              }}
                              toggle={false}
                            >
                              <span style={{ fontWeight: 'bold' }}>Featured:</span>
                              <FormGroup check inline style={{ zIndex: '0' }}>
                                <Input
                                  /* alternative to using the formgroup
                                  style={{ position: 'static' }}
                                  */
                                  type="checkbox"
                                  id={value.badge._id}
                                  checked={value.featured}
                                  onChange={e => {
                                    featuredChange(value, index, e);
                                  }}
                                />
                              </FormGroup>
                            </DropdownItem>
                            <DropdownItem divider />
                            <DropdownItem
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '60px',
                              }}
                            >
                              {canDeleteBadges ? (
                                <button
                                  className="btn btn-danger"
                                  onClick={() => handleDeleteBadge(sortBadges[index])}
                                >
                                  Delete
                                </button>
                              ) : null}
                            </DropdownItem>
                          </DropdownMenu>
                        </UncontrolledDropdown>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center' }}>
                    {`${props.isUserSelf ? 'You have' : 'This person has'} no badges.`}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Button
            className="btn--dark-sea-green float-right"
            style={{ margin: 5 }}
            onClick={e => {
              if (props.isRecordBelongsToJaeAndUneditable) {
                alert(PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE);
              }
              saveChanges();
            }}
          >
            <span>Save Changes</span>
          </Button>
          <Button
            className="btn--dark-sea-green float-right"
            style={{ margin: 5 }}
            onClick={pdfDocGenerator}
          >
            <span>Export All Badges to PDF</span>
          </Button>
          <Button
            disabled={numFeatured === 0}
            className="btn--dark-sea-green float-right"
            style={{ margin: 5 }}
            onClick={pdfFeaturedDocGenerator}
          >
            <span>Export Selected/Featured Badges to PDF</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = state => {
  return { state };
};

const mapDispatchToProps = dispatch => ({
  changeBadgesByUserID: (userId, badges) => dispatch(changeBadgesByUserID(userId, badges)),
  getUserProfile: userId => dispatch(getUserProfile(userId)),
  hasPermission: permission => dispatch(hasPermission(permission)),
});

BadgeReport.propTypes = {
  hasPermission: PropTypes.func.isRequired,
  changeBadgesByUserID: PropTypes.func.isRequired,
  getUserProfile: PropTypes.func.isRequired,

  badges: PropTypes.arrayOf(PropTypes.object).isRequired, // array of badge objects
  userId: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,

  setUserProfile: PropTypes.func.isRequired,
  setOriginalUserProfile: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired,
  isUserSelf: PropTypes.bool,
  personalBestMaxHrs: PropTypes.number,
  isRecordBelongsToJaeAndUneditable: PropTypes.bool,
};

export default connect(mapStateToProps, mapDispatchToProps)(BadgeReport);
