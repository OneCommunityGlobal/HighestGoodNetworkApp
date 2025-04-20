// Import the necessary action creators and constants from the respective files
import { teamMembersFectchACtion, userTeamsUpdateAction, addNewTeam, teamsDeleteAction, updateTeamAction, teamUsersFetchAction, teamUsersFetchCompleteAction, teamUsersFetchErrorAction, teamMemberDeleteAction, teamMemberAddAction, updateVisibilityAction, fetchAllTeamCodeSucess, fetchAllTeamCodeFailure, getAllUserTeams, postNewTeam, deleteTeam } from '../allTeamsAction';
import { RECEIVE_ALL_USER_TEAMS, USER_TEAMS_UPDATE, ADD_NEW_TEAM, TEAMS_DELETE, UPDATE_TEAM, FETCH_TEAM_USERS_START, RECEIVE_TEAM_USERS, FETCH_TEAM_USERS_ERROR, TEAM_MEMBER_DELETE, TEAM_MEMBER_ADD, UPDATE_TEAM_MEMBER_VISIBILITY, FETCH_ALL_TEAM_CODE_SUCCESS, FETCH_ALL_TEAM_CODE_FAILURE } from '../../constants/allTeamsConstants';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ENDPOINTS } from '../../utils/URL';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);
const mock = new MockAdapter(axios);

// Describe block for the teamMembersFectchACtion tests
describe('teamMembersFectchACtion', () => {
  // Test case for creating an action to set all user teams
  it('should create an action to set all user teams', () => {
    // Define the payload for the action
    const payload = [{ id: 1, name: 'Team 1' }, { id: 2, name: 'Team 2' }];
    // Define the expected action object
    const expectedAction = {
      type: RECEIVE_ALL_USER_TEAMS,
      payload,
    };
    // Assert that the action creator returns the expected action
    expect(teamMembersFectchACtion(payload)).toEqual(expectedAction);
  });
});

// Describe block for the userTeamsUpdateAction tests
describe('userTeamsUpdateAction', () => {
  // Test case for creating an action to update a user team
  it('should create an action to update a user team', () => {
    // Define the team object to be updated
    const team = { id: 1, name: 'Updated Team' };
    // Define the expected action object
    const expectedAction = {
      type: USER_TEAMS_UPDATE,
      team,
    };
    // Assert that the action creator returns the expected action
    expect(userTeamsUpdateAction(team)).toEqual(expectedAction);
  });
});

// Describe block for the addNewTeam tests
describe('addNewTeam', () => {
  // Test case for creating an action to add a new team
  it('should create an action to add a new team', () => {
    // Define the payload for the new team
    const payload = { id: 3, name: 'New Team' };
    // Define the status for the new team
    const status = true;
    // Define the expected action object
    const expectedAction = {
      type: ADD_NEW_TEAM,
      payload,
      status,
    };
    // Assert that the action creator returns the expected action
    expect(addNewTeam(payload, status)).toEqual(expectedAction);
  });
});

// Describe block for the teamsDeleteAction tests
describe('teamsDeleteAction', () => {
  // Test case for creating an action to delete a team
  it('should create an action to delete a team', () => {
    // Define the team object to be deleted
    const team = { id: 1, name: 'Team to Delete' };
    // Define the expected action object
    const expectedAction = {
      type: TEAMS_DELETE,
      team,
    };
    // Assert that the action creator returns the expected action
    expect(teamsDeleteAction(team)).toEqual(expectedAction);
  });
});

// Describe block for the updateTeamAction tests
describe('updateTeamAction', () => {
  it('should create an action to update a team', () => {
    const teamId = 1;
    const isActive = true;
    const teamName = 'Updated Team';
    const teamCode = '123ABC';
    const expectedAction = {
      type: UPDATE_TEAM,
      teamId,
      isActive,
      teamName,
      teamCode,
    };
    expect(updateTeamAction(teamId, isActive, teamName, teamCode)).toEqual(expectedAction);
  });
});

// Describe block for the teamUsersFetchAction tests
describe('teamUsersFetchAction', () => {
  it('should create an action to set fetching team users flag', () => {
    const expectedAction = {
      type: FETCH_TEAM_USERS_START,
    };
    expect(teamUsersFetchAction()).toEqual(expectedAction);
  });
});

// Describe block for the teamUsersFetchCompleteAction tests
describe('teamUsersFetchCompleteAction', () => {
  it('should create an action to set team users', () => {
    const payload = [{ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' }];
    const expectedAction = {
      type: RECEIVE_TEAM_USERS,
      payload,
    };
    expect(teamUsersFetchCompleteAction(payload)).toEqual(expectedAction);
  });
});

// Describe block for the teamUsersFetchErrorAction tests
describe('teamUsersFetchErrorAction', () => {
  it('should create an action for team users fetch error', () => {
    const payload = 'Error fetching team users';
    const expectedAction = {
      type: FETCH_TEAM_USERS_ERROR,
      payload,
    };
    expect(teamUsersFetchErrorAction(payload)).toEqual(expectedAction);
  });
});

// Describe block for the teamMemberDeleteAction tests
describe('teamMemberDeleteAction', () => {
  // Test case for creating an action to delete a team member
  it('should create an action to delete a team member', () => {
    // Define the member object to be deleted
    const member = { id: 1, name: 'Member to Delete' };
    // Define the expected action object
    const expectedAction = {
      type: TEAM_MEMBER_DELETE,
      member,
    };
    // Assert that the action creator returns the expected action
    expect(teamMemberDeleteAction(member)).toEqual(expectedAction);
  });
});

// Describe block for the teamMemberAddAction tests
describe('teamMemberAddAction', () => {
  // Test case for creating an action to add a team member
  it('should create an action to add a team member', () => {
    // Define the member object to be added
    const member = { id: 2, name: 'New Member' };
    // Define the expected action object
    const expectedAction = {
      type: TEAM_MEMBER_ADD,
      member,
    };
    // Assert that the action creator returns the expected action
    expect(teamMemberAddAction(member)).toEqual(expectedAction);
  });
});

// Describe block for the updateVisibilityAction tests
describe('updateVisibilityAction', () => {
  // Test case for creating an action to update team member visibility
  it('should create an action to update team member visibility', () => {
    // Define the visibility, userId, and teamId
    const visibility = true;
    const userId = 1;
    const teamId = 1;
    // Define the expected action object
    const expectedAction = {
      type: UPDATE_TEAM_MEMBER_VISIBILITY,
      visibility,
      userId,
      teamId,
    };
    // Assert that the action creator returns the expected action
    expect(updateVisibilityAction(visibility, userId, teamId)).toEqual(expectedAction);
  });
});

// Describe block for the fetchAllTeamCodeSucess tests
describe('fetchAllTeamCodeSucess', () => {
  // Test case for creating an action to fetch all team codes successfully
  it('should create an action to fetch all team codes successfully', () => {
    // Define the payload for the action
    const payload = [{ code: 'ABC123' }, { code: 'XYZ789' }];
    // Define the expected action object
    const expectedAction = {
      type: FETCH_ALL_TEAM_CODE_SUCCESS,
      payload,
    };
    // Assert that the action creator returns the expected action
    expect(fetchAllTeamCodeSucess(payload)).toEqual(expectedAction);
  });
});


// Describe block for the getAllUserTeams tests
describe('getAllUserTeams', () => {
  // Test case for fetching all user teams
  it('should fetch all user teams and dispatch RECEIVE_ALL_USER_TEAMS action', async () => {
    // Mock the API response
    const responseData = [{ id: 1, name: 'Team 1' }, { id: 2, name: 'Team 2' }];
    mock.onGet(ENDPOINTS.TEAM).reply(200, responseData);

    const expectedActions = [
      { type: RECEIVE_ALL_USER_TEAMS, payload: responseData },
    ];

    const store = mockStore({});
    await store.dispatch(getAllUserTeams());
    expect(store.getActions()).toEqual(expectedActions);
  });
});

// Describe block for the postNewTeam tests
describe('postNewTeam', () => {
  // Test case for posting a new team
  it('should post a new team and dispatch ADD_NEW_TEAM action', async () => {
    // Mock the API response
    const responseData = { id: 3, name: 'New Team' };
    mock.onPost(ENDPOINTS.TEAM).reply(200, responseData);

    const expectedActions = [
      { type: ADD_NEW_TEAM, payload: responseData, status: true },
    ];

    const store = mockStore({});
    await store.dispatch(postNewTeam('New Team', true));
    expect(store.getActions()).toEqual(expectedActions);
  });
});

// Describe block for the deleteTeam tests
describe('deleteTeam', () => {
  // Test case for deleting a team
  it('should delete a team and dispatch TEAMS_DELETE action', async () => {
    // Mock the API response
    const teamId = 1;
    mock.onDelete(ENDPOINTS.TEAM_DATA(teamId)).reply(200);

    const expectedActions = [
      { type: TEAMS_DELETE, team: teamId },
    ];

    const store = mockStore({});
    await store.dispatch(deleteTeam(teamId));
    expect(store.getActions()).toEqual(expectedActions);
  });
});

