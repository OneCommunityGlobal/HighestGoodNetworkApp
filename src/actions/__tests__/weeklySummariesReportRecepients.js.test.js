import axios from 'axios'; // Import axios for making HTTP requests
import configureMockStore from 'redux-mock-store'; // Import redux-mock-store for creating a mock store
import thunk from 'redux-thunk'; // Import redux-thunk for handling asynchronous actions
import * as actions from '../../constants/weeklySummariesReport'; // Import the action type constants
import { authorizeWeeklySummaries, authorizeWeeklySummariesReportError, getRecepients, getRecepientsError, addSummaryRecipient, deleteRecipient, deleteSummaryRecipient, getSummaryRecipients } from '../weeklySummariesReportRecepients'; // Import the action creators
import { ENDPOINTS } from '../../utils/URL'; // Import the endpoints

// Mock axios to control its behavior in tests
jest.mock('axios');

// Mock console.log to suppress log messages during testing
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

// Define middlewares to be used in the mock store
const middlewares = [thunk];
// Create a mock store with the defined middlewares
const mockStore = configureMockStore(middlewares);

// Define the test suite for the authorizeWeeklySummaries action creator
describe('authorizeWeeklySummaries action creator', () => {
  // Define a test case
  it('should create an action to authorize weekly summaries', () => {
    // Define the message to be used in the test
    const message = 'Authorization successful';
    // Define the expected action object
    const expectedAction = {
      type: actions.AUTHORIZE_WEEKLY_SUMMARY_REPORTS,
      payload: message
    };

    // Assert that the action creator returns the expected action object
    expect(authorizeWeeklySummaries(message)).toEqual(expectedAction);
  });
});

// Define the test suite for the authorizeWeeklySummariesReportError action creator
describe('authorizeWeeklySummariesReportError action creator', () => {
  // Define a test case
  it('should create an action for authorization error', () => {
    // Define the error message to be used in the test
    const errorMsg = 'Authorization failed';
    // Define the expected action object
    const expectedAction = {
      type: actions.AUTHORIZE_WEEKLYSUMMARIES_REPORTS_ERROR,
      payload: errorMsg
    };

    // Assert that the action creator returns the expected action object
    expect(authorizeWeeklySummariesReportError(errorMsg)).toEqual(expectedAction);
  });
});

// Define the test suite for the getRecepients action creator
describe('getRecepients action creator', () => {
  // Define a test case
  it('should create an action to get recipients', () => {
    // Define the recipients array to be used in the test
    const recepientsArr = ['user1', 'user2'];
    // Define the expected action object
    const expectedAction = {
      type: actions.GET_SUMMARY_RECIPIENTS,
      recepientsArr
    };

    // Assert that the action creator returns the expected action object
    expect(getRecepients(recepientsArr)).toEqual(expectedAction);
  });
});

// Define the test suite for the getRecepientsError action creator
describe('getRecepientsError action creator', () => {
  // Define a test case
  it('should create an action for get recipients error', () => {
    // Define the error message to be used in the test
    const err = 'Error fetching recipients';
    // Define the expected action object
    const expectedAction = {
      type: actions.GET_SUMMARY_RECIPIENTS_ERROR,
      payload: err
    };

    // Assert that the action creator returns the expected action object
    expect(getRecepientsError(err)).toEqual(expectedAction);
  });
});

// Define the test suite for the addSummaryRecipient action creator
describe('addSummaryRecipient action creator', () => {
  // Define a test case for the success scenario
  it('should handle adding a summary recipient successfully', async () => {
    // Create an empty mock store
    const store = mockStore({});
    // Define the user ID to be used in the test
    const userid = '12345';
    // Define the expected response status
    const responseStatus = 200;

    // Mock the axios.patch method to resolve with the expected response status
    axios.patch.mockResolvedValue({ status: responseStatus });

    // Dispatch the addSummaryRecipient action with the user ID
    const result = await store.dispatch(addSummaryRecipient(userid));

    // Assert that the result matches the expected response status
    expect(result).toEqual(responseStatus);
    // Assert that axios.patch was called with the correct endpoint
    expect(axios.patch).toHaveBeenCalledWith(ENDPOINTS.SAVE_SUMMARY_RECEPIENTS(userid));
  });

  // Define a test case for the failure scenario
  it('should handle adding a summary recipient failure', async () => {
    // Create an empty mock store
    const store = mockStore({});
    // Define the user ID to be used in the test
    const userid = '12345';
    // Define the expected error message
    const errorMessage = 'Network Error';

    // Mock the axios.patch method to reject with an error
    axios.patch.mockRejectedValue(new Error(errorMessage));

    // Dispatch the addSummaryRecipient action with the user ID
    await store.dispatch(addSummaryRecipient(userid));

    // Assert that the actions dispatched include the error action
    const actionsDispatched = store.getActions();
    expect(actionsDispatched).toContainEqual({
      type: actions.AUTHORIZE_WEEKLYSUMMARIES_REPORTS_ERROR,
      payload: new Error(errorMessage)
    });
  });
});

// Define the test suite for the deleteRecipient action creator
describe('deleteRecipient action creator', () => {
  // Define a test case
  it('should create an action to delete a recipient', () => {
    // Define the user ID to be used in the test
    const userid = '12345';
    // Define the expected action object
    const expectedAction = {
      type: actions.DELETE_WEEKLY_SUMMARIES_RECIPIENTS,
      payload: { userid }
    };

    // Assert that the action creator returns the expected action object
    expect(deleteRecipient(userid)).toEqual(expectedAction);
  });
});

// Define the test suite for the deleteSummaryRecipient action creator
describe('deleteSummaryRecipient action creator', () => {
  // Define a test case for the success scenario
  it('should handle deleting a summary recipient successfully', async () => {
    // Create an empty mock store
    const store = mockStore({});
    // Define the user ID to be used in the test
    const userid = '12345';
    // Define the expected response status
    const responseStatus = 200;

    // Mock the axios.delete method to resolve with the expected response status
    axios.delete.mockResolvedValue({ status: responseStatus });

    // Dispatch the deleteSummaryRecipient action with the user ID
    const result = await store.dispatch(deleteSummaryRecipient(userid));

    // Assert that the result matches the expected response status
    expect(result).toEqual(responseStatus);
    // Assert that axios.delete was called with the correct endpoint
    expect(axios.delete).toHaveBeenCalledWith(ENDPOINTS.SAVE_SUMMARY_RECEPIENTS(userid));
    // Assert that the actions dispatched include the deleteRecipient action
    const actionsDispatched = store.getActions();
    expect(actionsDispatched).toContainEqual({
      type: actions.DELETE_WEEKLY_SUMMARIES_RECIPIENTS,
      payload: { userid }
    });
  });

  // Define a test case for the failure scenario
  it('should handle deleting a summary recipient failure', async () => {
    // Create an empty mock store
    const store = mockStore({});
    // Define the user ID to be used in the test
    const userid = '12345';
    // Define the expected error message
    const errorMessage = 'Network Error';

    // Mock the axios.delete method to reject with an error
    axios.delete.mockRejectedValue(new Error(errorMessage));

    // Dispatch the deleteSummaryRecipient action with the user ID
    await store.dispatch(deleteSummaryRecipient(userid));

    // Assert that the actions dispatched include the error action
    const actionsDispatched = store.getActions();
    expect(actionsDispatched).toContainEqual({
      type: actions.AUTHORIZE_WEEKLYSUMMARIES_REPORTS_ERROR,
      payload: new Error(errorMessage)
    });
  });
});

// Define the test suite for the getSummaryRecipients action creator
describe('getSummaryRecipients action creator', () => {
  // Define a test case for the success scenario
  it('should handle getting summary recipients successfully', async () => {
    // Create an empty mock store
    const store = mockStore({});
    // Define the expected response data
    const responseData = ['user1', 'user2'];

    // Mock the axios.get method to resolve with the expected response data
    axios.get.mockResolvedValue({ data: responseData });

    // Dispatch the getSummaryRecipients action
    const result = await store.dispatch(getSummaryRecipients());

    // Assert that the result matches the expected response data
    expect(result).toEqual(responseData);
    // Assert that axios.get was called with the correct endpoint
    expect(axios.get).toHaveBeenCalledWith(ENDPOINTS.GET_SUMMARY_RECEPIENTS());
    // Assert that the actions dispatched include the getRecepients action
    const actionsDispatched = store.getActions();
    expect(actionsDispatched).toContainEqual({
      type: actions.GET_SUMMARY_RECIPIENTS,
      recepientsArr: responseData
    });
  });

  // Define a test case for the failure scenario
  it('should handle getting summary recipients failure', async () => {
    // Create an empty mock store
    const store = mockStore({});
    // Define the expected error message
    const errorMessage = 'Network Error';

    // Mock the axios.get method to reject with an error
    axios.get.mockRejectedValue(new Error(errorMessage));

    // Dispatch the getSummaryRecipients action
    await store.dispatch(getSummaryRecipients());

    // Assert that the actions dispatched include the error action
    const actionsDispatched = store.getActions();
    expect(actionsDispatched).toContainEqual({
      type: actions.GET_SUMMARY_RECIPIENTS_ERROR,
      payload: new Error(errorMessage)
    });
  });
});