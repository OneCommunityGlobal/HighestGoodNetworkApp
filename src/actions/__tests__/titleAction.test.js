import axios from 'axios';
import * as titleActions from '../title';
import { ENDPOINTS } from '../../utils/URL';

jest.mock('axios');

describe('Title Actions', () => {
  describe('addTitle', () => {
    it('should return response when API call is successful', async () => {
      const mockResponse = { id: '123', title: 'Test Title' };
      jest.spyOn(titleActions, 'addTitle').mockResolvedValue(mockResponse);

      const response = await titleActions.addTitle({ title: 'Test Title' });
      expect(response).toEqual(mockResponse);
    });

    it('should return error object when API call fails', async () => {
      const mockError = { response: { data: { message: 'Error' }, status: 400 } };
      jest.spyOn(titleActions, 'addTitle').mockRejectedValue(mockError);

      try {
        await titleActions.addTitle({ title: 'Test Title' });
      } catch (error) {
        expect(error.response).toEqual(mockError.response);
      }
    });
  });

  describe('editTitle', () => {
    it('should return response when API call is successful', async () => {
      const mockResponse = { id: '123', title: 'Updated Title' };
      jest.spyOn(titleActions, 'editTitle').mockResolvedValue(mockResponse);

      const response = await titleActions.editTitle('123', { title: 'Updated Title' });
      expect(response).toEqual(mockResponse);
    });

    it('should return error object when API call fails', async () => {
      const mockError = { response: { data: { message: 'Error' }, status: 400 } };
      jest.spyOn(titleActions, 'editTitle').mockRejectedValue(mockError);

      try {
        await titleActions.editTitle('123', { title: 'Updated Title' });
      } catch (error) {
        expect(error.response).toEqual(mockError.response);
      }
    });
  });
});
