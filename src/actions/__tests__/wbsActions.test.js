import axios from 'axios';
import * as types from '../../constants/WBS';
import {
  addNewWBS,
  deleteWbs,
  fetchAllWBS,
  setWBSStart,
  setWBS,
  removeWBS,
  postNewWBS,
  setWBSError,
} from '../wbs';

jest.mock('axios');

describe('WBS Action Creators', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.clearAllMocks();
    console.log.mockRestore();
  });

  describe('addNewWBS', () => {
    it('should dispatch postNewWBS with correct payload on successful API call', async () => {
      const mockDispatch = jest.fn();
      const mockResponse = { data: { _id: 'test-id' }, status: 200 };
      axios.post.mockResolvedValueOnce(mockResponse);

      const thunk = addNewWBS('Test WBS', 'test-project-id');
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith(
        postNewWBS(
          {
            _id: 'test-id',
            wbsName: 'Test WBS',
            isActive: true,
          },
          200,
        ),
      );
    });

    it('should dispatch postNewWBS with status 400 on API error', async () => {
      const mockDispatch = jest.fn();
      axios.post.mockRejectedValueOnce(new Error('Network Error'));

      const thunk = addNewWBS('Test WBS', 'test-project-id');
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith(
        postNewWBS(
          {
            _id: null,
            wbsName: 'Test WBS',
            isActive: true,
          },
          400,
        ),
      );
    });
  });

  describe('deleteWbs', () => {
    it('should dispatch removeWBS on successful API call', async () => {
      const mockDispatch = jest.fn();
      axios.delete.mockResolvedValueOnce();
      axios.post.mockResolvedValueOnce();

      const thunk = deleteWbs('test-wbs-id');
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith(removeWBS('test-wbs-id'));
    });

    it('should dispatch setWBSError on API error in axios.post', async () => {
      const mockDispatch = jest.fn();
      const mockError = new Error('Network Error');

      axios.post.mockRejectedValueOnce(mockError);
      axios.delete.mockResolvedValueOnce({});

      const thunk = deleteWbs('test-wbs-id');
      await thunk(mockDispatch);

      await new Promise(process.nextTick);

      expect(mockDispatch).toHaveBeenCalledWith({
        type: types.DELETE_WBS,
        wbsId: 'test-wbs-id',
      });
    });

    it('should dispatch setWBSError on axios.delete failure', async () => {
      const mockDispatch = jest.fn();
      const mockError = new Error('Delete Error');
      axios.post.mockResolvedValueOnce({});
      axios.delete.mockRejectedValueOnce(mockError);

      const thunk = deleteWbs('test-wbs-id');
      await thunk(mockDispatch);

      await new Promise(process.nextTick);
      expect(mockDispatch).toHaveBeenCalledWith(setWBSError(mockError));
    });
  });

  describe('fetchAllWBS', () => {
    it('should dispatch setWBS with data on successful API call', async () => {
      const mockDispatch = jest.fn();
      const mockResponse = { data: [{ _id: 'test-id', wbsName: 'Test WBS' }] };
      axios.get.mockResolvedValueOnce(mockResponse);

      const thunk = fetchAllWBS('test-project-id');
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith(setWBSStart());
      expect(mockDispatch).toHaveBeenCalledWith(setWBS(mockResponse.data));
    });

    it('should dispatch setWBSStart but not setWBSError on API error', async () => {
      const mockDispatch = jest.fn();
      const mockError = new Error('Fetch Error');
      axios.get.mockRejectedValueOnce(mockError);

      const thunk = fetchAllWBS('test-project-id');
      await thunk(mockDispatch);

      expect(mockDispatch).toHaveBeenCalledWith({ type: types.FETCH_WBS_START });
    });

    it('should dispatch setWBSError when axios.get promise fails', async () => {
      const mockDispatch = jest.fn();
      const mockError = new Error('Fetch Error');

      axios.get.mockReturnValueOnce(Promise.reject(mockError));

      const thunk = fetchAllWBS('test-project-id');
      await thunk(mockDispatch);
      await new Promise(process.nextTick);

      expect(mockDispatch).toHaveBeenCalledWith(setWBSStart());
      expect(mockDispatch).toHaveBeenCalledWith(setWBSError(mockError));
    });
  });
});
