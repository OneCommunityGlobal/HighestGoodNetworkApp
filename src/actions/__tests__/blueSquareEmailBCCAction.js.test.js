import axios from 'axios'; // Import axios for making HTTP requests
import configureMockStore from 'redux-mock-store'; // Import redux-mock-store for creating a mock store
import thunk from 'redux-thunk'; // Import redux-thunk for handling asynchronous actions
import * as types from '../../constants/BluequareEmailBccConstants'; // Import the action type constants
import { setBlueSquareEmailAssignement, deleteBlueSquareEmailAssignement } from '../blueSquareEmailBCCAction'; // Import the action creator

// Mock axios to control its behavior in tests
jest.mock('axios');

// Define middlewares to be used in the mock store
const middlewares = [thunk];
// Create a mock store with the defined middlewares
const mockStore = configureMockStore(middlewares);

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

// Define the test suite for the deleteBlueSquareEmailAssignement action creator
describe('deleteBlueSquareEmailAssignement action creator', () => {
  // Define a test case for the success scenario
  it('should handle deleting a blue square email assignment successfully', async () => {
    // Create an empty mock store
    const store = mockStore({});
    // Define the ID to be used in the test
    const id = 1;
    // Define the expected response data
    const responseData = { id };

    // Mock the axios.delete method to resolve with the expected response data
    axios.delete.mockResolvedValue({ status: 200, data: responseData });

    // Dispatch the deleteBlueSquareEmailAssignement action with the ID
    await store.dispatch(deleteBlueSquareEmailAssignement(id));

    // Assert that the actions dispatched include the deleteBlueSquareEmailBcc action
    const actionsDispatched = store.getActions();
    expect(actionsDispatched).toContainEqual({
      type: types.DELETE_BLUE_SQUARE_EMAIL_ASSIGNMENT,
      payload: id,
    });
  });

  // Define a test case for the failure scenario
  it('should handle deleting a blue square email assignment failure', async () => {
    // Create an empty mock store
    const store = mockStore({});
    // Define the ID to be used in the test
    const id = 1;
    // Define the expected error message
    const errorMessage = 'Network Error';

    // Mock the axios.delete method to reject with an error
    axios.delete.mockRejectedValue(new Error(errorMessage));

    // Dispatch the deleteBlueSquareEmailAssignement action with the ID
    await store.dispatch(deleteBlueSquareEmailAssignement(id));

    // Assert that the actions dispatched include the blueSquareEmailBccError action
    const actionsDispatched = store.getActions();
    expect(actionsDispatched).toContainEqual({
      type: types.BLUE_SQUARE_EMAIL_ASSIGNMENT_ERROR,
      payload: new Error(errorMessage),
    });
  });
});
