import React from 'react';
// import { getUserProfile } from '../../actions/userProfile'
import { getHeaderData } from '../../actions/authActions';
import { getTimerData } from '../../actions/timer';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Timer from '../Timer/Timer';
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
  WELCOME,
  VIEW_PROFILE,
  UPDATE_PASSWORD,
  LOGOUT,
  POPUP_MANAGEMENT,
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
import { UserRole } from '../../utils/enums';
import './Header.css';

export class Header extends React.Component {
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false,
    };
  }

  componentDidMount() {
    if (this.props.auth.isAuthenticated) {
      // this.props.getUserProfile(this.props.auth.user.userid)
      this.props.getHeaderData(this.props.auth.user.userid);
      this.props.getTimerData(this.props.auth.user.userid);
    }
  }
  componentDidUpdate(prevProps) {
    if (!prevProps.auth.isAuthenticated && this.props.auth.isAuthenticated) {
      // this.props.getUserProfile(this.props.auth.user.userid)
      this.props.getHeaderData(this.props.auth.user.userid);
      this.props.getTimerData(this.props.auth.user.userid);
    }
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  render() {
    const { isAuthenticated, user, firstName, profilePic } = this.props.auth;
    return (
      <div>
        <Navbar className="py-3 mb-3" color="dark" dark expand="lg">
          {/**
           * <NavbarBrand tag={Link} to="/" className="d-none d-md-block">
            {LOGO}
          </NavbarBrand>
           */}
          {isAuthenticated && <Timer />}
          <NavbarToggler onClick={this.toggle} />
          {isAuthenticated && (
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className="ml-auto" navbar>
                <NavItem>
                  <NavLink tag={Link} to="/dashboard">
                    {DASHBOARD}
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} to={`/timelog/${user.userid}`}>
                    {TIMELOG}
                  </NavLink>
                </NavItem>
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret>
                    {REPORTS}
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem tag={Link} to="/reports">
                      {REPORTS}
                    </DropdownItem>
                    {user.role === UserRole.Administrator ||
                    user.role === UserRole.Manager ||
                    user.role === UserRole.CoreTeam ? (
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
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret>
                    {OTHER_LINKS}
                  </DropdownToggle>
                  <DropdownMenu>
                    {user.role === UserRole.Administrator ? (
                      <DropdownItem tag={Link} to="/usermanagement">
                        {USER_MANAGEMENT}
                      </DropdownItem>
                    ) : (
                      <React.Fragment></React.Fragment>
                    )}
                    {user.role === UserRole.Administrator ? (
                      <DropdownItem tag={Link} to="/badgemanagement">
                        {BADGE_MANAGEMENT}
                      </DropdownItem>
                    ) : (
                      <React.Fragment></React.Fragment>
                    )}
                    <DropdownItem tag={Link} to="/projects">
                      {PROJECTS}
                    </DropdownItem>
                    <DropdownItem tag={Link} to="/teams">
                      {TEAMS}
                    </DropdownItem>
                    {user.role === UserRole.Administrator ? (
                      <>
                        <DropdownItem divider />
                        <DropdownItem tag={Link} to={`/admin/`}>
                          {POPUP_MANAGEMENT}
                        </DropdownItem>
                      </>
                    ) : null}
                  </DropdownMenu>
                </UncontrolledDropdown>
                <NavItem>
                  <NavLink tag={Link} to={`/userprofile/${user.userid}`}>
                    <img
                      src={`${profilePic || '/pfp-default-header.png'}`}
                      alt=""
                      height="35"
                      width="40"
                      className="dashboardimg"
                    />
                  </NavLink>
                </NavItem>
                <UncontrolledDropdown nav>
                  <DropdownToggle nav caret>
                    {WELCOME}, {firstName}
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
                    <DropdownItem tag={Link} to="/logout">
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
}
const mapStateToProps = (state) => ({
  auth: state.auth,
  userProfile: state.userProfile,
});
export default connect(mapStateToProps, {
  getHeaderData,
  getTimerData,
})(Header);
