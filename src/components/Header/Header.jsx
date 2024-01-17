import React, { useState, useEffect } from 'react';
// import { getUserProfile } from '../../actions/userProfile'
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
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Button,
} from 'reactstrap';
import Logout from '../Logout/Logout';
import PopUpBar from 'components/PopUpBar';
import './Header.css';
import hasPermission, { cantUpdateDevAdminDetails } from '../../utils/permissions';
import { fetchTaskEditSuggestions } from 'components/TaskEditSuggestions/thunks';

export const Header = props => {
  const [isOpen, setIsOpen] = useState(false);
  const [logoutPopup, setLogoutPopup] = useState(false);
  const { isAuthenticated, user } = props.auth;
  const [firstName, setFirstName] = useState(props.auth.firstName);
  const [profilePic, setProfilePic] = useState(props.auth.profilePic);
  const [displayUserId, setDisplayUserId] = useState(user.userid);
  const [popup, setPopup] = useState(false);
  const [isAuthUser, setIsAuthUser] = useState(true);
  // Reports
  const canGetReports = props.hasPermission('getReports');
  const canGetWeeklySummaries = props.hasPermission('getWeeklySummaries');
  // Users

  const canPostUserProfile = props.hasPermission('postUserProfile');
  const canDeleteUserProfile = props.hasPermission('deleteUserProfile');
  const canPutUserProfileImportantInfo = props.hasPermission('putUserProfileImportantInfo');
  // Badges
  const canCreateBadges = props.hasPermission('createBadges');
  // Projects
  const canSeeProjectManagementTab = props.hasPermission('seeProjectManagement') || props.hasPermission('seeProjectManagementTab');
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

  const removeViewingUser = () => {
    setPopup(false);
    sessionStorage.removeItem('viewingUser');
    window.dispatchEvent(new Event('storage'));
  }

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
                <NavLink tag={Link} to={`/timelog/${displayUserId}`}>
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
                canSeeProjectManagementTab ||
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
                    ) : (
                      <React.Fragment></React.Fragment>
                    )}
                    {canCreateBadges ? (
                      <DropdownItem tag={Link} to="/badgemanagement">
                        {BADGE_MANAGEMENT}
                      </DropdownItem>
                    ) : (
                      <React.Fragment></React.Fragment>
                    )}
                    {(canPostProject || canSeeProjectManagementTab) && (
                      <DropdownItem tag={Link} to="/projects">
                        {PROJECTS}
                      </DropdownItem>
                    )}
                    {(canDeleteTeam || canPutTeam) && (
                      <DropdownItem tag={Link} to="/teams">
                        {TEAMS}
                      </DropdownItem>
                    )}
                    {(canPutRole || canManageUser) && (
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
                <DropdownMenu>
                  <DropdownItem header>Hello {firstName}</DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem tag={Link} to={`/userprofile/${displayUserId}`}>
                    {VIEW_PROFILE}
                  </DropdownItem>
                  {!cantUpdateDevAdminDetails(props.userProfile.email, props.userProfile.email) && (
                    <DropdownItem tag={Link} to={`/updatepassword/${displayUserId}`}>
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
      {!isAuthUser && <PopUpBar onClickClose={()=> setPopup(prevPopup=> !prevPopup)} viewingUser={JSON.parse(window.sessionStorage.getItem('viewingUser'))}/> }
      <div>
        <Modal isOpen={popup} >
          <ModalHeader >Return to your Dashboard</ModalHeader>
          <ModalBody>
            <p>Are you sure you wish to return to your own dashboard?</p>
          </ModalBody>
          <ModalFooter>
            <Button variant='primary' onClick={removeViewingUser}>
              Ok
            </Button>{' '}
            <Button variant='secondary' onClick={()=> setPopup(prevPopup=> !prevPopup)}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
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
  getAllRoles,
  hasPermission,
})(Header);
