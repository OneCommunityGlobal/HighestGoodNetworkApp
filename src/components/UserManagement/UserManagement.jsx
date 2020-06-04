/*****************************************************************
 * Component   : USER MANAGEMENT 
 * Author      : Nithesh A N - TEKTalent 
 * Created on  : 05/27/2020
 * List the users in the application for administrator.
 *****************************************************************/
import React from 'react'
import { getAllUserProfile } from '../../actions/userManagement'
import { connect } from 'react-redux'
import Loading from '../common/Loading'
import UserTableHeader from './UserTableHeader'
import UserTableData from './UserTableData'
import UserTableSearchHeader from './UserTableSearchHeader'
import UserTableFooter from './UserTableFooter'
import './usermanagement.css'
import UserSearchPanel from './UserSearchPanel'
import NewUserPopup from './NewUserPopup'

class UserManagement extends React.PureComponent {
  filteredUserDataCount = 0;

  constructor(props) {
    super(props);
    this.state = {
      firstNameSearchText: '',
      lastNameSearchText: '',
      roleSearchText: '',
      weeklyHrsSearchText: '',
      emailSearchText: '',
      wildCardSearchText: '',
      selectedPage: 1,
      pageSize: 10,
      isActive: undefined
    };
  }

  componentDidMount() {
    // Initiating the user profile fetch action.
    this.props.getAllUserProfile();
  }

  render() {
    let { userProfiles, fetching } = this.props.state.allUserProfiles;
    let userTable = this.userTableElements(userProfiles);
    let roles = [...new Set(userProfiles.map(item => item.role))];

    return <div className='container'>
      {fetching ?
        <Loading /> :
        <React.Fragment>
          <NewUserPopup
            open={this.state.newUserPoupOPen}
            onUserPopupClose={this.onUserPopupClose} />
          <UserSearchPanel
            onSearch={this.onSearch}
            onActiveFiter={this.onActiveFiter}
            onNewUserClick={this.onNewUserClick} />
          <table className="table table-bordered table-responsive-sm">
            <thead>
              <UserTableHeader />
              <UserTableSearchHeader
                onFirstNameSearch={this.onFirstNameSearch}
                onLastNameSearch={this.onLastNameSearch}
                onRoleSearch={this.onRoleSearch}
                onEmailSearch={this.onEmailSearch}
                onWeeklyHrsSearch={this.onWeeklyHrsSearch}
                roles={roles} />
            </thead>
            <tbody>
              {userTable}
            </tbody>
          </table>
          <UserTableFooter
            datacount={this.filteredUserDataCount}
            selectedPage={this.state.selectedPage}
            onPageSelect={this.onSelectPage}
            onSelectPageSize={this.onSelectPageSize}
            pageSize={this.state.pageSize} />
        </React.Fragment>
      }
    </div>
  }

  /**
   * Creates the table body elements after applying the search filter and return it.
   */
  userTableElements = (userProfiles) => {

    if (userProfiles && userProfiles.length > 0) {
      let usersSearchData = this.filteredUserList(userProfiles);
      this.filteredUserDataCount = usersSearchData.length;
      /* Builiding the table body for users users based on the page size and selected page number and returns 
        the rows for currently selected page */
      return usersSearchData.slice((this.state.selectedPage - 1) * this.state.pageSize, (this.state.selectedPage * this.state.pageSize))
        .map((user, index) => {
          return <UserTableData
            key={'user_' + index}
            index={index}
            isActive={user.isActive}
            firstName={user.firstName}
            lastName={user.lastName}
            role={user.role}
            email={user.email}
            weeklyComittedHours={user.weeklyComittedHours}
          />
        });
    }
  }

  filteredUserList = (userProfiles) => {
    let filteredList = userProfiles.filter((user) => {
      //Applying the search filters before creating each table data element
      if ((user.firstName.toLowerCase().indexOf(this.state.firstNameSearchText.toLowerCase()) > -1
        && user.lastName.toLowerCase().indexOf(this.state.lastNameSearchText.toLowerCase()) > -1
        && user.role.toLowerCase().indexOf(this.state.roleSearchText.toLowerCase()) > -1
        && user.email.toLowerCase().indexOf(this.state.emailSearchText.toLowerCase()) > -1
        && (this.state.weeklyHrsSearchText === ''
          || user.weeklyComittedHours == this.state.weeklyHrsSearchText)
        && (this.state.isActive === undefined || user.isActive === this.state.isActive)
        && this.state.wildCardSearchText === '')
        //the wild card serach, the search text can be match with any item
        || (this.state.wildCardSearchText !== '' &&
          (user.firstName.toLowerCase().indexOf(this.state.wildCardSearchText.toLowerCase()) > -1
            || user.lastName.toLowerCase().indexOf(this.state.wildCardSearchText.toLowerCase()) > -1
            || user.role.toLowerCase().indexOf(this.state.wildCardSearchText.toLowerCase()) > -1
            || user.email.toLowerCase().indexOf(this.state.wildCardSearchText.toLowerCase()) > -1
            || user.weeklyComittedHours == this.state.wildCardSearchText))
      ) {
        return user;
      }
    })

    return filteredList;
  }

  /**
   * Call back for search filter - First name
   */
  onFirstNameSearch = (searchText) => {
    this.setState({
      firstNameSearchText: searchText
    })
  }

  /**
   * Call back for search filter - Last name
   */
  onLastNameSearch = (searchText) => {
    this.setState({
      lastNameSearchText: searchText
    })
  }

  /**
   * Call back for search filter - role
   */
  onRoleSearch = (searchText) => {
    this.setState({
      roleSearchText: searchText
    })
  }

  /**
   * Call back for search filter - email
   */
  onEmailSearch = (searchText) => {
    this.setState({
      emailSearchText: searchText
    })
  }

  /**
   * Call back for search filter - weekly committed hours
   */
  onWeeklyHrsSearch = (searchText) => {
    this.setState({
      weeklyHrsSearchText: searchText
    })
  }

  /**
   * Callback for page selection
   */
  onSelectPage = (pageNo) => {
    this.setState({
      selectedPage: pageNo
    })
  }

  /**
   * Callback for page size selection
   */
  onSelectPageSize = (pageSize) => {
    this.setState({
      pageSize: pageSize
    })
  }

  /**
   * callback for search
   */
  onSearch = (searchText) => {
    this.setState({
      searchText: searchText
    })
  }

  /**
   * call back for active/inactive search filter
   */
  onActiveFiter = (value) => {
    let active = undefined;
    if (value === "active") {
      active = true;
    } else if (value === "inactive") {
      active = false;
    }
    this.setState({
      isActive: active
    })
  }

  /**
   * New user button click
   */
  onNewUserClick = () => {
    this.setState({
      newUserPoupOPen: true
    })
  }

  /**
   * New user popup close button click
   */
  onUserPopupClose = () => {
    this.setState({
      newUserPoupOPen: false
    })
  }
}

const mapStateToProps = state => { return { state } }
export default connect(mapStateToProps, { getAllUserProfile })(UserManagement)

