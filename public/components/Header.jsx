import React from 'react';
import {getCurrentUser} from "../services/loginService";
import {getUserProfile} from "../services/userProfileService";
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
    userId:0,
    userProfileData:{},
    name:"",
    profilePic:""
  };
  
  async componentDidMount() {
    let user = getCurrentUser();
    if(user)
    {
      let {userid:userId} = user;
    let {data:userProfileData} = {...await getUserProfile(userId)}
    let name = userProfileData.firstName;
    let profilePic = userProfileData.profilePic;
    this.setState({userId,userProfileData,name,profilePic});
    }
  }
  render() {
    let {userId,name,profilePic} = this.state;
    if(userId === 0) return null;

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
              <NavLink href={`/timelog/${userId}`}>Timelog</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="/reports" activeStyle={{color:"blue"}}>Reports</NavLink>
              </NavItem>
              <NavItem>
              <NavLink href={`/timelog/${userId}`}>
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
                  <DropdownItem href="/usermanagement">User Management</DropdownItem>
                  <DropdownItem href="">Projects</DropdownItem>
                  <DropdownItem href="">Teams</DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
              <NavItem>
                <NavLink href={`/profile/${userId}`}>
                  <img src= {`${profilePic}`} alt= "" height="35" width="40" className="dashboardimg"/> 
                </NavLink>
              </NavItem>
              <UncontrolledDropdown nav >
                  <DropdownToggle nav caret>
                    Welcome {name}
                  </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem header>Hello {name}</DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem href={`/userprofile/${userId}`} >
                    View Profile
                  </DropdownItem>
                  <DropdownItem href={`/updatepassword/${userId}`}>Update Password</DropdownItem>
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
