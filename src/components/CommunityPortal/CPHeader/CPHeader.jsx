import { useState, useEffect, useMemo } from 'react';
// import { getUserProfile } from '../../actions/userProfile'
import { Link } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
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
} from 'reactstrap';
import DarkModeButton from '~/components/Header/DarkModeButton';
import { fetchTaskEditSuggestions } from '~/components/TaskEditSuggestions/thunks';
import BellNotification from '~/components/Header/BellNotification';
import { getHeaderData } from '../../../actions/authActions';
import { getAllRoles } from '../../../actions/role';
import Timer from '../../Timer/Timer';
import OwnerMessage from '../../OwnerMessage/OwnerMessage';
import {
  // LOGO,
  DASHBOARD,
  // BM_DASHBOARD,
  // CP_DASHBOARD,
  REPORTS,
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
  ACTIVITY,
  PARTICIPATION,
  RESOURCE_USAGE,
  CALENDAR,
  EVENT_PERSONALIZATION,
  ACTIVITIES,
  REGISTRATION,
  SEND_EMAILS,
} from '../../../languages/en/ui';
import Logout from '../../Logout/Logout';
import './CPHeader.css';
import hasPermission, { cantUpdateDevAdminDetails } from '../../../utils/permissions';

export function CPHeader(props) {
  const [isOpen, setIsOpen] = useState(false);
  const [logoutPopup, setLogoutPopup] = useState(false);
  const { isAuthenticated, user } = props.auth;
  const [firstName, setFirstName] = useState(props.auth.firstName);
  const [profilePic, setProfilePic] = useState(props.auth.profilePic);
  const [isAuthUser, setIsAuthUser] = useState(true);
  const [displayUserId, setDisplayUserId] = useState(user.userid);

  const ALLOWED_ROLES_TO_INTERACT = useMemo(() => ['Owner', 'Administrator'], []);
  const canInteractWithViewingUser = useMemo(
    () => ALLOWED_ROLES_TO_INTERACT.includes(props.auth.user.role),
    [ALLOWED_ROLES_TO_INTERACT, props.auth.user.role],
  );

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

  const dispatch = useDispatch();
  const { darkMode } = props;

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

  useEffect(() => {
    if (props.auth.isAuthenticated) {
      props.getHeaderData(props.auth.user.userid);
      if (props.auth.user.role === 'Administrator') {
        dispatch(fetchTaskEditSuggestions());
      }
    }
  }, [props.auth.isAuthenticated]);

  const roles = props.role?.roles;

  useEffect(() => {
    if (roles.length === 0) {
      props.getAllRoles();
    }
  }, []);

  const toggle = () => {
    setIsOpen(prevIsOpen => !prevIsOpen);
  };

  const openModal = () => {
    setLogoutPopup(true);
  };

  const fontColor = darkMode ? 'text-white dropdown-item-hover' : '';

  return (
    <div className="header-wrapper">
      <Navbar className="py-3 navbar" color="dark" dark expand="md">
        {logoutPopup && <Logout open={logoutPopup} setLogoutPopup={setLogoutPopup} />}

        <div
          className="timer-message-section"
          style={user.role === 'Owner' ? { marginRight: '0.5rem' } : { marginRight: '1rem' }}
        >
          {isAuthenticated && <Timer />}
          {isAuthenticated && (
            <div className="owner-message">
              <OwnerMessage />
            </div>
          )}
        </div>
        <NavbarToggler onClick={toggle} />
        {isAuthenticated && (
          <Collapse isOpen={isOpen} navbar>
            <Nav className="ml-auto nav-links" navbar>
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ width: '100%' }}
              >
                {canUpdateTask && (
                  <NavItem>
                    <NavLink tag={Link} to="/taskeditsuggestions">
                      <div className="redBackGroupHeader">
                        <span>{props.taskEditSuggestionCount}</span>
                      </div>
                    </NavLink>
                  </NavItem>
                )}
                <NavItem>
                  <NavLink tag={Link} to="/communityportal">
                    <span className="dashboard-text-link">{DASHBOARD}</span>
                  </NavLink>
                </NavItem>
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret>
                    <span className="dashboard-text-link">{ACTIVITY}</span>
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem tag={Link} to="/communityportal/activities">
                      {ACTIVITIES}
                    </DropdownItem>
                    <DropdownItem tag={Link} to="/communityportal/activities/registration">
                      {REGISTRATION}
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
                <NavItem>
                  <NavLink tag={Link} to="/communityportal/calendar">
                    <span className="dashboard-text-link">{CALENDAR}</span>
                  </NavLink>
                </NavItem>
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret>
                    <span className="dashboard-text-link">{REPORTS}</span>
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem tag={Link} to="/communityportal/reports/participation">
                      {PARTICIPATION}
                    </DropdownItem>
                    <DropdownItem tag={Link} to="/communityportal/reports/resourceusage">
                      {RESOURCE_USAGE}
                    </DropdownItem>
                    <DropdownItem tag={Link} to="/communityportal/reports/event/personalization">
                      {EVENT_PERSONALIZATION}
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
                <NavItem className="responsive-spacing">
                  <BellNotification />
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
                      ) : null}
                      {canAccessBadgeManagement ? (
                        <DropdownItem tag={Link} to="/badgemanagement" className={fontColor}>
                          {BADGE_MANAGEMENT}
                        </DropdownItem>
                      ) : null}
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
                <NavItem>
                  <NavLink tag={Link} to={`/userprofile/${displayUserId}`}>
                    <img
                      src={`${profilePic || '/pfp-default-header.png'}`}
                      alt=""
                      style={{ maxWidth: '60px', maxHeight: '60px' }}
                      className="dashboardimg"
                    />
                  </NavLink>
                </NavItem>
                <UncontrolledDropdown nav>
                  <DropdownToggle nav caret>
                    <span className="dashboard-text-link">
                      {WELCOME}, {firstName}
                    </span>
                  </DropdownToggle>
                  <DropdownMenu className={darkMode ? 'bg-yinmn-blue' : ''}>
                    <DropdownItem header>Hello {firstName}</DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem
                      tag={Link}
                      to={`/userprofile/${user.userid}`}
                      className={darkMode ? 'text-light' : ''}
                    >
                      {VIEW_PROFILE}
                    </DropdownItem>
                    {!cantUpdateDevAdminDetails(
                      props.userProfile.email,
                      props.userProfile.email,
                    ) && (
                      <DropdownItem
                        tag={Link}
                        to={`/updatepassword/${user.userid}`}
                        className={darkMode ? 'text-light' : ''}
                      >
                        {UPDATE_PASSWORD}
                      </DropdownItem>
                    )}
                    <div style={{ padding: '0 1rem' }}>
                      <DarkModeButton />
                    </div>
                    <DropdownItem divider />
                    <DropdownItem onClick={openModal} className={darkMode ? 'text-light' : ''}>
                      {LOGOUT}
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </div>
            </Nav>
          </Collapse>
        )}
      </Navbar>
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
})(CPHeader);
