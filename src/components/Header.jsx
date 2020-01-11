import React from 'react'
import { getCurrentUser } from '../services/loginService'
// import {getUserProfile} from "../services/userProfileService";
import { getUserProfile } from '../actions/userProfile'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
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
  state = {
    userId: 0,
    userProfileData: {},
    name: '',
    profilePic: ''
  }

  async componentDidMount() {
    let user = this.props.state.user
    if (user && user.role) {
      let { userid: userId } = user
      // let {data:userProfileData} = {...await getUserProfile(userId)}
      this.setState({ userId })
      this.props.getUserProfile(userId)
    }
  }

  // componentDidUpdate(prevProps) {
  //   if (this.props.state.userProfile && prevProps.state.userProfile !== this.props.state.userProfile){
  //     let userProfileData = this.props.state.userProfile;
  //     let name = this.props.state.userProfile.firstName;
  //     let profilePic = this.props.state.userProfile.profilePic;
  //     this.setState({userProfileData,name,profilePic});
  //   }
  // }

  render() {
    // let {userId,name,profilePic} = this.state;

    const { userId } = this.state
    // let userId = 0
    // if (this.props.state.user && this.props.state.user.role) {
    //   userId = this.props.state.user.userId
    // }

    let name = ''
    let profilePic = ''
    if (this.props.state.userProfile) {
      name = this.props.state.userProfile.firstName
      profilePic = this.props.state.userProfile.profilePic
    }

    return (
      <div>
        <Navbar color='dark' dark expand='md' style={{ marginBottom: '20px' }}>
          <NavbarBrand tag={Link} to='/'>
            Time Tracking Tool
          </NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className='ml-auto' navbar>
              <NavItem>
                <NavLink tag={Link} to='/dashboard'>
                  Dashboard
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to={`/timelog/${userId}`}>
                  Timelog
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to='/reports'>
                  Reports
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={Link} to={`/timelog/${userId}`}>
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
                  Other Links
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem tag={Link} to='/usermanagement'>
                    User Management
                  </DropdownItem>
                  <DropdownItem tag={Link} to=''>
                    Projects
                  </DropdownItem>
                  <DropdownItem tag={Link} to=''>
                    Teams
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
              <NavItem>
                <NavLink tag={Link} to={`/profile/${userId}`}>
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
                  Welcome {name}
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem header>Hello {name}</DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem tag={Link} to={`/userprofile/${userId}`}>
                    View Profile
                  </DropdownItem>
                  <DropdownItem tag={Link} to={`/updatepassword/${userId}`}>
                    Update Password
                  </DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem tag={Link} to='/logout'>
                    Logout
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return { state }
}

export default connect(
  mapStateToProps,
  {
    getUserProfile
  }
)(Header)
