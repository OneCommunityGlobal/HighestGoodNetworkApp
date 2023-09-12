/* eslint-disable no-shadow */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
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
import { getHeaderData } from '../../actions/authActions';
import { getTimerData } from '../../actions/timer';
import { getAllRoles } from '../../actions/role';
import Timer from '../Timer/Timer';
import OwnerMessage from '../OwnerMessage/OwnerMessage';
import {
  DASHBOARD,
  TIMELOG,
  REPORTS,
  WEEKLY_SUMMARIES_REPORT,
  OTHER_LINKS,
  USER_MANAGEMENT,
  BADGE_MANAGEMENT,
  PROJECTS,
  TEAMS,
  SUMMARY_MANAGEMENT,
  WELCOME,
  VIEW_PROFILE,
  UPDATE_PASSWORD,
  LOGOUT,
  POPUP_MANAGEMENT,
  PERMISSIONS_MANAGEMENT,
} from '../../languages/en/ui';
import Logout from '../Logout/Logout';
import './Header.css';
import hasPermission, { cantUpdateDevAdminDetails } from '../../utils/permissions';

export function Header(props) {
  const {
    auth,
    role,
    taskEditSuggestionCount,
    userProfile,
    getAllRoles,
    hasPermission,
    getHeaderData,
    getTimerData,
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [logoutPopup, setLogoutPopup] = useState(false);
  const { isAuthenticated, user, firstName, profilePic } = auth;

  // const userPermissions = auth.user?.permissions?.frontPermissions;
  // Reports
  const canGetWeeklySummaries = hasPermission('getWeeklySummaries');
  // Users
  const canPostUserProfile = hasPermission('postUserProfile');
  const canDeleteUserProfile = hasPermission('deleteUserProfile');
  const canPutUserProfileImportantInfo = hasPermission('putUserProfileImportantInfo');
  // Badges
  const canCreateBadges = hasPermission('createBadges');
  // Projects
  const canPostProject = hasPermission('postProject');
  // Tasks
  const canUpdateTask = hasPermission('updateTask');
  // Teams
  const canDeleteTeam = hasPermission('deleteTeam');
  const canPutTeam = hasPermission('putTeam');
  // Popups
  const canCreatePopup = hasPermission('createPopup');
  const canUpdatePopup = hasPermission('updatePopup');
  // Roles
  const canPutRole = hasPermission('putRole');

  useEffect(() => {
    if (auth.isAuthenticated) {
      getHeaderData(auth.user.userid);
      getTimerData(auth.user.userid);
    }
  }, []);

  const roles = role?.roles;
  useEffect(() => {
    if (roles.length === 0) {
      getAllRoles();
    }
  }, []);

  const toggle = () => {
    setIsOpen(prevIsOpen => !prevIsOpen);
  };

  const openModal = () => {
    setLogoutPopup(true);
  };

  return (
    <div className="header-wrapper">
      <Navbar className="py-3 mb-3 navbar" color="dark" dark expand="xl">
        {logoutPopup && <Logout open={logoutPopup} setLogoutPopup={setLogoutPopup} />}
        <div
          className="timer-message-section"
          style={user.role === 'Owner' ? { marginRight: '6rem' } : { marginRight: '10rem' }}
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
                      <span>{taskEditSuggestionCount}</span>
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
                <NavLink tag={Link} to={`/timelog/${user.userid}`}>
                  <span className="dashboard-text-link">{TIMELOG}</span>
                </NavLink>
              </NavItem>
              {(user.role === 'Mentor' || user.role === 'Manager') && (
                <NavItem>
                  <NavLink tag={Link} to="/summarymanagement">
                    <span className="dashboard-text-link">{SUMMARY_MANAGEMENT}</span>
                  </NavLink>
                </NavItem>
              )}
              {canGetWeeklySummaries || canGetWeeklySummaries ? (
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret>
                    <span className="dashboard-text-link">{REPORTS}</span>
                  </DropdownToggle>
                  <DropdownMenu>
                    {canGetWeeklySummaries ? (
                      <>
                        <DropdownItem tag={Link} to="/reports">
                          {REPORTS}
                        </DropdownItem>
                        <DropdownItem tag={Link} to="/weeklysummariesreport">
                          {WEEKLY_SUMMARIES_REPORT}
                        </DropdownItem>
                      </>
                    ) : (
                      <DropdownItem tag={Link} to="/weeklysummariesreport">
                        {WEEKLY_SUMMARIES_REPORT}
                      </DropdownItem>
                    )}
                  </DropdownMenu>
                </UncontrolledDropdown>
              ) : null}

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

              {(canPostUserProfile ||
                canDeleteUserProfile ||
                canPutUserProfileImportantInfo ||
                canCreateBadges ||
                canPostProject ||
                canDeleteTeam ||
                canPutTeam ||
                canCreatePopup ||
                canUpdatePopup) && (
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret>
                    <span className="dashboard-text-link">{OTHER_LINKS}</span>
                  </DropdownToggle>
                  <DropdownMenu>
                    {(canPostUserProfile ||
                      canDeleteUserProfile ||
                      canPutUserProfileImportantInfo) && (
                      <DropdownItem tag={Link} to="/usermanagement">
                        {USER_MANAGEMENT}
                      </DropdownItem>
                    )}
                    {canCreateBadges && (
                      <DropdownItem tag={Link} to="/badgemanagement">
                        {BADGE_MANAGEMENT}
                      </DropdownItem>
                    )}
                    {canPostProject && (
                      <DropdownItem tag={Link} to="/projects">
                        {PROJECTS}
                      </DropdownItem>
                    )}
                    {(canDeleteTeam || canPutTeam) && (
                      <DropdownItem tag={Link} to="/teams">
                        {TEAMS}
                      </DropdownItem>
                    )}

                    {(user.role === 'Administrator' || user.role === 'Owner') && (
                      <DropdownItem tag={Link} to="/summarymanagement">
                        {SUMMARY_MANAGEMENT}
                      </DropdownItem>
                    )}

                    {canCreatePopup || canUpdatePopup ? (
                      <>
                        <DropdownItem divider />
                        <DropdownItem tag={Link} to="/admin/">
                          {POPUP_MANAGEMENT}
                        </DropdownItem>
                      </>
                    ) : null}
                    {canPutRole && (
                      <DropdownItem tag={Link} to="/permissionsmanagement">
                        {PERMISSIONS_MANAGEMENT}
                      </DropdownItem>
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
                  <span className="dashboard-text-link">{`${WELCOME},${firstName}`}</span>
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem header>
                    Hello
                    {firstName}
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem tag={Link} to={`/userprofile/${user.userid}`}>
                    {VIEW_PROFILE}
                  </DropdownItem>
                  {!cantUpdateDevAdminDetails(userProfile.email, userProfile.email) && (
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
  getTimerData,
  getAllRoles,
  hasPermission,
})(Header);
