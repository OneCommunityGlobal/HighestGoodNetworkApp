import React, { useState, useEffect } from 'react';
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
import { getTimerData } from '../../../actions/timer';
import { getAllRoles } from '../../../actions/role';
import {
  ADD_MET,
  LOG_MET,
  LOG_TIME,
  LOG_ISSUE,
  ADD_MEMBER,
  MATERIAL,
  TOOL_EQUIPMENT,
  REPORTS,
  WEEKLY_SUMMARIES_REPORT,
  WELCOME,
  VIEW_PROFILE,
  UPDATE_PASSWORD,
  LOGOUT,
} from '../../../languages/en/ui';
import Logout from '../../Logout/Logout';
import hasPermission, { cantUpdateDevAdminDetails } from '../../../utils/permissions';
import './BMHeader.css';

export function Header(props) {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, firstName, profilePic } = props.auth;
  const [logoutPopup, setLogoutPopup] = useState(false);
  const canGetWeeklySummaries = props.hasPermission('getWeeklySummaries');

  const dispatch = useDispatch();

  useEffect(() => {
    if (props.auth.isAuthenticated) {
      props.getHeaderData(props.auth.user.userid);
      props.getTimerData(props.auth.user.userid);
      if (props.auth.user.role === 'Administrator') {
        dispatch(fetchTaskEditSuggestions());
      }
    }
  }, [props.auth.isAuthenticated]);

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
      <Navbar className="py-3 navbar" color="dark" dark expand="xl">
        {logoutPopup && <Logout open={logoutPopup} setLogoutPopup={setLogoutPopup} />}
        <div className="logo-section">HGN Logo</div>

        <NavbarToggler onClick={toggle} />
        {isAuthenticated && (
          <Collapse isOpen={isOpen} navbar>
            <Nav className="ml-auto nav-links" navbar>
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  <span className="dashboard-text-link">{ADD_MET}</span>
                </DropdownToggle>
                <DropdownMenu>
                  <>
                    <DropdownItem tag={Link} to="/material">
                      {MATERIAL}
                    </DropdownItem>
                    <DropdownItem tag={Link} to="/toolequipement">
                      {TOOL_EQUIPMENT}
                    </DropdownItem>
                  </>
                </DropdownMenu>
              </UncontrolledDropdown>

              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  <span className="dashboard-text-link">{LOG_MET}</span>
                </DropdownToggle>
                <DropdownMenu>
                  <>
                    <DropdownItem tag={Link} to="/material">
                      {MATERIAL}
                    </DropdownItem>
                    <DropdownItem tag={Link} to="/toolequipement">
                      {TOOL_EQUIPMENT}
                    </DropdownItem>
                  </>
                </DropdownMenu>
              </UncontrolledDropdown>

              <NavItem>
                <NavLink tag={Link} to="/logtime">
                  <span className="dashboard-text-link">{LOG_TIME}</span>
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to="/logissue">
                  <span className="dashboard-text-link">{LOG_ISSUE}</span>
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to="/addmember">
                  <span className="dashboard-text-link">{ADD_MEMBER}</span>
                </NavLink>
              </NavItem>

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
  getTimerData,
  getAllRoles,
  hasPermission,
})(Header);
