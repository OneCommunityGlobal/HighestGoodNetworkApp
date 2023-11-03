/*****************************************************************
 * Component   : USER MANAGEMENT
 * Author      : Nithesh A N - TEKTalent
 * Created on  : 05/27/2020
 * List the users in the application for administrator.
 *****************************************************************/
import React from 'react';
import {
  getAllUserProfile,
  updateUserStatus,
  updateUserFinalDayStatusIsSet,
  deleteUser,
} from '../../actions/userManagement';
import { connect } from 'react-redux';
import Loading from '../common/Loading';
import SkeletonLoading from '../common/SkeletonLoading';
import UserTableHeader from './UserTableHeader';
import UserTableData from './UserTableData';
import UserTableSearchHeader from './UserTableSearchHeader';
import UserTableFooter from './UserTableFooter';
import './usermanagement.css';
import UserSearchPanel from './UserSearchPanel';
import NewUserPopup from './NewUserPopup';
import ActivationDatePopup from './ActivationDatePopup';
import { UserStatus, UserDeleteType, FinalDay } from '../../utils/enums';
import hasPermission, { cantDeactivateOwner } from '../../utils/permissions';
import DeleteUserPopup from './DeleteUserPopup';
import ActiveInactiveConfirmationPopup from './ActiveInactiveConfirmationPopup';
import { Container } from 'reactstrap';
import SetUpFinalDayPopUp from './SetUpFinalDayPopUp';
import { Table } from 'react-bootstrap';
import SetupNewUserPopup from './setupNewUserPopup';

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
      isActive: undefined,
      isSet: undefined,
      activationDateOpen: false,
      deletePopupOpen: false,
      isPaused: false,
      finalDayDateOpen: false,
      setupNewUserPopupOpen: false,
    };
  }

  componentDidMount() {
    // Initiating the user profile fetch action.
    this.props.getAllUserProfile();
  }

  render() {
    let { userProfiles, fetching } = this.props.state.allUserProfiles;
    const { roles: rolesPermissions } = this.props.state.role;
    let userTable = this.userTableElements(userProfiles, rolesPermissions);

    let roles = [...new Set(userProfiles.map(item => item.role))];
    return (
      <Container fluid>
        {fetching ? (
          <SkeletonLoading template="UserManagement" />
        ) : (
          <React.Fragment>
            {this.popupElements()}
            <UserSearchPanel
              onSearch={this.onWildCardSearch}
              searchText={this.state.wildCardSearchText}
              onActiveFiter={this.onActiveFiter}
              onNewUserClick={this.onNewUserClick}
              handleNewUserSetupPopup={this.handleNewUserSetupPopup}
            />
            <div className="table-responsive" id="user-management-table">
              <Table className="table table-bordered noWrap">
                <thead>
                  <UserTableHeader
                    authRole={this.props.state.auth.user.role}
                    roleSearchText={this.state.roleSearchText}
                  />
                  <UserTableSearchHeader
                    onFirstNameSearch={this.onFirstNameSearch}
                    onLastNameSearch={this.onLastNameSearch}
                    onRoleSearch={this.onRoleSearch}
                    onEmailSearch={this.onEmailSearch}
                    onWeeklyHrsSearch={this.onWeeklyHrsSearch}
                    roles={roles}
                    authRole={this.props.state.auth.user.role}
                    roleSearchText={this.state.roleSearchText}
                  />
                </thead>
                <tbody>{userTable}</tbody>
              </Table>
            </div>
            <UserTableFooter
              datacount={this.filteredUserDataCount}
              selectedPage={this.state.selectedPage}
              onPageSelect={this.onSelectPage}
              onSelectPageSize={this.onSelectPageSize}
              pageSize={this.state.pageSize}
            />
          </React.Fragment>
        )}
      </Container>
    );
  }

  /**
   * Returns the differenet popup components to render
   * 1. Popup to show the reactivation date selection
   * 2. Popup to show the profile creation (new user)
   * 3. Popup to choose the delete option upon clicking delete button.
   * 4. Popup to confirm the action of setting a user active or inactive upon the status column click.
   * 5. Popup to show the last day selection
   */
  popupElements = () => {
    let user_name = this.state?.selectedUser?.firstName + '_' + this.state?.selectedUser?.lastName
    return (
      <React.Fragment>
        <ActivationDatePopup
          open={this.state.activationDateOpen}
          onClose={this.activationDatePopupClose}
          onPause={this.pauseUser}
        />
        <NewUserPopup
          open={this.state.newUserPopupOpen}
          userProfiles={this.props.state.allUserProfiles}
          onUserPopupClose={this.onUserPopupClose}
          userCreated={this.userCreated}
        />
        <DeleteUserPopup
          username={user_name}
          open={this.state.deletePopupOpen}
          onClose={this.deletePopupClose}
          onDelete={this.onDeleteUser}
        />
        <ActiveInactiveConfirmationPopup
          isActive={this.state.selectedUser ? this.state.selectedUser.isActive : false}
          fullName={
            this.state.selectedUser
              ? this.state.selectedUser.firstName + ' ' + this.state.selectedUser.lastName
              : ''
          }
          open={this.state.activeInactivePopupOpen}
          setActiveInactive={this.setActiveInactive}
          onClose={this.activeInactivePopupClose}
        />
        <SetUpFinalDayPopUp
          open={this.state.finalDayDateOpen}
          onClose={this.setUpFinalDayPopupClose}
          onSave={this.deactiveUser}
        />
        <SetupNewUserPopup
          open={this.state.setupNewUserPopupOpen}
          onClose={this.handleNewUserSetupPopup}
        />
      </React.Fragment>
    );
  };

  /**
   * Creates the table body elements after applying the search filter and return it.
   */
  userTableElements = (userProfiles, rolesPermissions) => {
    if (userProfiles && userProfiles.length > 0) {
      let usersSearchData = this.filteredUserList(userProfiles);
      this.filteredUserDataCount = usersSearchData.length;
      let that = this;
      /* Builiding the table body for users based on the page size and selected page number and returns
       * the rows for currently selected page .
       * Applying the Default sort in the order of created date as well
       */
      return usersSearchData
        .sort((a, b) => {
          if (a.createdDate >= b.createdDate) return -1;
          if (a.createdDate < b.createdDate) return 1;
          return 0;
        })
        .slice(
          (this.state.selectedPage - 1) * this.state.pageSize,
          this.state.selectedPage * this.state.pageSize,
        )
        .map((user, index) => {
          return (
            <UserTableData
              key={'user_' + index}
              index={index}
              isActive={user.isActive}
              isSet={user.isSet}
              resetLoading={
                this.state.selectedUser &&
                this.state.selectedUser._id === user._id &&
                this.state.activationDateOpen &&
                this.state.finalDayDateOpen
              }
              onPauseResumeClick={that.onPauseResumeClick}
              onFinalDayClick={that.onFinalDayClick}
              onDeleteClick={that.onDeleteButtonClick}
              onActiveInactiveClick={that.onActiveInactiveClick}
              onResetClick={that.onResetClick}
              authEmail={this.props.state.userProfile.email}
              user={user}
              role={this.props.state.auth.user.role}
              roles={rolesPermissions}
            />
          );
        });
    }
  };

  filteredUserList = userProfiles => {
    let filteredList = userProfiles.filter(user => {
      //Applying the search filters before creating each table data element
      if (
        (user.firstName.toLowerCase().indexOf(this.state.firstNameSearchText.toLowerCase()) > -1 &&
          user.lastName.toLowerCase().indexOf(this.state.lastNameSearchText.toLowerCase()) > -1 &&
          user.role.toLowerCase().indexOf(this.state.roleSearchText.toLowerCase()) > -1 &&
          user.email.toLowerCase().indexOf(this.state.emailSearchText.toLowerCase()) > -1 &&
          (this.state.weeklyHrsSearchText === '' ||
            user.weeklycommittedHours === Number(this.state.weeklyHrsSearchText)) &&
          (this.state.isActive === undefined || user.isActive === this.state.isActive) &&
          (this.state.isPaused === false || user.reactivationDate) &&
          this.state.wildCardSearchText === '') ||
        //the wild card serach, the search text can be match with any item
        (this.state.wildCardSearchText !== '' &&
          (user.firstName.toLowerCase().indexOf(this.state.wildCardSearchText.toLowerCase()) > -1 ||
            user.lastName.toLowerCase().indexOf(this.state.wildCardSearchText.toLowerCase()) > -1 ||
            user.role.toLowerCase().indexOf(this.state.wildCardSearchText.toLowerCase()) > -1 ||
            user.email.toLowerCase().indexOf(this.state.wildCardSearchText.toLowerCase()) > -1 ||
            user.weeklycommittedHours === Number(this.state.wildCardSearchText)))
      ) {
        return user;
      }
      return false;
    });

    return filteredList;
  };

  /**
   * reload user list and close user creation popup
   */
  userCreated = () => {
    const text = this.state.wildCardSearchText;
    this.props.getAllUserProfile();
    this.setState({
      newUserPopupOpen: false,
      wildCardSearchText: text,
    });
  };

  /**
   * Call back on Pause or Resume button click to trigger the action to update user status
   */
  onPauseResumeClick = (user, status) => {
    if (status === UserStatus.Active) {
      this.props.updateUserStatus(user, status, Date.now());
    } else {
      this.setState({
        activationDateOpen: true,
        selectedUser: user,
      });
    }
  };

  /**
   * Call back on Set Final day or Delete final button click to trigger the action to update user endate
   */

  onFinalDayClick = (user, status) => {
    if (status === FinalDay.NotSetFinalDay) {
      this.props.updateUserFinalDayStatusIsSet(user, 'Active', undefined, FinalDay.NotSetFinalDay);
    } else {
      this.setState({
        finalDayDateOpen: true,
        selectedUser: user,
      });
    }
  };

  /**
   * call back function to close the activation date popup
   */
  activationDatePopupClose = () => {
    this.setState({
      activationDateOpen: false,
    });
  };

  /**
   * call back function to close the final date popup
   */
  setUpFinalDayPopupClose = () => {
    this.setState({
      finalDayDateOpen: false,
    });
  };

  /**
   * Call back on Pause confirmation button click to trigger the action to update user status
   */
  pauseUser = reActivationDate => {
    this.props.updateUserStatus(this.state.selectedUser, UserStatus.InActive, reActivationDate);
    this.setState({
      activationDateOpen: false,
      selectedUser: undefined,
    });
  };

  /**
   * Call back on Save confirmation button click to trigger the action to update user status
   */
  deactiveUser = finalDayDate => {
    this.props.updateUserFinalDayStatusIsSet(
      this.state.selectedUser,
      'Active',
      finalDayDate,
      FinalDay.FinalDay,
    );
    this.setState({
      finalDayDateOpen: false,
      selectedUser: undefined,
    });
  };

  /**
   * Callback to trigger on the status (active/inactive) column click to show the confirmaton change the status
   */
  onActiveInactiveClick = user => {
    const authRole = this?.props?.state?.auth?.user.role||user.role
    const canChangeUserStatus = hasPermission('changeUserStatus');
    if (!canChangeUserStatus) {
      //permission to change the status of any user on the user profile page or User Management Page.
      //By default only Admin and Owner can access the user management page and they have this permission.
      alert('You are not authorized to change the active status.');
      return;
    }
    if (cantDeactivateOwner(user, authRole)) {
      //Owner user cannot be deactivated by another user that is not an Owner.
      alert('You are not authorized to deactivate an owner.');
      return;
    }
    this.setState({
      activeInactivePopupOpen: true,
      selectedUser: user,
    });
  };

  /**
   * Callback to trigger the status change on confirmation ok click.
   */
  setActiveInactive = isActive => {
    this.props.updateUserStatus(
      this.state.selectedUser,
      isActive ? UserStatus.Active : UserStatus.InActive,
      undefined,
    );
    this.setState({
      activeInactivePopupOpen: false,
      selectedUser: undefined,
    });
  };

  /**
   * Callback to close the confirmation popup on close button click.
   */
  activeInactivePopupClose = () => {
    this.setState({
      activeInactivePopupOpen: false,
    });
  };

  /**
   * Call back on delete button clic and triggering the delete action.
   */
  onDeleteButtonClick = user => {
    this.setState({
      deletePopupOpen: true,
      selectedUser: user,
    });
  };

  /**
   * Call back to trigger the delete based on the type chosen from the popup.
   */
  onDeleteUser = deleteType => {
    if (deleteType === UserDeleteType.Inactive) {
      this.props.updateUserStatus(this.state.selectedUser, UserStatus.InActive, undefined);
    } else {
      this.props.deleteUser(this.state.selectedUser, deleteType);
    }
    this.setState({
      deletePopupOpen: false,
      selectedUser: undefined,
    });
  };

  /**
   * To hide the delete user popup upon close button click
   */
  deletePopupClose = () => {
    this.setState({
      deletePopupOpen: false,
    });
  };

  /**
   * Call back for search filter - First name
   */
  onFirstNameSearch = searchText => {
    this.setState({
      firstNameSearchText: searchText,
      selectedPage: 1,
    });
  };

  /**
   * Call back for search filter - Last name
   */
  onLastNameSearch = searchText => {
    this.setState({
      lastNameSearchText: searchText,
      selectedPage: 1,
    });
  };

  /**
   * Call back for search filter - role
   */
  onRoleSearch = searchText => {
    this.setState({
      roleSearchText: searchText,
      selectedPage: 1,
    });
  };

  /**
   * Call back for search filter - email
   */
  onEmailSearch = searchText => {
    this.setState({
      emailSearchText: searchText,
      selectedPage: 1,
    });
  };

  /**
   * Call back for search filter - weekly committed hours
   */
  onWeeklyHrsSearch = searchText => {
    this.setState({
      weeklyHrsSearchText: searchText,
      selectedPage: 1,
    });
  };

  /**
   * Callback for page selection
   */
  onSelectPage = pageNo => {
    this.setState({
      selectedPage: pageNo,
    });
  };

  /**
   * Callback for page size selection
   */
  onSelectPageSize = pageSize => {
    this.setState({
      pageSize: pageSize,
      selectedPage: 1,
    });
  };

  /**
   * callback for search
   */
  onWildCardSearch = searchText => {
    this.setState({
      wildCardSearchText: searchText,
      selectedPage: 1,
    });
  };

  /**
   * call back for active/inactive search filter
   */
  onActiveFiter = value => {
    let active = undefined;
    let paused = false;

    switch (value) {
      case 'active':
        active = true;
        break;
      case 'inactive':
        active = false;
        break;
      case 'paused':
        active = false;
        paused = true;
    }

    this.setState({
      isActive: active,
      selectedPage: 1,
      isPaused: paused,
    });
  };

  /**
   * New user button click
   */
  onNewUserClick = () => {
    this.setState({
      newUserPopupOpen: true,
    });
  };
  /**
   *  set up new user button click handler
   */

  handleNewUserSetupPopup = () => {
    this.setState(prevState => ({
      setupNewUserPopupOpen: !prevState.setupNewUserPopupOpen,
    }));
  };

  /**
   * New user popup close button click
   */
  onUserPopupClose = () => {
    this.setState({
      newUserPopupOpen: false,
    });
  };
}

const mapStateToProps = state => {
  return { state };
};
export default connect(mapStateToProps, {
  getAllUserProfile,
  updateUserStatus,
  updateUserFinalDayStatusIsSet,
  deleteUser,
  hasPermission,
})(UserManagement);
