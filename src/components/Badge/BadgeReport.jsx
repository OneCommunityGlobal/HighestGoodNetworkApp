/* eslint-disable */
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
import { boxStyle, boxStyleDark } from 'styles';
import { formatDate } from 'utils/formatDate';
import hasPermission from '../../utils/permissions';
import { changeBadgesByUserID } from '../../actions/badgeManagement';
import './BadgeReport.css';
import { getUserProfile } from '../../actions/userProfile';
import { PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE } from 'utils/constants';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

function BadgeReport(props) {
  const [sortBadges, setSortBadges] = useState([]);
  const [numFeatured, setNumFeatured] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [badgeToDelete, setBadgeToDelete] = useState([]);
  const [savingChanges, setSavingChanges] = useState(false);

  const canDeleteBadges = props.hasPermission('deleteBadges');
  const canUpdateBadges = props.hasPermission('updateBadges');

  const darkMode = props.darkMode;

  useEffect(() => {
    let isMounted = true; // flag to track if component is mounted
    const initializeBadges = () => {
      const badges = JSON.parse(JSON.stringify(props.badges)) || [];
      let newBadges = badges.slice();

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
        newBadges.forEach((badge, index) => {
          if (badge.featured) {
            setNumFeatured(prev => prev + 1);
          }

          if (typeof newBadges[index] === 'string') {
            newBadges[index].lastModified = new Date(newBadges[index].lastModified);
          }
        });
        setSortBadges(newBadges);
      }
    };
    initializeBadges();

    return () => { isMounted = false }; // cleanup function
  }, [props.badges]);


  const countChange = (badge, index, newValue) => {
    let copyOfExisitingBadges = [...sortBadges];
    newValue = newValue === null || newValue === undefined ? -1 : parseInt(newValue);
    if (newValue < 0 || !copyOfExisitingBadges || copyOfExisitingBadges.length === 0) {
      toast.error(
        'Error: Invalid badge count or the badge does not exist in the badge records. Please refresh the page. If the problem persists, please contact the administrator.'
      );
      return;
    }

    const recordBeforeUpdate = props.badges.filter(item => item.badge._id === badge.badge._id);
    if (recordBeforeUpdate.length !== 0) {
      const badgePrevState = badge;
      if (newValue === 0) {
        handleDeleteBadge(badgePrevState);
        return;
      } else {
        const badgeCountFromExistingRecord = parseInt(recordBeforeUpdate[0].count);
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
            } else if (newValue < badgePrevState.count && newValue >= badgeCountFromExistingRecord) {
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
        'Error: The badge may not exist in the badge records. Please refresh the page. If the problem persists, please contact the administrator.'
      );
      return;
    }
  };

  const featuredChange = (badge, index, e) => {
    let newBadges = sortBadges.slice();
    if ((e.target.checked && numFeatured < 5) || !e.target.checked) {
      let count = 0;
      newBadges[index].featured = e.target.checked;
      newBadges.forEach(badge => {
        if (badge.featured) {
          count++;
        }
      });
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
    setShowModal(false);
    setBadgeToDelete([]);
  };

  const saveChanges = async () => {
    setSavingChanges(true);
    let newBadgeCollection = JSON.parse(JSON.stringify(sortBadges));
    newBadgeCollection.forEach(badge => {
      badge.badge = badge.badge._id;
    });

    await props.changeBadgesByUserID(props.userId, newBadgeCollection);
    await props.getUserProfile(props.userId);

    props.setUserProfile(prevProfile => {
      return { ...prevProfile, badgeCollection: sortBadges };
    });
    props.setOriginalUserProfile(prevProfile => {
      return { ...prevProfile, badgeCollection: sortBadges };
    });
    props.handleSubmit();
    props.close();
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
              {sortBadges && sortBadges.length ? (
                sortBadges.map((value, index) => (
                  <tr key={index}>
                    <td className="badge_image_sm">
                      <img src={value.badge.imageUrl} id={'popover_' + index.toString()} />
                    </td>
                    <UncontrolledPopover trigger="hover" target={'popover_' + index.toString()}>
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
                            <DropdownItem key={i}>{date}</DropdownItem>
                          ))}
                        </DropdownMenu>
                      </UncontrolledDropdown>
                      {value.hasBadgeDeletionImpact ? (
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
                          onChange={e => countChange(value, index, e.target.value)}
                        ></Input>
                      ) : (
                        Math.round(value.count)
                      )}
                    </td>
                    {canDeleteBadges ? (
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => handleDeleteBadge(sortBadges[index])}
                          style={darkMode ? boxStyleDark : boxStyle}
                        >
                          Delete
                        </button>
                      </td>
                    ) : null}
                    <td style={{ textAlign: 'center' }}>
                      <FormGroup check inline style={{ zIndex: '0' }}>
                        <Input
                          type="checkbox"
                          id={value.badge._id}
                          checked={value.featured}
                          onChange={e => featuredChange(value, index, e)}
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
          onClick={() => {
            // Ensure pdfDocGenerator function is correctly defined and imported
            if (typeof pdfDocGenerator !== 'undefined') {
              pdfDocGenerator();
            } else {
              console.error('pdfDocGenerator is not defined');
            }
          }}
        >
          Export All Badges to PDF
        </Button>
        <Button
          className="btn--dark-sea-green float-right"
          style={darkMode ? { ...boxStyleDark, margin: 5 } : { ...boxStyle, margin: 5 }}
          onClick={() => {
            // Ensure pdfFeaturedDocGenerator function is correctly defined and imported
            if (typeof pdfFeaturedDocGenerator !== 'undefined') {
              pdfFeaturedDocGenerator();
            } else {
              console.error('pdfFeaturedDocGenerator is not defined');
            }
          }}
        >
          Export Selected/Featured Badges to PDF
        </Button>
        <Modal isOpen={showModal} className={darkMode ? 'text-light' : ''}>
          <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
            <p>Woah, easy tiger! Are you sure you want to delete this badge?</p>
            <br />
            <p>
              Note: Even if you click &quot;Yes, Delete&quot;, this won&apos;t be fully deleted
              until you click the &quot;Save Changes&quot; button below.
            </p>
          </ModalBody>
          <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
            <Button onClick={handleCancel} style={darkMode ? boxStyleDark : boxStyle}>
              Cancel
            </Button>
            <Button
              color="danger"
              onClick={deleteBadge}
              style={darkMode ? boxStyleDark : boxStyle}
            >
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
