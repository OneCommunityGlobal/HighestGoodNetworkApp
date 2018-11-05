import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
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
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false
    };
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  render() {
    return (
      <div>
        <Navbar color="dark" dark expand="md" style={{marginBottom:'20px'}}>
          <NavbarBrand href="/">Time Tracking Tool</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="m10" navbar>
              <NavItem>
                <NavLink href="/Dashboard" activeStyle={{color:"blue"}}>Dashboard</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="/timelog" activeStyle={{color:"blue"}}>Timelog</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="/reports" activeStyle={{color:"blue"}}>Reports</NavLink>
              </NavItem>
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  other Links
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem href="/usermanagement">User Management</DropdownItem>
                  <DropdownItem>Projects</DropdownItem>
                  <DropdownItem>Teams</DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
              <UncontrolledDropdown nav >
                <DropdownToggle nav caret>
                  Welcome user
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem header>Hello User</DropdownItem>
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
      
      //<div>   
     // {/* //   <navbar color="dark" dark expand="md" style={{marginBottom:'20px'}}>
      //     <navbarBrand href="/">Time Tracking Tool</navbarBrand>
      //     <navbarToggler onClick={this.toggle} />
      //     <Collapse isOpen={this.state.isOpen} navbar>
      //       <Nav className="ml-auto" navbar>
      //         <NavItem>
      //           <NavLink href="/Dashboard">Dashboard</NavLink>
      //         </NavItem>
      //         <NavItem>
      //           <NavLink href="/timelog">Timelog</NavLink>
      //         </NavItem>
      //         <NavItem>
      //           <NavLink href="/reports">Reports</NavLink>
      //         </NavItem>
      //         <UncontrolledDropdown nav innavbar>
      //           <DropdownToggle nav caret>
      //             other Links
      //           </DropdownToggle>
      //           <DropdownMenu>
      //             <DropdownItem href="/usermanagement">User Management</DropdownItem>
      //             <DropdownItem>Projects</DropdownItem>
      //             <DropdownItem>Teams</DropdownItem>
      //           </DropdownMenu>
      //         </UncontrolledDropdown>
      //         <UncontrolledDropdown nav >
      //           <DropdownToggle nav caret>
      //             Welcome user
      //           </DropdownToggle>
      //           <DropdownMenu>
      //             <DropdownItem header>Hello User</DropdownItem>
      //             <DropdownItem divider />
      //             <DropdownItem>View Profile</DropdownItem>
      //             <DropdownItem  href="/updatepassword" >Update Password</DropdownItem>
      //             <DropdownItem divider />
      //             <DropdownItem href="/logout">Logout</DropdownItem>
      //           </DropdownMenu>
      //         </UncontrolledDropdown>
      //       </Nav>
      //     </Collapse>
      //   </navbar> */}
      // </div>
    );
  }
}

export default Header;
