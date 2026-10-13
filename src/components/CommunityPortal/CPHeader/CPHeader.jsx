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
import { permissions } from '../../../utils/constants';
import BellNotification from '~/components/Header/BellNotification';
import UserProfileLink from '~/components/Header/UserProfileLink';
import UserInfoDropdown from '~/components/Header/UserInfoDropdown';
import { getHeaderData } from '../../../actions/authActions';
import { getAllRoles } from '../../../actions/role';
import Timer from '../../Timer/Timer';
import OwnerMessage from '../../OwnerMessage/OwnerMessage';
import Logout from '../../Logout/Logout';
import { useHeaderState } from '../../../hooks/useHeaderState';
import { useHeaderEffects } from '../../../hooks/useHeaderEffects';
import {
  DASHBOARD,
  REPORTS,
  OTHER_LINKS,
  USER_MANAGEMENT,
  BADGE_MANAGEMENT,
  PROJECTS,
  TEAMS,
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
  EVENT_DATABASE_DESIGN,
} from '../../../languages/en/ui';
import styles from '../../Header/Header.module.css';
import hasPermission from '../../../utils/permissions';

export function Header(props) {
  const dispatch = useDispatch();
  const { darkMode } = props;

  // Use shared header state hook
  const {
    isOpen,
    setIsOpen,
    logoutPopup,
    setLogoutPopup,
    firstName,
    setFirstName,
    profilePic,
    setProfilePic,
    isAuthUser,
    setIsAuthUser,
    displayUserId,
    setDisplayUserId,
    collapseRef,
    toggleRef,
    canInteractWithViewingUser,
    openModal,
    toggle,
  } = useHeaderState(props.auth);

  // Use shared header effects hook
  useHeaderEffects({
    auth: props.auth,
    role: props.role,
    collapseRef,
    toggleRef,
    isOpen,
    setIsOpen,
    stateSetters: { setFirstName, setProfilePic, setDisplayUserId, setIsAuthUser },
    getHeaderData: props.getHeaderData,
    getAllRoles: props.getAllRoles,
    dispatch,
    includeTaskEditSuggestions: true,
  });

  const { isAuthenticated, user } = props.auth;

  // Users
  const canAccessUserManagement =
    props.hasPermission(permissions.postUserProfile, !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission(permissions.deleteUserProfile, !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission(permissions.changeUserStatus, !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission(permissions.getUserProfiles, !isAuthUser && canInteractWithViewingUser);

  // Badges
  const canAccessBadgeManagement =
    props.hasPermission(permissions.seeBadges, !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission(permissions.createBadges, !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission(permissions.updateBadges, !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission(permissions.deleteBadges, !isAuthUser && canInteractWithViewingUser);

  // Projects
  const canAccessProjects =
    props.hasPermission(permissions.postProject, !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission(permissions.deleteProject, !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission(permissions.putProject, !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission(permissions.getProjectMembers, !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission(
      permissions.assignProjectToUsers,
      !isAuthUser && canInteractWithViewingUser,
    ) ||
    props.hasPermission(permissions.postWbs, !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission(permissions.deleteWbs, !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission(permissions.postTask, !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission(permissions.updateTask, !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission(permissions.deleteTask, !isAuthUser && canInteractWithViewingUser);
  // Tasks
  const canUpdateTask = props.hasPermission(
    permissions.updateTask,
    !isAuthUser && canInteractWithViewingUser,
  );
  // Teams
  const canAccessTeams =
    props.hasPermission(permissions.postTeam, !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission(permissions.putTeam, !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission(permissions.deleteTeam, !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission(permissions.assignTeamToUsers, !isAuthUser && canInteractWithViewingUser);
  // Popups
  const canAccessPopups =
    props.hasPermission(permissions.createPopup, !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission(permissions.updatePopup, !isAuthUser && canInteractWithViewingUser);
  // SendEmails
  const canAccessSendEmails = props.hasPermission(permissions.sendEmails, !isAuthUser);
  // Permissions
  const canAccessPermissionsManagement =
    props.hasPermission(permissions.postRole, !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission(permissions.putRole, !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission(permissions.deleteRole, !isAuthUser && canInteractWithViewingUser) ||
    props.hasPermission(
      permissions.putUserProfilePermissions,
      !isAuthUser && canInteractWithViewingUser,
    );

  const PROFILE_ROUTE = '/communityportal/profile';

  const fontColor = darkMode
    ? `${styles.darkDropdownText} ${styles.darkDropdownItem}`
    : `${styles.mobileDropdownText} ${styles.mobileDropdownItem}`;

  return (
    <div className={`${styles.headerWrapper}`} data-testid="header">
      <Navbar className={`py-1 ${styles.navbar}`} color="dark" dark expand="xl">
        {logoutPopup && <Logout open={logoutPopup} setLogoutPopup={setLogoutPopup} />}

        <div className={styles.headerRow}>
          <div className={styles.leftSection}>{isAuthenticated && <Timer />}</div>

          {/* Owner message occupies center, shown on tablets and above */}
          <div className={styles.centerSection}>
            {isAuthenticated && (
              <div className={`${styles.navbarOwnerMessage} ${styles.showInTablet}`}>
                <OwnerMessage />
              </div>
            )}
          </div>

          <div className={styles.rightSection}>
            {/* User info row (bell, avatar, welcome menu) - always visible on desktop */}
            <div className={styles.userInfoRow}>
              <BellNotification userId={displayUserId} />
              <UserProfileLink profileRoute={PROFILE_ROUTE} displayUserId={displayUserId} profilePic={profilePic} />
              <UserInfoDropdown
                firstName={firstName}
                displayUserId={displayUserId}
                profileRoute={PROFILE_ROUTE}
                userEmail={props.userProfile.email}
                darkMode={darkMode}
                onLogout={openModal}
                dropdownMenuClass={`${styles.noMaxHeight} ${
                  darkMode ? styles.darkMenuDropdown : styles.mobileMenuDropdown
                }`}
                dropdownItemClass={fontColor}
              />
            </div>

            {/* Hamburger menu toggle */}
            <NavbarToggler
              onClick={toggle}
              ref={toggleRef}
              className={styles.navbarToggler}
              aria-label="Toggle navigation"
            />

            {/* Collapsible navigation menu - hidden on desktop, shown on mobile */}
            <div
              ref={collapseRef}
              className={`${styles.navCollapse} ${isOpen ? styles.navCollapseOpen : ''}`}
              role="menu"
              tabIndex={-1}
              onKeyDown={e => {
                if (e.key === 'Escape') setIsOpen(false);
              }}
            >
              <Nav className={`ml-auto ${styles.menuContainer} mr-3`} navbar>
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
                    <DropdownItem
                      tag={Link}
                      to="/communityportal/database/design"
                      className={fontColor}
                    >
                      {EVENT_DATABASE_DESIGN}
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
              </Nav>
            </div>
          </div>
        </div>
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
