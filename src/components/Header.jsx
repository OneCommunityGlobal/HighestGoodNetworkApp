import React from 'react';
import {getCurrentUser} from "../services/loginService";
import { getUserData,
         getUserProfile 
} from "../services/profileService";
import Img from 'react-image';
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

import { userInfo } from 'os';


class Header extends React.Component {
  state = {
    userID:0,
    userData:{},
    userProfileData:{}
  };
  
  async componentDidMount() {
    let userID = getCurrentUser().userid;
  //  let userId = this.props.match.params.userId;
    let userData = getUserData(userID); //get data?
    let {data:userProfileData} = {...await getUserProfile(userID)}
    //let userProfileData = getUserData(userID); //user profile?
   
    this.setState({userID,userData,userProfileData});
  }
  render() {
    let {userID,userData,userProfileData} = this.state;
    return (
      <div>
        <Navbar color="dark" dark expand="md" style={{marginBottom:'20px'}}>
          <NavbarBrand href="/">Time Tracking Tool</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="mr5" navbar>
              <NavItem>
                <NavLink href="/dashboard" activeStyle={{color:"blue"}}>Dashboard</NavLink>
              </NavItem>
              <NavItem>
              <NavLink href={`/timelog/${userID}`}>Timelog</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="/reports" activeStyle={{color:"blue"}}>Reports</NavLink>
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
                <NavLink href={`/profile/${userID}`} activeStyle={{color:"blue"}}>
                {/* {"https://raw.githubusercontent.com/OneCommunityGlobal/HGNApp/master/public/assets/images/defaultprofilepic.jpg"} */}
                 <Img src= {`/components/Images/default.jpg`}
                      alt={`${userProfileData.profilePic}`} height="35" width="40"
                      class="" shape="circle" /> 
                    {/* {`${userData.profilePic}`} */}
                </NavLink>
              </NavItem>
              <UncontrolledDropdown nav >
                  <DropdownToggle nav caret>
                    Welcome {userProfileData.firstName} 
                    {/* {userData.name}  */}
                  </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem header>Hello {userProfileData.firstName}</DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem>View Profile</DropdownItem>
                  <DropdownItem  href="/updatepassword" >Update Password</DropdownItem>
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
