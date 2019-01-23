import React from "react";
import Img from "react-image";
import { connect } from "react-redux";
import store from '../store';
import { getCurrentUser, getUserProfile } from '../actions';
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

import { BrowserRouter, Route, Link } from "react-router-dom";

class Header extends React.Component {


  state = {
    userId: 0,
    userProfileData: { a: 1, b: 2 },
    name: "",
    profilePic: ""
  };

  async componentDidMount() {
    let user = this.props.getCurrentUser();
    if (user) {
      let { userid: userId } = user;
      let { data: userProfileData } = { ...await this.props.getUserProfile(userId) }
      let name = 'hello';
      // let profilePic = userProfileData.profilePic;
      this.setState({ userId, userProfileData, name /* profilePic */ });
    }
  }
  render() {
    let { userId, name, profilePic } = this.state;
    if (userId === 0) return null;

    return (

      <div>
        <Navbar color="dark" dark expand="md" style={{ marginBottom: "20px" }}>
          <NavbarBrand href="/">Time Tracking Tool</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <Link to="/dashboard" activeStyle={{ color: "blue" }}>
                  Dashboard
                </Link>
              </NavItem>
              <NavItem>
                <NavLink href={`/timelog/${userId}`}>
                  <Link to={`/timelog/${store.getState().userProfile}`}>Timelog</Link>
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="/reports" activeStyle={{ color: "blue" }}>
                  Reports
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink href={`/timelog/${store.getState().userProfile}`}>
                  {/* Get userid on line above */}
                  <icon class="fa fa-bell icon-large">
                    <icon class="badge badge-pill badge-danger badge-notify">
                      {/* Pull number of unread messages */}
                    </icon>
                    <span class="sr-only">unread messages</span>
                  </icon>
                </NavLink>
              </NavItem>
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  Other Links
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem href="/usermanagement">
                    User Management
                  </DropdownItem>
                  <DropdownItem href="">Projects</DropdownItem>
                  <DropdownItem href="">Teams</DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
              <NavItem>
                <NavLink href={`/profile/${store.getState().userProfile}`}>
                  <Img
                    src={`${store.getState().userProfile}`}
                    alt=""
                    height="35"
                    width="40"
                    class="dashboardimg"
                  />
                </NavLink>
              </NavItem>
              <UncontrolledDropdown nav>
                <DropdownToggle nav caret>
                  Welcome {store.getState().userProfile}
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem header>
                    Hello {store.getState().userProfile}
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem href={`/profile/${store.getState().userProfile}`}>
                    View Profile
                  </DropdownItem>
                  <DropdownItem href="/updatepassword">
                    Update Password
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem href="/logout">Logout</DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({ state });

export default connect(mapStateToProps, { getCurrentUser, getUserProfile })(Header);