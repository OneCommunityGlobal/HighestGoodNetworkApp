import axios from 'axios';
import { updatePassword, forcePasswordUpdate } from '../updatePassword';
import { GET_ERRORS } from '../../constants/errors';
import { ENDPOINTS } from '../../utils/URL';

jest.mock('axios');

describe('Password Actions', () => {
  let mockDispatch;

  beforeEach(() => {
    mockDispatch = jest.fn();
    axios.patch.mockClear();
  });

  describe('updatePassword', () => {
    const userId = '123';
    const newpasswordData = { password: 'newPassword123' };

    it('should return the status code on successful password update', async () => {
      axios.patch.mockResolvedValue({ status: 200 });

      const status = await updatePassword(userId, newpasswordData)(mockDispatch);

      expect(axios.patch).toHaveBeenCalledWith(ENDPOINTS.UPDATE_PASSWORD(userId), newpasswordData);
      expect(status).toBe(200);
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should dispatch GET_ERRORS on failure and return the error status code', async () => {
      const errorResponse = { response: { status: 400, data: { error: 'Invalid request' } } };
      axios.patch.mockRejectedValue(errorResponse);

      const status = await updatePassword(userId, newpasswordData)(mockDispatch);

      expect(axios.patch).toHaveBeenCalledWith(ENDPOINTS.UPDATE_PASSWORD(userId), newpasswordData);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: GET_ERRORS,
        payload: errorResponse.response.data,
      });
      expect(status).toBe(400);
    });
  });

  describe('forcePasswordUpdate', () => {
    const data = { userId: '123', forceUpdate: true };

    it('should return the status code on successful forced password update', async () => {
      axios.patch.mockResolvedValue({ status: 200 });

      const status = await forcePasswordUpdate(data)(mockDispatch);

      expect(axios.patch).toHaveBeenCalledWith(ENDPOINTS.FORCE_PASSWORD, data);
      expect(status).toBe(200);
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('should dispatch GET_ERRORS on failure and return the error status code', async () => {
      const errorResponse = { response: { status: 400, data: { error: 'Invalid request' } } };
      axios.patch.mockRejectedValue(errorResponse);

      const status = await forcePasswordUpdate(data)(mockDispatch);

      expect(axios.patch).toHaveBeenCalledWith(ENDPOINTS.FORCE_PASSWORD, data);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: GET_ERRORS,
        payload: errorResponse.response.data,
      });
      expect(status).toBe(400);
    });
  });
});
