import { useState, useEffect, useMemo } from 'react';
// import { getUserProfile } from '../../actions/userProfile'
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import { getWeeklySummaries } from 'actions/weeklySummaries';
import { Link, useLocation } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
} from 'reactstrap';
import PopUpBar from 'components/PopUpBar';
import { fetchTaskEditSuggestions } from 'components/TaskEditSuggestions/thunks';
import { toast } from 'react-toastify';
import { getHeaderData } from '../../actions/authActions';
import { getAllRoles } from '../../actions/role';
import Timer from '../Timer/Timer';
import OwnerMessage from '../OwnerMessage/OwnerMessage';
import {
  DASHBOARD,
  TIMELOG,
  REPORTS,
  WEEKLY_SUMMARIES_REPORT,
  TEAM_LOCATIONS,
  OTHER_LINKS,
  USER_MANAGEMENT,
  BADGE_MANAGEMENT,
  PROJECTS,
  TEAMS,
  WELCOME,
  VIEW_PROFILE,
  UPDATE_PASSWORD,
  LOGOUT,
  PERMISSIONS_MANAGEMENT,
  SEND_EMAILS,
  TOTAL_ORG_SUMMARY,
  TOTAL_CONSTRUCTION_SUMMARY,
} from '../../languages/en/ui';
import Logout from '../Logout/Logout';
import './Header.css';
import hasPermission, { cantUpdateDevAdminDetails } from '../../utils/permissions';
import {
  getUnreadUserNotifications,
  resetNotificationError,
} from '../../actions/notificationAction';
import NotificationCard from '../Notification/notificationCard';
import DarkModeButton from './DarkModeButton';

export function Header(props) {
  const location = useLocation();
  const { darkMode } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [logoutPopup, setLogoutPopup] = useState(false);
  const { isAuthenticated, user } = props.auth;
  const [firstName, setFirstName] = useState(props.auth.firstName);
  const [profilePic, setProfilePic] = useState(props.auth.profilePic);
  const [displayUserId, setDisplayUserId] = useState(user.userid);
  const [popup, setPopup] = useState(false);
  const [isAuthUser, setIsAuthUser] = useState(true);

  const ALLOWED_ROLES_TO_INTERACT = useMemo(() => ['Owner', 'Administrator'], []);
  const canInteractWithViewingUser = useMemo(
    () => ALLOWED_ROLES_TO_INTERACT.includes(props.auth.user.role),
    [ALLOWED_ROLES_TO_INTERACT, props.auth.user.role],
  );

  // Reports
  const canGetReports = props.hasPermission(
    'getReports',
    !isAuthUser && canInteractWithViewingUser,
  );
  const canGetWeeklySummaries = props.hasPermission(
    'getWeeklySummaries',
    !isAuthUser && canInteractWithViewingUser,
  );
  const canGetWeeklyVolunteerSummary = props.hasPermission('getWeeklySummaries');

  // Users
  const canAccessUserManagement =
    props.hasPermission('postUserProfile', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('deleteUserProfile', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('changeUserStatus', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('getUserProfiles', !isAuthUser && canInteractWithViewingUser);

  // Badges
  const canAccessBadgeManagement =
    props.hasPermission('seeBadges', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('createBadges', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('updateBadges', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('deleteBadges', !isAuthUser && canInteractWithViewingUser);
  // Projects
  const canAccessProjects =
    props.hasPermission('postProject', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('deleteProject', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('putProject', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('getProjectMembers', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('assignProjectToUsers', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('postWbs', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('deleteWbs', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('postTask', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('updateTask', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('deleteTask', !isAuthUser && canInteractWithViewingUser);
  // Tasks
  const canUpdateTask = props.hasPermission(
    'updateTask',
    !isAuthUser && canInteractWithViewingUser,
  );
  // Teams
  const canAccessTeams =
    props.hasPermission('postTeam', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('putTeam', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('deleteTeam', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('assignTeamToUsers', !isAuthUser && canInteractWithViewingUser);
  // Popups
  const canAccessPopups =
    props.hasPermission('createPopup', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('updatePopup', !isAuthUser && canInteractWithViewingUser);
  // SendEmails
  const canAccessSendEmails = props.hasPermission('sendEmails', !isAuthUser);
  // Permissions
  const canAccessPermissionsManagement =
    props.hasPermission('postRole', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('putRole', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('deleteRole', !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission('putUserProfilePermissions', !isAuthUser && canInteractWithViewingUser);

  const userId = user.userid;
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [userDashboardProfile, setUserDashboardProfile] = useState(undefined);
  const [hasProfileLoaded, setHasProfileLoaded] = useState(false);
  const dismissalKey = `lastDismissed_${userId}`;
  const [lastDismissed, setLastDismissed] = useState(localStorage.getItem(dismissalKey));
  const unreadNotifications = props.notification?.unreadNotifications; // List of unread notifications
  const dispatch = useDispatch();
  const history = useHistory();

  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  useEffect(() => {
    const handleStorageEvent = () => {
      const sessionStorageData = JSON.parse(window.sessionStorage.getItem('viewingUser'));
      if (sessionStorageData) {
        setDisplayUserId(sessionStorageData.userId);
        setFirstName(sessionStorageData.firstName);
        setProfilePic(sessionStorageData.profilePic);
        setIsAuthUser(false);
      } else {
        setDisplayUserId(user.userid);
        setFirstName(props.auth.firstName);
        setProfilePic(props.auth.profilePic);
        setIsAuthUser(true);
      }
    };

    // Set the initial state when the component mounts
    handleStorageEvent();

    // Add the event listener
    window.addEventListener('storage', handleStorageEvent);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [user.userid, props.auth.firstName]);

  // useEffect(() => {
  //   const handleResize = () => {
  //     console.log('Window size: ', window.innerWidth);
  //   };
  
  //   // Add event listener
  //   window.addEventListener('resize', handleResize);
  //   handleResize();
  
  //   return () => {
  //     window.removeEventListener('resize', handleResize);
  //   };
  // }, []); // Empty dependency array means this effect will only run once, similar to componentDidMount
  
  useEffect(() => {
    if (props.auth.isAuthenticated) {
      props.getHeaderData(props.auth.user.userid);
      if (props.auth.user.role === 'Owner' || props.auth.user.role === 'Administrator') {
        dispatch(fetchTaskEditSuggestions());
      }
    }
  }, [props.auth.isAuthenticated]);
  const roles = props.role?.roles;

  useEffect(() => {
    if (roles.length === 0 && isAuthenticated) {
      props.getAllRoles();
    }
    // Fetch unread notification
    if (isAuthenticated && userId) {
      dispatch(getUnreadUserNotifications(userId));
    }
  }, []);

  useEffect(() => {
    if (props.notification?.error) {
      toast.error(props.notification.error.message);
      dispatch(resetNotificationError());
    }
  }, [props.notification?.error]);

  const toggle = () => {
    setIsOpen(prevIsOpen => !prevIsOpen);
  };

  const openModal = () => {
    setLogoutPopup(true);
  };

  const removeViewingUser = () => {
    setPopup(false);
    sessionStorage.removeItem('viewingUser');
    window.dispatchEvent(new Event('storage'));
    props.getWeeklySummaries(user.userid);
    history.push('/dashboard');
  };
  const closeModal = () => {
    setModalVisible(false);
    const today = new Date();
    localStorage.setItem(dismissalKey, today);
    setLastDismissed(today);
  };

  const getMostRecentThursday = date => {
    const mostRecentThursday = new Date(date);
    if (date.getDay() === 4) {
      // If today is Thursday, return today's date
      mostRecentThursday.setHours(0, 0, 0, 0);
      return mostRecentThursday;
    }
    // Otherwise, find the previous Thursday
    mostRecentThursday.setDate(date.getDate() - ((date.getDay() + 3) % 7));
    mostRecentThursday.setHours(0, 0, 0, 0);
    return mostRecentThursday;
  };

  const loadUserDashboardProfile = async () => {
    if (!userId || hasProfileLoaded) return;
    try {
      const response = await axios.get(ENDPOINTS.USER_PROFILE(userId));
      const newUserProfile = response.data;
      setUserDashboardProfile(newUserProfile);
      setHasProfileLoaded(true); // Set flag to true after loading the profile
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('User Profile not loaded.', err);
    }
  };

  useEffect(() => {
    loadUserDashboardProfile();

    if (user.role === 'Owner' || user.role === 'Administrator' || user.role === 'Mentor') {
      setModalVisible(false);
      return;
    }

    const today = new Date();
    const lastDismissedDate = lastDismissed ? new Date(lastDismissed) : null;

    // Check if lastDismissed date is ahead of today
    if (lastDismissedDate > today) {
      // Clear lastDismissed in both the state and localStorage
      setLastDismissed(null);
      localStorage.removeItem(dismissalKey);
    }

    // Check if today is Thursday or the stored date is before the most recent Thursday
    if (!lastDismissed || lastDismissedDate < getMostRecentThursday(today)) {
      if (userDashboardProfile?.teams?.length > 0) {
        if (user.role === 'Assistant Manager' || user.role === 'Volunteer') {
          setModalVisible(true);
          // Assistant Manager or Volunteer message
          setModalContent(
            `If you are seeing this, it’s because you are on a team! As a member of a team, you need to turn in your work 24 hours earlier, i.e. FRIDAY night at midnight Pacific Time. This is so your manager has time to review it and submit and report on your entire team’s work by the usual Saturday night deadline. For any work you plan on completing Saturday, please take pictures as best you can and include it in your summary as if it were already done.\n\nBy dismissing this notice, you acknowledge you understand and will do this.`,
          );
        } else if (user.role === 'Manager') {
          setModalVisible(true);
          // Manager message
          setModalContent(`If you are seeing this, it’s because you are a Manager of a team! Remember to turn in your team’s work by the Saturday night at midnight (Pacific Time) deadline. Every member of your team gets a notice like this too. Theirs tells them to get you their work 24 hours early so you have time to review it and submit it. If you have to remind them repeatedly (4+ times, track it on their Google Doc), they should receive a blue square.
          `);
        }
      }
    } else {
      setModalVisible(false);
    }
  }, [lastDismissed, userId, userDashboardProfile]);

  useEffect(() => {
    setShowProjectDropdown(location.pathname.startsWith('/bmdashboard/projects/'));
  }, [location.pathname]);

  const fontColor = darkMode ? 'text-white dropdown-item-hover' : '';

  if (location.pathname === '/login') return null;

  return (
    <div className="header-wrapper">
      <Navbar className="py-3 navbar" color="dark" dark expand="md">
        {logoutPopup && <Logout open={logoutPopup} setLogoutPopup={setLogoutPopup} />}
        <div
          className="timer-message-section"
          style={user.role === 'Owner' ? { marginRight: '0.5rem' } : { marginRight: '1rem' }}
        >
          {isAuthenticated && <Timer darkMode={darkMode} />}
          {isAuthenticated && (
            <div className="owner-message">
              <OwnerMessage />
            </div>
          )}
        </div>
        <NavbarToggler onClick={toggle} />
        {isAuthenticated && (
          <Collapse isOpen={isOpen} navbar>
            <Nav className="ml-auto nav-links d-flex" navbar>
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ width: '100%' }}
              >
                {canUpdateTask && (
                  <NavItem className="responsive-spacing">
                    <NavLink tag={Link} to="/taskeditsuggestions">
                      <div className="redBackGroupHeader">
                        <span>{props.taskEditSuggestionCount}</span>
                      </div>
                    </NavLink>
                  </NavItem>
                )}
                <NavItem className="responsive-spacing">
                  <NavLink tag={Link} to="/dashboard">
                    <span className="dashboard-text-link">{DASHBOARD}</span>
                  </NavLink>
                </NavItem>
                <NavItem className="responsive-spacing">
                  <NavLink tag={Link} to="/timelog">
                    <span className="dashboard-text-link">{TIMELOG}</span>
                  </NavLink>
                </NavItem>

                {showProjectDropdown && (
                  <UncontrolledDropdown nav inNavbar className="responsive-spacing">
                    <DropdownToggle nav caret>
                      <span className="dashboard-text-link">{PROJECTS}</span>
                    </DropdownToggle>
                    <DropdownMenu className={darkMode ? 'bg-yinmn-blue' : ''}>
                      <DropdownItem
                        tag={Link}
                        to="/bmdashboard/materials/add"
                        className={fontColor}
                      >
                        Add Material
                      </DropdownItem>
                      <DropdownItem tag={Link} to="/bmdashboard/logMaterial" className={fontColor}>
                        Log Material
                      </DropdownItem>
                      <DropdownItem tag={Link} to="/bmdashboard/materials" className={fontColor}>
                        Material List
                      </DropdownItem>
                      <DropdownItem
                        tag={Link}
                        to="/bmdashboard/equipment/add"
                        className={fontColor}
                      >
                        Add Equipment/Tool
                      </DropdownItem>
                      <DropdownItem
                        tag={Link}
                        to="/bmdashboard/equipment/:equipmentId"
                        className={fontColor}
                      >
                        Log Equipment/Tool
                      </DropdownItem>
                      <DropdownItem
                        tag={Link}
                        to="/bmdashboard/tools/:equipmentId/update"
                        className={fontColor}
                      >
                        Update Equipment/Tool
                      </DropdownItem>
                      <DropdownItem tag={Link} to="/bmdashboard/equipment" className={fontColor}>
                        Equipment/Tool List
                      </DropdownItem>
                      <DropdownItem tag={Link} to="/bmdashboard/Issue" className={fontColor}>
                        Issue
                      </DropdownItem>
                      <DropdownItem tag={Link} to="/bmdashboard/lessonform/" className={fontColor}>
                        Lesson
                      </DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                )}
              </div>
              <div className="d-flex align-items-center justify-content-center">
                {canGetReports || canGetWeeklySummaries || canGetWeeklyVolunteerSummary ? (
                  <UncontrolledDropdown nav inNavbar className="responsive-spacing">
                    <DropdownToggle nav caret>
                      <span className="dashboard-text-link">{REPORTS}</span>
                    </DropdownToggle>
                    <DropdownMenu className={darkMode ? 'bg-yinmn-blue' : ''}>
                      {canGetReports && (
                        <DropdownItem tag={Link} to="/reports" className={`${fontColor}`}>
                          {REPORTS}
                        </DropdownItem>
                      )}
                      {canGetWeeklySummaries && (
                        <DropdownItem tag={Link} to="/weeklysummariesreport" className={fontColor}>
                          {WEEKLY_SUMMARIES_REPORT}
                        </DropdownItem>
                      )}
                      {canGetWeeklyVolunteerSummary && (
                        <DropdownItem tag={Link} to="/totalorgsummary" className={fontColor}>
                          {TOTAL_ORG_SUMMARY}
                        </DropdownItem>
                      )}
                      <DropdownItem tag={Link} to="/teamlocations" className={fontColor}>
                        {TEAM_LOCATIONS}
                      </DropdownItem>
                      <DropdownItem
                        tag={Link}
                        to="/bmdashboard/totalconstructionsummary"
                        className={fontColor}
                      >
                        {TOTAL_CONSTRUCTION_SUMMARY}
                      </DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                ) : (
                  <NavItem className="responsive-spacing">
                    <NavLink tag={Link} to="/teamlocations">
                      <span className="dashboard-text-link">{TEAM_LOCATIONS}</span>
                    </NavLink>
                  </NavItem>
                )}
                <NavItem className="responsive-spacing">
                  <NavLink tag={Link} to={`/timelog/${displayUserId}`}>
                    <i className="fa fa-bell i-large">
                      <i className="badge badge-pill badge-danger badge-notify">
                        {/* Pull number of unread messages */}
                      </i>
                      <span className="sr-only">unread messages</span>
                    </i>
                  </NavLink>
                </NavItem>
                {(canAccessUserManagement ||
                  canAccessBadgeManagement ||
                  canAccessProjects ||
                  canAccessTeams ||
                  canAccessPopups ||
                  canAccessSendEmails ||
                  canAccessPermissionsManagement) && (
                  <UncontrolledDropdown nav inNavbar className="responsive-spacing">
                    <DropdownToggle nav caret>
                      <span className="dashboard-text-link">{OTHER_LINKS}</span>
                    </DropdownToggle>
                    <DropdownMenu className={darkMode ? 'bg-yinmn-blue' : ''}>
                      {canAccessUserManagement ? (
                        <DropdownItem tag={Link} to="/usermanagement" className={fontColor}>
                          {USER_MANAGEMENT}
                        </DropdownItem>
                      ) : (
                        `null`
                      )}
                      {canAccessBadgeManagement ? (
                        <DropdownItem tag={Link} to="/badgemanagement" className={fontColor}>
                          {BADGE_MANAGEMENT}
                        </DropdownItem>
                      ) : (
                        `null`
                      )}
                      {canAccessProjects && (
                        <DropdownItem tag={Link} to="/projects" className={fontColor}>
                          {PROJECTS}
                        </DropdownItem>
                      )}
                      {canAccessTeams && (
                        <DropdownItem tag={Link} to="/teams" className={fontColor}>
                          {TEAMS}
                        </DropdownItem>
                      )}
                      {canAccessSendEmails && (
                        <DropdownItem tag={Link} to="/announcements" className={fontColor}>
                          {SEND_EMAILS}
                        </DropdownItem>
                      )}
                      {canAccessPermissionsManagement && (
                        <>
                          <DropdownItem divider />
                          <DropdownItem
                            tag={Link}
                            to="/permissionsmanagement"
                            className={fontColor}
                          >
                            {PERMISSIONS_MANAGEMENT}
                          </DropdownItem>
                        </>
                      )}
                    </DropdownMenu>
                  </UncontrolledDropdown>
                )}
                <NavItem className="responsive-spacing">
                  <NavLink tag={Link} to={`/userprofile/${displayUserId}`}>
                    <img
                      src={`${profilePic || '/pfp-default-header.png'}`}
                      alt=""
                      style={{ maxWidth: '60px', maxHeight: '60px' }}
                      className="dashboardimg"
                    />
                  </NavLink>
                </NavItem>
                <UncontrolledDropdown nav className="responsive-spacing">
                  <DropdownToggle nav caret>
                    <span className="dashboard-text-link">
                      {WELCOME}, {firstName}
                    </span>
                  </DropdownToggle>
                  <DropdownMenu className={darkMode ? 'bg-yinmn-blue' : ''}>
                    <DropdownItem header className={darkMode ? 'text-custom-grey' : ''}>
                      Hello {firstName}
                    </DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem
                      tag={Link}
                      to={`/userprofile/${displayUserId}`}
                      className={fontColor}
                    >
                      {VIEW_PROFILE}
                    </DropdownItem>
                    {!cantUpdateDevAdminDetails(
                      props.userProfile.email,
                      props.userProfile.email,
                    ) && (
                      <DropdownItem
                        tag={Link}
                        to={`/updatepassword/${displayUserId}`}
                        className={fontColor}
                      >
                        {UPDATE_PASSWORD}
                      </DropdownItem>
                    )}
                    <DropdownItem className={fontColor}>
                      <DarkModeButton />
                    </DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem onClick={openModal} className={fontColor}>
                      {LOGOUT}
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </div>
            </Nav>
          </Collapse>
        )}
      </Navbar>
      {!isAuthUser && (
        <PopUpBar
          onClickClose={() => setPopup(prevPopup => !prevPopup)}
          viewingUser={JSON.parse(window.sessionStorage.getItem('viewingUser'))}
        />
      )}
      <div>
        <Modal isOpen={popup} className={darkMode ? 'text-light' : ''}>
          <ModalHeader className={darkMode ? 'bg-space-cadet' : ''}>
            Return to your Dashboard
          </ModalHeader>
          <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
            <p>Are you sure you wish to return to your own dashboard?</p>
          </ModalBody>
          <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
            <Button variant="primary" onClick={removeViewingUser}>
              Ok
            </Button>{' '}
            <Button variant="secondary" onClick={() => setPopup(prevPopup => !prevPopup)}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
      {props.auth.isAuthenticated && isModalVisible && (
        <Card color="primary">
          <div className="close-button">
            <Button close onClick={closeModal} />
          </div>
          <div className="card-content">{modalContent}</div>
        </Card>
      )}
      {/* Only render one unread message at a time */}
      {props.auth.isAuthenticated && unreadNotifications?.length > 0 ? (
        <NotificationCard notification={unreadNotifications[0]} />
      ) : null}
      <div className={darkMode ? 'header-margin' : 'header-margin-light'} />
    </div>
  );
}

const mapStateToProps = state => ({
  auth: state.auth,
  userProfile: state.userProfile,
  taskEditSuggestionCount: state.taskEditSuggestions.count,
  role: state.role,
  notification: state.notification,
  darkMode: state.theme.darkMode,
});

export default connect(mapStateToProps, {
  getHeaderData,
  getAllRoles,
  hasPermission,
  getWeeklySummaries,
})(Header);
