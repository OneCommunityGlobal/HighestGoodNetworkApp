import { setTeamDetail } from '../team';
import { GET_TEAM_BY_ID } from '../../constants/team';

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
