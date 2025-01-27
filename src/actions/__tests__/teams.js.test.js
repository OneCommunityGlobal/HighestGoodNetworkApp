import { setTeamDetail, getUserTeamMembers, getTeamDetail } from '../team'; // Import getTeamDetail
import { GET_TEAM_BY_ID } from '../../constants/team';
import httpService from '../../services/httpService';
import { ENDPOINTS } from '../../utils/URL';
import axios from 'axios'; // Import axios

jest.mock('../../services/httpService');
jest.mock('axios'); // Mock axios

describe('setTeamDetail', () => { // Describe the test suite for the setTeamDetail action creator
  it('should create an action to set team detail', () => { // Define a test case
    const data = { id: 1, name: 'Team A' }; // Define the input data for the action creator
    const expectedAction = { // Define the expected action object
      type: GET_TEAM_BY_ID, // The action type should be GET_TEAM_BY_ID
      payload: data, // The payload should be the input data
    };
    expect(setTeamDetail(data)).toEqual(expectedAction); // Assert that the action creator returns the expected action
  });
});

describe('getUserTeamMembers', () => { // Describe the test suite for the getUserTeamMembers action creator
  it('should fetch team members for a user', async () => { // Define a test case
    const userId = 1; // Define the user ID for which team members will be fetched
    const mockResponse = { data: [{ id: 1, name: 'Member A' }] }; // Define the mock response from the HTTP service
    httpService.get.mockResolvedValue(mockResponse); // Mock the HTTP GET request to resolve with the mock response

    const dispatch = jest.fn(); // Create a mock dispatch function
    const url = ENDPOINTS.USER_TEAM(userId); // Define the URL endpoint for fetching team members

    await getUserTeamMembers(userId)(dispatch); // Call the getUserTeamMembers action creator with the user ID and dispatch function

    expect(httpService.get).toHaveBeenCalledWith(url); // Assert that the HTTP GET request was called with the correct URL
  });
});

describe('getTeamDetail', () => { // Describe the test suite for the getTeamDetail action creator
  it('should fetch team detail for a team', async () => { // Define a test case
    const teamId = 1; // Define the team ID for which team detail will be fetched
    const mockResponse = { data: { id: 1, name: 'Team A' } }; // Define the mock response from the HTTP service
    axios.get.mockResolvedValue(mockResponse); // Mock the HTTP GET request to resolve with the mock response

    const dispatch = jest.fn(); // Create a mock dispatch function
    const url = ENDPOINTS.TEAM_BY_ID(teamId); // Define the URL endpoint for fetching team detail

    await getTeamDetail(teamId)(dispatch); // Call the getTeamDetail action creator with the team ID and dispatch function

    expect(axios.get).toHaveBeenCalledWith(url); // Assert that the HTTP GET request was called with the correct URL
    expect(dispatch).toHaveBeenCalledWith(setTeamDetail(mockResponse.data)); // Assert that the dispatch function was called with the correct action
  });

  it('should handle 401 error and not dispatch action', async () => { // Define a test case for handling 401 error
    const teamId = 1; // Define the team ID for which team detail will be fetched
    const mockError = { response: { status: 401 } }; // Define the mock error response
    axios.get.mockImplementation(() => Promise.reject(mockError)); // Mock the HTTP GET request to reject with the mock error

    const dispatch = jest.fn(); // Create a mock dispatch function
    const url = ENDPOINTS.TEAM_BY_ID(teamId); // Define the URL endpoint for fetching team detail

    await getTeamDetail(teamId)(dispatch); // Call the getTeamDetail action creator with the team ID and dispatch function

    expect(axios.get).toHaveBeenCalledWith(url); // Assert that the HTTP GET request was called with the correct URL
    expect(dispatch).not.toHaveBeenCalled(); // Assert that the dispatch function was not called
  });
});
