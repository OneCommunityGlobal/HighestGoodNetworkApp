import axios from 'axios';
import { getUserProjects, setUserProjects } from '../userProjects';
import types from '../../constants/userProjects';
import { ENDPOINTS } from '../../utils/URL';

jest.mock('axios'); // Mock axios

describe('getUserProjects Action', () => {
  const userId = '12345';
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should dispatch setUserProjects with data on successful API call', async () => {
    const mockData = [{ id: 1, name: 'Project 1' }, { id: 2, name: 'Project 2' }];
    const mockUrl = `http://example.com/user/${userId}/projects`;

    // Mock the endpoint and axios.get response
    ENDPOINTS.USER_PROJECTS = jest.fn(() => mockUrl);
    axios.get.mockResolvedValueOnce({ data: mockData });

    // Call the action
    const thunk = getUserProjects(userId);
    await thunk(mockDispatch);

    // Assertions
    expect(ENDPOINTS.USER_PROJECTS).toHaveBeenCalledWith(userId);
    expect(axios.get).toHaveBeenCalledWith(mockUrl);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: types.GET_USER_PROJECTS,
      payload: mockData,
    });
  });

  it('should handle API errors gracefully', async () => {
    const mockError = new Error('Network Error');
    const mockUrl = `http://example.com/user/${userId}/projects`;

    // Mock the endpoint and axios.get rejection
    ENDPOINTS.USER_PROJECTS = jest.fn(() => mockUrl);
    axios.get.mockRejectedValueOnce(mockError);

    // Spy on console.log to verify error logging
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Call the action
    const thunk = getUserProjects(userId);
    await thunk(mockDispatch);

    // Assertions
    expect(ENDPOINTS.USER_PROJECTS).toHaveBeenCalledWith(userId);
    expect(axios.get).toHaveBeenCalledWith(mockUrl);
    expect(consoleLogSpy).toHaveBeenCalledWith('err.message', mockError.message);
    expect(mockDispatch).not.toHaveBeenCalledWith(expect.any(Function)); // Ensure no dispatch on error

    // Clean up
    consoleLogSpy.mockRestore();
  });

  it('should not log error for status 401', async () => {
    const mockError = { status: 401, message: 'Unauthorized' };
    const mockUrl = `http://example.com/user/${userId}/projects`;

    // Mock the endpoint and axios.get rejection
    ENDPOINTS.USER_PROJECTS = jest.fn(() => mockUrl);
    axios.get.mockRejectedValueOnce(mockError);

    // Spy on console.log
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    // Call the action
    const thunk = getUserProjects(userId);
    await thunk(mockDispatch);

    // Assertions
    expect(ENDPOINTS.USER_PROJECTS).toHaveBeenCalledWith(userId);
    expect(axios.get).toHaveBeenCalledWith(mockUrl);
    expect(consoleLogSpy).not.toHaveBeenCalled(); // No logging for 401 errors
    expect(mockDispatch).not.toHaveBeenCalled();

    // Clean up
    consoleLogSpy.mockRestore();
  });
});
