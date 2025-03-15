import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';
import * as types from '../constants/allTeamsConstants';

import {
  RECEIVE_ALL_USER_TEAMS,
  USER_TEAMS_UPDATE,
  UPDATE_TEAM,
  ADD_NEW_TEAM,
  TEAMS_DELETE,
  FETCH_TEAM_USERS_START,
  RECEIVE_TEAM_USERS,
  FETCH_TEAM_USERS_ERROR,
  TEAM_MEMBER_DELETE,
  TEAM_MEMBER_ADD,
  UPDATE_TEAM_MEMBER_VISIBILITY,
  FETCH_ALL_TEAM_CODE_SUCCESS,
  FETCH_ALL_TEAM_CODE_FAILURE,
} from '../constants/allTeamsConstants';

/**
 * set allteams in store
 * @param payload : allteams []
 */
export const teamMembersFectchACtion = payload => ({
  type: RECEIVE_ALL_USER_TEAMS,
  payload,
});

/**
 * Action for Updating an teams
 * @param {*} team : the updated user
 */
export const userTeamsUpdateAction = team => ({
  type: USER_TEAMS_UPDATE,
  team,
});

/**
 * Action for Creating New Team
 */
export const addNewTeam = (payload, status) => ({
  type: ADD_NEW_TEAM,
  payload,
  status,
});

/**
 * Delete team action
 * @param {*} team : the deleted team
 */
export const teamsDeleteAction = team => ({
  type: TEAMS_DELETE,
  team,
});

/**
 * Action for updating the status of a team
 */
export const updateTeamAction = (teamId, isActive, teamName, teamCode) => ({
  type: UPDATE_TEAM,
  teamId,
  isActive,
  teamName,
  teamCode,
});

/**
 * Set a flag that fetching team users
 */
export const teamUsersFetchAction = () => ({
  type: FETCH_TEAM_USERS_START,
});

/**
 * setting team users in store
 * @param payload : allteams []
 */
export const teamUsersFetchCompleteAction = payload => ({
  type: RECEIVE_TEAM_USERS,
  payload,
});

/**
 * Error when setting the team users list
 * @param payload : error status code
 */
export const teamUsersFetchErrorAction = payload => ({
  type: FETCH_TEAM_USERS_ERROR,
  payload,
});

/*
delete team member action
*/
export const teamMemberDeleteAction = member => ({
  type: TEAM_MEMBER_DELETE,
  member,
});

/*
add team member action
*/
export const teamMemberAddAction = member => ({
  type: TEAM_MEMBER_ADD,
  member,
});

export const updateVisibilityAction = (visibility, userId, teamId) => ({
  type: UPDATE_TEAM_MEMBER_VISIBILITY,
  visibility,
  userId,
  teamId,
});


export const getAllUserTeams = () => {
  console.log('Getting all user teams...');
  return async (dispatch) => {
    try {
      const res = await axios.get(ENDPOINTS.TEAM);
      console.log('Raw API response team codes:', 
        [...new Set(res.data.map(team => team.teamCode).filter(Boolean))]);

      const processedTeams = processTeamCodeData(res.data);
       console.log('Team codes after processing:', 
        processedTeams.teamCodes.map(tc => tc.value));
      
      // Dispatch an action to update the teams in the global state
      dispatch({
        type: types.RECEIVE_ALL_USER_TEAMS,
        payload: processedTeams.teams
      });

      dispatch({
        type: types.UPDATE_TEAM_CODE_DATA,
        payload: {
          teamCodeGroup: processedTeams.teamCodeGroup,
          teamCodes: processedTeams.teamCodes
        }
      });
      
      return processedTeams;
    } catch (error) {
      console.error('Error fetching user teams:', error);
      dispatch({
        type: types.FETCH_USER_TEAMS_ERROR
      });
      return { teams: [], teamCodeGroup: {}, teamCodes: [] };
    }
  };
};

// action to specifically update teams after modal operations
export const updateTeamsAfterModalAction = (teams) => {
  console.log('ACTION 1: updateTeamsAfterModalAction called with teams count:', teams.length);
  return async (dispatch) => {
    try {
      // Look for the new team
      const teamCodes = teams.map(team => team.teamCode).filter(Boolean);
      console.log('ACTION 2: Team codes in data:', teamCodes);
      
      // Process the data 
      console.log('ACTION 3: Processing teams data');
      const processedTeams = processTeamCodeData(teams);
      console.log('ACTION 4: Processed team data:', {
        teamCodeCount: Object.keys(processedTeams.teamCodeGroup).length,
        teamCodes: processedTeams.teamCodes.map(tc => tc.value)
      });
      
      // First update the teams array
      console.log('ACTION 5: Dispatching RECEIVE_ALL_USER_TEAMS');
      dispatch({
        type: types.RECEIVE_ALL_USER_TEAMS,
        payload: teams
      });
      
      // Then update the processed team code data
      console.log('ACTION 6: Dispatching UPDATE_TEAM_CODE_DATA');
      dispatch({
        type: types.UPDATE_TEAM_CODE_DATA,
        payload: {
          teamCodeGroup: processedTeams.teamCodeGroup,
          teamCodes: processedTeams.teamCodes
        }
      });
      
      console.log('ACTION 7: updateTeamsAfterModalAction completed');
      return processedTeams;
    } catch (error) {
      console.error('Error in updateTeamsAfterModalAction:', error);
      return { teams, teamCodeGroup: {}, teamCodes: [] };
    }
  };
};

export const processTeamCodeData = (teams = []) => {
  console.log('PROCESS 1: Processing teams data, count:', teams.length);
  
  // Filter out any undefined or null teams
  const validTeams = teams.filter(team => team && team._id);
  console.log('PROCESS 2: Valid teams count after filtering:', validTeams.length);
  
  const teamCodeGroup = {};
  
  // Group teams by team code
  validTeams.forEach(team => {
    const code = (team.teamCode && team.teamCode.trim()) || 'noCodeLabel';
    if (teamCodeGroup[code]) {
      teamCodeGroup[code].push(team);
    } else {
      teamCodeGroup[code] = [team];
    }
  });

  // Log all team codes found
  console.log('PROCESS 3: Team codes found:', Object.keys(teamCodeGroup));
  
  // Create team codes
  const teamCodes = Object.keys(teamCodeGroup)
    .filter(code => code !== 'noCodeLabel')
    .map(code => ({
      value: code,
      label: `${code} (${teamCodeGroup[code].length})`,
      _ids: teamCodeGroup[code]?.map(item => item._id) || [],
    }))
    .sort((a, b) => `${a.label}`.localeCompare(`${b.label}`));

  console.log('Team codes after filtering and formatting:', 
    teamCodes.map(tc => tc.value));

  // Add "No Code" option
  teamCodes.push({
    value: '',
    label: `Select All With NO Code (${teamCodeGroup.noCodeLabel?.length || 0})`,
    _ids: teamCodeGroup?.noCodeLabel?.map(item => item._id),
  });
  
  console.log('PROCESS 4: Final processed team codes:', teamCodes.map(tc => tc.value));

  return {
    teams: validTeams,
    teamCodeGroup,
    teamCodes
  };
};

/**
 * posting new team
 */
export const postNewTeam = (name, status, source, requestorUser, teamCode) => {
  const data = { 
    teamName: name, 
    isActive: status,
    teamCode: teamCode || ""
  };

  if (requestorUser) {
    data.requestor = requestorUser;
  }

  const config = source ? { cancelToken: source.token } : {};

  return async dispatch => {
    try {
      const res = await axios.post(ENDPOINTS.TEAM, data, config);
      // Update the Redux store with the new team
      dispatch(addNewTeam(res.data, true));
      
      // Fetch all teams to ensure synchronization
      const teamsData = await axios.get(ENDPOINTS.TEAM);
      const processedTeams = processTeamCodeData(teamsData.data);
      
      // Update teams array
      dispatch(updateAllTeamsAction(processedTeams.teams));
      
      // CRITICAL: Also update teamCodeGroup and teamCodes in Redux
      dispatch({
        type: 'UPDATE_TEAM_CODE_DATA',
        payload: {
          teamCodeGroup: processedTeams.teamCodeGroup,
          teamCodes: processedTeams.teamCodes
        }
      });
      
      return res;
    } catch (error) {
      console.error('Team creation error:', error);
      if (error.response) {
        return error.response;
      } else if (error.request) {
        return { status: 500, message: 'No response received from the server' };
      } else {
        return { status: 500, message: error.message };
      }
    }
  };
};

/**
 * delete an existing team
 * @param {*} teamId  - the team to be deleted
 * @param {*} requestorUser - the user making the request
 */
export const deleteTeam = (teamId, requestorUser) => {
  const url = ENDPOINTS.TEAM_DATA(teamId);
  return async dispatch => {
    try {
      // For DELETE requests with a body, we need to use axios with a config object
      const deleteTeamResponse = await axios.delete(url, {
        data: { requestor: requestorUser }
      });
      dispatch(teamsDeleteAction(teamId));
      return deleteTeamResponse;
    } catch (error) {
      console.error('Delete team error:', error);
      return error.response.data.error;
    }
  };
};

/**
 * updating the team status
 */
export const updateTeam = (teamName, teamId, isActive, teamCode) => {
  const requestData = { teamName, isActive, teamCode };
  const url = ENDPOINTS.TEAM_DATA(teamId);
  return async dispatch => {
    try {
      const updateTeamResponse = await axios.put(url, requestData);
      dispatch(updateTeamAction(teamId, isActive, teamName, teamCode));
      return updateTeamResponse;
    } catch (error) {
      return error.response.data.error;
    }
  };
};

/**
 * fetching team members
 */
export const getTeamMembers = teamId => {
  const teamMembersPromise = axios.get(ENDPOINTS.TEAM_USERS(teamId));
  return async dispatch => {
    await dispatch(teamUsersFetchAction());
    return teamMembersPromise
      .then(res => {
        dispatch(teamUsersFetchCompleteAction(res.data));
        return res.data;
      })
      .catch(() => {
        dispatch(teamUsersFetchErrorAction());
      });
  };
};

/**
 * delete an existing team member
 * @param {*} teamId  - the team to be deleted
 */
export const deleteTeamMember = (teamId, userId) => {
  const requestData = { userId, operation: 'UnAssign' };
  const teamMemberDeletePromise = axios.post(ENDPOINTS.TEAM_USERS(teamId), requestData);
  return async dispatch => {
    teamMemberDeletePromise.then(() => {
      dispatch(teamMemberDeleteAction(userId));
    });
  };
};

/**
 * Adding an existing user to team
 */
export const addTeamMember = (teamId, userId, firstName, lastName, role, addDateTime, requestorUser) => {
  const requestData = { 
    userId, 
    operation: 'Assign'
  };
  
  // Add requestor information if available
  if (requestorUser) {
    requestData.requestor = requestorUser;
  }
  
  console.log(`Adding member ${firstName} ${lastName} to team ${teamId}`, requestData);
  console.log('addTeamMember requestData:', requestData);
  
  const teamMemberAddPromise = axios.post(ENDPOINTS.TEAM_USERS(teamId), requestData);
  return async dispatch => {
    try {
      const response = await teamMemberAddPromise;
      console.log("Team member add response:", response);
      dispatch(teamMemberAddAction(response.data.newMember));
      return response.data;
    } catch (error) {
      console.error("Error adding team member:", error);
      console.error("Error response data:", error.response?.data);
      throw error;
    }
  };
};

export const updateTeamMemeberVisibility = (teamId, userId, visibility) => {
  const updateData = { visibility, userId, teamId };
  const updateVisibilityPromise = axios.put(ENDPOINTS.TEAM, updateData);

  return async dispatch => {
    updateVisibilityPromise
      .then(res => {
        dispatch(updateVisibilityAction(visibility, userId, teamId));
      })
      .catch(error => {
        if (error.response) {
          // The request was made and the server responded with a status code
          console.error('Error updating visibility:', error.response.data);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('Error updating visibility: No response received');
        } else {
          // Something happened in setting up the request that triggered an error
          console.error('Error updating visibility:', error.message);
        }
      });
  };
};

/**
 * Set allTeamCode in store
 */

export const fetchAllTeamCodeSucess = payload => ({
  type: FETCH_ALL_TEAM_CODE_SUCCESS,
  payload,
});

/**
 *
 * @param {*} name
 * @param {*} status
 * @returns
 */

export const getAllTeamCode = () => {
  return async dispatch => {
    try {
      const res = await axios.get(ENDPOINTS.USER_ALL_TEAM_CODE);
      if (!res || !res.data) {
        throw new Error('Invalid response from server');
      }
      dispatch(fetchAllTeamCodeSucess(res.data));
    } catch (error) {
      dispatch({
        type: FETCH_ALL_TEAM_CODE_FAILURE,
      });
    }
    // const userTeamsPromise = axios.get(ENDPOINTS.GET_ALL_USER_PROFILES);
    // return async (dispatch) => {
    //   return userTeamsPromise
    //     .then((res) => {
    //       dispatch(fetchAllTeamCodeSucess(res.data));
    //     })
    //     .catch((err) => {
    //       dispatch({
    //         type: FETCH_ALL_TEAM_CODE_FAILURE,
    //       });
    //     });
  };
};


export const updateAllTeamsAction = (teams) => ({
  type: types.UPDATE_ALL_TEAMS,
  payload: teams,
});
