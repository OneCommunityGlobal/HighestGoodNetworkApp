import React from 'react'
// import { getUserProfile } from '../../actions/userProfile'
import { getHeaderData } from '../../actions/authActions'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import {
  LOGO, DASHBOARD, TIMELOG, REPORTS, OTHER_LINKS, 
  USER_MANAGEMENT, PROJECTS, TEAMS, WELCOME, VIEW_PROFILE, UPDATE_PASSWORD, LOGOUT
} from '../../languages/en/ui'
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
} from 'reactstrap'

class Header extends React.Component {
  state = {}

  componentDidMount(){
    if (this.props.auth.isAuthenticated){
      // this.props.getUserProfile(this.props.auth.user.userid)
      this.props.getHeaderData(this.props.auth.user.userid)
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.auth.isAuthenticated && this.props.auth.isAuthenticated ){
      // this.props.getUserProfile(this.props.auth.user.userid)
      this.props.getHeaderData(this.props.auth.user.userid)
    }
  }

  render() {
    const { isAuthenticated, user, firstName, profilePic } = this.props.auth;
    // let firstName = "", profilePic = "";
    // if (this.props.userProfile){
    //   ({ firstName, profilePic } = this.props.userProfile);
    // }

    return (
      <div>
        <Navbar color='dark' dark expand='md' style={{ marginBottom: '20px' }}>
          <NavbarBrand tag={Link} to='/'>
             {LOGO}
          </NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          {isAuthenticated &&
            <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className='ml-auto' navbar>
              <NavItem>
                <NavLink tag={Link} to='/dashboard'>
                  {DASHBOARD}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to={`/timelog/${user.userid}`}>
                  {TIMELOG}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to='/reports'>
                  {REPORTS}
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to={`/timelog/${user.userid}`}>
                  <i className='fa fa-bell i-large'>
                    <i className='badge badge-pill badge-danger badge-notify'>
                      {/* Pull number of unread messages */}
                    </i>
                    <span className='sr-only'>unread messages</span>
                  </i>
                </NavLink>
              </NavItem>
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  {OTHER_LINKS}
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem tag={Link} to='/usermanagement'>
                    {USER_MANAGEMENT}
                  </DropdownItem>
                  <DropdownItem tag={Link} to='/projects'>
                    {PROJECTS}
                  </DropdownItem>
                  <DropdownItem tag={Link} to=''>
                    {TEAMS}
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
              <NavItem>
                <NavLink tag={Link} to={`/profile/${user.userid}`}>
                  <img
                    src={`${profilePic}`}
                    alt=''
                    height='35'
                    width='40'
                    className='dashboardimg'
                  />
                </NavLink>
              </NavItem>
              <UncontrolledDropdown nav>
                <DropdownToggle nav caret>
                  {WELCOME} {firstName}
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
                  <DropdownItem tag={Link} to='/logout'>
                    {LOGOUT}
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Nav>
          </Collapse>
          }
        </Navbar>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  userProfile: state.userProfile
});

export default connect(
  mapStateToProps,
  {
    // getUserProfile,
    getHeaderData
  }
)(Header)
