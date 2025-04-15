import { useState, useEffect } from 'react';
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
import { fetchTaskEditSuggestions } from 'components/TaskEditSuggestions/thunks';
import { getHeaderData } from '../../../actions/authActions';
import { getAllRoles } from '../../../actions/role';
import Timer from '../../Timer/Timer';
import OwnerMessage from '../../OwnerMessage/OwnerMessage';
import {
  // LOGO,
  DASHBOARD,
  BM_DASHBOARD,
  BM_PROJECT,
  ADD_MATERIAL,
  LOG_MATERIAL,
  MATERIAL_LIST,
  ADD_EQUIPMENT_TOOL,
  LOG_EQUIPMENT_TOOL,
  UPDATE_EQUIPMENT_TOOL,
  EQUIPMENT_TOOL_LIST,
  ISSUE,
  LESSON,
  TIMELOG,
  REPORTS,
  WEEKLY_SUMMARIES_REPORT,
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
} from '../../../languages/en/ui';
import Logout from '../../Logout/Logout';
import './BMHeader.css';
import hasPermission, { cantUpdateDevAdminDetails } from '../../../utils/permissions';

export function Header(props) {
  const [isOpen, setIsOpen] = useState(false);
  const [logoutPopup, setLogoutPopup] = useState(false);
  const { isAuthenticated, user, firstName, profilePic } = props.auth;

  // Reports
  const canGetWeeklySummaries = props.hasPermission('getWeeklySummaries');
  // Users

  const canPostUserProfile = props.hasPermission('postUserProfile');
  const canDeleteUserProfile = props.hasPermission('deleteUserProfile');
  const canPutUserProfileImportantInfo = props.hasPermission('putUserProfileImportantInfo');
  // Badges
  const canCreateBadges = props.hasPermission('createBadges');
  // Projects
  const canPostProject = props.hasPermission('postProject');
  // Tasks
  const canUpdateTask = props.hasPermission('updateTask');
  // Teams
  const canDeleteTeam = props.hasPermission('deleteTeam');
  const canPutTeam = props.hasPermission('putTeam');
  // Popups
  const canCreatePopup = props.hasPermission('createPopup');
  const canUpdatePopup = props.hasPermission('updatePopup');
  // Roles
  const canPutRole = props.hasPermission('putRole');
  // Permissions
  const canManageUser = props.hasPermission('putUserProfilePermissions');

  const dispatch = useDispatch();

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

  return (
    <div className="header-wrapper">
      <Navbar className="py-3 navbar" color="dark" dark expand="xl">
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
                <NavLink tag={Link} to="/bmdashboard">
                  <span className="dashboard-text-link">{BM_DASHBOARD}</span>
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to={`/timelog/${user.userid}`}>
                  <span className="dashboard-text-link">{TIMELOG}</span>
                </NavLink>
              </NavItem>
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  <span className="dashboard-text-link">{BM_PROJECT}</span>
                </DropdownToggle>
                <DropdownMenu>
                  <>
                    <DropdownItem tag={Link} to="/bmdashboard/add-material">
                      {ADD_MATERIAL}
                    </DropdownItem>
                    <DropdownItem tag={Link} to="/bmdashboard/logMaterials">
                      {LOG_MATERIAL}
                    </DropdownItem>
                    <DropdownItem tag={Link} to="/bmdashboard/materials-list">
                      {MATERIAL_LIST}
                    </DropdownItem>
                    <DropdownItem tag={Link} to="/bmdashboard/add-equipment-tool">
                      {ADD_EQUIPMENT_TOOL}
                    </DropdownItem>
                    <DropdownItem tag={Link} to="/bmdashboard/log-equipment-tool">
                      {LOG_EQUIPMENT_TOOL}
                    </DropdownItem>
                    <DropdownItem tag={Link} to="/bmdashboard/update-equipment-tool">
                      {UPDATE_EQUIPMENT_TOOL}
                    </DropdownItem>
                    <DropdownItem tag={Link} to="/bmdashboard/equipment-tool-list">
                      {EQUIPMENT_TOOL_LIST}
                    </DropdownItem>
                    <DropdownItem tag={Link} to="/bmdashboard/issue">
                      {ISSUE}
                    </DropdownItem>
                    <DropdownItem tag={Link} to="/bmdashboard/lesson">
                      {LESSON}
                    </DropdownItem>
                  </>
                </DropdownMenu>
              </UncontrolledDropdown>
              {canGetWeeklySummaries ? (
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret>
                    <span className="dashboard-text-link">{REPORTS}</span>
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem tag={Link} to="/reports">
                      {REPORTS}
                    </DropdownItem>
                    <DropdownItem tag={Link} to="/weeklysummariesreport">
                      {WEEKLY_SUMMARIES_REPORT}
                    </DropdownItem>
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
                canUpdatePopup ||
                canManageUser) && (
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret>
                    <span className="dashboard-text-link">{OTHER_LINKS}</span>
                  </DropdownToggle>
                  <DropdownMenu>
                    {canPostUserProfile ||
                    canDeleteUserProfile ||
                    canPutUserProfileImportantInfo ? (
                      <DropdownItem tag={Link} to="/usermanagement">
                        {USER_MANAGEMENT}
                      </DropdownItem>
                    ) : null}
                    {canCreateBadges ? (
                      <DropdownItem tag={Link} to="/badgemanagement">
                        {BADGE_MANAGEMENT}
                      </DropdownItem>
                    ) : null}
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
                    {canCreatePopup || canUpdatePopup ? (
                      <>
                        <DropdownItem divider />
                        <DropdownItem tag={Link} to="/admin/">
                          {POPUP_MANAGEMENT}
                        </DropdownItem>
                      </>
                    ) : null}
                    {(canPutRole || canManageUser) && (
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
