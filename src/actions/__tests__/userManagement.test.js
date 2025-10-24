import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import moment from 'moment';
import * as actions from '../userManagement';
import { ENDPOINTS } from '../../utils/URL';
import { UserStatus } from '../../utils/enums';

// Mock axios
jest.mock('axios');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('User Management Actions', () => {
  let store;
  
  beforeEach(() => {
    store = mockStore({});
    jest.clearAllMocks();
  });

  describe('getAllUserProfile', () => {

    it('should handle errors when fetching user profiles', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      const expectedActions = [
        { type: 'FETCH_USER_PROFILES_START' },
        { type: 'FETCH_USER_PROFILES_ERROR' }
      ];

      await store.dispatch(actions.getAllUserProfile());
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('updateUserStatus', () => {
    const mockUser = {
      _id: '123',
      name: 'John Doe',
      createdDate: '2024-01-01',
      isActive: true
    };


    it('should update user to active status', async () => {
      const reactivationDate = null;
      
      axios.patch.mockResolvedValueOnce({ data: {} });

      await store.dispatch(actions.updateUserStatus(mockUser, UserStatus.Active, reactivationDate));

      expect(axios.patch).toHaveBeenCalledWith(
        ENDPOINTS.USER_PROFILE(mockUser._id),
        {
          status: UserStatus.Active,
          reactivationDate: null,
          endDate: undefined
        }
      );
    });
  });

  describe('updateRehireableStatus', () => {
    it('should update rehireable status successfully', async () => {
      const mockUser = { _id: '123', name: 'John Doe' };
      const isRehireable = true;

      axios.patch.mockResolvedValueOnce({ data: {} });

      const expectedActions = [
        {
          type: 'USER_PROFILE_UPDATE',
          user: { ...mockUser, isRehireable }
        }
      ];

      await store.dispatch(actions.updateRehireableStatus(mockUser, isRehireable));
      expect(store.getActions()).toEqual(expectedActions);
      expect(axios.patch).toHaveBeenCalledWith(
        ENDPOINTS.UPDATE_REHIREABLE_STATUS(mockUser._id),
        { isRehireable }
      );
    });

    it('should handle errors when updating rehireable status', async () => {
      const mockUser = { _id: '123', name: 'John Doe' };
      const isRehireable = true;
      const error = new Error('Update failed');

      axios.patch.mockRejectedValueOnce(error);

      await expect(store.dispatch(actions.updateRehireableStatus(mockUser, isRehireable)))
        .rejects.toThrow('Update failed');
    });
  });

  describe('toggleVisibility', () => {
    it('should toggle user visibility successfully', async () => {
      const mockUser = { _id: '123', name: 'John Doe', isVisible: false };
      const newVisibility = true;

      axios.patch.mockResolvedValueOnce({ data: {} });

      const expectedActions = [
        {
          type: 'USER_PROFILE_UPDATE',
          user: { ...mockUser, isVisible: newVisibility }
        }
      ];

      await store.dispatch(actions.toggleVisibility(mockUser, newVisibility));
      expect(store.getActions()).toEqual(expectedActions);
      expect(axios.patch).toHaveBeenCalledWith(
        ENDPOINTS.TOGGLE_VISIBILITY(mockUser._id),
        { isVisible: newVisibility }
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const mockUser = { _id: '123', name: 'John Doe' };
      const option = 'archive';

      axios.delete.mockResolvedValueOnce({ data: {} });

      const expectedActions = [
        {
          type: 'USER_PROFILE_DELETE',
          user: mockUser
        }
      ];

      await store.dispatch(actions.deleteUser(mockUser, option));
      expect(store.getActions()).toEqual(expectedActions);
      expect(axios.delete).toHaveBeenCalledWith(
        ENDPOINTS.USER_PROFILE(mockUser._id),
        {
          data: { option, userId: mockUser._id }
        }
      );
    });

    
  });

  describe('updateUserFinalDayStatus', () => {
    it('should update user final day status with date', async () => {
      const mockUser = { _id: '123', name: 'John Doe' };
      const status = 'InActive';
      const finalDayDate = '2024-03-01';

      axios.patch.mockResolvedValueOnce({ data: {} });

      const expectedActions = [
        {
          type: 'USER_PROFILE_UPDATE',
          user: {
            ...mockUser,
            endDate: moment(finalDayDate).format('YYYY-MM-DD'),
            isActive: false
          }
        }
      ];

      await store.dispatch(actions.updateUserFinalDayStatus(mockUser, status, finalDayDate));
      expect(store.getActions()).toEqual(expectedActions);
      expect(axios.patch).toHaveBeenCalledWith(
        ENDPOINTS.USER_PROFILE(mockUser._id),
        {
          status,
          endDate: moment(finalDayDate).format('YYYY-MM-DD')
        }
      );
    });

    it('should clear final day date when undefined', async () => {
      const mockUser = { _id: '123', name: 'John Doe' };
      const status = 'Active';
      const finalDayDate = undefined;

      axios.patch.mockResolvedValueOnce({ data: {} });

      const expectedActions = [
        {
          type: 'USER_PROFILE_UPDATE',
          user: {
            ...mockUser,
            endDate: undefined,
            isActive: true
          }
        }
      ];

      await store.dispatch(actions.updateUserFinalDayStatus(mockUser, status, finalDayDate));
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('getUserProfileBasicInfo', () => {
    it('should fetch user profile basic info successfully', async () => {
      const mockBasicInfo = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
      ];

      axios.get.mockResolvedValueOnce({ data: mockBasicInfo });

      const expectedActions = [
        { type: 'FETCH_USER_PROFILE_BASIC_INFO' },
        { type: 'RECEIVE_USER_PROFILE_BASIC_INFO', payload: mockBasicInfo }
      ];

      await store.dispatch(actions.getUserProfileBasicInfo());
      expect(store.getActions()).toEqual(expectedActions);
      expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.USER_PROFILE_BASIC_INFO);
    });

    it('should handle errors when fetching basic info', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      const expectedActions = [
        { type: 'FETCH_USER_PROFILE_BASIC_INFO' },
        { type: 'FETCH_USER_PROFILE_BASIC_INFO_ERROR' }
      ];

      await store.dispatch(actions.getUserProfileBasicInfo());
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('UI State Actions', () => {
    it('should dispatch enable edit user info action', () => {
      const value = true;
      const expectedAction = {
        type: 'ENABLE_USER_PROFILE_EDIT',
        payload: value
      };

      store.dispatch(actions.enableEditUserInfo(value));
      expect(store.getActions()).toContainEqual(expectedAction);
    });

    it('should dispatch disable edit user info action', () => {
      const value = false;
      const expectedAction = {
        type: 'DISABLE_USER_PROFILE_EDIT',
        payload: value
      };

      store.dispatch(actions.disableEditUserInfo(value));
      expect(store.getActions()).toContainEqual(expectedAction);
    });

    it('should dispatch change pagination action', () => {
      const value = 2;
      const expectedAction = {
        type: 'CHANGE_USER_PROFILE_PAGE',
        payload: value
      };

      store.dispatch(actions.changePagination(value));
      expect(store.getActions()).toContainEqual(expectedAction);
    });

    it('should dispatch start user info update action', () => {
      const value = { name: 'John Doe' };
      const expectedAction = {
        type: 'START_USER_INFO_UPDATE',
        payload: value
      };

      store.dispatch(actions.updateUserInfomation(value));
      expect(store.getActions()).toContainEqual(expectedAction);
    });
  });
});