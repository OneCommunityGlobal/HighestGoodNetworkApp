import axios from 'axios';
import { toast } from 'react-toastify';
import * as actions from '../followUpActions';
import * as types from '../../constants/followUpConstants';
import { ENDPOINTS } from '../../utils/URL';

jest.mock('axios');
jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe('followUpActions', () => {
  describe('fetchAllFollowUps', () => {
    it('should dispatch FETCH_ALL_FOLLOWUPS on successful API call', async () => {
      const mockData = [{ id: 1, name: 'Follow-up 1' }];
      axios.get.mockResolvedValueOnce({ status: 200, data: mockData });

      const dispatch = jest.fn();
      await actions.fetchAllFollowUps()(dispatch);

      expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.GET_ALL_FOLLOWUPS());
      expect(dispatch).toHaveBeenCalledWith({
        type: types.FETCH_ALL_FOLLOWUPS,
        payload: mockData,
      });
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should dispatch SET_FOLLOWUP_ERROR and show a toast on API failure', async () => {
      const mockError = new Error('Network Error');
      axios.get.mockRejectedValueOnce(mockError);

      const dispatch = jest.fn();
      await actions.fetchAllFollowUps()(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: types.SET_FOLLOWUP_ERROR,
        payload: mockError,
      });
      expect(toast.error).toHaveBeenCalledWith('Error: loading follow-up data.');
    });
  });

  describe('setUserFollowUp', () => {
    it('should dispatch SET_FOLLOWUP on successful API call', async () => {
      const userId = 1;
      const taskId = 101;
      const updateData = { status: 'completed' };
      const mockResponse = { id: 101, status: 'completed' };

      axios.post.mockResolvedValueOnce({ status: 200, data: mockResponse });

      const dispatch = jest.fn();
      await actions.setUserFollowUp(userId, taskId, updateData)(dispatch);

      expect(axios.post).toHaveBeenCalledWith(
        ENDPOINTS.SET_USER_FOLLOWUP(userId, taskId),
        updateData
      );
      expect(dispatch).toHaveBeenCalledWith({
        type: types.SET_FOLLOWUP,
        payload: mockResponse,
      });
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should dispatch SET_FOLLOWUP_ERROR and show a toast on API failure', async () => {
      const userId = 1;
      const taskId = 101;
      const updateData = { status: 'completed' };
      const mockError = new Error('Request failed');

      axios.post.mockRejectedValueOnce(mockError);

      const dispatch = jest.fn();
      await actions.setUserFollowUp(userId, taskId, updateData)(dispatch);

      expect(dispatch).toHaveBeenCalledWith({
        type: types.SET_FOLLOWUP_ERROR,
        payload: mockError,
      });
      expect(toast.error).toHaveBeenCalledWith('Error: Unable to set follow-up.');
    });
  });
});
