// eslint-disable-next-line no-unused-vars
import React from 'react';
import { shallow } from 'enzyme';
import { UnconnectedUserManagement } from '../UserManagement';

// Mock the actions
jest.mock('../../../actions/userManagement', () => ({
  getAllUserProfile: jest.fn(),
  updateUserStatus: jest.fn(),
  updateUserFinalDayStatusIsSet: jest.fn(),
  deleteUser: jest.fn(),
}));

// Mock child components to avoid rendering them
jest.mock('../UserTableHeader', () => function first() {
  return <div>UserTableHeader</div>
});
jest.mock('../UserTableData', () => function second() {
  return <div>UserTableData</div>
});
jest.mock('../UserTableSearchHeader', () => function third() {
  return <div>UserTableSearchHeader</div>
});
jest.mock('../UserTableFooter', () => function fourth() {
  return <div>UserTableFooter</div>
});
jest.mock('../UserSearchPanel', () => function fifth() {
  return <div>UserSearchPanel</div>
});
jest.mock('../NewUserPopup', () => function sixth() {
  return <div>NewUserPopup</div>
});
jest.mock('../ActivationDatePopup', () => function seventh() {
  return <div>ActivationDatePopup</div>
});
jest.mock('../SetupHistoryPopup', () => function eighth() {
  return <div>SetupHistoryPopup</div>
});
jest.mock('../DeleteUserPopup', () => function ninth() {
  return <div>DeleteUserPopup</div>
});
jest.mock('../ActiveInactiveConfirmationPopup', () => function tenth() {
  return <div>ActiveInactiveConfirmationPopup</div>
});
jest.mock('../SetUpFinalDayPopUp', () => function eleventh() {
  return <div>SetUpFinalDayPopUp</div>
});
jest.mock('../logTimeOffPopUp', () => function twelfth() {
  return <div>LogTimeOffPopUp</div>
});
jest.mock('../setupNewUserPopup', () => function thirteenth() {
  return <div>SetupNewUserPopup</div>
});

describe('UserManagement Component', () => {
  let wrapper;
  let props;

  beforeEach(() => {
    props = {
      getAllUserProfile: jest.fn(),
      updateUserStatus: jest.fn(),
      updateUserFinalDayStatusIsSet: jest.fn(),
      deleteUser: jest.fn(),
      hasPermission: jest.fn(),
      getAllTimeOffRequests: jest.fn(),
      state: {
        theme: { darkMode: false },
        allUserProfiles: {
          userProfiles: [],
          fetching: false,
        },
        role: { roles: [] },
        timeOffRequests: { requests: {} },
        auth: { user: { role: 'Administrator' } },
        userProfile: { email: 'test@example.com' },
        userProfileEdit: { editable: false },
        userPagination: { 
          pagestats: {
            selectedPage: 1,
            pageSize: 10,
          },
          editable: false,
        },
      },
    };

    wrapper = shallow(<UnconnectedUserManagement 
      getAllUserProfile={props.getAllUserProfile}
      updateUserStatus={props.updateUserStatus}
      updateUserFinalDayStatusIsSet={props.updateUserFinalDayStatusIsSet}
      deleteUser={props.deleteUser}
      hasPermission={props.hasPermission}
      getAllTimeOffRequests={props.getAllTimeOffRequests}
      state={props.state}
      userProfile={props.userProfile}
      userProfileEdit={props.userProfileEdit}
      userPagination={props.userPagination}
      theme={props.theme}
      role={props.role}
      timeOffRequests={props.timeOffRequests}
      auth={props.auth}
    />);
  });

  it('should render without errors', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('should call getAllUserProfile and getAllTimeOffRequests on componentDidMount', () => {
    const instance = wrapper.instance();
    instance.componentDidMount();
    expect(props.getAllUserProfile).toHaveBeenCalled();
    expect(props.getAllTimeOffRequests).toHaveBeenCalled();
  });

  it('should update state when onFirstNameSearch is called', () => {
    const instance = wrapper.instance();
    instance.onFirstNameSearch('John');
    expect(wrapper.state('firstNameSearchText')).toEqual('John');
    expect(wrapper.state('selectedPage')).toEqual(1);
  });


  it('should call updateUserStatus when onPauseResumeClick is called with status Active', () => {
    const user = { _id: '1' };
    const instance = wrapper.instance();
    instance.onPauseResumeClick(user, 'Active');
    expect(props.updateUserStatus).toHaveBeenCalledWith(user, 'Active', expect.any(Number));
  });

  it('should set activationDateOpen to true and selectedUser when onPauseResumeClick is called with status not Active', () => {
    const user = { _id: '1' };
    const instance = wrapper.instance();
    instance.onPauseResumeClick(user, 'Inactive');
    expect(wrapper.state('activationDateOpen')).toBe(true);
    expect(wrapper.state('selectedUser')).toEqual(user);
  });


  it('should update state when onActiveFiter is called with active', () => {
    const instance = wrapper.instance();
    instance.onActiveFiter('active');
    expect(wrapper.state('isActive')).toBe(true);
    expect(wrapper.state('selectedPage')).toEqual(1);
  });

  it('should open new user popup when onNewUserClick is called', () => {
    const instance = wrapper.instance();
    instance.onNewUserClick();
    expect(wrapper.state('newUserPopupOpen')).toBe(true);
  });
  
});
