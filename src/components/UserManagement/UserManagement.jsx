/* ****************************************************************
 * Component   : USER MANAGEMENT
 * Author      : Nithesh A N - TEKTalent
 * Created on  : 05/27/2020
 * List the users in the application for administrator.
 **************************************************************** */

import React from 'react';
import { connect } from 'react-redux';
import { Container } from 'reactstrap';
import { Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getAllRoles } from '../../actions/role';
import {
  DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY,
  DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY,
  PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE,
} from '../../utils/constants';
import {
  getAllUserProfile,
  updateUserStatus,
  updateUserFinalDayStatusIsSet,
  deleteUser,
  enableEditUserInfo,
  disableEditUserInfo,
} from '../../actions/userManagement';
// import Loading from '../common/Loading';
// import SkeletonLoading from '../common/SkeletonLoading';
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
import { searchWithAccent } from '../../utils/search';
import SetupHistoryPopup from './SetupHistoryPopup';
import DeleteUserPopup from './DeleteUserPopup';
import ActiveInactiveConfirmationPopup from './ActiveInactiveConfirmationPopup';
import SetUpFinalDayPopUp from './SetUpFinalDayPopUp';
import LogTimeOffPopUp from './logTimeOffPopUp';
import SetupNewUserPopup from './setupNewUserPopup';
import { cantUpdateDevAdminDetails } from '../../utils/permissions';
import { getAllTimeOffRequests } from '../../actions/timeOffRequestAction';

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
      selectedPage: props.state.userPagination.pagestats.selectedPage,
      pageSize: props.state.userPagination.pagestats.pageSize,
      allSelected: undefined,
      isActive: undefined,
      // isSet: undefined,
      activationDateOpen: false,
      deletePopupOpen: false,
      isPaused: false,
      finalDayDateOpen: false,
      setupNewUserPopupOpen: false,
      setupHistoryPopupOpen: false,
      shouldRefreshInvitationHistory: false,
      logTimeOffPopUpOpen: false,
      userForTimeOff: '',
      userTableItems: [],
      editable: props.state.userPagination.editable,
      // updating:props.state.updateUserInfo.updating
    };
    this.onPauseResumeClick = this.onPauseResumeClick.bind(this);
    this.onLogTimeOffClick = this.onLogTimeOffClick.bind(this);
    this.onDeleteButtonClick = this.onDeleteButtonClick.bind(this);
    this.onFinalDayClick = this.onFinalDayClick.bind(this);
    this.onActiveInactiveClick = this.onActiveInactiveClick.bind(this);
  }

  componentDidMount() {
    // Initiating the user profile fetch action.
    this.props.getAllUserProfile();
    this.props.getAllTimeOffRequests();
    const { darkMode } = this.props.state.theme;
    const { userProfiles } = this.props.state.allUserProfiles;
    const { roles: rolesPermissions } = this.props.state.role;
    const { requests: timeOffRequests } = this.props.state.timeOffRequests;
    this.getFilteredData(
      userProfiles,
      rolesPermissions,
      timeOffRequests,
      darkMode,
      this.state.editable,
    );
  }

  async componentDidUpdate(prevProps, prevState) {
    const searchState =
      prevState.firstNameSearchText !== this.state.firstNameSearchText ||
      prevState.lastNameSearchText !== this.state.lastNameSearchText ||
      prevState.roleSearchText !== this.state.roleSearchText ||
      prevState.weeklyHrsSearchText !== this.state.weeklyHrsSearchText ||
      prevState.emailSearchText !== this.state.emailSearchText;
    const pageSizeValue = prevState.pageSize !== this.state.pageSize;
    if (
      prevState.selectedPage !== this.state.selectedPage ||
      prevState.wildCardSearchText !== this.state.wildCardSearchText ||
      searchState ||
      pageSizeValue
    ) {
      const { darkMode } = this.props.state.theme;
      const { userProfiles } = this.props.state.allUserProfiles;
      const { roles: rolesPermissions } = this.props.state.role;
      const { requests: timeOffRequests } = this.props.state.timeOffRequests;
      this.getFilteredData(
        userProfiles,
        rolesPermissions,
        timeOffRequests,
        darkMode,
        this.state.editable,
      );
    }
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
    const userName = `${this.state?.selectedUser?.firstName}_${this.state?.selectedUser?.lastName}`;
    return (
      <>
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
          username={userName}
          open={this.state.deletePopupOpen}
          onClose={this.deletePopupClose}
          onDelete={this.onDeleteUser}
        />
        <ActiveInactiveConfirmationPopup
          isActive={this.state.selectedUser ? this.state.selectedUser.isActive : false}
          fullName={
            this.state.selectedUser
              ? `${this.state.selectedUser.firstName} ${this.state.selectedUser.lastName}`
              : ''
          }
          open={this.state.activeInactivePopupOpen}
          onClose={this.activeInactivePopupClose}
          setActiveInactive={this.setActiveInactive}
        />
        <SetUpFinalDayPopUp
          open={this.state.finalDayDateOpen}
          onClose={this.setUpFinalDayPopupClose}
          onSave={this.deactiveUser}
        />
        <SetupNewUserPopup
          open={this.state.setupNewUserPopupOpen}
          onClose={this.handleNewUserSetupPopup}
          handleShouldRefreshInvitationHistory={this.handleShouldRefreshInvitationHistory}
        />
        <SetupHistoryPopup
          open={this.state.setupHistoryPopupOpen}
          onClose={this.handleSetupHistoryPopup}
          shouldRefreshInvitationHistory={this.state.shouldRefreshInvitationHistory}
          handleShouldRefreshInvitationHistory={this.handleShouldRefreshInvitationHistory}
        />
        <LogTimeOffPopUp
          open={this.state.logTimeOffPopUpOpen}
          onClose={this.logTimeOffPopUpClose}
          user={this.state.userForTimeOff}
        />
      </>
    );
  };

  reloadTable = () => {
    this.props.getAllUserProfile();
    this.props.getAllTimeOffRequests();
    const { darkMode } = this.props.state.theme;
    const { allUserProfiles } = this.props.state.allUserProfiles;
    const { roles: rolesPermissions } = this.props.state.role;
    const { requests: timeOffRequests } = this.props.state.timeOffRequests;
    this.getFilteredData(
      allUserProfiles,
      rolesPermissions,
      timeOffRequests,
      darkMode,
      this.state.editable,
    );

  };

  /**
   * Creates the table body elements after applying the search filter and return it.
   */
  userTableElements = (userProfiles, rolesPermissions, timeOffRequests, darkMode) => {
    if (userProfiles && userProfiles.length > 0) {
      const usersSearchData = this.filteredUserList(userProfiles);
      this.filteredUserDataCount = usersSearchData.length;
      const that = this;
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
              // eslint-disable-next-line react/no-array-index-key
              key={`user_${index}`}
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
              onLogTimeOffClick={that.onLogTimeOffClick}
              onFinalDayClick={that.onFinalDayClick}
              onDeleteClick={that.onDeleteButtonClick}
              onActiveInactiveClick={that.onActiveInactiveClick}
              onResetClick={that.onResetClick}
              authEmail={this.props.state.userProfile.email}
              user={user}
              role={this.props.state.auth.user.role}
              roles={rolesPermissions}
              timeOffRequests={timeOffRequests[user._id] || []}
              darkMode={darkMode}
              // editUser={editUser}
            />
          );
        });
    }
    return null;
  };

  getFilteredData = (userProfiles, rolesPermissions, timeOffRequests, darkMode, editUser) => {
    this.setState({
      userTableItems: this.userTableElements(
        userProfiles,
        rolesPermissions,
        timeOffRequests,
        darkMode,
        editUser,
      ),
    });
  };

  filteredUserList = userProfiles => {
    return userProfiles.filter(user => {
      // Applying the search filters before creating each table data element
      // const search = result => {
      //   if (typeof result === 'string') {
      //     return result
      //       .toLowerCase()
      //       .trim()
      //       .replace(/\s+/g, '');
      //   }
      //   const numberToString = String(result)
      //     .trim()
      //     .replace(/\s+/g, '');
      //   const stringToNumber = Number(numberToString);
      //   return stringToNumber;
      // };

      return (
        // Check if the user matches the search criteria

        // Regular search criteria
        user.firstName.toLowerCase().indexOf(this.state.firstNameSearchText.toLowerCase()) > -1 &&
        user.lastName.toLowerCase().indexOf(this.state.lastNameSearchText.toLowerCase()) > -1 &&
        user.role.toLowerCase().indexOf(this.state.roleSearchText.toLowerCase()) > -1 &&
        user.email.toLowerCase().indexOf(this.state.emailSearchText.toLowerCase()) > -1 &&
        (this.state.weeklyHrsSearchText === '' ||
          user.weeklycommittedHours === Number(this.state.weeklyHrsSearchText)) &&
        // Check the isActive state only if 'all' is not selected
        ((this.state.allSelected && true) ||
          this.state.isActive === undefined ||
          user.isActive === this.state.isActive) &&
        // Check the isPaused state only if 'all' is not selected
        ((this.state.allSelected && true) ||
          this.state.isPaused === false ||
          (user.reactivationDate && new Date(user.reactivationDate) > new Date())) &&
        (searchWithAccent(user.firstName, this.state.wildCardSearchText) ||
          searchWithAccent(user.lastName, this.state.wildCardSearchText) ||
          user.role.toLowerCase().indexOf(this.state.wildCardSearchText.toLowerCase()) > -1 ||
          user.email.toLowerCase().indexOf(this.state.wildCardSearchText.toLowerCase()) > -1 ||
          user.weeklycommittedHours === Number(this.state.wildCardSearchText))
      );
    });
  };

  /**
   * reload user list and close user creation popup
   */
  userCreated = () => {
    const text = this.state.wildCardSearchText;
    this.props.getAllUserProfile();
    this.setState(() => ({
      newUserPopupOpen: false,
      wildCardSearchText: text,
    }));
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
   * Call back on log time off button click
   */
  onLogTimeOffClick = user => {
    // Check if target user is Jae's related user and authroized to manage time off requests
    if (cantUpdateDevAdminDetails(user.email, this.authEmail)) {
      if (user?.email === DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY) {
        alert(DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY);
      } else {
        alert(PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE);
      }
      return;
    }
    const canManageTimeOffRequests = this.props.hasPermission('manageTimeOffRequests')

    const hasRolePermission =
      this.props.state.auth.user.role === 'Administrator' ||
      this.props.state.auth.user.role === 'Owner';
    if (canManageTimeOffRequests || hasRolePermission) {
      this.setState({
        logTimeOffPopUpOpen: true,
        userForTimeOff: user,
      });
    } else {
      toast.warn(`You do not have permission to manage time-off requests.`);
    }
  };

  /**
   * Call back on Set Final day or Delete final button click to trigger the action to update user endate
   */

  onFinalDayClick = (user, status) => {
    if (cantUpdateDevAdminDetails(user.email, this.authEmail)) {
      if (user?.email === DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY) {
        alert(DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY);
      } else {
        alert(PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE);
      }
      return;
    }
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
   * call back function to close log time off popup
   */
  logTimeOffPopUpClose = () => {
    this.setState({
      logTimeOffPopUpOpen: false,
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
    const authRole = this?.props?.state?.auth?.user.role || user.role;
    // const canChangeUserStatus = hasPermission('changeUserStatus');
    if (cantDeactivateOwner(user, authRole)) {
      // Owner user cannot be deactivated by another user that is not an Owner.
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
    const text = this.state.wildCardSearchText;
    this.props.updateUserStatus(
      this.state.selectedUser,
      isActive ? UserStatus.Active : UserStatus.InActive,
      undefined,
    );
    this.setState({
      activeInactivePopupOpen: false,
      selectedUser: undefined,
      wildCardSearchText: text,
      // userProfiles: [...this.props.state.allUserProfiles],
      userProfiles: this.props.state.allUserProfiles
    });
    this.reloadTable(); 
  };

  /**
   * Callback to close the confirmation popup on close button click.
   */
  activeInactivePopupClose = () => {
    this.componentDidMount();
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
      firstNameSearchText: searchText.trim(),
      selectedPage: 1,
    });
  };

  /**
   * Call back for search filter - Last name
   */
  onLastNameSearch = searchText => {
    this.setState({
      lastNameSearchText: searchText.trim(),
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
      emailSearchText: searchText.trim(),
      selectedPage: 1,
    });
  };

  /**
   * Call back for search filter - weekly committed hours
   */
  onWeeklyHrsSearch = searchText => {
    this.setState({
      weeklyHrsSearchText: searchText.trim(),
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
      pageSize,
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
    let active;
    let paused = false;
    let allSelected = false;

    switch (value) {
      case 'active':
        active = true;
        paused = false;
        allSelected = false;
        break;
      case 'inactive':
        active = false;
        paused = false;
        allSelected = false;
        break;
      case 'all':
        allSelected = true;
        active = false;
        paused = false;
        break;
      case 'paused':
        active = false;
        paused = true;
        allSelected = false;
        break;
      default:
        active = undefined;
        paused = false;
        allSelected = false;
    }

    this.setState({
      isActive: active,
      selectedPage: 1,
      isPaused: paused,
      allSelected,
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
   * When a new invitation send to user. We should update the state
   * and re-fecth the invitation history.
   */
  handleShouldRefreshInvitationHistory = () => {
    this.setState(prevState => ({
      shouldRefreshInvitationHistory: !prevState.shouldRefreshInvitationHistory,
    }));
  };

  /**
   * Setup invitation history popup modal
   */
  handleSetupHistoryPopup = () => {
    this.setState(prevState => ({
      setupHistoryPopupOpen: !prevState.setupHistoryPopupOpen,
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

  render() {
    const { darkMode } = this.props.state.theme;
    const { userProfiles } = this.props.state.allUserProfiles;
    const roles = [...new Set(userProfiles.map(item => item.role))];
    // let userdataInformation = this.state.userTableItems
    return (
      <Container
        fluid
        className={darkMode ? ' bg-oxford-blue text-light' : ''}
        style={{ minHeight: '100%' }}
      >
        {/* {fetching ? (
          <SkeletonLoading template="UserManagement" />
        ) : ( */}
        <>
          {this.popupElements()}
          <UserSearchPanel
            onSearch={this.onWildCardSearch}
            searchText={this.state.wildCardSearchText}
            onActiveFiter={this.onActiveFiter}
            onNewUserClick={this.onNewUserClick}
            handleNewUserSetupPopup={this.handleNewUserSetupPopup}
            handleSetupHistoryPopup={this.handleSetupHistoryPopup}
            darkMode={darkMode}
          />
          <div className="table-responsive" id="user-management-table">
            <Table
              className={`table table-bordered noWrap ${
                darkMode ? 'text-light bg-yinmn-blue' : ''
              }`}
            >
              <thead>
                <UserTableHeader
                  authRole={this.props.state.auth.user.role}
                  roleSearchText={this.state.roleSearchText}
                  darkMode={darkMode}
                  editUser={this.props.state.userProfileEdit.editable}
                  enableEditUserInfo={this.props.enableEditUserInfo}
                  disableEditUserInfo={this.props.disableEditUserInfo}
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
                  darkMode={darkMode}
                />
              </thead>
              <tbody className={darkMode ? 'dark-mode' : ''}>{this.state.userTableItems}</tbody>
            </Table>
          </div>
          <UserTableFooter
            datacount={this.filteredUserDataCount}
            selectedPage={this.state.selectedPage}
            onPageSelect={this.onSelectPage}
            onSelectPageSize={this.onSelectPageSize}
            pageSize={this.state.pageSize}
            darkMode={darkMode}
          />
        </>
        {/* )} */}
      </Container>
    );
  }
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
  getAllTimeOffRequests,
  enableEditUserInfo,
  disableEditUserInfo,
  getAllRoles,
})(UserManagement);
// exporting without connect
export { UserManagement as UnconnectedUserManagement };
