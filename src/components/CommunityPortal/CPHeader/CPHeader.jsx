import { useState, useEffect, useMemo, useRef } from 'react';
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
  ACTIVITY_RESOURCE_MANGEMENT,
  ACTIVITY_RESOURCE_USAGE,
} from '../../../languages/en/ui';
import Logout from '../../Logout/Logout';
// import './CPHeader.css';
import styles from '../../Header/Header.module.css';
import hasPermission, { cantUpdateDevAdminDetails } from '../../../utils/permissions';

export function Header(props) {
  const [isOpen, setIsOpen] = useState(false);
  const [logoutPopup, setLogoutPopup] = useState(false);
  const { isAuthenticated, user } = props.auth;
  const [firstName, setFirstName] = useState(props.auth.firstName);
  const [profilePic, setProfilePic] = useState(props.auth.profilePic);
  const [isAuthUser, setIsAuthUser] = useState(true);
  const [displayUserId, setDisplayUserId] = useState(user.userid);
  const collapseRef = useRef(null);
  const toggleRef = useRef(null);

  const ALLOWED_ROLES_TO_INTERACT = useMemo(() => ['Owner', 'Administrator'], []);
  const canInteractWithViewingUser = useMemo(
    () => ALLOWED_ROLES_TO_INTERACT.includes(props.auth.user.role),
    [ALLOWED_ROLES_TO_INTERACT, props.auth.user.role],
  );

  const PROFILE_ROUTE = '/communityportal/profile';
  const userProfileLink = (
    <NavLink tag={Link} to={`${PROFILE_ROUTE}/${displayUserId}`}>
      <img
        src={profilePic || '/pfp-default-header.png'}
        alt=""
        style={{ maxWidth: '60px', maxHeight: '60px' }}
        className="dashboardimg"
      />
    </NavLink>
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

  const openModal = () => {
    setLogoutPopup(true);
  };

  const toggle = () => {
    setIsOpen(prevIsOpen => !prevIsOpen);
  };

  useEffect(() => {
    const handleClickOutside = event => {
      if (
        collapseRef.current &&
        !collapseRef.current.contains(event.target) &&
        !toggleRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const fontColor = darkMode
    ? `${styles.darkDropdownText} ${styles.darkDropdownItem}`
    : `${styles.mobileDropdownText} ${styles.mobileDropdownItem}`;

  return (
    <div className={styles.headerWrapper}>
      {isAuthenticated && (
        <div className={`${styles.navbarOwnerMessage} ${styles.showInTablet} bg-dark pt-3 `}>
          <OwnerMessage />
        </div>
      )}
      <Navbar className={`py-3 ${styles.navbar}`} color="dark" dark expand="xl">
        {logoutPopup && <Logout open={logoutPopup} setLogoutPopup={setLogoutPopup} />}

        {isAuthenticated && <Timer />}

        {/* ITEM SHOWS OUTSIDE OF THE DROPDOWN IN MOBILE */}
        <div className={`${styles.showInMobile} ml-auto mr-3`}>
          <BellNotification userId={displayUserId} />
        </div>
        {/* --------------------------------------------- */}

        <div ref={toggleRef}>
          <NavbarToggler onClick={toggle} className="mr-3" />
        </div>

        {isAuthenticated && (
          <Collapse isOpen={isOpen} navbar innerRef={collapseRef}>
            {isAuthenticated && (
              <div className={`${styles.hideInTablet} ${styles.navbarOwnerMessage}`}>
                <OwnerMessage />
              </div>
            )}
            <Nav className={`ml-auto ${styles.menuContainer} mr-3`} navbar>
              {/* --PROFILE SHOWS ON TOP IN MOBILE VIEW */}
              <NavItem className={styles.showInMobile}>{userProfileLink}</NavItem>
              <UncontrolledDropdown inNavbar nav className={styles.showInMobile}>
                <DropdownToggle nav caret>
                  <span>
                    {WELCOME}, {firstName}
                  </span>
                </DropdownToggle>
                <DropdownMenu
                  className={` ${darkMode ? styles.darkMenuDropdown : styles.mobileMenuDropdown} ${
                    styles.noMaxHeight
                  }`}
                >
                  <DropdownItem
                    tag={Link}
                    to={`${PROFILE_ROUTE}/{displayUserId}`}
                    className={fontColor}
                  >
                    {VIEW_PROFILE}
                  </DropdownItem>
                  {!cantUpdateDevAdminDetails(props.userProfile.email, props.userProfile.email) && (
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
                  <DropdownItem onClick={openModal} className={fontColor}>
                    {LOGOUT}
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
              {/* ------------------------------------- */}

              {canUpdateTask && (
                <NavItem>
                  <NavLink tag={Link} to="/taskeditsuggestions">
                    <div className={`${styles.redBackGroupHeader} ${styles.hideInMobile}`}>
                      <span>{props.taskEditSuggestionCount}</span>
                    </div>
                    {/* --- MOBILE VIEW ONLY --- */}
                    <span className={styles.showInMobile}>
                      Task Edit Suggestion ({props.taskEditSuggestionCount})
                    </span>
                    {/* ------------------- */}
                  </NavLink>
                </NavItem>
              )}
              <NavItem>
                <NavLink tag={Link} to="/communityportal">
                  <span>{DASHBOARD}</span>
                </NavLink>
              </NavItem>
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  <span>{ACTIVITY}</span>
                </DropdownToggle>
                <DropdownMenu
                  className={`${styles.noMaxHeight} ${
                    darkMode ? styles.darkMenuDropdown : styles.mobileMenuDropdown
                  }`}
                >
                  <DropdownItem tag={Link} to="/communityportal/activities" className={fontColor}>
                    {ACTIVITIES}
                  </DropdownItem>
                  <DropdownItem
                    tag={Link}
                    to="/communityportal/activities/registration"
                    className={fontColor}
                  >
                    {REGISTRATION}
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
              <NavItem>
                <NavLink tag={Link} to="/communityportal/calendar">
                  <span>{CALENDAR}</span>
                </NavLink>
              </NavItem>
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  <span>{REPORTS}</span>
                </DropdownToggle>
                <DropdownMenu
                  className={`${styles.noMaxHeight} ${
                    darkMode ? styles.darkMenuDropdown : styles.mobileMenuDropdown
                  }`}
                >
                  <DropdownItem
                    tag={Link}
                    to="/communityportal/reports/participation"
                    className={fontColor}
                  >
                    {PARTICIPATION}
                  </DropdownItem>
                  <DropdownItem
                    tag={Link}
                    to="/communityportal/reports/resourceusage"
                    className={fontColor}
                  >
                    {RESOURCE_USAGE}
                  </DropdownItem>
                  <DropdownItem
                    tag={Link}
                    to="/communityportal/reports/event/personalization"
                    className={fontColor}
                  >
                    {EVENT_PERSONALIZATION}
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
              <NavItem className={styles.hideInMobile}>
                <BellNotification userId={displayUserId} />
              </NavItem>
              {(canAccessUserManagement ||
                canAccessBadgeManagement ||
                canAccessProjects ||
                canAccessTeams ||
                canAccessPopups ||
                canAccessSendEmails ||
                canAccessPermissionsManagement) && (
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret>
                    <span>{OTHER_LINKS}</span>
                  </DropdownToggle>
                  <DropdownMenu
                    className={`${styles.noMaxHeight} ${
                      darkMode ? styles.darkMenuDropdown : styles.mobileMenuDropdown
                    }`}
                  >
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
                    {isAuthenticated && (
                      <DropdownItem
                        tag={Link}
                        to="/communityportal/activity/:activityid/resources"
                        className={fontColor}
                      >
                        {ACTIVITY_RESOURCE_MANGEMENT}
                      </DropdownItem>
                    )}
                    {isAuthenticated && (
                      <DropdownItem
                        tag={Link}
                        to="/communityportal/activity/:activityid/resourcesusage"
                        className={fontColor}
                      >
                        {ACTIVITY_RESOURCE_USAGE}
                      </DropdownItem>
                    )}
                    {canAccessPermissionsManagement && (
                      <>
                        <DropdownItem divider className={styles.hideInMobile} />
                        <DropdownItem tag={Link} to="/permissionsmanagement" className={fontColor}>
                          {PERMISSIONS_MANAGEMENT}
                        </DropdownItem>
                      </>
                    )}
                  </DropdownMenu>
                </UncontrolledDropdown>
              )}
              <NavItem className={styles.hideInMobile}>{userProfileLink}</NavItem>
              <UncontrolledDropdown nav className={styles.hideInMobile}>
                <DropdownToggle nav caret>
                  <span>
                    {WELCOME}, {firstName}
                  </span>
                </DropdownToggle>
                <DropdownMenu
                  className={`${styles.noMaxHeight} ${
                    darkMode ? styles.darkMenuDropdown : styles.mobileMenuDropdown
                  }`}
                >
                  <DropdownItem header className={fontColor}>
                    Hello {firstName}
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem
                    tag={Link}
                    to={`${PROFILE_ROUTE}/${user.userid}`}
                    className={fontColor}
                  >
                    {VIEW_PROFILE}
                  </DropdownItem>
                  {!cantUpdateDevAdminDetails(props.userProfile.email, props.userProfile.email) && (
                    <DropdownItem
                      tag={Link}
                      to={`/updatepassword/${user.userid}`}
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
})(Header);
