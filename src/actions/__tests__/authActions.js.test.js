import configureMockStore from 'redux-mock-store'; // Import mock store configuration
import thunk from 'redux-thunk'; // Import thunk middleware
import httpService from '../../services/httpService'; // Import httpService
import {
  loginUser, // Import loginUser action
  loginBMUser, // Import loginBMUser action
  getHeaderData, // Import getHeaderData action
  logoutUser, // Import logoutUser action
  refreshToken as refreshUserToken, // Import refreshToken action and rename it to avoid conflict
  setCurrentUser, // Import setCurrentUser action
  setHeaderData, // Import setHeaderData action
} from '../authActions'; // Import actions from authActions
import { SET_CURRENT_USER, GET_ERRORS, SET_HEADER_DATA } from '../../constants/auth'; // Import constants
import jwtDecode from 'jwt-decode'; // Import jwtDecode
import axios from 'axios'; // Import axios

const middlewares = [thunk]; // Define middlewares
const mockStore = configureMockStore(middlewares); // Create mock store with middlewares

jest.mock('jwt-decode', () => jest.fn()); // Mock jwtDecode

jest.mock('../../services/httpService'); // Mock httpService
jest.mock('axios'); // Mock axios

describe('authActions', () => {
  it('creates SET_CURRENT_USER when loginUser is successful', async () => {
    const store = mockStore({}); // Create a mock store
    const credentials = { email: 'test@example.com', password: 'password' }; // Define test credentials
    const token = 'fake-jwt-token'; // Define a fake token
    const decodedToken = { id: '123' }; // Define a decoded token
    httpService.post.mockResolvedValue({ data: { token } }); // Mock the httpService post method
    jwtDecode.mockReturnValue(decodedToken); // Mock the jwtDecode function

    const expectedActions = [{ type: SET_CURRENT_USER, payload: decodedToken }]; // Define expected actions

    await store.dispatch(loginUser(credentials)); // Dispatch the loginUser action
    expect(store.getActions()).toEqual(expectedActions); // Assert the actions
  });

  it('creates SET_CURRENT_USER when loginBMUser is successful', async () => {
    const store = mockStore({}); // Create a mock store
    const credentials = { email: 'bm@example.com', password: 'password' }; // Define test credentials
    const token = 'fake-bm-jwt-token'; // Define a fake token
    const decodedToken = { id: '456' }; // Define a decoded token
    httpService.post.mockResolvedValue({ data: { token } }); // Mock the httpService post method
    jwtDecode.mockReturnValue(decodedToken); // Mock the jwtDecode function

    const expectedActions = [{ type: SET_CURRENT_USER, payload: decodedToken }]; // Define expected actions

    await store.dispatch(loginBMUser(credentials)); // Dispatch the loginBMUser action
    expect(store.getActions()).toEqual(expectedActions); // Assert the actions
  });

  it('handles errors when loginBMUser fails', async () => {
    const store = mockStore({}); // Create a mock store
    const credentials = { email: 'bm@example.com', password: 'password' }; // Define test credentials
    const errorResponse = { response: { status: 400, data: { message: 'Invalid credentials' } } }; // Define an error response
    httpService.post.mockRejectedValue(errorResponse); // Mock the httpService post method to reject

    const result = await store.dispatch(loginBMUser(credentials)); // Dispatch the loginBMUser action
    expect(result).toEqual(errorResponse.response); // Assert the error response
    expect(store.getActions()).toEqual([]); // Assert no actions were created
  });

  it('creates SET_CURRENT_USER with null when logoutUser is called', () => {
    const store = mockStore({}); // Create a mock store
    const expectedActions = [{ type: SET_CURRENT_USER, payload: null }]; // Define expected actions

    store.dispatch(logoutUser()); // Dispatch the logoutUser action
    expect(store.getActions()).toEqual(expectedActions); // Assert the actions
  });

  it('creates SET_CURRENT_USER when refreshToken is successful', async () => {
    const store = mockStore({}); // Create a mock store
    const userId = '123'; // Define a user ID
    const refreshToken = 'fake-refresh-token'; // Define a fake refresh token
    const decodedToken = { id: '123' }; // Define a decoded token
    axios.get.mockResolvedValue({ data: { refreshToken }, status: 200 }); // Mock the axios get method
    jwtDecode.mockReturnValue(decodedToken); // Mock the jwtDecode function

    const expectedActions = [{ type: SET_CURRENT_USER, payload: decodedToken }]; // Define expected actions

    await store.dispatch(refreshUserToken(userId)); // Dispatch the refreshUserToken action
    expect(store.getActions()).toEqual(expectedActions); // Assert the actions
  });

  it('does not create SET_CURRENT_USER when refreshToken fails', async () => {
    const store = mockStore({}); // Create a mock store
    const userId = '123'; // Define a user ID
    axios.get.mockResolvedValue({ status: 400 }); // Mock the axios get method to fail

    await store.dispatch(refreshUserToken(userId)); // Dispatch the refreshUserToken action
    expect(store.getActions()).toEqual([]); // Assert no actions were created
  });

  it('creates an action to set the current user', () => {
    const decoded = { id: '123', name: 'John Doe' }; // Define a decoded token
    const expectedAction = { type: SET_CURRENT_USER, payload: decoded }; // Define expected action

    expect(setCurrentUser(decoded)).toEqual(expectedAction); // Assert the action
  });

  it('creates an action to set header data', () => {
    const data = { firstName: 'John', profilePic: 'profile.jpg' }; // Define header data
    const expectedAction = { type: SET_HEADER_DATA, payload: data }; // Define expected action

    expect(setHeaderData(data)).toEqual(expectedAction); // Assert the action
  });

});
