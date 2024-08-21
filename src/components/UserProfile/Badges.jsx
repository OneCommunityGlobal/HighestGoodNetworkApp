import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardFooter,
  CardBody,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  UncontrolledTooltip,
  Table,
  ModalFooter,
  Button as ReactStrapButton,
  UncontrolledPopover,
  UncontrolledDropdown,
  CardTitle,
  CardImg,
  CardText,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { connect } from 'react-redux';
import './Badge.css';
import FeaturedBadges from './FeaturedBadges';
import BadgeReport from '../Badge/BadgeReport';
import AssignBadgePopup from './AssignBadgePopup';
import { clearSelected } from 'actions/badgeManagement';
import hasPermission from '../../utils/permissions';
import { boxStyle, boxStyleDark } from 'styles';
import EditableInfoModal from '../UserProfile/EditableModal/EditableInfoModal';

export const Badges = (props) => {
  const {auth, darkMode, displayUserId, authUser} = props;

  const [isOpen, setOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isAssignOpen, setAssignOpen] = useState(false);

  const canAssignBadges = props.hasPermission('assignBadges') || props.hasPermission('assignBadgeOthers');
  
  const [sortedBadges, setSortedBadges] = useState([]);
  const [isBadgeOpen, setIsBadgeOpen] = useState(false);

  // Added restriction: Jae's badges only editable by Jae or Owner
  const isRecordBelongsToJaeAndUneditable = props.isRecordBelongsToJaeAndUneditable && props.role !== 'Owner';
  const toggle = () => setOpen(!isOpen);
  
  const toggleBadge = () => {setIsBadgeOpen(!isBadgeOpen)};

  // xiaohan: connect to see all badges
  const assignToggle = () => {
    setAssignOpen(isAssignOpen => !isAssignOpen);
  };

  useEffect(() => {
    if (!isOpen && !isAssignOpen) {
      props.clearSelected();
    }
  }, [isOpen, isAssignOpen]);

  useEffect(() => {
    try {
      if (props.userProfile.badgeCollection && props.userProfile.badgeCollection.length) {
        const sortBadges = [...props.userProfile.badgeCollection].sort((a, b) => {
          if (a?.badge?.ranking === 0) return 1;
          if (b?.badge?.ranking === 0) return -1;
          if (a?.badge?.ranking > b?.badge?.ranking) return 1;
          if (a?.badge?.ranking < b?.badge?.ranking) return -1;
          if (a?.badge?.badgeName > b?.badge?.badgeName) return 1;
          if (a?.badge?.badgeName < b?.badge?.badgeName) return -1;
          return 0;
        });
        setSortedBadges(sortBadges);
      }
    } catch (error) {
       console.log(error);
    }
   
  }, [props.userProfile.badgeCollection]);

  // Determines what congratulatory text should displayed.
  const badgesEarned = props.userProfile.badgeCollection.reduce((acc, badge) => {
    if (badge?.badge?.badgeName === 'Personal Max' || badge?.badge?.type === 'Personal Max') {
      return acc + 1;
    }
    return acc + Math.round(Number(badge.count));
  }, 0);

  const subject = props.isUserSelf ? 'You have' : 'This person has';
  const verb = badgesEarned ? `earned ${badgesEarned}`  : 'no';
  const object = badgesEarned == 1 ? 'badge' : 'badges';
  let congratulatoryText = `${subject} ${verb} ${object}`;
  congratulatoryText = badgesEarned
  ? `Bravo! ${subject} <a href="#" onclick="handleClick()">${verb} ${object}</a>!`
  : `${subject} ${verb} ${object}.`;

  return (
    <>
      <Card id="badgeCard" className={`badgeCard ${darkMode ? 'bg-space-cadet' : ''}`}>
        <CardHeader>
          <div className="badge-header">

            <span>
              Featured Badges
            </span>
            <span className="badge-header-title">
              <EditableInfoModal
                areaName="FeaturedBadgesInfoPoint"
                areaTitle="Featured Badges"
                fontSize={20}
                isPermissionPage={true}
                role={props.role}
                darkMode={darkMode}
              />
            </span>

            <div className='d-flex'>
              {(props.canEdit || props.role == 'Owner' || props.role == 'Administrator') && (
                <>
                  <Button className="btn--dark-sea-green" onClick={toggle} style={darkMode ? boxStyleDark : boxStyle}>
                    Select Featured
                  </Button>
                  <Modal size="lg" isOpen={isOpen} toggle={toggle} className={darkMode ? 'text-light dark-mode' : ''}>
                    <ModalHeader toggle={toggle} className={darkMode ? 'bg-space-cadet' : ''}>Full View of Badge History</ModalHeader>
                    <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
                      <BadgeReport
                        badges={props.userProfile.badgeCollection}
                        userId={props.userProfile._id}
                        role={props.role}
                        firstName={props.userProfile.firstName}
                        lastName={props.userProfile.lastName}
                        close={toggle}
                        setUserProfile={props.setUserProfile}
                        setOriginalUserProfile={props.setOriginalUserProfile}
                        handleSubmit={props.handleSubmit}
                        isUserSelf={props.isUserSelf}
                        isRecordBelongsToJaeAndUneditable={isRecordBelongsToJaeAndUneditable}
                        darkMode={darkMode}
                      />
                    </ModalBody>
                  </Modal>
                </>
              )}
              {canAssignBadges && (
                <>
                  <Button
                    className="btn--dark-sea-green mr-2"
                    onClick={assignToggle}
                    style={darkMode ? boxStyleDark : boxStyle}
                  >
                    Assign Badges
                  </Button>
                  <Modal size="lg" isOpen={isAssignOpen} toggle={assignToggle} className={darkMode ? 'text-light dark-mode' : ''}>
                    <ModalHeader className={darkMode ? 'bg-space-cadet' : ''} toggle={assignToggle}>Assign Badges</ModalHeader>
                    <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
                      <AssignBadgePopup
                        allBadgeData={props.allBadgeData}
                        userProfile={props.userProfile}
                        setUserProfile={props.setUserProfile}
                        close={assignToggle}
                        handleSubmit={props.handleSubmit}
                        isRecordBelongsToJaeAndUneditable={isRecordBelongsToJaeAndUneditable}
                      />
                    </ModalBody>
                  </Modal>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardBody style={{ overflow: 'auto' }}>
          <FeaturedBadges personalBestMaxHrs={props.userProfile.personalBestMaxHrs} badges={props.userProfile.badgeCollection} />
        </CardBody>
        <CardFooter style={{ display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              fontWeight: 'bold',
              fontSize: 18,
              color: darkMode ? '#fff' : '#285739',
            }}
          >
          <div>
            {badgesEarned ? (
              <div>
                Bravo! {subject} earned <a href="#" onClick={toggleBadge} >{badgesEarned}</a> {object}!
              </div>
            ) : (
              <div>
                {subject} {verb} {object}.
              </div>
            )}
          </div>
          </span>
          <span className="ml-2">
            <EditableInfoModal
              areaName="NumberOfBadgesInfoPoint"
              areaTitle="Number of Badges"
              role={props.role}
              fontSize={20}
              isPermissionPage={true}
              darkMode={darkMode}
            />
          </span>
        </CardFooter>
      </Card>
      <Modal size="lg" isOpen={isBadgeOpen} toggle={toggleBadge} className={darkMode ? 'text-light' : ''}>
        <ModalHeader className={darkMode ? 'bg-space-cadet' : ''}>Badge Summary</ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          <div>
            {/* --- DESKTOP VERSION OF MODAL --- */}
            <div className="desktop">
              <div style={{ overflowY: 'scroll', height: '75vh' }}>
                <Table className={darkMode ? 'text-light dark-mode' : ''}>
                  <thead style={{ zIndex: '10' }}>
                    <tr style={{ zIndex: '10' }} className={darkMode ? 'bg-space-cadet' : ''}>
                      <th style={{ width: '93px' }}>Badge</th>
                      <th>Name</th>
                      <th style={{ width: '110px' }}>Modified</th>
                      <th style={{ width: '110px' }}>Earned Dates</th>
                      <th style={{ width: '90px' }}>Count</th>
                    </tr>
                  </thead>
                    <tbody>
                    {props.userProfile.badgeCollection && props.userProfile.badgeCollection.length>0 ? (
                      sortedBadges &&
                      sortedBadges.map(value => value &&(
                        <tr key={value.badge._id}>
                          <td className="badge_image_sm">
                            {' '}
                            <img
                              src={value.badge.imageUrl}
                              id={`popover_${value.badge._id}`}
                              alt="badge"
                            />
                          </td>
                          <UncontrolledPopover
                            trigger="hover"
                            target={`popover_${value.badge._id}`}
                          >
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
                              ? value.lastModified.substring(0, 10)
                              : value.lastModified.toLocaleString().substring(0, 10)}
                          </td>
                          <td style={{ display: 'flex', alignItems: 'center' }}>
                            <>
                              {' '}
                              <UncontrolledDropdown className="me-2" direction="down">
                                <DropdownToggle caret color="primary" style={darkMode ? boxStyleDark : boxStyle}>
                                  Dates
                                </DropdownToggle>
                                <DropdownMenu>
                                  {value.earnedDate.map((date, index) => (
                                    // eslint-disable-next-line react/no-array-index-key
                                    <DropdownItem key={`date-${value._id}-${index}`}>
                                      {date}
                                    </DropdownItem>
                                  ))}
                                </DropdownMenu>
                              </UncontrolledDropdown>
                              {value?.hasBadgeDeletionImpact && value?.hasBadgeDeletionImpact === true ?
                              (<>
                                <span id="mismatchExplainationTooltip" style={{paddingLeft: '3px'}}>
                                  {'  '} *
                                </span>
                                <UncontrolledTooltip
                                  placement="bottom"
                                  target="mismatchExplainationTooltip"
                                  style={{ maxWidth: '300px' }}
                                >
                                  This record contains a mismatch in the badge count and associated dates. It indicates that a badge has been deleted. 
                                  Despite the deletion, we retain the earned date to ensure a record of the badge earned for historical purposes.
                                </UncontrolledTooltip>
                              </>)
                              : null
                              } 
                            </>
                          </td>
                          <td>{value.count}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center' }}>{`${
                          authUser.userid === displayUserId ? 'You have' : 'This person has'
                        } no badges .`}</td>
                      </tr>
                    )} 
                  </tbody> 
                </Table>
              </div>
            </div>
            {/* --- TABLET VERSION OF MODAL --- */}
            <div className="tablet">
              <div style={{ overflow: 'auto', height: '68vh' }}>
                <Table  className={darkMode ? 'text-light dark-mode' : ''}>
                  <thead style={{ zIndex: '10' }}>
                    <tr style={{ zIndex: '10' }}  className={darkMode ? 'bg-space-cadet' : ''}>
                      <th style={{ width: '25%' }}>Badge</th>
                      <th style={{ width: '25%' }}>Name</th>
                      <th style={{ width: '25%' }}>Modified</th>
                      <th style={{ width: '25%', zIndex: '10' }}>Count</th>
                    </tr>
                  </thead>
                   <tbody>
                    {props.userProfile.badgeCollection && props.userProfile.badgeCollection.length ? (
                      sortedBadges &&
                      sortedBadges.map(value => value &&(
                        <tr key={value._id}>
                          <td className="badge_image_sm">
                            {' '}
                            <img
                              src={value?.badge.imageUrl}
                              id={`popover_${value._id}`}
                              alt="badge"
                            />
                          </td>
                          <UncontrolledPopover trigger="hover" target={`popover_${value._id}`}>
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
                                  {value?.badge?.badgeName}
                                </CardTitle>
                                <CardText>{value?.badge?.description}</CardText>
                              </CardBody>
                            </Card>
                          </UncontrolledPopover>
                          <td>{value?.badge?.badgeName}</td>
                          <td>
                            {typeof value.lastModified === 'string'
                              ? value.lastModified.substring(0, 10)
                              : value.lastModified.toLocaleString().substring(0, 10)}
                          </td>
                          <td>{value?.count}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center' }}>{`${
                          authUser.userid === displayUserId ? 'You have' : 'This person has'
                        } no badges.`}</td>
                      </tr>
                    )}
                  </tbody> 
                </Table>
              </div>
            </div> 
          </div>
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <div className="badge_summary_viz_footer">
            <ReactStrapButton
              className="btn--dark-sea-green badge_summary_viz_button"
              onClick={toggleBadge}
            >
              Close
            </ReactStrapButton>
          </div>
        </ModalFooter>
      </Modal>
      {/* <UncontrolledTooltip
        placement="right"
        target="FeaturedBadgeInfo"
        style={{ backgroundColor: '#666', color: '#fff' }}
      >
        <p className="badge_info_icon_text">
          Holy Awesome, these are your profiles featured badges !!! Click &quot;Select
          Featured&quot; to bask in the glory of your COMPLETE LIST!
        </p>
        <p className="badge_info_icon_text">
          Have a number bigger than &quot;1&quot; in the bottom righthand corner of a badge?
          That&apos;s how many times you&apos;ve earned the same badge! Do your Happy Dance you
          Champion!!
        </p>
        <p className="badge_info_icon_text">
          No badges in this area? Uh, in that cases, everything said above is a bit premature. Sorry
          about that... Everyone must start somewhere, and in your case, that somewhere is with the
          big empty, desolate, bare and barren badge box below (BEDBABBBB). If we had a BEDBABBBB
          badge, you&apos;d earn it, but we don&apos;t, so this area is blank.
        </p>
        <p className="badge_info_icon_text">
          No worries though, we&apos;re sure there are other areas of your life where you are a
          Champion already. Stick with us long enough and this will be another one.
        </p>
      </UncontrolledTooltip> */}
      {/* <UncontrolledTooltip
        placement="auto"
        target="CountInfo"
        style={{ backgroundColor: '#666', color: '#fff' }}
      >
        <p className="badge_info_icon_text">
          This is the total number of badges you have earned. (Way to go Champion!) It increases if
          you earn the same badge multiple times too!
        </p>
        <p className="badge_info_icon_text">
          There are many things in life to be proud of. Some are even worth bragging about. If your
          number here is large, it definitely falls into the later category.
        </p>
      </UncontrolledTooltip> */}
    </>
  );
};

const mapDispatchToProps = dispatch => ({
  clearSelected: () => dispatch(clearSelected()),
  hasPermission: (permission) => dispatch(hasPermission(permission)),
});

const mapStateToProps = state => ({
  allBadgeData: state?.badge?.allBadgeData,
  auth: state.auth, 
  //darkMode: state.theme.darkMode,
  authUser: state.auth.user,
});

export default connect(mapStateToProps, mapDispatchToProps)(Badges);
