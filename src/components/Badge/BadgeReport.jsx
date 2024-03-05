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
  Modal,
  ModalBody,
  ModalFooter,
  FormGroup,
  UncontrolledDropdown,
  UncontrolledPopover,
  DropdownMenu,
  DropdownItem,
  UncontrolledTooltip,
} from 'reactstrap';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from 'html-to-pdfmake';
import moment from 'moment';
import 'moment-timezone';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { boxStyle } from 'styles';
import { formatDate } from 'utils/formatDate';
import hasPermission from '../../utils/permissions';
import { changeBadgesByUserID } from '../../actions/badgeManagement';
import './BadgeReport.css';
import { getUserProfile } from '../../actions/userProfile';

pdfMake.vfs = pdfFonts.pdfMake.vfs;
function BadgeReport({
  badges,
  firstName,
  lastName,
  userId,
  setUserProfile,
  setOriginalUserProfile,
  handleSubmit,
  close,
  isUserSelf,
  isRecordBelongsToJaeAndUneditable,
}) {
  const [sortBadges, setSortBadges] = useState(JSON.parse(JSON.stringify(badges)) || []);
  const [numFeatured, setNumFeatured] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [badgeToDelete, setBadgeToDelete] = useState([]);

  const canDeleteBadges = hasPermission('deleteBadges');
  const canUpdateBadges = hasPermission('updateBadges');

  async function imageToUri(url, callback) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const baseImage = new Image();
    baseImage.crossOrigin = 'anonymous';
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
  }

  const FormatReportForPdf = (badgesAll, callback) => {
    const bgReport = [];
    bgReport[0] = `<h3>Badge Report (Page 1 of ${Math.ceil(badgesAll.length / 4)})</h3>
    <div style="margin-bottom: 20px; color: orange;"><h4>For ${firstName} ${lastName}</h4></div>
    <div style="color:#DEE2E6; margin:10px 0px 20px 0px; text-align:center;">_______________________________________________________________________________________________</div>`;
    for (let i = 0; i < badgesAll.length; i += 1) {
      imageToUri(badgesAll[i].badge.imageUrl, function(uri) {
        bgReport[i + 1] = `
        <table>
          <thead>
            <tr>
              <th>Badge Image</th>
              <th>Badge Name, Count Awarded & Badge Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="width:160px">
                <div><img height="150" width="150" src=${uri}/></div>
              </td>
              <td style="width:500px">
                <div><b>Name:</b> <span class="name">${badgesAll[i].badge.badgeName}</span></div>
                <div><b>Count:</b> ${badgesAll[i].count}</div>
                <div><b>Description:</b> ${badgesAll[i].badge.description}</div>
              </td>
            </tr>
          </tbody>
      </table>
      ${
        (i + 1) % 4 === 0 && i + 1 !== badgesAll.length
          ? `</br></br></br>
      <h3>Badge Report (Page ${1 + Math.ceil((i + 1) / 4)} of ${Math.ceil(
              badgesAll.length / 4,
            )})</h3>
    <div style="margin-bottom: 20px; color: orange;"><h4>For ${firstName} ${lastName}</h4></div>
    <div style="color:#DEE2E6; margin:10px 0px 20px 0px; text-align:center;">_______________________________________________________________________________________________</div>
      `
          : ''
      }`;
        if (i === badgesAll.length - 1) {
          setTimeout(() => {
            callback(bgReport.join('\n'));
          }, 100);
        }
      });
    }
  };

  const pdfDocGenerator = async () => {
    const CurrentDate = moment().format('MM-DD-YYYY-HH-mm-ss');
    const badges = sortBadges.slice();
    FormatReportForPdf(badges, formattedReport => {
      const html = htmlToPdfmake(formattedReport, {
        tableAutoSize: true,
      });
      const docDefinition = {
        content: [html],
        pageBreakBefore(currentNode) {
          return currentNode.style && currentNode.style.indexOf('pdf-pagebreak-before') > -1;
        },
        styles: {
          'html-div': { margin: [0, 4, 0, 4] },
          name: {
            background: 'white',
          },
        },
      };
      pdfMake.createPdf(docDefinition).download(`Badge-Report-${CurrentDate}`);
    });
  };

  const pdfFeaturedDocGenerator = async () => {
    const CurrentDate = moment().format('MM-DD-YYYY-HH-mm-ss');
    let badgesAll = sortBadges.slice();
    badgesAll = badgesAll.filter(badge => {
      if (badge.featured) {
        return true;
      }
      return false;
    });

    FormatReportForPdf(badgesAll, formattedReport => {
      const html = htmlToPdfmake(formattedReport, { tableAutoSize: true });
      const docDefinition = {
        content: [html],
        pageBreakBefore(currentNode) {
          return currentNode.style && currentNode.style.indexOf('pdf-pagebreak-before') > -1;
        },
        styles: {
          'html-div': { margin: [0, 4, 0, 4] },
          name: {
            background: 'white',
          },
        },
      };
      pdfMake.createPdf(docDefinition).download(`Featured-Badge-Report-${CurrentDate}`);
    });
  };

  useEffect(() => {
    setSortBadges(JSON.parse(JSON.stringify(badges)) || []);
    const newBadges = sortBadges.slice();
    newBadges.sort((a, b) => {
      if (a.badge.ranking === 0) return 1;
      if (b.badge.ranking === 0) return -1;
      if (a.badge.ranking > b.badge.ranking) return 1;
      if (a.badge.ranking < b.badge.ranking) return -1;
      if (a.badge.badgeName > b.badge.badgeName) return 1;
      if (a.badge.badgeName < b.badge.badgeName) return -1;
      return 0;
    });

    // Update numFeatured with the correct value
    let updatedNumFeatured = 0;

    newBadges.forEach((badge, index) => {
      if (badge.featured) {
        updatedNumFeatured += 1;
      }

      if (typeof newBadges[index] === 'string') {
        newBadges[index].lastModified = new Date(newBadges[index].lastModified);
      }
    });

    // Update the state with the computed value
    setNumFeatured(updatedNumFeatured);
    setSortBadges(newBadges);
  }, [badges]);

  const handleDeleteBadge = oldBadge => {
    setShowModal(true);
    setBadgeToDelete(oldBadge);
  };

  const countChange = (badge, index, newValue) => {
    let copyOfExisitingBadges = [...sortBadges];
    // eslint-disable-next-line no-param-reassign
    newValue = newValue === null || newValue === undefined ? -1 : parseInt(newValue, 10);
    if (newValue < 0 || !copyOfExisitingBadges || copyOfExisitingBadges.length === 0) {
      toast.error(
        'Error: Invalid badge count or the badge is not exist in the badge records. Please fresh the page. If the problem persists, please contact the administrator.',
      );
      return;
    }

    const recordBeforeUpdate = badges.filter(item => item.badge._id === badge.badge._id);
    // New requirement: We want to keep to the earned date so that there's still a record
    // that badges were earned. hasBadgeDeletionImpact indicates a deletion has occured.
    // The original code which remove the earned date is deleted.
    if (recordBeforeUpdate.length !== 0) {
      const badgePrevState = badge;
      if (newValue === 0) {
        // Prev states before onChange event
        handleDeleteBadge(badgePrevState);
        // let newBadges = sortBadges.filter(badge => badge.badge._id !== badgeToDelete.badge._id);
        // setSortBadges(newBadges);
        return;
      }
      // Value of the existing record from the database before frontend udpate commit to db.
      const badgeCountFromExsitingRecord = parseInt(recordBeforeUpdate[0].count, 10);

      const currentDate = new Date(Date.now());
      const formatedDate = formatDate(currentDate);
      // new > prev && new > exsiting: check impact of deletion and push new date. Case: decrease and increase. Remove temp asterisk.
      // new > prev && new < exsiting: do nothihng
      // new < prev && new < exsiting: set deletion flag to true
      // new < prev && new > exsiting OR new < pre && new === existing: remove earned date. Case: increase then decrease. Remove temp added earned dates.
      // new > prev && new === exsiting: remove temp asterisk
      copyOfExisitingBadges = copyOfExisitingBadges.map(item => {
        if (item.badge._id === badge.badge._id) {
          const updatedItem = { ...item };

          if (newValue > badgePrevState.count && newValue >= badgeCountFromExsitingRecord) {
            if (recordBeforeUpdate[0].hasBadgeDeletionImpact === false) {
              updatedItem.hasBadgeDeletionImpact = false;
            }
            if (newValue > badgeCountFromExsitingRecord) {
              updatedItem.earnedDate = [...updatedItem.earnedDate, formatedDate];
            }
          } else if (newValue < badgePrevState.count && newValue < badgeCountFromExsitingRecord) {
            updatedItem.hasBadgeDeletionImpact = true;
          } else if (newValue < badgePrevState.count && newValue >= badgeCountFromExsitingRecord) {
            updatedItem.earnedDate = updatedItem.earnedDate.slice(0, -1);
          }

          updatedItem.count = newValue;
          return updatedItem;
        }
        return item;
      });

      setSortBadges(copyOfExisitingBadges);
    } else {
      toast.error(
        'Error: The badge may not exist in the badge records. Please fresh the page. If the problem persists, please contact the administrator.',
      );
    }
  };

  const featuredChange = (badge, index, e) => {
    const newBadges = sortBadges.slice();
    if ((e.target.checked && numFeatured < 5) || !e.target.checked) {
      const count = 0;
      setNumFeatured(count);
      newBadges[index].featured = e.target.checked;
      newBadges.forEach(item => {
        if (item.featured) {
          const updatedCount = count + 1;
          setNumFeatured(updatedCount);
        }
      });
    } else {
      e.target.checked = false;
      toast.error('Unfortunately, you may only select five badges to be featured.');
    }
    setSortBadges(newBadges);
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
    const newBadges = sortBadges.filter(badge => badge.badge._id !== badgeToDelete.badge._id);
    if (badgeToDelete.featured) {
      const updatedNumFeatured = numFeatured - 1;
      setNumFeatured(updatedNumFeatured);
    }
    setSortBadges(newBadges);
    setShowModal(false);
    setBadgeToDelete([]);
  };

  const saveChanges = async () => {
    const newBadgeCollection = JSON.parse(JSON.stringify(sortBadges));
    for (let i = 0; i < newBadgeCollection.length; i += 1) {
      newBadgeCollection[i].badge = newBadgeCollection[i].badge._id;
    }

    await changeBadgesByUserID(userId, newBadgeCollection);
    await getUserProfile(userId);

    setUserProfile(prevProfile => {
      return { ...prevProfile, badgeCollection: sortBadges };
    });
    setOriginalUserProfile(prevProfile => {
      return { ...prevProfile, badgeCollection: sortBadges };
    });
    handleSubmit();
    // close the modal
    close();
  };

  return (
    <div>
      <div className="desktop">
        <div style={{ overflowY: 'scroll', height: '75vh' }}>
          <Table>
            <thead style={{ zIndex: '10' }}>
              <tr style={{ zIndex: '10' }}>
                <th style={{ width: '90px' }}>Badge</th>
                <th>Name</th>
                <th style={{ width: '110px' }}>Modified</th>
                <th style={{ width: '110px' }}>Earned Dates</th>
                <th style={{ width: '90px' }}>Count</th>
                {canDeleteBadges ? <th>Delete</th> : []}
                <th style={{ width: '70px', zIndex: '1' }}>Featured</th>
              </tr>
            </thead>
            <tbody>
              {sortBadges && sortBadges.length ? (
                sortBadges.map((value, index) => (
                  <tr key={index}>
                    <td className="badge_image_sm">
                      {' '}
                      <img src={value.badge.imageUrl} id={`popover_${index.toString()}`} alt="" />
                    </td>
                    <UncontrolledPopover trigger="hover" target={`popover_${index.toString()}`}>
                      <Card className="text-center">
                        <CardImg className="badge_image_lg" src={value?.badge?.imageUrl} />
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
                        ? // ? formatDate(value.lastModified.substring(0, 10))
                          formatDate(value.lastModified)
                        : value.lastModified.toLocaleString('en-US', {
                            timeZone: 'America/Los_Angeles',
                          })}
                    </td>
                    <td style={{ display: 'flex', alignItems: 'center' }}>
                      {' '}
                      <UncontrolledDropdown className="me-2" direction="down">
                        <DropdownToggle caret color="primary" style={boxStyle}>
                          Dates
                        </DropdownToggle>
                        <DropdownMenu className="badge_dropdown">
                          {value.earnedDate.map((date, i) => {
                            return <DropdownItem key={i}>{date}</DropdownItem>;
                          })}
                        </DropdownMenu>
                      </UncontrolledDropdown>
                      {value.hasBadgeDeletionImpact && value.hasBadgeDeletionImpact === true ? (
                        <>
                          <span id="mismatchExplainationTooltip" style={{ paddingLeft: '3px' }}>
                            {'  '} *
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
                      ) : null}
                    </td>
                    <td>
                      {canUpdateBadges ? (
                        <Input
                          type="number"
                          value={Math.round(value.count)}
                          min={0}
                          step={1}
                          onChange={e => {
                            countChange(value, index, e.target.value);
                          }}
                        />
                      ) : (
                        Math.round(value.count)
                      )}
                    </td>
                    {canDeleteBadges ? (
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={e => handleDeleteBadge(sortBadges[index])}
                          style={boxStyle}
                        >
                          Delete
                        </button>
                      </td>
                    ) : (
                      []
                    )}
                    <td style={{ textAlign: 'center' }}>
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
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center' }}>
                    {`${isUserSelf ? 'You have' : 'This person has'} no badges.`}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
        <Button
          className="btn--dark-sea-green float-right"
          style={{ ...boxStyle, margin: 5 }}
          onClick={e => {
            saveChanges();
          }}
        >
          Save Changes
        </Button>
        <Button
          className="btn--dark-sea-green float-right"
          style={{ ...boxStyle, margin: 5 }}
          onClick={pdfDocGenerator}
        >
          Export All Badges to PDF
        </Button>
        <Button
          className="btn--dark-sea-green float-right"
          style={{ ...boxStyle, margin: 5 }}
          onClick={pdfFeaturedDocGenerator}
        >
          Export Selected/Featured Badges to PDF
        </Button>
        <Modal isOpen={showModal}>
          <ModalBody>
            <p>Woah, easy tiger! Are you sure you want to delete this badge?</p>
            <br />
            <p>
              Note: Even if you click &quot;Yes, Delete&quot;, this won&apos;t be fully deleted
              until you click the &quot;Save Changes&quot; button below.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => handleCancel()} style={boxStyle}>
              Cancel
            </Button>
            <Button color="danger" onClick={() => deleteBadge()} style={boxStyle}>
              Yes, Delete
            </Button>
          </ModalFooter>
        </Modal>
      </div>
      <div className="tablet">
        <div style={{ overflow: 'auto', height: '68vh' }}>
          <Table>
            <thead style={{ zIndex: '10' }}>
              <tr style={{ zIndex: '10' }}>
                <th style={{ width: '93px' }}>Badge</th>
                <th>Name</th>
                <th style={{ width: '110px' }}>Modified</th>
                <th style={{ width: '100%', zIndex: '10' }}>Earned</th>
              </tr>
            </thead>
            <tbody>
              {sortBadges && sortBadges.length ? (
                sortBadges.map((value, index) => (
                  <tr key={index}>
                    <td className="badge_image_sm">
                      {' '}
                      <img
                        src={value.badge.imageUrl}
                        id={`popover_${index.toString()}`}
                        alt="" // Add alt attribute with an empty string for decorative images
                      />
                    </td>
                    <UncontrolledPopover trigger="hover" target={`popover_${index.toString()}`}>
                      <Card className="text-center">
                        <CardImg className="badge_image_lg" src={value?.badge?.imageUrl} />
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
                                />
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
                                  type="button"
                                  className="btn btn-danger"
                                  onClick={() => handleDeleteBadge(sortBadges[index])}
                                  onKeyDown={event => {
                                    if (event.key === 'Enter') {
                                      handleDeleteBadge(sortBadges[index]);
                                    }
                                  }}
                                  tabIndex={0} // Make the button focusable
                                >
                                  Delete
                                </button>
                              ) : (
                                []
                              )}
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
                    {`${isUserSelf ? 'You have' : 'This person has'} no badges.`}
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
            onClick={() => {
              if (isRecordBelongsToJaeAndUneditable) {
                alert(
                  'STOP! YOU SHOULDN’T BE TRYING TO CHANGE THIS. Please reconsider your choices.',
                );
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
            className="btn--dark-sea-green float-right"
            style={{ margin: 5 }}
            onClick={pdfFeaturedDocGenerator}
          >
            <span>Export Selected/Featured Badges to PDF</span>
          </Button>
        </div>
        <Modal isOpen={showModal}>
          <ModalBody>
            <p>Woah, easy tiger! Are you sure you want to delete this badge?</p>
            <br />
            <p>
              Note: Even if you click &quot;Yes, Delete&quot;, this won&apos;t be fully deleted
              until you click the &quot;Save Changes&quot; button below.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => handleCancel()} style={boxStyle}>
              Cancel
            </Button>
            <Button color="danger" onClick={() => deleteBadge()} style={boxStyle}>
              Yes, Delete
            </Button>
          </ModalFooter>
        </Modal>
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

export default connect(mapStateToProps, mapDispatchToProps)(BadgeReport);
