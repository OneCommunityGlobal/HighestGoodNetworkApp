import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  Container,
  TabContent,
  TabPane,
  List,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Nav,
  NavItem,
  NavLink,
  Button,
} from 'reactstrap';
import { toast } from 'react-toastify';
import _ from 'lodash';
//
import Select from 'react-select';
import { Link } from 'react-router-dom';
import classnames from 'classnames';
import moment from 'moment';
import Alert from 'reactstrap/lib/Alert';
import { boxStyle, boxStyleDark } from 'styles';
import httpService from '../../services/httpService';
import { ENDPOINTS } from '../../utils/URL';

import SkeletonLoading from '../common/SkeletonLoading';
import UserProfileModal from './UserProfileModal';
import ActiveInactiveConfirmationPopup from '../UserManagement/ActiveInactiveConfirmationPopup';
import UserProfilePic from './UserProfilePic/UserProfilePic';
import TabToolTips from './ToolTips/TabToolTips';
import BasicToolTips from './ToolTips/BasicTabTips';

import hasPermission, {
  cantDeactivateOwner,
  cantUpdateDevAdminDetails,
} from '../../utils/permissions';
import ActiveCell from '../UserManagement/ActiveCell';

import './UserProfile.scss';
import TeamsTab from './TeamsAndProjects/TeamsTab';
import ProjectsTab from './TeamsAndProjects/ProjectsTab';
import BasicInformationTab from './BasicInformationTab/BasicInformationTab';
import VolunteeringTimeTab from './VolunteeringTimeTab/VolunteeringTimeTab';
import SaveButton from './UserProfileEdit/SaveButton';
import UserLinkLayout from './UserLinkLayout';

import ResetPasswordButton from '../UserManagement/ResetPasswordButton';
import Badges from './Badges';
import TimeEntryEditHistory from './TimeEntryEditHistory';

// import { updateUserStatus, updateRehireableStatus } from '../../actions/userManagement';
// import { UserStatus } from '../../utils/enums';
import BlueSquareLayout from './BlueSquareLayout';

import TeamSummarySelect from './TeamSummary/TeamSummarySelect';
import { convertDateFormatToMMMDDYY } from '../../utils/formatDate';
import EditableInfoModal from './EditableModal/EditableInfoModal';
// import { fetchAllProjects } from '../../actions/projects';
// import { getAllUserTeams } from '../../actions/allTeamsAction';

// import { GiConsoleController } from 'react-icons/gi';
// import { setCurrentUser } from '../../actions/authActions';
// import { getAllTimeOffRequests } from '../../actions/timeOffRequestAction';

function UserProfile(props) {
  const dispatch = useDispatch();

  /* Redux */
  // evaluated before useEffect
  const darkMode = useSelector((state) => state.theme.darkMode);
  const auth = useSelector((state) => state.auth);
  const userProjects = useSelector((state) => state.userProjects);
  const allProjects = useSelector((state) => state.allProjects);
  const allTeams = useSelector((state) => state.allTeamsData);
  const taskItems = useSelector((state) => state.tasks.taskItems);

  /* Basic Info Form Validation */
  const initialFormValid = {
    firstName: true, // required
    lastName: true, // required
    email: true, //  required
    phone: true, //  required
    title: true, // empty or char only
    activeStatus: true, // required
  };

  /* Component State */
  const [showLoading, setShowLoading] = useState(true);
  // const [shouldRefreshTeamData, setShouldRefreshTeamData] = useState(false);
  // const [shouldRefreshProjectData, setShouldRefreshProjectData] = useState(false);
  // const [shouldRefreshTaskData, setShouldRefreshTaskData] = useState(false);
  // const [shouldRefreshUserProfile, setShouldRefreshUserProfile] = useState(false);
  // const [shouldRefreshBadgeData, setShouldRefreshBadgeData] = useState(false);
  // const [shouldRefreshBlueSquareData, setShouldRefreshBlueSquareData] = useState(false);

  const [formValid, setFormValid] = useState(initialFormValid);
  // Current viewing user profile. Didn't use redux store value. Any changes
  // will use setUserProfile to update the value.
  const [userProfile, setUserProfile] = useState(undefined);
  // Original profile for current viewing user
  const [originalUserProfile, setOriginalUserProfile] = useState(undefined);
  // Should set to true if original user profile is updated (new profile is saved).
  const [shouldRefreshTeamData, setShouldRefreshTeamData] = useState(false);
  // Control user status popup
  const [userStatusPopupOpen, setUserStatusPopupOpen] = useState(false);
  /* User Blue Sqr, Upload, and links Popup Modal */
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('');
  const [blueSqrId, setBlueSqrId] = useState('');

  /* Profile Header Section */
  const [showTeamWeeklySummary, setShowTeamWeeklySummary] = useState(false);
  const [summarySelected, setSummarySelected] = useState(null);
  const [summaryName, setSummaryName] = useState(null);
  const [summaryIntro, setSummaryIntro] = useState(null);

  /* Profile State */
  const [isTeamChanged, setIsTeamChanged] = useState(false);
  const [isProjectChanged, setIsProjectChanged] = useState(false);
  const [isTaskChanged, setIsTaskChanged] = useState(false);
  const [isRehireable, setIsRehireable] = useState(null);

  /* User Permission Control */
  // Use logged in user id if no user id in url
  const currentViewingUserId = props?.match?.params?.userId
    ? props.match.params.userId : props.auth.user?.userid;

  if (!currentViewingUserId) {
    toast.error('Failed fetch user profile. Pleaase refresh the page.');
    setShowLoading(true);
    return null;
  }

  const isUserSelf = props.match.params.userId === props.auth.user?.userid;
  const authEmail = auth?.user?.email;
  const authUserRole = auth?.user?.role;

  const canChangeUserStatus = hasPermission('changeUserStatus');
  const canAddDeleteEditOwners = hasPermission('addDeleteEditOwners');
  const canPutUserProfile = hasPermission('putUserProfile');
  const canUpdatePassword = hasPermission('updatePassword');
  const canGetProjectMembers = hasPermission('getProjectMembers');
  const canChangeRehireableStatus = hasPermission('changeUserRehireableStatus');
  // Jae's account permission control
  const targetIsDevAdminUneditable = cantUpdateDevAdminDetails(userProfile.email, authEmail);

  let canEditUserProfile = false;

  if (targetIsDevAdminUneditable) {
    canEditUserProfile = false;
  } else if (userProfile.role === 'Owner') {
    canEditUserProfile = canAddDeleteEditOwners;
  } else {
    canEditUserProfile = canPutUserProfile;
  }
  const canEdit = canEditUserProfile || isUserSelf;
  const ownerNotEditable = cantDeactivateOwner(userProfile, authUserRole);
  // Deep comparison for profile changes
  const hasProfileChanged = !_.isEqual(originalUserProfile, userProfile);
  // const isTaskTeamProjectChanged = isTeamChanged || isProjectChanged || isTaskChanged;

  /* Other Variables */
  const currUserFullname = `${userProfile.firstName} ${userProfile.lastName}`;
  /* Style */
  const customStyles = {
    control: (base, state) => ({
      ...base,
      border: state.isFocused ? '2px solid #333' : '2px solid #ccc',
      boxShadow: 'none',
      '&:hover': {
        border: state.isFocused ? '2px solid #333' : '2px solid #ccc',
      },
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#333',
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  /* Component Functions */

  const onClickActiveStatus = () => {
    // Owner user cannot be deactivated by another user that is not an Owner.
    if (ownerNotEditable) {
      // eslint-disable-next-line no-alert
      alert('You are not authorized to deactivate an owner.');
      return;
    }
    setUserStatusPopupOpen(true);
  };

  const handleRehireableChange = () => {
    const newRehireableStatus = !userProfile.isRehireable;
    // setUserProfile({ ...userProfile, isRehireable: newRehireableStatus });
    setPendingRehireableStatus(newRehireableStatus);
    setShowConfirmDialog(true);
  };

  const onClickShowTeamSummary = () => {
    setShowTeamWeeklySummary(!showTeamWeeklySummary);
  };

  const onClickUserTimelog = (e) => {
    if (e.metaKey || e.ctrlKey) {
      window.open(`/timelog/${currentViewingUserId}`, '_blank');
    } else {
      e.preventDefault();
      props.history.push(`/timelog/${currentViewingUserId}`);
    }
  };

  /* Functions for UserProfileModal */
  const updateLink = (personalLinksUpdate, adminLinksUpdate, mediaUrlUpdate) => {
    setShowModal(false);
    setUserProfile({
      ...userProfile,
      mediaUrl: mediaUrlUpdate !== undefined ? mediaUrlUpdate : userProfile.mediaUrl,
      personalLinks: personalLinksUpdate,
      adminLinks: adminLinksUpdate,
    });
  };

  /**
   * Modifies the userProfile's infringements using a predefined operation
   * @param {String} id Id of the blue square
   * @param {String} dateStamp
   * @param {String} summary
   * @param {String} operation 'add' | 'update' | 'delete'
   */
  const modifyBlueSquares = (id, dateStamp, summary, operation) => {
    if (operation === 'add') {
      const newBlueSquare = {
        date: dateStamp,
        description: summary,
        createdDate: moment.tz('America/Los_Angeles').toISOString().split('T')[0],
      };
      setOriginalUserProfile({
        ...originalUserProfile,
        infringements: userProfile.infringements?.concat(newBlueSquare),
      });
      setUserProfile({
        ...userProfile,
        infringements: userProfile.infringements?.concat(newBlueSquare),
      });
      setModalTitle('Blue Square');
    } else if (operation === 'update') {
      const currentBlueSquares = [...userProfile?.infringements] || [];
      if (dateStamp != null && currentBlueSquares.length !== 0) {
        currentBlueSquares.find((blueSquare) => blueSquare._id === id).date = dateStamp;
      }
      if (summary != null && currentBlueSquares.length !== 0) {
        currentBlueSquares.find((blueSquare) => blueSquare._id === id).description = summary;
      }

      setUserProfile({ ...userProfile, infringements: currentBlueSquares });
      setOriginalUserProfile({ ...userProfile, infringements: currentBlueSquares });
    } else if (operation === 'delete') {
      let newInfringements = [...userProfile?.infringements] || [];
      if (newInfringements.length !== 0) {
        newInfringements = newInfringements.filter((infringement) => infringement._id !== id);
        setUserProfile({ ...userProfile, infringements: newInfringements });
        setOriginalUserProfile({ ...userProfile, infringements: newInfringements });
      }
    }
    setShowModal(false);
    setBlueSquareChanged(true);
  };

  /* Data Fetching */
  const loadSummaryIntroDetails = async () => {
    const placeHolder = 'This week’s summary was managed by ';
    setSummaryIntro(placeHolder);
    /*
    const currentManager = user;
    try {
      const res = await axios.get(ENDPOINTS.TEAM_USERS(teamId));
      const { data } = res;

      const activeMembers = data.filter( member =>
        member._id !== currentManager._id && member.isActive);

      const memberSubmitted = activeMembers
        .filter(member => member.weeklySummaries[0].summary !== '')
        .map(member => `${member.firstName} ${member.lastName}`);

      const memberNotSubmitted = activeMembers
        .filter(member => member.weeklySummaries[0].summary === '')
        .map(member => `${member.firstName} ${member.lastName}`);

      const memberSubmittedString =
        memberSubmitted.length !== 0
          ? memberSubmitted.join(', ')
          : '<list all team members names included in the summary>';

      const memberDidntSubmitString =
        memberNotSubmitted.length !== 0
          ? memberNotSubmitted.join(', ')
          : '<list all team members names NOT included in the summary>';

      const summaryIntroString = `This week’s summary was managed by
      ${currentManager.firstName} ${currentManager.lastName}
      and includes ${memberSubmittedString}. These people did NOT provide a summary
      ${memberDidntSubmitString}.
      <Insert the proofread and single-paragraph summary created by ChatGPT>`;

      setSummaryIntro(summaryIntroString);
    } catch (error) {
      console.error('Error fetching team users:', error);
    } */
  };

  const loadUserProfile = async () => {
    // Get user id from url
    if (currentViewingUserId) {
      const res = await httpService.get(ENDPOINTS.USER_PROFILE(currentViewingUserId));
      if (res.status === 200) {
        setUserProfile(res.data);
        setOriginalUserProfile(res.data);
        setShowLoading(false);
        loadSummaryIntroDetails();
      } else {
        toast.error('Failed fetch user profile. Please refresh the page.');
        setShowLoading(true);
      }
    } else {
      toast.error('Failed fetch user profile. Specific user id required.');
      setShowLoading(true);
    }
  };

  /* useEffect Hook */
  useEffect(() => {
    // Get User Profile
    loadUserProfile();

    // Clean up if any
    return () => {};
  }, []);

  // useEffect(() => {
  //   if(shouldRefreshTeamData) {

  //   }

  //   // Clean up if any
  //   return () => {};
  // }, [shouldRefreshTeamData]);

  /* Render */
  return showLoading || userProfile === undefined ? (
    <Container fluid>
      <Row className="text-center" data-test="loading">
        <SkeletonLoading template="UserProfile" />
      </Row>
    </Container>
  ) : (
    <div>
        <div className={darkMode ? 'bg-oxford-blue' : ''} style={{ minHeight: '100%' }}>
        {/* User Status Popup Modal */}
        <ActiveInactiveConfirmationPopup
          isActive={userProfile.isActive}
          fullName={`${userProfile.firstName} ${userProfile.lastName}`}
          open={userStatusPopupOpen}
          setActiveInactive={setUserStatusPopupOpen}
          onClose={() => setUserStatusPopupOpen(false)}
        />
        {/* User Blue Sqr, Upload, and links Popup Modal */}
        {showModal && (
          <UserProfileModal
            isOpen={showModal}
            closeModal={() => setShowModal(false)}
            modalMessage={modalMessage}
            modalTitle={modalTitle}
            type={modalType}
            updateLink={updateLink}
            modifyBlueSquares={modifyBlueSquares}
            userProfile={userProfile}
            id={blueSqrId}
          />
        )}
        <TabToolTips />
        <BasicToolTips />
        {/* Content */}
        <Container className={`py-5 ${darkMode ? 'bg-yinmn-blue text-light' : ''}`}>
          <Row>
            <Col md="4" id="profileContainer">
              <UserProfilePic userProfile={userProfile} setUserProfile={setUserProfile} canEdit />
            </Col>
            <Col md="8">
              {/* Alert banner */}
              {hasProfileChanged || isTaskTeamProjectChanged
              // || !isTasksEqual
              // || (!isTeamsEqual && !isTeamSaved)
              //     || !isProjectsEqual
                ? (
                <Alert color="warning">
                  Please click on &quot;Save changes&quot; to save the changes you have made.{' '}
                </Alert>
                ) : null}
              {!teamCodeValid ? (
                <Alert color="danger">The code format should be A-AAA or AAAAA.</Alert>
              ) : null}
              {/* Profile Header */}
              <div className="profile-head">
                <h5 className={`mr-2 ${darkMode ? 'text-light' : ''}`}>
                  {currUserFullname}
                </h5>
                <div style={{ marginTop: '6px' }}>
                  <EditableInfoModal
                    areaName="UserProfileInfoModal"
                    areaTitle="User Profile"
                    fontSize={24}
                    isPermissionPage
                    role={authUserRole}
                  />
                </div>
                <span className="mr-2">
                  <ActiveCell
                    isActive={userProfile.isActive}
                    user={userProfile}
                    canChange={canChangeUserStatus}
                    onClick={onClickActiveStatus}
                  />
                </span>
                {canEdit && (
                  <span className="mr-2">
                    <i
                      data-toggle="tooltip"
                      className="fa fa-clock-o"
                      aria-hidden="true"
                      style={{ fontSize: 24, cursor: 'pointer', marginTop: '6px' }}
                      title="Click to see user's timelog"
                      onClick={onClickUserTimelog}
                    />
                  </span>
                )}
                {(canChangeRehireableStatus) && (
                  <span className="mr-2">
                    <i
                      className={isRehireable ? 'fa fa-check-square-o' : 'fa fa-square-o'}
                      aria-hidden="true"
                      style={{ fontSize: 24, cursor: 'pointer', marginTop: '6px' }}
                      title="Click to change rehirable status"
                      onClick={handleRehireableChange}
                    />
                  </span>
                )}
                <Button
                  onClick={onClickShowTeamSummary}
                  color="primary"
                  size="sm"
                  style={darkMode ? boxStyleDark : boxStyle}
                >
                  {showTeamWeeklySummary ? 'Hide Team Weekly Summaries' : 'Show Team Weekly Summaries'}
                </Button>
                {canGetProjectMembers && userProfile.teams.length !== 0 ? (
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(summaryIntro);
                      toast.success('Summary Intro Copied!');
                    }}
                    color="primary"
                    size="sm"
                    title="Generates the summary intro for your team and copies it to your clipboard for easy use."
                    style={darkMode ? boxStyleDark : boxStyle}
                  >
                    Generate Summary Intro
                  </Button>
                ) : (
                  ''
                )}
              </div>
              {/* Name and Start Date Section */}
              <h6 className="text-azure">{userProfile.jobTitle || null }</h6>
              <p className={`proile-rating ${darkMode ? 'text-light' : ''}`}>
                {/* use UTC rather than Timezoned Date */}
                From :{' '}
                <span className={darkMode ? 'text-light' : ''}>
                  {convertDateFormatToMMMDDYY(userProfile.startDate)}
                </span>
                {'   '}
                To:{' '}
                <span className={darkMode ? 'text-light' : ''}>
                  {userProfile.endDate ? convertDateFormatToMMMDDYY(userProfile.endDate) : 'N/A'}
                </span>
              </p>
                <TeamSummarySelect
                  userId={currentViewingUserId}
                  shouldRefreshData={shouldRefreshTeamData}
                  darkMode={darkMode ? 'text-light' : ''}
                  customStyles={customStyles} />
              <Badges
                isUserSelf={isUserSelf}
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                setOriginalUserProfile={setOriginalUserProfile}
                role={authUserRole}
                canEdit={canEdit}
                handleSubmit={handleBadgeSubmit}
                isRecordBelongsToJaeAndUneditable={targetIsDevAdminUneditable}
                darkMode={darkMode}
              />
            </Col>
          </Row>
          <Row>
            <Col md="4">
              <div className="profile-work">
                <UserLinkLayout
                  isUserSelf={isUserSelf}
                  userProfile={userProfile}
                  updateLink={updateLink}
                  handleLinkModel={props.handleLinkModel}
                  handleSubmit={handleSubmit}
                  role={requestorRole}
                  canEdit={canEdit}
                  darkMode={darkMode}
                />
                <BlueSquareLayout
                  userProfile={userProfile}
                  handleUserProfile={handleUserProfile}
                  handleSaveError={props.handleSaveError}
                  handleBlueSquare={handleBlueSquare}
                  user={props.auth.user}
                  isUserSelf={isUserSelf}
                  canEdit={canEdit}
                  darkMode={darkMode}
                />
              </div>
            </Col>
            <Col md="8" className="profile-functions-desktop">
              <div className="profile-tabs">
                <Nav tabs>
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === '1' },
                        'nav-link',
                        darkMode && activeTab === '1' ? 'bg-space-cadet text-light' : 'text-azure',
                      )}
                      onClick={() => toggleTab('1')}
                      id="nabLink-basic"
                    >
                      Basic Information
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === '2' },
                        'nav-link',
                        darkMode && activeTab === '2' ? 'bg-space-cadet text-light' : 'text-azure',
                      )}
                      onClick={() => toggleTab('2')}
                      id="nabLink-time"
                    >
                      Volunteering Times
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === '3' },
                        'nav-link',
                        darkMode && activeTab === '3' ? 'bg-space-cadet text-light' : 'text-azure',
                      )}
                      onClick={() => toggleTab('3')}
                      id="nabLink-teams"
                    >
                      Teams
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === '4' },
                        'nav-link',
                        darkMode && activeTab === '4' ? 'bg-space-cadet text-light' : 'text-azure',
                      )}
                      onClick={() => toggleTab('4')}
                      id="nabLink-projects"
                    >
                      Projects
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames(
                        { active: activeTab === '5' },
                        'nav-link',
                        darkMode && activeTab === '5' ? 'bg-space-cadet text-light' : 'text-azure',
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleTab('5');
                      }}
                      data-testid="edit-history-tab"
                    >
                      Edit History
                    </NavLink>
                  </NavItem>
                </Nav>
              </div>
              <TabContent
                activeTab={activeTab}
                className={`tab-content profile-tab ${darkMode ? 'bg-yinmn-blue' : ''}`}
                id="myTabContent"
                style={{ border: 0 }}
              >
                <TabPane tabId="1">
                  <BasicInformationTab
                    role={requestorRole}
                    userProfile={userProfile}
                    setUserProfile={setUserProfile}
                    loadUserProfile={loadUserProfile}
                    handleUserProfile={handleUserProfile}
                    formValid={formValid}
                    setFormValid={setFormValid}
                    isUserSelf={isUserSelf}
                    canEdit={canEdit}
                    canEditRole={canEditUserProfile}
                    roles={roles}
                    darkMode={darkMode}
                  />
                </TabPane>
                <TabPane tabId="2">
                  <VolunteeringTimeTab
                    userProfile={userProfile}
                    setUserProfile={setUserProfile}
                    isUserSelf={isUserSelf}
                    role={requestorRole}
                    onEndDate={handleEndDate}
                    loadUserProfile={loadUserProfile}
                    canEdit={canEditUserProfile}
                    onStartDate={handleStartDate}
                    darkMode={darkMode}
                  />
                </TabPane>
                <TabPane tabId="3">
                  <TeamsTab
                    userTeams={teams || []}
                    teamsData={props?.allTeams || []}
                    onAssignTeam={onAssignTeam}
                    onDeleteTeam={onDeleteTeam}
                    edit={canEdit && !targetIsDevAdminUneditable}
                    role={requestorRole}
                    onUserVisibilitySwitch={onUserVisibilitySwitch}
                    isVisible={userProfile.isVisible}
                    canEditVisibility={canEdit && !['Volunteer', 'Mentor'].includes(requestorRole)}
                    handleSubmit={handleSubmit}
                    disabled={
                      !formValid.firstName
                      || !formValid.lastName
                      || !formValid.email
                      || (!(isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual)
                        && !isTeamSaved)
                    }
                    canEditTeamCode={
                      props.hasPermission('editTeamCode')
                      || requestorRole == 'Owner'
                      || !targetIsDevAdminUneditable
                    }
                    setUserProfile={setUserProfile}
                    userProfile={userProfile}
                    codeValid={codeValid}
                    setCodeValid={setCodeValid}
                    saved={saved}
                    isTeamSaved={(isSaved) => setIsTeamSaved(isSaved)}
                    darkMode={darkMode}
                  />
                </TabPane>
                <TabPane tabId="4">
                  <ProjectsTab
                    userProjects={userProfile.projects || []}
                    userTasks={tasks}
                    projectsData={props?.allProjects?.projects || []}
                    onAssignProject={onAssignProject}
                    onDeleteProject={onDeleteProject}
                    edit={canEdit}
                    role={requestorRole}
                    userId={props.match.params.userId}
                    updateTask={onUpdateTask}
                    handleSubmit={handleSubmit}
                    disabled={
                      !formValid.firstName
                      || !formValid.lastName
                      || !formValid.email
                      || !(isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual)
                    }
                    darkMode={darkMode}
                  />
                </TabPane>
                <TabPane tabId="5">
                  <TimeEntryEditHistory
                    userProfile={userProfile}
                    setUserProfile={setUserProfile}
                    role={requestorRole}
                    isRecordBelongsToJaeAndUneditable={targetIsDevAdminUneditable}
                    darkMode={darkMode}
                  />
                </TabPane>
              </TabContent>
            </Col>
            <Col md="8" className="profile-functions-tablet">
              <List className="profile-functions-list">
                <Button
                  className="list-button"
                  onClick={() => toggle('Basic Information')}
                  color="primary"
                  style={darkMode ? boxStyleDark : boxStyle}
                >
                  Basic Information
                </Button>
                <Modal isOpen={showConfirmDialog} toggle={handleCancelChange}>
                  <ModalHeader toggle={handleCancelChange}>Confirm Status Change</ModalHeader>
                  <ModalBody>
                    {`Are you sure you want to change the user status to ${
                      pendingRehireableStatus ? 'Rehireable' : 'Unrehireable'
                    }?`}
                  </ModalBody>
                  <ModalFooter>
                    <Button color="primary" onClick={handleConfirmChange}>
                      Confirm
                    </Button>{' '}
                    <Button color="secondary" onClick={handleCancelChange}>
                      Cancel
                    </Button>
                  </ModalFooter>
                </Modal>
                <Modal isOpen={menuModalTabletScreen === 'Basic Information'} toggle={toggle}>
                  <ModalHeader toggle={toggle} className={darkMode ? 'bg-azure text-light' : ''}>
                    Basic Information
                  </ModalHeader>
                  <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
                    <BasicInformationTab
                      role={requestorRole}
                      userProfile={userProfile}
                      setUserProfile={setUserProfile}
                      loadUserProfile={loadUserProfile}
                      handleUserProfile={handleUserProfile}
                      formValid={formValid}
                      setFormValid={setFormValid}
                      isUserSelf={isUserSelf}
                      canEdit={canEdit}
                      canEditRole={canEditUserProfile}
                      roles={roles}
                      darkMode={darkMode}
                    />
                  </ModalBody>
                  <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
                    <Row>
                      <div className="profileEditButtonContainer">
                        {canUpdatePassword && canEdit && !isUserSelf && (
                          <ResetPasswordButton
                            className="mr-1 btn-bottom"
                            user={userProfile}
                            authEmail={authEmail}
                          />
                        )}
                        {isUserSelf && (activeTab == '1' || canPutUserProfile) && (
                          <Link
                            to={
                              targetIsDevAdminUneditable
                                ? '#'
                                : `/updatepassword/${userProfile._id}`
                            }
                            onClick={() => {
                              if (targetIsDevAdminUneditable) {
                                alert(
                                  'STOP! YOU SHOULDN’T BE TRYING TO CHANGE THIS PASSWORD. '
                                    + 'You shouldn’t even be using this account except to create your own accounts to use. '
                                    + 'Please re-read the Local Setup Doc to understand why and what you should be doing instead of what you are trying to do now.',
                                );
                                return '#';
                              }
                            }}
                          >
                            <Button
                              className="mr-1 btn-bottom"
                              color="primary"
                              style={darkMode ? boxStyleDark : boxStyle}
                            >
                              {' '}
                              Update Password
                            </Button>
                          </Link>
                        )}
                        {canEdit && (activeTab == '1' || canPutUserProfile) && (
                          <>
                            <SaveButton
                              className="mr-1 btn-bottom"
                              handleSubmit={async () => await handleSubmit()}
                              disabled={
                                !formValid.firstName
                                || !formValid.lastName
                                || !formValid.email
                                || !codeValid
                                || (isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual)
                              }
                              userProfile={userProfile}
                              setSaved={() => setSaved(true)}
                              darkMode={darkMode}
                            />
                            <span
                              onClick={() => {
                                setUserProfile(originalUserProfile);
                                setTasks(originalTasks);
                                setProjects(resetProjects);
                              }}
                              className="btn btn-outline-danger mr-1 btn-bottom"
                              style={darkMode ? boxStyleDark : boxStyle}
                            >
                              X
                            </span>
                          </>
                        )}
                        <Button
                          outline
                          onClick={() => loadUserProfile()}
                          style={darkMode ? boxStyleDark : boxStyle}
                        >
                          <i
                            className={`fa fa-refresh ${darkMode ? 'text-light' : ''}`}
                            aria-hidden="true"
                          />
                        </Button>
                      </div>
                    </Row>
                  </ModalFooter>
                </Modal>
                <Button
                  className="list-button"
                  onClick={() => toggle('Volunteering Times')}
                  color="secondary"
                  style={darkMode ? boxStyleDark : boxStyle}
                >
                  Volunteering Times
                </Button>
                <Modal isOpen={menuModalTabletScreen === 'Volunteering Times'} toggle={toggle}>
                  <ModalHeader toggle={toggle} className={darkMode ? 'bg-azure text-light' : ''}>
                    Volunteering Times
                  </ModalHeader>
                  <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
                    <VolunteeringTimeTab
                      userProfile={userProfile}
                      setUserProfile={setUserProfile}
                      isUserSelf={isUserSelf}
                      role={requestorRole}
                      onEndDate={handleEndDate}
                      canEdit={canEdit}
                      onStartDate={handleStartDate}
                      darkMode={darkMode}
                    />
                  </ModalBody>
                  <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
                    <Row>
                      <div className="profileEditButtonContainer">
                        {canEdit && (activeTab == '1' || canPutUserProfile) && (
                          <>
                            <SaveButton
                              className="mr-1 btn-bottom"
                              handleSubmit={async () => await handleSubmit()}
                              disabled={
                                !formValid.firstName
                                || !formValid.lastName
                                || !formValid.email
                                || !codeValid
                                || (isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual)
                              }
                              userProfile={userProfile}
                              setSaved={() => setSaved(true)}
                              darkMode={darkMode}
                            />
                            <span
                              onClick={() => {
                                setUserProfile(originalUserProfile);
                                setTasks(originalTasks);
                                setProjects(resetProjects);
                              }}
                              className="btn btn-outline-danger mr-1 btn-bottom"
                              style={darkMode ? boxStyleDark : boxStyle}
                            >
                              X
                            </span>
                          </>
                        )}
                        <Button
                          outline
                          onClick={() => loadUserProfile()}
                          style={darkMode ? boxStyleDark : boxStyle}
                        >
                          <i
                            className={`fa fa-refresh ${darkMode ? 'text-light' : ''}`}
                            aria-hidden="true"
                          />
                        </Button>
                      </div>
                    </Row>
                  </ModalFooter>
                </Modal>
                <Button
                  className="list-button"
                  onClick={() => toggle('Teams')}
                  color="secondary"
                  style={darkMode ? boxStyleDark : boxStyle}
                >
                  Teams
                </Button>
                <Modal isOpen={menuModalTabletScreen === 'Teams'} toggle={toggle}>
                  <ModalHeader toggle={toggle} className={darkMode ? 'bg-azure text-light' : ''}>
                    Teams
                  </ModalHeader>
                  <ModalBody className={darkMode ? 'bg-yinmn-blue text-light' : ''}>
                    <TeamsTab
                      userTeams={userProfile?.teams || []}
                      teamsData={props?.allTeams?.allTeamCode || []}
                      onAssignTeam={onAssignTeam}
                      onDeleteTeam={onDeleteTeam}
                      edit={canEdit}
                      role={requestorRole}
                      onUserVisibilitySwitch={onUserVisibilitySwitch}
                      isVisible={userProfile.isVisible}
                      canEditVisibility={
                        canEdit && !['Volunteer', 'Mentor'].includes(requestorRole)
                      }
                      handleSubmit={handleSubmit}
                      disabled={
                        !formValid.firstName
                        || !formValid.lastName
                        || !formValid.email
                        || !(
                          isProfileEqual
                          && isTasksEqual
                          // && isTeamsEqual
                          && isProjectsEqual
                        )
                      }
                      canEditTeamCode={
                        props.hasPermission('editTeamCode')
                        || requestorRole === 'Owner'
                        || requestorRole === 'Administrator'
                      }
                      setUserProfile={setUserProfile}
                      userProfile={userProfile}
                      codeValid={codeValid}
                      setCodeValid={setCodeValid}
                      darkMode={darkMode}
                    />
                  </ModalBody>
                  <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
                    <Row>
                      <div className="profileEditButtonContainer">
                        {canEdit && (activeTab == '1' || canPutUserProfile) && (
                          <>
                            <SaveButton
                              className="mr-1 btn-bottom"
                              handleSubmit={async () => await handleSubmit()}
                              disabled={
                                !formValid.firstName
                                || !formValid.lastName
                                || !formValid.email
                                || !codeValid
                                || (isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual)
                              }
                              userProfile={userProfile}
                              setSaved={() => setSaved(true)}
                              darkMode={darkMode}
                            />
                            <span
                              onClick={() => {
                                setUserProfile(originalUserProfile);
                                setTasks(originalTasks);
                                setProjects(resetProjects);
                              }}
                              className="btn btn-outline-danger mr-1 btn-bottom"
                              style={darkMode ? boxStyleDark : boxStyle}
                            >
                              X
                            </span>
                          </>
                        )}
                        <Button
                          outline
                          onClick={() => loadUserProfile()}
                          style={darkMode ? boxStyleDark : boxStyle}
                        >
                          <i
                            className={`fa fa-refresh ${darkMode ? 'text-light' : ''}`}
                            aria-hidden="true"
                          />
                        </Button>
                      </div>
                    </Row>
                  </ModalFooter>
                </Modal>
                <Button
                  className="list-button"
                  onClick={() => toggle('Projects')}
                  color="secondary"
                  style={darkMode ? boxStyleDark : boxStyle}
                >
                  Projects
                </Button>
                <Modal isOpen={menuModalTabletScreen === 'Projects'} toggle={toggle}>
                  <ModalHeader toggle={toggle} className={darkMode ? 'bg-azure text-light' : ''}>
                    Projects
                  </ModalHeader>
                  <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
                    <ProjectsTab
                      userProjects={userProfile.projects || []}
                      userTasks={tasks}
                      projectsData={props?.allProjects?.projects || []}
                      onAssignProject={onAssignProject}
                      onDeleteProject={onDeleteProject}
                      edit={canPutUserProfile}
                      role={requestorRole}
                      userId={props.match.params.userId}
                      updateTask={onUpdateTask}
                      handleSubmit={handleSubmit}
                      disabled={
                        !formValid.firstName
                        || !formValid.lastName
                        || !formValid.email
                        || !(isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual)
                      }
                      darkMode={darkMode}
                    />
                  </ModalBody>
                  <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
                    <Row>
                      <div className="profileEditButtonContainer">
                        {canEdit && (activeTab == '1' || canPutUserProfile) && (
                          <>
                            <SaveButton
                              className="mr-1 btn-bottom"
                              handleSubmit={async () => await handleSubmit()}
                              disabled={
                                !formValid.firstName
                                || !formValid.lastName
                                || !formValid.email
                                || !codeValid
                                || (isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual)
                              }
                              userProfile={userProfile}
                              setSaved={() => setSaved(true)}
                              darkMode={darkMode}
                            />
                            <span
                              onClick={() => {
                                setUserProfile(originalUserProfile);
                                setTasks(originalTasks);
                                setProjects(resetProjects);
                              }}
                              className="btn btn-outline-danger mr-1 btn-bottom"
                              style={darkMode ? boxStyleDark : boxStyle}
                            >
                              X
                            </span>
                          </>
                        )}
                        <Button
                          outline
                          onClick={() => loadUserProfile()}
                          style={darkMode ? boxStyleDark : boxStyle}
                        >
                          <i
                            className={`fa fa-refresh ${darkMode ? 'text-light' : ''}`}
                            aria-hidden="true"
                          />
                        </Button>
                      </div>
                    </Row>
                  </ModalFooter>
                </Modal>
                <Button
                  className="list-button"
                  onClick={() => toggle('Edit History')}
                  color="secondary"
                  style={darkMode ? boxStyleDark : boxStyle}
                >
                  Edit History
                </Button>
                <Modal isOpen={menuModalTabletScreen === 'Edit History'} toggle={toggle}>
                  <ModalHeader toggle={toggle} className={darkMode ? 'bg-azure text-light' : ''}>
                    Edit History
                  </ModalHeader>
                  <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
                    <TimeEntryEditHistory
                      userProfile={userProfile}
                      setUserProfile={setUserProfile}
                      darkMode={darkMode}
                      tabletView
                    />
                  </ModalBody>
                  <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
                    <Row>
                      <div className="profileEditButtonContainer">
                        {canEdit && (activeTab == '1' || canPutUserProfile) && (
                          <>
                            <SaveButton
                              className="mr-1 btn-bottom"
                              handleSubmit={async () => await handleSubmit()}
                              disabled={
                                !formValid.firstName
                                || !formValid.lastName
                                || !formValid.email
                                || !codeValid
                                || (isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual)
                              }
                              userProfile={userProfile}
                              setSaved={() => setSaved(true)}
                              darkMode={darkMode}
                            />
                            <span
                              onClick={() => {
                                setUserProfile(originalUserProfile);
                                setTasks(originalTasks);
                                setProjects(resetProjects);
                              }}
                              className="btn btn-outline-danger mr-1 btn-bottom"
                              style={darkMode ? boxStyleDark : boxStyle}
                            >
                              X
                            </span>
                          </>
                        )}
                        <Button
                          outline
                          onClick={() => loadUserProfile()}
                          style={darkMode ? boxStyleDark : boxStyle}
                        >
                          <i
                            className={`fa fa-refresh ${darkMode ? 'text-light' : ''}`}
                            aria-hidden="true"
                          />
                        </Button>
                      </div>
                    </Row>
                  </ModalFooter>
                </Modal>
              </List>
            </Col>
          </Row>
          <Row>
            <Col md="4" />
            <Col md="8" className="desktop-panel">
              <div className="profileEditButtonContainer">
                {canUpdatePassword && canEdit && !isUserSelf && (
                  <ResetPasswordButton
                    className="mr-1 btn-bottom"
                    user={userProfile}
                    authEmail={authEmail}
                  />
                )}
                {isUserSelf && (activeTab === '1' || canPutUserProfile) && (
                  <Link
                    to={targetIsDevAdminUneditable ? '#' : `/updatepassword/${userProfile._id}`}
                    onClick={() => {
                      if (targetIsDevAdminUneditable) {
                        alert(
                          'STOP! YOU SHOULDN’T BE TRYING TO CHANGE THIS PASSWORD. '
                            + 'You shouldn’t even be using this account except to create your own accounts to use. '
                            + 'Please re-read the Local Setup Doc to understand why and what you should be doing instead of what you are trying to do now.',
                        );
                        return '#';
                      }
                    }}
                  >
                    <Button
                      className="mr-1 btn-bottom"
                      color="primary"
                      style={darkMode ? boxStyleDark : boxStyle}
                    >
                      {' '}
                      Update Password
                    </Button>
                  </Link>
                )}
                {canEdit && activeTab && (
                  <>
                    <SaveButton
                      className="mr-1 btn-bottom"
                      handleSubmit={async () => await handleSubmit()}
                      disabled={
                        !formValid.firstName
                        || !formValid.lastName
                        || !formValid.email
                        || !codeValid
                        || (userStartDate > userEndDate && userEndDate !== '')
                        || (isProfileEqual && isTasksEqual && isTeamsEqual && isProjectsEqual)
                        || isTeamSaved
                      }
                      userProfile={userProfile}
                      setSaved={() => setSaved(true)}
                      darkMode={darkMode}
                    />
                    {activeTab !== '3' && (
                      <span
                        onClick={() => {
                          setUserProfile(originalUserProfile);
                          setTasks(originalTasks);
                          setTeams(originalTeams);
                          setProjects(resetProjects);
                        }}
                        className="btn btn-outline-danger mr-1 btn-bottom"
                        style={darkMode ? boxStyleDark : boxStyle}
                      >
                        Cancel
                      </span>
                    )}
                  </>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default UserProfile;
