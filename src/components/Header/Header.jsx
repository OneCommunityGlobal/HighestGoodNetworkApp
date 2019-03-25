import React from "react";
import { Link } from "react-router-dom";
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
  DropdownItem
} from "reactstrap";
import { connect } from "react-redux";
import { getUserProfile } from "../../services/userProfileService";
import { getCurrentUser } from "../../services/loginService";

class Header extends React.Component {
  state = {
    userId: 0,
    userProfileData: { a: 1, b: 2 },
    name: "",
    profilePic: ""
  };

  async componentDidMount() {
    const user = getCurrentUser();
    if (user) {
      const { userid: userId } = user;
      const { data: userProfileData } = { ...(await getUserProfile(userId)) };
      const name = userProfileData.firstName;
      const profilePic = userProfileData.profilePic;
      this.setState({ userId, userProfileData, name, profilePic });
    }
  }

  render() {
    const { userId, profilePic } = this.state;
    return (
      <div>
        <Navbar color="dark" dark expand="md" style={{ marginBottom: "20px" }}>
          <NavbarBrand tag={Link} to="/">
            Time Tracking Tool
          </NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink tag={Link} to="/dashboard">
                  Dashboard
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to={`/timelog/${userId}`}>
                  Timelog
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to="/reports">
                  Reports
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to={`/timelog/${userId}`}>
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
                  Other Links
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem tag={Link} to="/usermanagement">
                    User Management
                  </DropdownItem>
                  <DropdownItem tag={Link} to="">
                    Projects
                  </DropdownItem>
                  <DropdownItem tag={Link} to="">
                    Teams
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
              <NavItem>
                <NavLink tag={Link} to={`/profile/${userId}`}>
                  <img
                    src={`${profilePic}`}
                    alt=""
                    height="35"
                    width="40"
                    className="dashboardimg"
                  />
                </NavLink>
              </NavItem>
              <UncontrolledDropdown nav>
                <DropdownToggle nav caret>
                  Welcome 
{' '}
{this.props.state.userProfile.firstName}
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem header>
                    Hello 
{' '}
{this.props.state.userProfile.firstName}
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem tag={Link} to={`/userprofile/${userId}`}>
                    View Profile
                  </DropdownItem>
                  <DropdownItem tag={Link} to={`/updatepassword/${userId}`}>
                    Update Password
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem tag={Link} to="/logout">
                    Logout
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    );
  }
}

const mapStateToProps = state => ({ state });

export default connect(
  mapStateToProps,
  { getCurrentUser, getUserProfile }
)(Header);
