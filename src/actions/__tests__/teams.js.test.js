import { setTeamDetail, getUserTeamMembers } from '../team';
import { GET_TEAM_BY_ID } from '../../constants/team';
import httpService from '../../services/httpService';
import { ENDPOINTS } from '../../utils/URL';

jest.mock('../../services/httpService');

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
    // Add more assertions as needed
  });
});
