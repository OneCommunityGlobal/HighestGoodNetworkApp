import axios from 'axios';
import { getUserProjects, setUserProjects } from '../userProjects';
import types from '../../constants/userProjects';
import { ENDPOINTS } from '../../utils/URL';

jest.mock('axios');

describe('getUserProjects Action Creator', () => {
  const mockDispatch = jest.fn();
  const userId = '12345';
  const mockUrl = ENDPOINTS.USER_PROJECTS(userId);
  const mockData = { projects: [{ id: 1, name: 'Project 1' }] };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should dispatch setUserProjects with data when the API call is successful', async () => {
    axios.get.mockResolvedValueOnce({ data: mockData });

    await getUserProjects(userId)(mockDispatch);

    expect(axios.get).toHaveBeenCalledWith(mockUrl);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: types.GET_USER_PROJECTS,
      payload: mockData,
    });
  });

  it('should log an error message when the API call fails with a non-401 status', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const errorMessage = 'Request failed';
    axios.get.mockRejectedValueOnce({ status: 500, message: errorMessage });

    await getUserProjects(userId)(mockDispatch);

    expect(axios.get).toHaveBeenCalledWith(mockUrl);
    expect(consoleSpy).toHaveBeenCalledWith('err.message', errorMessage);
    expect(mockDispatch).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should not log an error message or dispatch anything for a 401 error', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    axios.get.mockRejectedValueOnce({ status: 401 });

    await getUserProjects(userId)(mockDispatch);

    expect(axios.get).toHaveBeenCalledWith(mockUrl);
    expect(consoleSpy).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

describe('setUserProjects Action Creator', () => {
  it('should create an action to set user projects', () => {
    const mockData = { projects: [{ id: 1, name: 'Project 1' }] };
    const expectedAction = {
      type: types.GET_USER_PROJECTS,
      payload: mockData,
    };

    const action = setUserProjects(mockData);
    expect(action).toEqual(expectedAction);
  });
});
