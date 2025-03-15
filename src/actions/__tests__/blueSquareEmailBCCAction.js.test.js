import axios from 'axios'; // Import axios for making HTTP requests
import configureMockStore from 'redux-mock-store'; // Import redux-mock-store for creating a mock store
import thunk from 'redux-thunk'; // Import redux-thunk for handling asynchronous actions
import * as types from '../../constants/BluequareEmailBccConstants'; // Import the action type constants
import {
  getAllBlueSquareEmailAssignements,
  setBlueSquareEmailAssignement,
} from '../blueSquareEmailBCCAction'; // Import the action creator

// Mock axios to control its behavior in tests
jest.mock('axios');

// Define middlewares to be used in the mock store
const middlewares = [thunk];
// Create a mock store with the defined middlewares
const mockStore = configureMockStore(middlewares);

// Define the test suite for the getAllBlueSquareEmailAssignements action creator
describe('getAllBlueSquareEmailAssignements action creator', () => {
  // Define a test case for the success scenario
  it('should handle getting all blue square email assignments successfully', async () => {
    // Create an empty mock store
    const store = mockStore({});
    // Define the expected response data
    const responseData = ['assignment1', 'assignment2'];

    // Mock the axios.get method to resolve with the expected response data
    axios.get.mockResolvedValue({ status: 200, data: responseData });

    // Dispatch the getAllBlueSquareEmailAssignements action
    await store.dispatch(getAllBlueSquareEmailAssignements());

    // Assert that the actions dispatched include the getAllBlueSquareEmailBccs action
    const actionsDispatched = store.getActions();
    expect(actionsDispatched).toContainEqual({
      type: types.GET_BLUE_SQUARE_EMAIL_ASSIGNMENTS,
      payload: responseData,
    });
  });

  // Define a test case for the failure scenario
  it('should handle getting all blue square email assignments failure', async () => {
    // Create an empty mock store
    const store = mockStore({});
    // Define the expected error message
    const errorMessage = 'Network Error';

    // Mock the axios.get method to reject with an error
    axios.get.mockRejectedValue(new Error(errorMessage));

    // Dispatch the getAllBlueSquareEmailAssignements action
    await store.dispatch(getAllBlueSquareEmailAssignements());

    // Assert that the actions dispatched include the blueSquareEmailBccError action
    const actionsDispatched = store.getActions();
    expect(actionsDispatched).toContainEqual({
      type: types.BLUE_SQUARE_EMAIL_ASSIGNMENT_ERROR,
      payload: new Error(errorMessage),
    });
  });
});

// Define the test suite for the setBlueSquareEmailAssignement action creator
describe('setBlueSquareEmailAssignement action creator', () => {
  // Define a test case for the success scenario
  it('should handle setting a blue square email assignment successfully', async () => {
    // Create an empty mock store
    const store = mockStore({});
    // Define the email to be used in the test
    const email = 'test@example.com';
    // Define the expected response data
    const responseData = { id: 1, email };

    // Mock the axios.post method to resolve with the expected response data
    axios.post.mockResolvedValue({ status: 200, data: responseData });

    // Dispatch the setBlueSquareEmailAssignement action with the email
    await store.dispatch(setBlueSquareEmailAssignement(email));

    // Assert that the actions dispatched include the setBlueSquareEmailBcc action
    const actionsDispatched = store.getActions();
    expect(actionsDispatched).toContainEqual({
      type: types.SET_BLUE_SQUARE_EMAIL_ASSIGNMENT,
      payload: responseData,
    });
  });

  // Define a test case for the failure scenario
  it('should handle setting a blue square email assignment failure', async () => {
    // Create an empty mock store
    const store = mockStore({});
    // Define the email to be used in the test
    const email = 'test@example.com';
    // Define the expected error message
    const errorMessage = 'Network Error';

    // Mock the axios.post method to reject with an error
    axios.post.mockRejectedValue(new Error(errorMessage));

    // Dispatch the setBlueSquareEmailAssignement action with the email
    await store.dispatch(setBlueSquareEmailAssignement(email));

    // Assert that the actions dispatched include the blueSquareEmailBccError action
    const actionsDispatched = store.getActions();
    expect(actionsDispatched).toContainEqual({
      type: types.BLUE_SQUARE_EMAIL_ASSIGNMENT_ERROR,
      payload: new Error(errorMessage),
    });
  });
});
