import React from 'react';
import Img from 'react-image';
import {getCurrentUser} from "../services/loginService";
import {getUserProfile} from "../services/profileService";
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
} from 'reactstrap';

class Header extends React.Component {
  state = {
    userID:"",
    userData:{},
    userProfileData:{}
  };
  
  async componentDidMount() {
    let userID = getCurrentUser()? getCurrentUser().userid : null;
    if (!userID) return;
    let {data:userProfileData} = {...await getUserProfile(userID)};
    this.setState({userID,userProfileData});
  }
  render() {
    let {userID,userProfileData} = this.state;
    if (!userID) return (null);
    return (
      <div>
        <Navbar color="dark" dark expand="md" style={{marginBottom:'20px'}}>
          <NavbarBrand href="/">Time Tracking Tool</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink href="/dashboard" activeStyle={{color:"blue"}}>Dashboard</NavLink>
              </NavItem>
              <NavItem>
              <NavLink href={`/timelog/${userID}`}>Timelog</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="/reports" activeStyle={{color:"blue"}}>Reports</NavLink>
              </NavItem>
              <NavItem>
              <NavLink href={`/timelog/${userID}`}>
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
                  <DropdownItem href="/usermanagement">User Management</DropdownItem>
                  <DropdownItem href="">Projects</DropdownItem>
                  <DropdownItem href="">Teams</DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
              <NavItem>
                <NavLink href={`/profile/${userID}`}>
                  <Img src= {`${userProfileData.profilePic}`}
                       alt= "" height="35" width="40" class="dashboardimg"/> 
                </NavLink>
              </NavItem>
              <UncontrolledDropdown nav >
                  <DropdownToggle nav caret>
                    Welcome {userProfileData.firstName} 
                  </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem header>Hello {userProfileData.firstName}</DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem href={`/profile/${userID}`} >
                    View Profile
                  </DropdownItem>
                  <DropdownItem href="/updatepassword">Update Password</DropdownItem>
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

export default Header;
