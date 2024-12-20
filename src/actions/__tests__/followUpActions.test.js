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
});
