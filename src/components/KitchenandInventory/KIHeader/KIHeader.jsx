import { useState, useEffect, useMemo, useRef } from 'react';
import { permissions } from '../../../utils/constants';
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
import DarkModeButton from '../../Header/DarkModeButton';
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
  // PERMISSIONS_MANAGEMENT,
  // ACTIVITY,
  // PARTICIPATION,
  // RESOURCE_USAGE,
  // CALENDAR,
  // EVENT_PERSONALIZATION,
  // ACTIVITIES,
  // REGISTRATION,
  // SEND_EMAILS,
  // ACTIVITY_RESOURCE_MANGEMENT,
  // ACTIVITY_RESOURCE_USAGE,
  PRODUCTION,
  KI_PROCESSING,
  GARDEN_MANAGEMENT,
  ORCHARD_MANAGEMENT,
  ANIMAL_MANAGEMENT,
  ANIMAL_MANAGEMENT_TRACKING,
  RECIPES,
  KI_INVENTORY,
  ORDERS,
  KI_REPORTS,
  FOOD_BARS,
  KI_CALENDAR,
} from '../../../languages/en/ui';
import Logout from '../../Logout/Logout';
// import './CPHeader.module.css';
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

  const canUpdateTask = props.hasPermission(
    permissions.updateTask,
    !isAuthUser && canInteractWithViewingUser,
  );

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
              <NavLink tag={Link} to={`/userprofile/${displayUserId}`} className="p-0">
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    minWidth: '40px',
                    minHeight: '40px',
                    backgroundImage: `url(${profilePic || '/pfp-default-header.png'})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                  className="dashboardimg rounded-circle"
                />
              </NavLink>
              <UncontrolledDropdown inNavbar>
                <DropdownToggle nav caret className="text-light">
                  <span>
                    {WELCOME}, {firstName}
                  </span>
                </DropdownToggle>
                <DropdownMenu
                  right
                  className={`${styles.noMaxHeight} ${
                    darkMode ? styles.darkMenuDropdown : styles.mobileMenuDropdown
                  }`}
                >
                  <DropdownItem
                    header
                    className={darkMode ? 'text-custom-grey' : styles.mobileDropdownText}
                  >
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
                  <DropdownItem divider />
                  <DropdownItem onClick={openModal} className={fontColor}>
                    {LOGOUT}
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
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
                  <NavLink tag={Link} to="/kitchenandinventory">
                    <span>{DASHBOARD}</span>
                  </NavLink>
                </NavItem>
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret>
                    <span>{PRODUCTION}</span>
                  </DropdownToggle>
                  <DropdownMenu
                    className={`${styles.noMaxHeight} ${
                      darkMode ? styles.darkMenuDropdown : styles.mobileMenuDropdown
                    }`}
                  >
                    <DropdownItem
                      tag={Link}
                      to="/kitchenandinventory/gardenmanagement"
                      className={fontColor}
                    >
                      {GARDEN_MANAGEMENT}
                    </DropdownItem>
                    <DropdownItem
                      tag={Link}
                      to="/kitchenandinventory/orchardmanagement"
                      className={fontColor}
                    >
                      {ORCHARD_MANAGEMENT}
                    </DropdownItem>
                    <DropdownItem
                      tag={Link}
                      to="/kitchenandinventory/animalmanagement"
                      className={fontColor}
                    >
                      {ANIMAL_MANAGEMENT}
                    </DropdownItem>
                    <DropdownItem
                      tag={Link}
                      to="/kitchenandinventory/animalmanagementtracking"
                      className={fontColor}
                    >
                      {ANIMAL_MANAGEMENT_TRACKING}
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
                <NavItem>
                  <NavLink tag={Link} to="/kitchenandinventory/processing">
                    <span>{KI_PROCESSING}</span>
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} to="/kitchenandinventory/recipes">
                    <span>{RECIPES}</span>
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} to="/kitchenandinventory/inventory">
                    <span>{KI_INVENTORY}</span>
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} to="/kitchenandinventory/orders">
                    <span>{ORDERS}</span>
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} to="/kitchenandinventory/reports">
                    <span>{KI_REPORTS}</span>
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} to="/kitchenandinventory/foodbars">
                    <span>{FOOD_BARS}</span>
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} to="/kitchenandinventory/calendar">
                    <span>{KI_CALENDAR}</span>
                  </NavLink>
                </NavItem>
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
