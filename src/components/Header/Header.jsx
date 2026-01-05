import { useState, useEffect, useMemo, React, useRef } from 'react';
import { ENDPOINTS } from '~/utils/URL';
import axios from 'axios';
import { getWeeklySummaries } from '~/actions/weeklySummaries';
import { Link, useLocation, useHistory } from 'react-router-dom';
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
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
} from 'reactstrap';
import PopUpBar from '~/components/PopUpBar';
import { fetchTaskEditSuggestions } from '~/components/TaskEditSuggestions/thunks';
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
  PR_PROMOTIONS,
  BLUE_SQUARE_EMAIL_MANAGEMENT,
  JOB_ANALYTICS_REPORT,
} from '../../languages/en/ui';
import Logout from '../Logout/Logout';
import '../../App.css';
import styles from './Header.module.css';
import hasPermission, { cantUpdateDevAdminDetails } from '../../utils/permissions';
import {
  getUnreadUserNotifications,
  resetNotificationError,
} from '../../actions/notificationAction';
import NotificationCard from '../Notification/notificationCard';
import DarkModeButton from './DarkModeButton';
import BellNotification from './BellNotification';
import { getUserProfile } from '../../actions/userProfile';
import PermissionWatcher from '../Auth/PermissionWatcher';
import DisplayBox from '../PRPromotions/DisplayBox';
import PropTypes from 'prop-types';

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
  const collapseRef = useRef(null);
  const toggleRef = useRef(null);
  const [isAckLoading, setIsAckLoading] = useState(false);
  const [ showPromotionsPopup, setShowPromotionsPopup ] = useState(false);

  const ALLOWED_ROLES_TO_INTERACT = useMemo(() => ['Owner', 'Administrator'], []);
  const canInteractWithViewingUser = useMemo(
    () => ALLOWED_ROLES_TO_INTERACT.includes(props.auth.user.role),
    [ALLOWED_ROLES_TO_INTERACT, props.auth.user.role],
  );
  const headerDisabled = isAuthUser ? false : !canInteractWithViewingUser;

  // Reports
  const canGetReports = props.hasPermission(
    'getReports',
    !isAuthUser ,
  );
  const canGetWeeklySummaries = props.hasPermission(
    'getWeeklySummaries',
    !isAuthUser,
  );
  const canGetWeeklyVolunteerSummary = props.hasPermission('getWeeklySummaries');
  const canGetJobAnalytics = props.hasPermission('getJobReports');

  // Users
  const canAccessUserManagement =
    props.hasPermission('postUserProfile', !isAuthUser ) ||
    props.hasPermission('deleteUserProfile', !isAuthUser ) ||
    props.hasPermission('changeUserStatus', !isAuthUser ) ||
    props.hasPermission('getUserProfiles', !isAuthUser ) ||
    props.hasPermission('setFinalDay', !isAuthUser);

  // Badges
  const canAccessBadgeManagement =
    props.hasPermission('seeBadges', !isAuthUser ) ||
    props.hasPermission('createBadges', !isAuthUser ) ||
    props.hasPermission('updateBadges', !isAuthUser) ||
    props.hasPermission('deleteBadges', !isAuthUser );
  // Projects
  const canAccessProjects =
    props.hasPermission('postProject', !isAuthUser ) ||
    props.hasPermission('deleteProject', !isAuthUser ) ||
    props.hasPermission('putProject', !isAuthUser ) ||
    props.hasPermission('getProjectMembers', !isAuthUser ) ||
    props.hasPermission('assignProjectToUsers', !isAuthUser ) ||
    props.hasPermission('postWbs', !isAuthUser ) ||
    props.hasPermission('deleteWbs', !isAuthUser ) ||
    props.hasPermission('postTask', !isAuthUser ) ||
    props.hasPermission('updateTask', !isAuthUser ) ||
    props.hasPermission('deleteTask', !isAuthUser);
  // Tasks
  const canUpdateTask = props.hasPermission(
    'updateTask',
    !isAuthUser,
  );
  // Teams
  const canAccessTeams =
    props.hasPermission('postTeam', !isAuthUser ) ||
    props.hasPermission('putTeam', !isAuthUser) ||
    props.hasPermission('deleteTeam', !isAuthUser ) ||
    props.hasPermission('assignTeamToUsers', !isAuthUser);
  // Popups
  const canAccessPopups =
    props.hasPermission('createPopup', !isAuthUser) ||
    props.hasPermission('updatePopup', !isAuthUser );
  // SendEmails
  const canAccessSendEmails = props.hasPermission('sendEmails', !isAuthUser);
  // Permissions
  const canAccessPermissionsManagement =
    props.hasPermission('postRole', !isAuthUser ) ||
    props.hasPermission('putRole', !isAuthUser ) ||
    props.hasPermission('deleteRole', !isAuthUser ) ||
    props.hasPermission('putUserProfilePermissions', !isAuthUser);
  
  // Blue Square Email Management
  const canAccessBlueSquareEmailManagement = props.hasPermission('resendBlueSquareAndSummaryEmails', !isAuthUser);

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

  // Debugging Enhancement: Monitor window resize events for responsive testing
  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      // eslint-disable-next-line no-console
      console.log(`[Header Debug] Window resized to: ${currentWidth}px`);
      
      // Log breakpoint information for debugging
      if (currentWidth >= 1728) {
        // eslint-disable-next-line no-console
        console.log(`[Header Debug] Breakpoint: Large screen (90%+) - Owner message below timer`);
      } else if (currentWidth >= 1400) {
        // eslint-disable-next-line no-console
        console.log(`[Header Debug] Breakpoint: Desktop - Centered layout`);
      } else if (currentWidth >= 1200) {
        // eslint-disable-next-line no-console
        console.log(`[Header Debug] Breakpoint: Medium desktop - Centered layout`);
      } else if (currentWidth >= 768) {
        // eslint-disable-next-line no-console
        console.log(`[Header Debug] Breakpoint: Tablet - Stacked layout`);
      } else {
        // eslint-disable-next-line no-console
        console.log(`[Header Debug] Breakpoint: Mobile - Compact vertical layout`);
      }
    };

    // Log initial window size
    handleResize();

    // Add resize event listener
    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
    if (isAuthenticated && displayUserId) {
      dispatch(getUnreadUserNotifications(displayUserId));
    }
  }, [isAuthenticated, displayUserId, roles.length]);

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

  const handlePermissionChangeAck = async () => {
    // handle setting the ack true
    try {
      setIsAckLoading(true);
      const { firstName: name, lastName, personalLinks, adminLinks, _id } = props.userProfile;
      axios
        .put(ENDPOINTS.USER_PROFILE(_id), {
          // req fields for updation
          firstName: name,
          lastName,
          personalLinks,
          adminLinks,

          isAcknowledged: true,
        })
        .then(() => {
          setIsAckLoading(false);
          dispatch(getUserProfile(_id));
        });
    } catch (e) {
      // console.log('update ack', e);
    }
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
      const newUserProfile = response?.data;
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
            `If you are seeing this, it's because you are on a team! As a member of a team, you need to turn in your work 24 hours earlier, i.e. FRIDAY night at midnight Pacific Time. This is so your manager has time to review it and submit and report on your entire team's work by the usual Saturday night deadline. For any work you plan on completing Saturday, please take pictures as best you can and include it in your summary as if it were already done.\n\nBy dismissing this notice, you acknowledge you understand and will do this.`,
          );
        } else if (user.role === 'Manager') {
          setModalVisible(true);
          // Manager message
          setModalContent(`If you are seeing this, it's because you are a Manager of a team! Remember to turn in your team's work by the Saturday night at midnight (Pacific Time) deadline. Every member of your team gets a notice like this too. Theirs tells them to get you their work 24 hours early so you have time to review it and submit it. If you have to remind them repeatedly (4+ times, track it on their Google Doc), they should receive a blue square.
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

  useEffect(() => {
    const handleClickOutside = (event) => {
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

  const fontColor = darkMode ? `${styles.darkDropdownText} ${styles.darkDropdownItem}` : `${styles.mobileDropdownText} ${styles.mobileDropdownItem}`;

  if (location.pathname === '/login') return null;

  const viewingUser = JSON.parse(window.sessionStorage.getItem('viewingUser'));
  return (
    <div className={`${styles.headerWrapper}`} data-testid="header">
      {isAuthenticated && (
        <div className={`bg-dark pt-3 ${styles.navbarOwnerMessage} ${styles.showInTablet}`}>
          <OwnerMessage />
        </div>
      )}
      <Navbar className={`py-3 ${styles.navbar}`} color="dark" dark expand="xl">
        {logoutPopup && <Logout open={logoutPopup} setLogoutPopup={setLogoutPopup} />}
        {showPromotionsPopup && 
        (<DisplayBox onClose={() => setShowPromotionsPopup(false)} />)}
        {/* Left Component - Timer */}
        {isAuthenticated && <Timer darkMode={darkMode} />}
        
        {/* ITEM SHOWS OUTSIDE OF THE DROPDOWN IN MOBILE */}
        <div className={`${styles.showInMobile} ml-auto mr-3`}>
          <BellNotification userId={displayUserId}/>
        </div>
        {/* --------------------------------------------- */}

        <div ref={toggleRef}>
          <NavbarToggler onClick={toggle} className='mr-3'/>
        </div>

        {isAuthenticated && (
          <Collapse isOpen={isOpen} navbar innerRef={collapseRef}>
            {isAuthenticated && (
              <div className={`${styles.navbarOwnerMessage} ${styles.hideInTablet}`}>
                <OwnerMessage />
              </div>
            )}
            <Nav className={`ml-auto ${styles.menuContainer} mr-3`} navbar>
              <NavItem className={styles.showInMobile}>
                <NavLink tag={Link} to={`/userprofile/${displayUserId}`}>
                  <img
                    src={`${profilePic || '/pfp-default-header.png'}`}
                    alt=""
                    style={{ maxWidth: '60px', maxHeight: '60px' }}
                    className="dashboardimg"
                  />
                </NavLink>
              </NavItem>
              <UncontrolledDropdown nav inNavbar className={styles.showInMobile}>
                  <DropdownToggle nav caret>
                    <span>
                      {WELCOME}, {firstName}
                    </span>
                  </DropdownToggle>
                  <DropdownMenu className={`${styles.noMaxHeight} ${darkMode ? styles.darkMenuDropdown : styles.mobileMenuDropdown}`}>
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
                    <DropdownItem onClick={openModal} className={fontColor}>
                      {LOGOUT}
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>

                {canUpdateTask && (
                  <NavItem>
                    <NavLink tag={Link} to="/taskeditsuggestions" disabled={headerDisabled}>
                      <div className={`${styles.redBackGroupHeader} ${styles.hideInMobile}`}>
                        <span>{props.taskEditSuggestionCount}</span>
                      </div>

                      {/* --- MOBILE VIEW ONLY --- */}
                      <span className={styles.showInMobile}>Task Edit Suggestion ({props.taskEditSuggestionCount})</span>
                      {/* ------------------- */}
                    </NavLink>
                  </NavItem>
                )}
                <NavItem>
                  <NavLink tag={Link} to="/dashboard" disabled={headerDisabled}>
                    <span>{DASHBOARD}</span>
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} to="/timelog#currentWeek" disabled={headerDisabled}>
                    <span>{TIMELOG}</span>
                  </NavLink>
                </NavItem>

                {showProjectDropdown && (
                  <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav caret disabled={headerDisabled}>
                      <span>{PROJECTS}</span>
                    </DropdownToggle>
                    <DropdownMenu className={`${styles.noMaxHeight} ${darkMode ? styles.darkMenuDropdown : styles.mobileMenuDropdown}`} disabled={headerDisabled}>
                      <DropdownItem
                        tag={Link}
                        to="/bmdashboard/materials/add"
                        className={fontColor}
                      >
                        Add Material
                      </DropdownItem>
                      <DropdownItem tag={Link} to="/bmdashboard/logMaterial" className={fontColor}  disabled={headerDisabled}>
                        Log Material
                      </DropdownItem>
                      <DropdownItem tag={Link} to="/bmdashboard/materials" className={fontColor}  disabled={headerDisabled}>
                        Material List
                      </DropdownItem>
                      <DropdownItem
                        tag={Link}
                        to="/bmdashboard/equipment/add"
                        className={fontColor}
                        disabled={headerDisabled}
                      >
                        Add Equipment/Tool
                      </DropdownItem>
                      <DropdownItem
                        tag={Link}
                        to="/bmdashboard/equipment/:equipmentId"
                        className={fontColor}
                        disabled={headerDisabled}
                      >
                        Log Equipment/Tool
                      </DropdownItem>
                      <DropdownItem
                        tag={Link}
                        to="/bmdashboard/tools/:equipmentId/update"
                        className={fontColor}
                        disabled={headerDisabled}
                      >
                        Update Equipment/Tool
                      </DropdownItem>
                      <DropdownItem tag={Link} to="/bmdashboard/equipment" className={fontColor}  disabled={headerDisabled}>
                        Equipment/Tool List
                      </DropdownItem>
                      <DropdownItem tag={Link} to="/bmdashboard/Issue" className={fontColor}  disabled={headerDisabled}>
                        Issue
                      </DropdownItem>
                      <DropdownItem tag={Link} to="/bmdashboard/lessonform/" className={fontColor}  disabled={headerDisabled}>
                        Lesson
                      </DropdownItem>
                      <DropdownItem tag={Link} to="/teams" className={fontColor}>
                        Team
                      </DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                )}
            
                {canGetReports || canGetWeeklySummaries || canGetWeeklyVolunteerSummary ? (
                  <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav caret>
                      <span>{REPORTS}</span>
                    </DropdownToggle>
                    <DropdownMenu className= {`${styles.noMaxHeight} ${darkMode ? styles.darkMenuDropdown : styles.mobileMenuDropdown}`}>
                      {canGetReports && (
                        <DropdownItem tag={Link} to="/reports" className={`${fontColor}`}  disabled={headerDisabled}>
                          {REPORTS}
                        </DropdownItem>
                      )}
                      {canGetWeeklySummaries && (
                        <DropdownItem tag={Link} to="/weeklysummariesreport" className={fontColor}  disabled={headerDisabled}>
                          {WEEKLY_SUMMARIES_REPORT}
                        </DropdownItem>
                      )}
                      {canGetWeeklyVolunteerSummary && (
                        <DropdownItem tag={Link} to="/totalorgsummary" className={fontColor}  disabled={headerDisabled}>
                          {TOTAL_ORG_SUMMARY}
                        </DropdownItem>
                      )}
                      {canGetJobAnalytics && (
                        <DropdownItem tag={Link} to="/application/analytics" className={fontColor}  disabled={headerDisabled}>
                          {JOB_ANALYTICS_REPORT}
                        </DropdownItem>
                      )}
                      <DropdownItem tag={Link} to="/teamlocations" className={fontColor}  disabled={headerDisabled}>
                        {TEAM_LOCATIONS}
                      </DropdownItem>
                      <DropdownItem
                        tag={Link}
                        to="/bmdashboard/totalconstructionsummary"
                        className={fontColor}
                         disabled={headerDisabled}
                      >
                        {TOTAL_CONSTRUCTION_SUMMARY}
                      </DropdownItem>
                      <DropdownItem onClick={() => setShowPromotionsPopup(true)} className={fontColor}  disabled={headerDisabled}>
                        {PR_PROMOTIONS}
                      </DropdownItem>
                    </DropdownMenu>
                  </UncontrolledDropdown>
                ) : (
                  <NavItem>
                    <NavLink tag={Link} to="/teamlocations" disabled={headerDisabled}>
                      <span>{TEAM_LOCATIONS}</span>
                    </NavLink>
                  </NavItem>
                )}
                {(canAccessUserManagement ||
                  canAccessBadgeManagement ||
                  canAccessProjects ||
                  canAccessTeams ||
                  canAccessPopups ||
                  canAccessSendEmails ||
                  canAccessPermissionsManagement ||
                  canAccessBlueSquareEmailManagement) && (
                  <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav caret>
                      <span>{OTHER_LINKS}</span>
                    </DropdownToggle>
                    <DropdownMenu className={`${styles.noMaxHeight} ${darkMode ? styles.darkMenuDropdown : styles.mobileMenuDropdown}`}>
                      {canAccessUserManagement && (
                        <DropdownItem tag={Link} to="/usermanagement" className={fontColor}  disabled={headerDisabled}>
                          {USER_MANAGEMENT}
                        </DropdownItem>
                      )}
                      {canAccessBadgeManagement && (
                        <DropdownItem tag={Link} to="/badgemanagement" className={fontColor}  disabled={headerDisabled}>
                          {BADGE_MANAGEMENT}
                        </DropdownItem>
                      )}
                      {canAccessProjects && (
                        <DropdownItem tag={Link} to="/projects" className={fontColor}  disabled={headerDisabled}>
                          {PROJECTS}
                        </DropdownItem>
                      )}
                      {canAccessTeams && (
                        <DropdownItem tag={Link} to="/teams" className={fontColor}  disabled={headerDisabled}>
                          {TEAMS}
                        </DropdownItem>
                      )}
                      {canAccessSendEmails && (
                        <DropdownItem tag={Link} to="/announcements" className={fontColor}  disabled={headerDisabled}>
                          {SEND_EMAILS}
                        </DropdownItem>
                      )}
                      {canAccessPermissionsManagement && (
                        <>
                          <DropdownItem divider className={styles.hideInMobile}/>
                          <DropdownItem
                            tag={Link}
                            to="/permissionsmanagement"
                            className={fontColor}
                            disabled={headerDisabled}
                          >
                            {PERMISSIONS_MANAGEMENT}
                          </DropdownItem>
                        </>
                      )}
                      <DropdownItem divider className={styles.hideInMobile} />
                      <DropdownItem tag={Link} to="/pr-dashboard/overview" className={fontColor} disabled={headerDisabled}>
                        PR Team Analytics
                      </DropdownItem>
                      {canAccessBlueSquareEmailManagement && (
                        <DropdownItem
                          tag={Link}
                          to="/bluesquare-email-management"
                          className={fontColor}
                          disabled={headerDisabled}
                        >
                          {BLUE_SQUARE_EMAIL_MANAGEMENT}
                        </DropdownItem>
                      )}
                    </DropdownMenu>
                  </UncontrolledDropdown>
                )}
                <NavItem className={styles.hideInMobile}>
                  <BellNotification userId={displayUserId}/>
                </NavItem>
                <NavItem className={styles.hideInMobile}>
                  <NavLink tag={Link} to={`/userprofile/${displayUserId}`}>
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        minWidth: '60px',
                        minHeight: '60px',
                        backgroundImage: `url(${profilePic || '/pfp-default-header.png'})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      }}
                      className="dashboardimg"
                    />
                  </NavLink>
                </NavItem>
                <UncontrolledDropdown nav className={styles.hideInMobile}>
                  <DropdownToggle nav caret>
                    <span>
                      {WELCOME}, {firstName}
                    </span>
                  </DropdownToggle>
                  <DropdownMenu className={`${styles.noMaxHeight} ${darkMode ? styles.darkMenuDropdown : styles.mobileMenuDropdown}`}>
                    <DropdownItem header className={darkMode ? 'text-custom-grey' : styles.mobileDropdownText}>
                      Hello {firstName}
                    </DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem
                      tag={Link}
                      to={`/userprofile/${displayUserId}`}
                      className={fontColor}
                      disabled={headerDisabled}
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
                    <DropdownItem onClick={openModal} className={fontColor}  disabled={headerDisabled}>
                      {LOGOUT}
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
            </Nav>
          </Collapse>
        )}
     
      </Navbar>
      {!isAuthUser && (
        <PopUpBar
          firstName={viewingUser.firstName}
          lastName={viewingUser.lastName}
          message={`You are currently viewing the header for ${viewingUser.firstName} ${viewingUser.lastName}`}
          onClickClose={() => setPopup(prevPopup => !prevPopup)}
        />
      )}
      <PermissionWatcher props={props} />
      {props.auth.isAuthenticated && props.userProfile?.permissions?.isAcknowledged === false && (
        <PopUpBar
          firstName={viewingUser?.firstName || firstName}
          lastName={viewingUser?.lastName}
          message="Heads Up, there were permission changes made to this account"
          onClickClose={handlePermissionChangeAck}
          textColor="black_text"
          isLoading={isAckLoading}
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
        <div className={`${darkMode ? 'bg-oxford-blue' : ''} ${styles.cardWrapper}`}>
          <Card color="primary" className={styles.headerCard}>
            <div className="close-button">
              <Button close onClick={closeModal} />
            </div>
            <div className={`${styles.cardContent}`}>{modalContent}</div>
          </Card>
        </div>
      )}
      {/* Only render one unread message at a time */}
      {props.auth.isAuthenticated && unreadNotifications?.length > 0 ? (
        <NotificationCard notification={unreadNotifications[0]} />
      ) : null}
      <div className={darkMode ? styles.headerMargin : styles.headerMarginLight} />
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
Header.propTypes = {
  hasPermission: PropTypes.func.isRequired,
  auth: PropTypes.shape({
    isAuthenticated: PropTypes.bool,
    user: PropTypes.shape({
      userid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      role: PropTypes.string
    }),
    firstName: PropTypes.string,
    profilePic: PropTypes.string
  }),
  getHeaderData: PropTypes.func,
  getAllRoles: PropTypes.func,
  getWeeklySummaries: PropTypes.func,
  role: PropTypes.shape({
    roles: PropTypes.array
  }),
  notification: PropTypes.object,
  userProfile: PropTypes.object,
  darkMode: PropTypes.bool,
  taskEditSuggestionCount: PropTypes.number,
};
export default connect(mapStateToProps, {
  getHeaderData,
  getAllRoles,
  hasPermission,
  getWeeklySummaries,
  getUserProfile,
})(Header);
