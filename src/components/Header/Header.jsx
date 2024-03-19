import React, { useState, useEffect } from 'react';
// import { getUserProfile } from '../../actions/userProfile'
import { Button, Card } from 'reactstrap';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import { getHeaderData } from '../../actions/authActions';
import { getAllRoles } from '../../actions/role';
import { Link } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import Timer from '../Timer/Timer';
import OwnerMessage from '../OwnerMessage/OwnerMessage';
import {
  LOGO,
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
  POPUP_MANAGEMENT,
  PERMISSIONS_MANAGEMENT,
  SEND_EMAILS,
} from '../../languages/en/ui';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import Logout from '../Logout/Logout';
import './Header.css';
import hasPermission, { cantUpdateDevAdminDetails } from '../../utils/permissions';
import { fetchTaskEditSuggestions } from 'components/TaskEditSuggestions/thunks';

export function Header(props) {
  const [isOpen, setIsOpen] = useState(false);
  const [logoutPopup, setLogoutPopup] = useState(false);
  const { isAuthenticated, user, firstName, profilePic } = props.auth;

  // Reports
  const canGetReports = props.hasPermission('getReports');
  const canGetWeeklySummaries = props.hasPermission('getWeeklySummaries');
  // Users
  const canAccessUserManagement = props.hasPermission('postUserProfile')
    || props.hasPermission('deleteUserProfile')
    || props.hasPermission('changeUserStatus')
    || props.hasPermission('getUserProfiles');

  // Badges
  const canAccessBadgeManagement = props.hasPermission('seeBadges')
    || props.hasPermission('createBadges')
    || props.hasPermission('updateBadges')
    || props.hasPermission('deleteBadges');
  // Projects
  const canAccessProjects = props.hasPermission('postProject')
    || props.hasPermission('deleteProject')
    || props.hasPermission('putProject')
    || props.hasPermission('getProjectMembers')
    || props.hasPermission('assignProjectToUsers')
    || props.hasPermission('postWbs')
    || props.hasPermission('deleteWbs')
    || props.hasPermission('postTask')
    || props.hasPermission('updateTask')
    || props.hasPermission('deleteTask');
  // Tasks
  const canUpdateTask = props.hasPermission('updateTask');
  // Teams
  const canAccessTeams = props.hasPermission('postTeam')
    || props.hasPermission('putTeam')
    || props.hasPermission('deleteTeam')
    || props.hasPermission('assignTeamToUsers');
  // Popups
  const canAccessPopups = props.hasPermission('createPopup')
    || props.hasPermission('updatePopup');
  // Permissions
  const canAccessPermissionsManagement = props.hasPermission('postRole')
    || props.hasPermission('putRole')
    || props.hasPermission('deleteRole')
    || props.hasPermission('putUserProfilePermissions')

  const userId = user.userid;
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [userDashboardProfile, setUserDashboardProfile] = useState(undefined);
  const [hasProfileLoaded, setHasProfileLoaded] = useState(false);
  const dismissalKey = `lastDismissed_${userId}`;
  const [lastDismissed, setLastDismissed] = useState(localStorage.getItem(dismissalKey));

  const dispatch = useDispatch();

  useEffect(() => {
    if (props.auth.isAuthenticated) {
      props.getHeaderData(props.auth.user.userid);
      if (props.auth.user.role === 'Owner' || props.auth.user.role === 'Administrator') {
        dispatch(fetchTaskEditSuggestions());
      }
    }
  }, [props.auth.isAuthenticated]);

  useEffect(() => {
    if (roles.length === 0 && isAuthenticated) {
      props.getAllRoles();
    }
  }, []);
  const roles = props.role?.roles;

  const toggle = () => {
    setIsOpen(prevIsOpen => !prevIsOpen);
  };

  const openModal = () => {
    setLogoutPopup(true);
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
      console.log('User Profile not loaded.', err);
    }
  };

  useEffect(() => {
    loadUserDashboardProfile();

    if (
      user.role === 'Owner' ||
      user.role === 'Administrator' ||
      user.role === 'Mentor'
    ) {
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
          setModalContent(`If you are seeing this, it’s because you are on a team! As a member of a team, you need to turn in your work 24 hours earlier, i.e. FRIDAY night at midnight Pacific Time. This is so your manager has time to review it and submit and report on your entire team’s work by the usual Saturday night deadline. For any work you plan on completing Saturday, please take pictures as best you can and include it in your summary as if it were already done.\n\nBy dismissing this notice, you acknowledge you understand and will do this.`);
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

  return (
    <div className="header-wrapper">
      <Navbar className="py-3 navbar" color="dark" dark expand="xl">
        {logoutPopup && <Logout open={logoutPopup} setLogoutPopup={setLogoutPopup} />}
        <div
          className="timer-message-section"
          style={user.role == 'Owner' ? { marginRight: '6rem' } : { marginRight: '10rem' }}
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
                <NavLink tag={Link} to="/dashboard">
                  <span className="dashboard-text-link">{DASHBOARD}</span>
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to={`/timelog`}>
                  <span className="dashboard-text-link">{TIMELOG}</span>
                </NavLink>
              </NavItem>
              {(canGetReports || canGetWeeklySummaries) ? (
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret>
                    <span className="dashboard-text-link">{REPORTS}</span>
                  </DropdownToggle>
                  <DropdownMenu>
                    {canGetReports &&
                      <DropdownItem tag={Link} to="/reports">
                        {REPORTS}
                      </DropdownItem>
                    }
                    {canGetWeeklySummaries &&
                      <DropdownItem tag={Link} to="/weeklysummariesreport">
                        {WEEKLY_SUMMARIES_REPORT}
                      </DropdownItem>
                    }
                    <DropdownItem tag={Link} to="/teamlocations">
                      {TEAM_LOCATIONS}
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              ) :
                <NavItem>
                  <NavLink tag={Link} to="/teamlocations">
                    {TEAM_LOCATIONS}
                  </NavLink>
                </NavItem>
              }
              <NavItem>
                <NavLink tag={Link} to={`/timelog/${user.userid}`}>
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
                canAccessPermissionsManagement) && (
                  <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav caret>
                      <span className="dashboard-text-link">{OTHER_LINKS}</span>
                    </DropdownToggle>
                    <DropdownMenu>
                      {canAccessUserManagement ? (
                        <DropdownItem tag={Link} to="/usermanagement">
                          {USER_MANAGEMENT}
                        </DropdownItem>
                      ) : (
                        <React.Fragment></React.Fragment>
                      )}
                      {canAccessBadgeManagement ? (
                        <DropdownItem tag={Link} to="/badgemanagement">
                          {BADGE_MANAGEMENT}
                        </DropdownItem>
                      ) : (
                        <React.Fragment></React.Fragment>
                      )}
                      {(canAccessProjects) && (
                        <DropdownItem tag={Link} to="/projects">
                          {PROJECTS}
                        </DropdownItem>
                      )}
                      {(canAccessTeams) && (
                        <DropdownItem tag={Link} to="/teams">
                          {TEAMS}
                        </DropdownItem>
                      )}
                      {(canAccessPermissionsManagement) && (
                        <DropdownItem tag={Link} to="/announcements">
                          {SEND_EMAILS}
                        </DropdownItem>
                      )}
                      {canAccessPermissionsManagement && (
                        <>
                          <DropdownItem divider />
                          <DropdownItem tag={Link} to="/permissionsmanagement">
                            {PERMISSIONS_MANAGEMENT}
                          </DropdownItem>
                        </>
                      )}
                    </DropdownMenu>
                  </UncontrolledDropdown>
                )}
              <NavItem>
                <NavLink tag={Link} to={`/userprofile/${user.userid}`}>
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
                <DropdownMenu>
                  <DropdownItem header>Hello {firstName}</DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem tag={Link} to={`/userprofile/${user.userid}`}>
                    {VIEW_PROFILE}
                  </DropdownItem>
                  {!cantUpdateDevAdminDetails(props.userProfile.email, props.userProfile.email) && (
                    <DropdownItem tag={Link} to={`/updatepassword/${user.userid}`}>
                      {UPDATE_PASSWORD}
                    </DropdownItem>
                  )}
                  <DropdownItem divider />
                  <DropdownItem onClick={openModal}>{LOGOUT}</DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Nav>
          </Collapse>
        )}
      </Navbar>
      {props.auth.isAuthenticated && isModalVisible && (
        <Card color="primary">
          <div className="close-button">
            <Button close onClick={closeModal} />
          </div>
          <div className="card-content">{modalContent}</div>
        </Card>
      )}
    </div>
  );
}

const mapStateToProps = state => ({
  auth: state.auth,
  userProfile: state.userProfile,
  taskEditSuggestionCount: state.taskEditSuggestions.count,
  role: state.role,
});
export default connect(mapStateToProps, {
  getHeaderData,
  getAllRoles,
  hasPermission,
})(Header);