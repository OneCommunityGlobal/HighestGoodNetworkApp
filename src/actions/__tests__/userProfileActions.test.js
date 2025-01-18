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

// Mock axios and toast
jest.mock('axios');
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));

// Mock ENDPOINTS
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
});
