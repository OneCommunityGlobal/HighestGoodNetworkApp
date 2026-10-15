/* eslint-disable */
import htmlToPdfmake from 'html-to-pdfmake';
import moment from 'moment';
import 'moment-timezone';
import pdfMake from 'pdfmake/build/pdfmake';
import 'pdfmake/build/vfs_fonts';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardImg,
  CardText,
  CardTitle,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  FormGroup,
  Input,
  Table,
  UncontrolledDropdown,
  UncontrolledPopover,
  UncontrolledTooltip,
} from 'reactstrap';
import { changeBadgesByUserID } from '~/actions/badgeManagement';
import { getUserProfile } from '~/actions/userProfile';
import { boxStyle, boxStyleDark } from '~/styles';
import { permissions } from '~/utils/constants';
import { formatDate } from '~/utils/formatDate';
import hasPermission from '~/utils/permissions';
import BadgeImage from '../BadgeImage';
import '../Badge.module.css';
import '../BadgeReport.module.css';
import DeleteBadgeModal from './DeleteBadgeModal';
import { inspectBadgeCollection, isValidBadgeCount } from '../badgeListUtils';

export async function imageToUri(url, callback) {
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

  baseImage.onerror = function handleImageError() {
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
  const numFeatured = sortBadges.filter(badge => badge.featured).length;
  const [countInputs, setCountInputs] = useState({});
  const inFlight = useRef(false);
  const originalBadges = useRef([]);
  const collection = useMemo(() => inspectBadgeCollection(props.badges), [props.badges]);
  const hasInvalidCounts = Object.values(countInputs).some(value => !isValidBadgeCount(value));
  const [showModal, setShowModal] = useState(false);
  const [badgeToDelete, setBadgeToDelete] = useState([]);
  const [savingChanges, setSavingChanges] = useState(false);

  const editable = !props.isRecordBelongsToJaeAndUneditable;
  const canDeleteBadges = editable && props.hasPermission(permissions.deleteBadges);
  const canUpdateBadges = props.hasPermission(permissions.updateBadges);

  const darkMode = props.darkMode;

  const canAssignBadges = props.hasPermission(permissions.assignBadges);
  const canModifyBadgeAmount = props.hasPermission(permissions.modifyBadgeAmount);
  const canEditCount = editable && (canUpdateBadges || canModifyBadgeAmount || canAssignBadges);
  const canFeature = editable && (props.canEdit || canUpdateBadges || canAssignBadges);
  const canSave = editable && (canEditCount || canFeature || canDeleteBadges);
  const writesBlocked =
    savingChanges || collection.hasInvalidRecords || hasInvalidCounts || !canSave;
  const clearCountInput = id =>
    setCountInputs(inputs => {
      const next = { ...inputs };
      delete next[id];
      return next;
    });
  const displayModified = value => {
    if (!value || Number.isNaN(new Date(value).getTime())) return '—';
    return formatDate(value);
  };

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

  useEffect(() => {
    if (inFlight.current) return;
    originalBadges.current = structuredClone(collection.records);
    setSortBadges(structuredClone(collection.records));
    setCountInputs({});
  }, [collection]);

  const handleDeleteBadge = badge => {
    if (inFlight.current || !canDeleteBadges || collection.hasInvalidRecords || hasInvalidCounts)
      return;
    setShowModal(true);
    setBadgeToDelete(badge);
  };

  const countChange = (badge, index, rawValue) => {
    if (inFlight.current || !canEditCount) return;
    if (!isValidBadgeCount(rawValue)) {
      setCountInputs(inputs => ({ ...inputs, [badge._id]: rawValue }));
      return;
    }
    clearCountInput(badge._id);
    const newValue = Number(rawValue);
    if (newValue === 0) {
      if (!canDeleteBadges) {
        toast.error('Deleting a badge requires Delete Badge permission.');
        return;
      }
      if (
        !collection.hasInvalidRecords &&
        !Object.entries(countInputs).some(
          ([id, value]) => id !== badge._id && !isValidBadgeCount(value),
        )
      ) {
        setShowModal(true);
        setBadgeToDelete(badge);
      }
      return;
    }
    const original = originalBadges.current.find(item => item._id === badge._id);
    if (!original) return;
    setSortBadges(current =>
      current.map(item => {
        if (item._id !== badge._id) return item;
        const updated = { ...item, count: newValue };
        const dates = Array.isArray(item.earnedDate) ? item.earnedDate : [];
        const originalCount = Number(original.count);
        if (newValue > item.count && newValue >= originalCount) {
          if (original.hasBadgeDeletionImpact === false) updated.hasBadgeDeletionImpact = false;
          if (newValue > originalCount) updated.earnedDate = [...dates, formatDate(new Date())];
        } else if (newValue < item.count && newValue < originalCount) {
          updated.hasBadgeDeletionImpact = true;
        } else if (newValue < item.count && newValue >= originalCount) {
          updated.earnedDate = dates.slice(0, -1);
        }
        return updated;
      }),
    );
  };

  const featuredChange = (badge, index, event) => {
    if (inFlight.current || !canFeature) return;
    const checked = event.target.checked;
    if (checked && numFeatured >= 5) {
      toast.error('Unfortunately, you may only select five badges to be featured.');
      return;
    }
    setSortBadges(current =>
      current.map(item => (item._id === badge._id ? { ...item, featured: checked } : item)),
    );
  };

  const handleCancel = () => {
    if (inFlight.current) return;
    setShowModal(false);
    setBadgeToDelete([]);
  };

  const saveChanges = async (
    badgesToSave = sortBadges,
    { closeEditor = true, successMessage = 'Badges successfully saved.' } = {},
  ) => {
    if (inFlight.current || writesBlocked) return false;
    inFlight.current = true;
    setSavingChanges(true);
    props.onSavingChange?.(true);
    let saved = false;
    try {
      const snapshot = structuredClone(badgesToSave);
      const payload = snapshot.map(record => ({ ...record, badge: record.badge._id }));
      saved = await props.changeBadgesByUserID(props.userId, payload);
      if (!saved) {
        toast.error('Failed to save badges. Please try again.');
        return false;
      }
      let refreshFailed = false;
      try {
        const refreshed = await props.getUserProfile(props.userId);
        refreshFailed = refreshed === null;
      } catch {
        refreshFailed = true;
      }
      props.setUserProfile(profile => ({ ...profile, badgeCollection: snapshot }));
      props.setOriginalUserProfile(profile => ({ ...profile, badgeCollection: snapshot }));
      originalBadges.current = structuredClone(snapshot);
      setSortBadges(snapshot);
      setCountInputs({});
      await props.handleSubmit();
      if (refreshFailed)
        toast.warn(
          'Badges were saved, but the profile could not be refreshed. Reload the profile to verify.',
        );
      else toast.success(successMessage);
    } catch (error) {
      if (saved)
        toast.warn(
          'Badges were saved, but the profile could not be refreshed. Reload the profile to verify.',
        );
      else toast.error('Failed to save badges. Please try again.');
    } finally {
      inFlight.current = false;
      setSavingChanges(false);
      props.onSavingChange?.(false);
    }
    if (saved && closeEditor) props.close();
    return saved;
  };

  const deleteBadge = async () => {
    if (!canDeleteBadges || inFlight.current) return;
    const newBadges = sortBadges.filter(badge => badge._id !== badgeToDelete._id);
    if (
      await saveChanges(newBadges, {
        closeEditor: false,
        successMessage: 'Badges deleted successfully.',
      })
    ) {
      setShowModal(false);
      setBadgeToDelete([]);
    }
  };

  return (
    <div>
      {collection.hasInvalidRecords && (
        <p role="alert">
          Some badge records are invalid. Refresh the profile or ask an administrator to repair them
          before saving. No records have been removed.
        </p>
      )}
      {hasInvalidCounts && (
        <p role="alert">
          Badge counts must be nonnegative whole numbers. Correct the input before saving.
        </p>
      )}
      {savingChanges && <p role="status">Saving badges…</p>}
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
                  <tr key={value._id || index}>
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
                    <td>{displayModified(value.lastModified)}</td>

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
                          {(Array.isArray(value.earnedDate) ? value.earnedDate : []).map(
                            (date, i) => (
                              <DropdownItem key={`${date}-${i}`}>{date}</DropdownItem>
                            ),
                          )}
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
                      {canEditCount ? (
                        <Input
                          type="number"
                          value={countInputs[value._id] ?? Number(value.count)}
                          disabled={savingChanges}
                          onBlur={() => {
                            if (!inFlight.current) clearCountInput(value._id);
                          }}
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
                          disabled={writesBlocked}
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
                          disabled={savingChanges || !canFeature}
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
          disabled={writesBlocked}
          onClick={() => saveChanges()}
        >
          Save Changes
        </Button>
        <Button
          className="btn--dark-sea-green float-right"
          style={darkMode ? { ...boxStyleDark, margin: 5 } : { ...boxStyle, margin: 5 }}
          onClick={pdfDocGenerator}
        >
          Export All Badges to PDF
        </Button>
        <Button
          disabled={numFeatured === 0}
          className="btn--dark-sea-green float-right"
          style={darkMode ? { ...boxStyleDark, margin: 5 } : { ...boxStyle, margin: 5 }}
          onClick={pdfFeaturedDocGenerator}
        >
          Export Selected/Featured Badges to PDF
        </Button>

        <DeleteBadgeModal
          pending={savingChanges}
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
                  <tr key={value._id || index}>
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
                    <td>{displayModified(value.lastModified)}</td>
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
                          {(Array.isArray(value.earnedDate) ? value.earnedDate : []).map(
                            (date, i) => (
                              <DropdownItem key={`${date}-${i}`}>{date}</DropdownItem>
                            ),
                          )}
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
                              {canEditCount ? (
                                <Input
                                  type="number"
                                  value={countInputs[value._id] ?? Number(value.count)}
                                  disabled={savingChanges}
                                  onBlur={() => {
                                    if (!inFlight.current) clearCountInput(value._id);
                                  }}
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
                                  disabled={savingChanges || !canFeature}
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
                                  disabled={writesBlocked}
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
            disabled={writesBlocked}
            onClick={() => saveChanges()}
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
  canEdit: PropTypes.bool,
  onSavingChange: PropTypes.func,
  hasPermission: PropTypes.func.isRequired,
  changeBadgesByUserID: PropTypes.func.isRequired,
  getUserProfile: PropTypes.func.isRequired,

  badges: PropTypes.arrayOf(PropTypes.object).isRequired, // array of badge objects
  userId: PropTypes.string.isRequired,
  role: PropTypes.string,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
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
