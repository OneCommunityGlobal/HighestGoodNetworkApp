import axios from 'axios';
import { toast } from 'react-toastify';
import * as actions from '../userProfile';
import { ENDPOINTS } from '../../utils/URL';
import {
  GET_USER_PROFILE,
  GET_USER_TASKS,
  EDIT_FIRST_NAME,
  EDIT_USER_PROFILE,
  CLEAR_USER_PROFILE,
  GET_PROJECT_BY_USER_NAME,
  USER_NOT_FOUND_ERROR,
  GET_USER_AUTOCOMPLETE,
} from '../../constants/userProfile';

jest.mock('axios');
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock('../../utils/URL', () => ({
  ENDPOINTS: {
    USER_PROFILE: jest.fn(id => `/api/users/${id}`),
    TASKS_BY_USERID: jest.fn(id => `/api/tasks/${id}`),
    USER_PROFILE_PROPERTY: jest.fn(id => `/api/users/${id}/property`),
    GET_PROJECT_BY_PERSON: jest.fn(name => `/api/projects/person/${name}`),
    USER_AUTOCOMPLETE: jest.fn(text => `/api/users/autocomplete/${text}`),
  },
}));

describe('User Profile Actions', () => {
  let dispatch;

  beforeEach(() => {
    dispatch = jest.fn(action => action);
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('getUserProfile', () => {
    it('should fetch and dispatch user profile data successfully', async () => {
      const userId = '123';
      const mockData = { id: userId, name: 'John Doe' };
      axios.get.mockResolvedValueOnce({ data: mockData });

      const action = actions.getUserProfile(userId);
      const result = await action(dispatch);

      expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.USER_PROFILE(userId));
      expect(result).toEqual(mockData);
    });

    it('should handle 401 error correctly', async () => {
      const userId = '123';
      axios.get.mockRejectedValueOnce({ status: 401 });

      const action = actions.getUserProfile(userId);
      await action(dispatch);

      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe('getUserTasks', () => {
    it('should fetch and dispatch user tasks successfully', async () => {
      const userId = '123';
      const mockTasks = [{ id: 1, task: 'Test Task' }];
      axios.get.mockResolvedValueOnce({ status: 200, data: mockTasks });

      const action = actions.getUserTasks(userId);
      await action(dispatch);

      expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.TASKS_BY_USERID(userId));
      expect(dispatch).toHaveBeenCalledWith({
        type: GET_USER_TASKS,
        payload: mockTasks,
      });
    });

    it('should handle non-200 response', async () => {
      const userId = '123';
      axios.get.mockResolvedValueOnce({ status: 400, statusText: 'Bad Request' });

      const action = actions.getUserTasks(userId);
      await action(dispatch);

      expect(dispatch).not.toHaveBeenCalled();
    });

    it('should handle error', async () => {
      const userId = '123';
      const error = new Error('Network error');
      axios.get.mockRejectedValueOnce(error);

      const action = actions.getUserTasks(userId);
      await action(dispatch);

      expect(dispatch).not.toHaveBeenCalled();
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const userProfile = { _id: '123', name: 'John Doe' };
      axios.put.mockResolvedValueOnce({ status: 200 });

      const action = actions.updateUserProfile(userProfile);
      const result = await action(dispatch);

      expect(axios.put).toHaveBeenCalledWith(ENDPOINTS.USER_PROFILE(userProfile._id), userProfile);
      expect(dispatch).toHaveBeenCalledWith({
        type: GET_USER_PROFILE,
        payload: userProfile,
      });
      expect(result).toBe(200);
    });
  });

  describe('updateUserProfileProperty', () => {
    it('should update user profile property successfully', async () => {
      const userProfile = { _id: '123', name: 'John Doe' };
      const key = 'name';
      const value = 'Jane Doe';
      axios.patch.mockResolvedValueOnce({ status: 200 });

      const action = actions.updateUserProfileProperty(userProfile, key, value);
      const result = await action(dispatch);

      expect(axios.patch).toHaveBeenCalledWith(ENDPOINTS.USER_PROFILE_PROPERTY(userProfile._id), {
        key,
        value,
      });
      expect(dispatch).toHaveBeenCalledWith({
        type: GET_USER_PROFILE,
        payload: userProfile,
      });
      expect(result).toBe(200);
    });
  });

  describe('getProjectsByUsersName', () => {
    it('should fetch and dispatch projects successfully', async () => {
      const searchName = 'John';
      const mockProjects = { allProjects: [{ id: 1, name: 'Project 1' }] };
      axios.get.mockResolvedValueOnce({ data: mockProjects });

      const action = actions.getProjectsByUsersName(searchName);
      const result = await action(dispatch);

      expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.GET_PROJECT_BY_PERSON(searchName));
      expect(dispatch).toHaveBeenCalledWith({
        type: GET_PROJECT_BY_USER_NAME,
        payload: mockProjects,
      });
      expect(result).toEqual(mockProjects.allProjects);
    });

    it('should handle error and show toast', async () => {
      const searchName = 'John';
      const error = new Error('User not found');
      axios.get.mockRejectedValueOnce(error);

      const action = actions.getProjectsByUsersName(searchName);
      await action(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: USER_NOT_FOUND_ERROR,
        payload: error.message,
      });
      expect(dispatch).toHaveBeenCalledWith({
        type: GET_PROJECT_BY_USER_NAME,
        payload: [],
      });
      expect(toast.error).toHaveBeenCalledWith('Could not find user or project, please try again');
    });
  });

  describe('getUserByAutocomplete', () => {
    it('should fetch and dispatch autocomplete suggestions successfully', async () => {
      const searchText = 'John';
      const mockSuggestions = [{ id: 1, name: 'John Doe' }];
      axios.get.mockResolvedValueOnce({ data: mockSuggestions });

      const action = actions.getUserByAutocomplete(searchText);
      const result = await action(dispatch);

      expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.USER_AUTOCOMPLETE(searchText));
      expect(dispatch).toHaveBeenCalledWith({
        type: GET_USER_AUTOCOMPLETE,
        payload: mockSuggestions,
      });
      expect(result).toEqual(mockSuggestions);
    });

    it('should handle error and show toast', async () => {
      const searchText = 'John';
      const error = new Error('Network error');
      axios.get.mockRejectedValueOnce(error);

      const action = actions.getUserByAutocomplete(searchText);
      const result = await action(dispatch);

      expect(toast.error).toHaveBeenCalledWith('Error fetching autocomplete suggestions');
      expect(result).toEqual([]);
    });
  });

  describe('Action Creators', () => {
    it('should create action for editing first name', () => {
      const data = 'John';
      expect(actions.editFirstName(data)(dispatch)).toBeUndefined();
      expect(dispatch).toHaveBeenCalledWith({
        type: EDIT_FIRST_NAME,
        payload: data,
      });
    });

    it('should create action for putting user profile', () => {
      const data = { name: 'John Doe' };
      expect(actions.putUserProfile(data)(dispatch)).toBeUndefined();
      expect(dispatch).toHaveBeenCalledWith({
        type: EDIT_USER_PROFILE,
        payload: data,
      });
    });

    it('should create action for clearing user profile', () => {
      expect(actions.clearUserProfile()).toEqual({
        type: CLEAR_USER_PROFILE,
      });
    });
  });
});
