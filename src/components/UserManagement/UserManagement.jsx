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
  deleteUser,
  enableEditUserInfo,
  disableEditUserInfo,
} from '../../actions/userManagement';
import UserTableHeader from './UserTableHeader';
import UserTableData from './UserTableData';
import UserTableSearchHeader from './UserTableSearchHeader';
import UserTableFooter from './UserTableFooter';
import styles from './usermanagement.module.css';
import UserSearchPanel from './UserSearchPanel';
import NewUserPopup from './NewUserPopup';
import ActivationDatePopup from './ActivationDatePopup';
import { UserStatus, UserDeleteType, FinalDay } from '../../utils/enums';
import hasPermission, { cantDeactivateOwner, cantUpdateDevAdminDetails } from '../../utils/permissions';
import SetupHistoryPopup from './SetupHistoryPopup';
import DeleteUserPopup from './DeleteUserPopup';
import ActiveInactiveConfirmationPopup from './ActiveInactiveConfirmationPopup';
import SetUpFinalDayPopUp from './SetUpFinalDayPopUp';
import LogTimeOffPopUp from './logTimeOffPopUp';
import SetupNewUserPopup from './setupNewUserPopup';
import { getAllTimeOffRequests } from '../../actions/timeOffRequestAction';
import {
  scheduleDeactivationAction,
  activateUserAction,
  pauseUserAction,
  deactivateImmediatelyAction,
} from '../../actions/userLifecycleActions';

class UserManagement extends React.PureComponent {
  filteredUserDataCount = 0;

  constructor(props) {
    super(props);
    this.state = {
      firstNameSearchText: '',
      lastNameSearchText: '',
      roleSearchText: '',
      titleSearchText: '',
      weeklyHrsSearchText: '',
      emailSearchText: '',
      wildCardSearchText: '',
      selectedPage: props.state.userPagination.pagestats.selectedPage,
      pageSize: props.state.userPagination.pagestats.pageSize,
      allSelected: undefined,
      isActive: undefined,
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
      isMobile: window.innerWidth <= 750,
      mobileFontSize: 10,
      mobileWidth: '100px',
      activeInactivePopupOpen: false,
      finalDayPopupOpen: false,
      selectedUser: null,
    };
    this.onPauseResumeClick = this.onPauseResumeClick.bind(this);
    this.onLogTimeOffClick = this.onLogTimeOffClick.bind(this);
    this.onDeleteButtonClick = this.onDeleteButtonClick.bind(this);
    this.onFinalDayClick = this.onFinalDayClick.bind(this);
    this.onActiveInactiveClick = this.onActiveInactiveClick.bind(this);
  }

  componentDidMount() {
    document.body.classList.add('no-global-theme');
    this.props.getAllUserProfile();
    this.props.getAllTimeOffRequests();
    const { darkMode } = this.props.state.theme;
    const { userProfiles } = this.props.state.allUserProfiles;
    const { roles: rolesPermissions } = this.props.state.role;
    const { requests: timeOffRequests } = this.props.state.timeOffRequests;
    window.addEventListener('resize', this.handleResize);
    this.getFilteredData(
      userProfiles,
      rolesPermissions,
      timeOffRequests,
      darkMode,
      this.state.editable,
      this.state.isMobile,
      this.state.mobileFontSize,
    );
  }

  componentWillUnmount() {
    document.body.classList.remove('no-global-theme');
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    // eslint-disable-next-line no-console
    console.log(window.innerWidth);
    this.setState({ isMobile: window.innerWidth <= 750 });
  };

  // eslint-disable-next-line react/sort-comp
  async componentDidUpdate(prevProps, prevState) {
    if (prevProps.state.theme.darkMode !== this.props.state.theme.darkMode) {
      const { darkMode } = this.props.state.theme;
      // eslint-disable-next-line no-unused-vars
      const { userProfiles, fetching } = this.props.state.allUserProfiles;
      const { roles: rolesPermissions } = this.props.state.role;
      const { requests: timeOffRequests } = this.props.state.timeOffRequests;

      this.getFilteredData(
        userProfiles,
        rolesPermissions,
        timeOffRequests,
        darkMode,
        this.state.editable,
        this.state.isMobile,
        this.state.mobileFontSize,
      );
    }

    const searchStateChanged =
      prevState.firstNameSearchText !== this.state.firstNameSearchText ||
      prevState.lastNameSearchText !== this.state.lastNameSearchText ||
      prevState.roleSearchText !== this.state.roleSearchText ||
      prevState.titleSearchText !== this.state.titleSearchText ||
      prevState.weeklyHrsSearchText !== this.state.weeklyHrsSearchText ||
      prevState.emailSearchText !== this.state.emailSearchText;

    const pageSizeChanged = prevState.pageSize !== this.state.pageSize;
    const userProfilesChanged =
      prevProps.state.allUserProfiles.userProfiles !== this.props.state.allUserProfiles.userProfiles;

    if (
      prevState.selectedPage !== this.state.selectedPage ||
      prevState.wildCardSearchText !== this.state.wildCardSearchText ||
      searchStateChanged ||
      pageSizeChanged ||
      userProfilesChanged
    ) {
      const { darkMode } = this.props.state.theme;
      // eslint-disable-next-line no-unused-vars
      const { userProfiles, fetching } = this.props.state.allUserProfiles;
      const { roles: rolesPermissions } = this.props.state.role;
      const { requests: timeOffRequests } = this.props.state.timeOffRequests;

      this.getFilteredData(
        userProfiles,
        rolesPermissions,
        timeOffRequests,
        darkMode,
        this.state.editable,
        this.state.isMobile,
        this.state.mobileFontSize,
      );
    }
  }

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
          endDate={this.state.selectedUser ? this.state.selectedUser.endDate : null}
          inactiveReason={this.state.selectedUser ? this.state.selectedUser.inactiveReason : null}
          fullName={
            this.state.selectedUser
              ? `${this.state.selectedUser.firstName} ${this.state.selectedUser.lastName}`
              : ''
          }
          open={this.state.activeInactivePopupOpen}
          onClose={this.activeInactivePopupClose}
          onDeactivateImmediate={() =>
            deactivateImmediatelyAction(this.props.dispatch, this.state.selectedUser, this.props.getAllUserProfile)
          }
          onScheduleFinalDay={() => {
            this.setState({
              finalDayPopupOpen: true,
              activeInactivePopupOpen: false,
            });
          }}
          onCancelScheduledDeactivation={() =>
            activateUserAction(this.props.dispatch, this.state.selectedUser, this.props.getAllUserProfile)
          }
          onReactivateUser={() =>
            activateUserAction(this.props.dispatch, this.state.selectedUser, this.props.getAllUserProfile)
          }
        />
        <SetUpFinalDayPopUp
          open={this.state.finalDayPopupOpen}
          darkMode={this.props.state.theme.darkMode}
          onClose={() => this.setState({ finalDayPopupOpen: false })}
          onSave={(finalDayISO) => {
            scheduleDeactivationAction(
              this.props.dispatch,
              this.state.selectedUser,
              finalDayISO,
              this.props.getAllUserProfile,
            );
            this.setState({ finalDayPopupOpen: false });
          }}
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

  userTableElements = (userProfiles, rolesPermissions, timeOffRequests, darkMode, isMobile, mobileFontSize) => {
    if (userProfiles && userProfiles.length > 0) {
      const usersSearchData = this.filteredUserList(userProfiles);
      this.filteredUserDataCount = usersSearchData.length;
      const that = this;

      return usersSearchData
        .sort((a, b) => {
          if (a.startDate >= b.startDate) return -1;
          if (a.startDate < b.startDate) return 1;
          return 0;
        })
        .slice(
          (this.state.selectedPage - 1) * this.state.pageSize,
          this.state.selectedPage * this.state.pageSize,
        )
        .map((user, index) => (
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
            jobTitle={this.props.state.userProfile.jobTitle}
            role={this.props.state.auth.user.role}
            roles={rolesPermissions}
            timeOffRequests={timeOffRequests[user._id] || []}
            darkMode={darkMode}
            isMobile={isMobile}
            mobileFontSize={mobileFontSize}
            onUserUpdate={this.onUserUpdate}
          />
        ));
    }
    return null;
  };

  getFilteredData = (userProfiles, rolesPermissions, timeOffRequests, darkMode, editUser, isMobile, mobileFontSize) => {
    this.setState({
      userTableItems: this.userTableElements(
        userProfiles,
        rolesPermissions,
        timeOffRequests,
        darkMode,
        editUser,
        isMobile,
        mobileFontSize,
      ),
    });
  };

  filteredUserList = (userProfiles) => {
    const wildCardSearch = this.state.wildCardSearchText.trim().toLowerCase();

    return userProfiles.filter((user) => {
      const firstNameSearch = this.state.firstNameSearchText || '';
      const lastNameSearch = this.state.lastNameSearchText || '';

      const firstName = user.firstName.toLowerCase();
      const lastName = user.lastName.toLowerCase();
      const email = user.email ? user.email.toLowerCase() : '';

      const trimmedFirstNameSearch = firstNameSearch.trim();
      const trimmedLastNameSearch = lastNameSearch.trim();

      const isFirstNameExactMatch = firstNameSearch.endsWith(' ') && trimmedFirstNameSearch.length > 0;
      const isLastNameExactMatch = lastNameSearch.endsWith(' ') && trimmedLastNameSearch.length > 0;

      let firstNameMatches = true;
      if (trimmedFirstNameSearch) {
        if (isFirstNameExactMatch) {
          firstNameMatches = firstName === trimmedFirstNameSearch.toLowerCase();
        } else {
          firstNameMatches = firstName.includes(trimmedFirstNameSearch.toLowerCase());
        }
      }

      let lastNameMatches = true;
      if (trimmedLastNameSearch) {
        if (isLastNameExactMatch) {
          lastNameMatches = lastName === trimmedLastNameSearch.toLowerCase();
        } else {
          lastNameMatches = lastName.includes(trimmedLastNameSearch.toLowerCase());
        }
      }

      let wildcardMatches = true;
      if (wildCardSearch) {
        const fullName = `${firstName} ${lastName}`;
        const trimmedSearch = wildCardSearch.trim();

        if (wildCardSearch.includes(' ')) {
          wildcardMatches = fullName.startsWith(trimmedSearch) || fullName === trimmedSearch || email === trimmedSearch;
        } else {
          wildcardMatches =
            firstName.startsWith(wildCardSearch) ||
            lastName.startsWith(wildCardSearch) ||
            firstName.includes(wildCardSearch) ||
            lastName.includes(wildCardSearch) ||
            email.includes(wildCardSearch);
        }
      }

      const nameMatches = firstNameMatches && lastNameMatches && wildcardMatches;

      return (
        nameMatches &&
        user.role.toLowerCase().includes(this.state.roleSearchText.toLowerCase()) &&
        user.email.toLowerCase().includes(this.state.emailSearchText.toLowerCase()) &&
        (this.state.weeklyHrsSearchText === '' ||
          user.weeklycommittedHours === Number(this.state.weeklyHrsSearchText)) &&
        ((this.state.allSelected && true) ||
          (this.state.isActive === undefined || user.isActive === this.state.isActive)) &&
        ((this.state.allSelected && true) ||
          (this.state.isPaused === false ||
            (user.reactivationDate && new Date(user.reactivationDate) > new Date())))
      );
    });
  };

  userCreated = () => {
    const text = this.state.wildCardSearchText;
    this.props.getAllUserProfile();
    this.setState(() => ({
      newUserPopupOpen: false,
      wildCardSearchText: text,
    }));
  };

  onPauseResumeClick = async (user, status) => {
    this.setState({ selectedUser: user });

    if (status === UserStatus.Inactive) {
      this.setState({ activationDateOpen: true });
    } else {
      await activateUserAction(this.props.dispatch, user, this.props.getAllUserProfile);
    }
  };

  onUserUpdate = (updatedUser) => {
    const { userProfiles } = this.props.state.allUserProfiles;

    const updatedProfiles = userProfiles.map((user) => (user._id === updatedUser._id ? updatedUser : user));

    this.props.state.allUserProfiles.userProfiles = updatedProfiles;

    this.getFilteredData(
      updatedProfiles,
      this.props.state.role.roles,
      this.props.state.timeOffRequests.requests,
      this.props.state.theme.darkMode,
      this.state.editable,
      this.state.isMobile,
      this.state.mobileFontSize,
    );
  };

  onLogTimeOffClick = (user) => {
    if (cantUpdateDevAdminDetails(user.email, this.authEmail)) {
      if (user?.email === DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY) {
        // eslint-disable-next-line no-alert
        alert(DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY);
      } else {
        // eslint-disable-next-line no-alert
        alert(PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE);
      }
      return;
    }
    const canManageTimeOffRequests = this.props.hasPermission('manageTimeOffRequests');

    const hasRolePermission =
      this.props.state.auth.user.role === 'Administrator' || this.props.state.auth.user.role === 'Owner';
    if (canManageTimeOffRequests || hasRolePermission) {
      this.setState({
        logTimeOffPopUpOpen: true,
        userForTimeOff: user,
      });
    } else {
      toast.warn(`You do not have permission to manage time-off requests.`);
    }
  };

  onFinalDayClick = async (user, status) => {
    if (cantUpdateDevAdminDetails(user.email, this.authEmail)) {
      if (user?.email === DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY) {
        // eslint-disable-next-line no-alert
        alert(DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY);
      } else {
        // eslint-disable-next-line no-alert
        alert(PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE);
      }
      return;
    }
    if (status === FinalDay.RemoveFinalDay) {
      await activateUserAction(this.props.dispatch, user, this.props.getAllUserProfile);
    } else {
      this.setState({
        finalDayDateOpen: true,
        selectedUser: user,
      });
    }
  };

  activationDatePopupClose = () => {
    this.setState({
      activationDateOpen: false,
    });
  };

  setUpFinalDayPopupClose = () => {
    this.setState({
      finalDayDateOpen: false,
    });
  };

  logTimeOffPopUpClose = () => {
    this.setState({
      logTimeOffPopUpOpen: false,
    });
  };

  pauseUser = async (reactivationDate) => {
    // eslint-disable-next-line no-console
    console.log('Pausing user with reactivation date:', reactivationDate);
    await pauseUserAction(
      this.props.dispatch,
      this.state.selectedUser,
      reactivationDate,
      this.props.getAllUserProfile,
    );

    this.setState({
      activationDateOpen: false,
      selectedUser: undefined,
    });
  };

  onActiveInactiveClick = (user) => {
    const authRole = this?.props?.state?.auth?.user.role || user.role;
    if (cantDeactivateOwner(user, authRole)) {
      // eslint-disable-next-line no-alert
      alert('You are not authorized to deactivate an owner.');
      return;
    }
    this.setState({
      activeInactivePopupOpen: true,
      selectedUser: user,
    });
  };

  activeInactivePopupClose = () => {
    this.setState({
      activeInactivePopupOpen: false,
    });
  };

  onDeleteButtonClick = (user) => {
    this.setState({
      deletePopupOpen: true,
      selectedUser: user,
    });
  };

  onDeleteUser = (deleteType) => {
    this.setState({
      deletePopupOpen: false,
      selectedUser: undefined,
    });

    if (deleteType === UserDeleteType.Inactive) {
      this.props.updateUserStatus(this.state.selectedUser, UserStatus.Inactive, undefined);
    } else {
      this.props.deleteUser(this.state.selectedUser, deleteType);
    }
  };

  deletePopupClose = () => {
    this.setState({
      deletePopupOpen: false,
    });
  };

  onFirstNameSearch = (searchText) => {
    this.setState({
      firstNameSearchText: searchText,
      selectedPage: 1,
    });
  };

  onLastNameSearch = (searchText) => {
    this.setState({
      lastNameSearchText: searchText,
      selectedPage: 1,
    });
  };

  onRoleSearch = (searchText) => {
    this.setState({
      roleSearchText: searchText,
      selectedPage: 1,
    });
  };

  onTitleSearch = (searchText) => {
    this.setState({
      titleSearchText: searchText.trim(),
      selectedPage: 1,
    });
  };

  onEmailSearch = (searchText) => {
    this.setState({
      emailSearchText: searchText.trim(),
      selectedPage: 1,
    });
  };

  onWeeklyHrsSearch = (searchText) => {
    this.setState({
      weeklyHrsSearchText: searchText.trim(),
      selectedPage: 1,
    });
  };

  onSelectPage = (pageNo) => {
    this.setState({
      selectedPage: pageNo,
    });
  };

  onSelectPageSize = (pageSize) => {
    this.setState({
      pageSize,
      selectedPage: 1,
    });
  };

  onWildCardSearch = (searchText) => {
    this.setState(
      {
        wildCardSearchText: searchText,
        selectedPage: 1,
      },
      () => {
        const { userProfiles } = this.props.state.allUserProfiles;
        const { roles: rolesPermissions } = this.props.state.role;
        const { requests: timeOffRequests } = this.props.state.timeOffRequests;
        const { darkMode } = this.props.state.theme;

        this.getFilteredData(userProfiles, rolesPermissions, timeOffRequests, darkMode);
      },
    );
  };

  onActiveFilter = (value) => {
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

  onNewUserClick = () => {
    this.setState({
      newUserPopupOpen: true,
    });
  };

  handleNewUserSetupPopup = () => {
    this.setState((prevState) => ({
      setupNewUserPopupOpen: !prevState.setupNewUserPopupOpen,
    }));
  };

  handleShouldRefreshInvitationHistory = () => {
    this.setState((prevState) => ({
      shouldRefreshInvitationHistory: !prevState.shouldRefreshInvitationHistory,
    }));
  };

  handleSetupHistoryPopup = () => {
    this.setState((prevState) => ({
      setupHistoryPopupOpen: !prevState.setupHistoryPopupOpen,
    }));
  };

  onUserPopupClose = () => {
    this.setState({
      newUserPopupOpen: false,
    });
  };

  render() {
    const { darkMode } = this.props.state.theme;
    const { userProfiles } = this.props.state.allUserProfiles;
    const roles = [...new Set(userProfiles.map((item) => item.role))];

    return (
      <Container
        fluid
        className={darkMode ? ' bg-oxford-blue text-light p-3' : 'p-3'}
        style={{ minHeight: '100%' }}
      >
        <>
          {this.popupElements()}
          <UserSearchPanel
            onSearch={this.onWildCardSearch}
            searchText={this.state.wildCardSearchText}
            onActiveFilter={this.onActiveFilter}
            onNewUserClick={this.onNewUserClick}
            handleNewUserSetupPopup={this.handleNewUserSetupPopup}
            handleSetupHistoryPopup={this.handleSetupHistoryPopup}
            darkMode={darkMode}
          />

          <div className="table-responsive" id="user-management-table">
            <Table
              className={`table table-bordered ${styles.noWrap} ${
                darkMode ? 'text-light bg-yinmn-blue' : ''
              }`}
            >
              <thead>
                <UserTableHeader
                  authUser={this.props.state.auth.user}
                  roleSearchText={this.state.roleSearchText}
                  darkMode={darkMode}
                  editUser={this.props.state.userProfileEdit.editable}
                  enableEditUserInfo={this.props.enableEditUserInfo}
                  disableEditUserInfo={this.props.disableEditUserInfo}
                  isMobile={this.state.isMobile}
                  mobileFontSize={this.state.mobileFontSize}
                  mobileWidth={this.state.mobileWidth}
                  roles={this.props.state.role.roles}
                />
                <UserTableSearchHeader
                  onFirstNameSearch={this.onFirstNameSearch}
                  onLastNameSearch={this.onLastNameSearch}
                  onRoleSearch={this.onRoleSearch}
                  onTitleSearch={this.onTitleSearch}
                  onEmailSearch={this.onEmailSearch}
                  onWeeklyHrsSearch={this.onWeeklyHrsSearch}
                  roles={roles}
                  authRole={this.props.state.auth.user.role}
                  roleSearchText={this.state.roleSearchText}
                  darkMode={darkMode}
                  isMobile={this.state.isMobile}
                  mobileFontSize={this.state.mobileFontSize}
                  mobileWidth={this.state.mobileWidth}
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
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return { state };
};

const mapDispatchToProps = (dispatch) => ({
  dispatch,
  getAllUserProfile: () => dispatch(getAllUserProfile()),
  deleteUser: (...args) => dispatch(deleteUser(...args)),
  getAllTimeOffRequests: () => dispatch(getAllTimeOffRequests()),
  enableEditUserInfo: () => dispatch(enableEditUserInfo()),
  disableEditUserInfo: () => dispatch(disableEditUserInfo()),
  getAllRoles: () => dispatch(getAllRoles()),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserManagement);
