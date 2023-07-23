import React, { useState, useEffect } from 'react';
// import { getUserProfile } from '../../actions/userProfile'
import { getHeaderData } from '../../actions/authActions';
import { getTimerData } from '../../actions/timer';
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
import { Logout } from '../Logout/Logout';
import './Header.css';
import hasPermission from '../../utils/permissions';
import { fetchTaskEditSuggestionCount } from 'components/TaskEditSuggestions/thunks';
import SummaryManagement from 'components/SummaryManagement/SummaryManagement';

export const Header = props => {
  const [isOpen, setIsOpen] = useState(false);
  const [logoutPopup, setLogoutPopup] = useState(false);
  const { isAuthenticated, user, firstName, profilePic } = props.auth;

  const dispatch = useDispatch();

  const userPermissions = props.auth.user?.permissions?.frontPermissions;

  useEffect(() => {
    if (props.auth.isAuthenticated) {
      props.getHeaderData(props.auth.user.userid);
      props.getTimerData(props.auth.user.userid);
    }
  }, []);

  useEffect(() => {
    if (roles.length === 0) {
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

  return (
    <div className="header-wrapper">
      <Navbar className="py-3 mb-3 navbar" color="dark" dark expand="xl">
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
              {hasPermission(user.role, 'editTask', roles, userPermissions) && (
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
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  <span className="dashboard-text-link">{REPORTS}</span>
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem tag={Link} to="/reports">
                    {REPORTS}
                  </DropdownItem>
                  {hasPermission(user.role, 'seeWeeklySummaryReports', roles, userPermissions) ? (
                    <DropdownItem tag={Link} to="/weeklysummariesreport">
                      {WEEKLY_SUMMARIES_REPORT}
                    </DropdownItem>
                  ) : (
                    <React.Fragment></React.Fragment>
                  )}
                </DropdownMenu>
              </UncontrolledDropdown>
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

              {(hasPermission(user.role, 'seeUserManagement', roles, userPermissions) ||
                hasPermission(user.role, 'seeBadgeManagement', roles, userPermissions) ||
                hasPermission(user.role, 'seeProjectManagement', roles, userPermissions) ||
                hasPermission(user.role, 'seeTeamsManagement', roles, userPermissions) ||
                hasPermission(user.role, 'seePopupManagement', roles, userPermissions)) && (
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret>
                    <span className="dashboard-text-link">{OTHER_LINKS}</span>
                  </DropdownToggle>
                  <DropdownMenu>
                    {hasPermission(user.role, 'seeUserManagement', roles, userPermissions) ? (
                      <DropdownItem tag={Link} to="/usermanagement">
                        {USER_MANAGEMENT}
                      </DropdownItem>
                    ) : (
                      <React.Fragment></React.Fragment>
                    )}
                    {hasPermission(user.role, 'seeBadgeManagement', roles, userPermissions) ? (
                      <DropdownItem tag={Link} to="/badgemanagement">
                        {BADGE_MANAGEMENT}
                      </DropdownItem>
                    ) : (
                      <React.Fragment></React.Fragment>
                    )}
                    {hasPermission(user.role, 'seeProjectManagement', roles, userPermissions) && (
                      <DropdownItem tag={Link} to="/projects">
                        {PROJECTS}
                      </DropdownItem>
                    )}
                    {hasPermission(user.role, 'seeTeamsManagement', roles, userPermissions) && (
                      <DropdownItem tag={Link} to="/teams">
                        {TEAMS}
                      </DropdownItem>
                    )}
                    {hasPermission(user.role, 'seeTeamsManagement', roles, userPermissions) && (
                      <DropdownItem tag={Link} to="/summarymanagement">
                        {SUMMARY_MANAGEMENT}
                      </DropdownItem>
                    )}
                    {hasPermission(user.role, 'seePopupManagement', roles, userPermissions) ? (
                      <>
                        <DropdownItem divider />
                        <DropdownItem tag={Link} to={`/admin/`}>
                          {POPUP_MANAGEMENT}
                        </DropdownItem>
                      </>
                    ) : null}
                    {hasPermission(
                      user.role,
                      'seePermissionsManagement',
                      roles,
                      userPermissions,
                    ) && (
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
                  <DropdownItem tag={Link} to={`/updatepassword/${user.userid}`}>
                    {UPDATE_PASSWORD}
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem tag={Link} to="/#" onClick={openModal}>
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
};

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
})(Header);
