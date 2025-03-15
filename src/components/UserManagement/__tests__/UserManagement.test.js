
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
jest.mock('../UserTableHeader', () => () => <div>UserTableHeader</div>);
jest.mock('../UserTableData', () => () => <div>UserTableData</div>);
jest.mock('../UserTableSearchHeader', () => () => <div>UserTableSearchHeader</div>);
jest.mock('../UserTableFooter', () => () => <div>UserTableFooter</div>);
jest.mock('../UserSearchPanel', () => () => <div>UserSearchPanel</div>);
jest.mock('../NewUserPopup', () => () => <div>NewUserPopup</div>);
jest.mock('../ActivationDatePopup', () => () => <div>ActivationDatePopup</div>);
jest.mock('../SetupHistoryPopup', () => () => <div>SetupHistoryPopup</div>);
jest.mock('../DeleteUserPopup', () => () => <div>DeleteUserPopup</div>);
jest.mock('../ActiveInactiveConfirmationPopup', () => () => <div>ActiveInactiveConfirmationPopup</div>);
jest.mock('../SetUpFinalDayPopUp', () => () => <div>SetUpFinalDayPopUp</div>);
jest.mock('../logTimeOffPopUp', () => () => <div>LogTimeOffPopUp</div>);
jest.mock('../setupNewUserPopup', () => () => <div>SetupNewUserPopup</div>);

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

    wrapper = shallow(<UnconnectedUserManagement {...props} />);
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
