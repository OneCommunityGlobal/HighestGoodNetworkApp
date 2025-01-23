import axios from 'axios';
import {
  getOwnerMessage,
  updateOwnerMessage,
  deleteOwnerMessage,
  updateOwnerMessageAction,
} from '../ownerMessageAction';
import * as types from '../../constants/ownerMessageConstants';
import { ENDPOINTS } from '../../utils/URL';

jest.mock('axios');

const mockDispatch = jest.fn();

describe('ownerMessageActions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOwnerMessage', () => {
    it('should dispatch updateOwnerMessageAction with the fetched owner message', async () => {
      const mockResponse = {
        data: { ownerMessage: 'Test owner message' },
      };
      axios.get.mockResolvedValue(mockResponse);

      const thunk = getOwnerMessage();
      const response = await thunk(mockDispatch);

      expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.OWNERMESSAGE());
      expect(mockDispatch).toHaveBeenCalledWith({
        type: types.UPDATE_OWNER_MESSAGE,
        payload: 'Test owner message',
      });
      expect(response).toEqual(mockResponse);
    });

    it('should return the error message if the request fails', async () => {
      const mockError = {
        response: { data: { error: 'Failed to fetch owner message' } },
      };
      axios.get.mockRejectedValue(mockError);

      const thunk = getOwnerMessage();
      const error = await thunk(mockDispatch);

      expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.OWNERMESSAGE());
      expect(mockDispatch).not.toHaveBeenCalled();
      expect(error).toBe('Failed to fetch owner message');
    });
  });

  describe('updateOwnerMessage', () => {
    it('should dispatch updateOwnerMessageAction with the updated owner message', async () => {
      const newMessage = { message: 'Updated message' };
      const mockResponse = {
        data: { ownerMessage: 'Updated owner message' },
      };
      axios.put.mockResolvedValue(mockResponse);

      const thunk = updateOwnerMessage(newMessage);
      const response = await thunk(mockDispatch);

      expect(axios.put).toHaveBeenCalledWith(ENDPOINTS.OWNERMESSAGE(), newMessage);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: types.UPDATE_OWNER_MESSAGE,
        payload: 'Updated owner message',
      });
      expect(response).toEqual(mockResponse);
    });

});
