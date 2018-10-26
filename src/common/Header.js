import React from 'react';
//import { Link } from 'react-router-dom';


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
         hello
      {/* //   <navbar color="dark" dark expand="md" style={{marginBottom:'20px'}}>
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
       </div>
    );
  }
}

export default Header;
