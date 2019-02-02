import React from "react";
import Img from "react-image";
import { connect } from "react-redux";
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
import { LinkContainer } from 'react-router-bootstrap'
import { Link } from "react-router-dom";

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
      this.setState({ userId, userProfileData, name /* profilePic */ });
    }
    console.log(this.props.state)
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
                <LinkContainer to="/dashboard">
                  <NavLink>Dashboard</NavLink>
                </LinkContainer>
              </NavItem>
              <NavItem>
                <LinkContainer to={`/timelog/${this.props.state.userProfile._id}`}>
                  <NavLink>Timelog</NavLink>
                </LinkContainer>
              </NavItem>
              <NavItem>
                <NavLink href="/reports">
                  Reports
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink href={`/timelog/${this.props.state.userProfile}`}>
                  {/* Get userid on line above */}
                  <icon className="fa fa-bell icon-large">
                    <icon className="badge badge-pill badge-danger badge-notify">
                      {/* Pull number of unread messages */}
                    </icon>
                    <span className="sr-only">unread messages</span>
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
                <NavLink href={`/profile/${this.props.state.userProfile._id}`}>
                  <Img
                    src={`${this.props.state.userProfile.profilePic}`}
                    alt=""
                    height="35"
                    width="40"
                    className="dashboardimg"
                  />
                </NavLink>
              </NavItem>
              <UncontrolledDropdown nav>
                <DropdownToggle nav caret>
                  Welcome {this.props.state.userProfile.firstName}
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem header>
                    Hello {this.props.state.userProfile.firstName}
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem href={`/profile/${this.props.state.userProfile._id}`}>
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
      </div >
    );
  }
}

const mapStateToProps = (state) => ({ state });

export default connect(mapStateToProps, { getCurrentUser, getUserProfile })(Header);