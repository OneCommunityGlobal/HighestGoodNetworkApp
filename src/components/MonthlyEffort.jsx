import React from 'react';
import {getCurrentUser} from "../services/loginService";
import { Link } from 'react-router-dom';
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


class MonthlyEffort extends React.Component {
    state = {
      
    };
    
  async componentDidMount() {
    let userID = getCurrentUser().userid;
    this.setState({userID});
  }
  render() {
    let {userID} = this.state;
    return (
        <div className="card-body text-white">
          <h5 className="card-title">Monthly Efforts</h5>
          <div>
          
          </div>
        </div>
        
    );
  }
}

export default MonthlyEffort;
