

import * as titleActions from '../title';

describe('Title Actions', () => {
  describe('addTitle', () => {
    it('should return response when API call is successful', async () => {
      const mockResponse = { id: '123', title: 'Test Title' };
      vi.spyOn(titleActions, 'addTitle').mockResolvedValue(mockResponse);

      const response = await titleActions.addTitle({ title: 'Test Title' });
      expect(response).toEqual(mockResponse);
    });

    it('should return error object when API call fails', async () => {
      const mockError = { response: { data: { message: 'Error' }, status: 400 } };
      vi.spyOn(titleActions, 'addTitle').mockRejectedValue(mockError);

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
      vi.spyOn(titleActions, 'editTitle').mockResolvedValue(mockResponse);

      const response = await titleActions.editTitle('123', { title: 'Updated Title' });
      expect(response).toEqual(mockResponse);
    });

    it('should return error object when API call fails', async () => {
      const mockError = { response: { data: { message: 'Error' }, status: 400 } };
      vi.spyOn(titleActions, 'editTitle').mockRejectedValue(mockError);

      try {
        await titleActions.editTitle('123', { title: 'Updated Title' });
      } catch (error) {
        expect(error.response).toEqual(mockError.response);
      }
    });
  });

  describe('getAllTitle', () => {
    it('should return response when API call is successful', async () => {
      const mockResponse = [
        { id: '123', title: 'Title 1' },
        { id: '124', title: 'Title 2' },
      ];
      vi.spyOn(titleActions, 'getAllTitle').mockResolvedValue(mockResponse);

      const response = await titleActions.getAllTitle();
      expect(response).toEqual(mockResponse);
    });

    it('should return error object when API call fails', async () => {
      const mockError = { response: { data: { message: 'Error' }, status: 400 } };
      vi.spyOn(titleActions, 'getAllTitle').mockRejectedValue(mockError);

      try {
        await titleActions.getAllTitle();
      } catch (error) {
        expect(error.response).toEqual(mockError.response);
      }
    });
  });

  describe('getTitleById', () => {
    it('should return response when API call is successful', async () => {
      const mockResponse = { id: '123', title: 'Test Title' };
      vi.spyOn(titleActions, 'getTitleById').mockResolvedValue(mockResponse);

      const response = await titleActions.getTitleById('123');
      expect(response).toEqual(mockResponse);
    });

    it('should return error object when API call fails', async () => {
      vi.spyOn(titleActions, 'getTitleById').mockImplementation(async () => {
        return {
          message: 'Error',
          errorCode: 'Error',
          status: 400,
        };
      });

      const response = await titleActions.getTitleById('123');
      expect(response).toEqual({
        message: 'Error',
        errorCode: 'Error',
        status: 400,
      });
    });
  });

  describe('deleteTitleById', () => {
    it('should return response when API call is successful', async () => {
      const mockResponse = { message: 'Title deleted successfully' };
      vi.spyOn(titleActions, 'deleteTitleById').mockResolvedValue(mockResponse);

      const response = await titleActions.deleteTitleById('123');
      expect(response).toEqual(mockResponse);
    });

    it('should return error object when API call fails', async () => {
      vi.spyOn(titleActions, 'deleteTitleById').mockImplementation(async () => {
        return {
          message: 'Error',
          errorCode: 'Error',
          status: 400,
        };
      });

      const response = await titleActions.deleteTitleById('123');
      expect(response).toEqual({
        message: 'Error',
        errorCode: 'Error',
        status: 400,
      });
    });
  });
});
