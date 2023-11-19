import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';

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
} from '../constants/allTeamsConstants';

/**
 * set allteams in store
 * @param payload : allteams []
 */
export const teamMembersFectchACtion = (payload) => ({
  type: RECEIVE_ALL_USER_TEAMS,
  payload,
});

/**
 * Action for Updating an teams
 * @param {*} team : the updated user
 */
export const userTeamsUpdateAction = (team) => ({
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
export const teamsDeleteAction = (team) => ({
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
export const teamUsersFetchCompleteAction = (payload) => ({
  type: RECEIVE_TEAM_USERS,
  payload,
});

/**
 * Error when setting the team users list
 * @param payload : error status code
 */
export const teamUsersFetchErrorAction = (payload) => ({
  type: FETCH_TEAM_USERS_ERROR,
  payload,
});

/*
delete team member action
*/
export const teamMemberDeleteAction = (member) => ({
  type: TEAM_MEMBER_DELETE,
  member,
});

/*
delete team member action
*/
export const teamMemberAddAction = (member) => ({
  type: TEAM_MEMBER_ADD,
  member,
});

/**
 * fetching all user teams
 */
export const getAllUserTeams = () => {
  const userTeamsPromise = axios.get(ENDPOINTS.TEAM);
  return async (dispatch) => {
    return userTeamsPromise
      .then((res) => {
        dispatch(teamMembersFectchACtion(res.data));
        return res.data;
        // console.log("getAllUserTeams: res:", res.data)
      })
      .catch(() => {
        dispatch(teamMembersFectchACtion(undefined));
      });
  };
};

/**
 * posting new team
 */
export const postNewTeam = (name, status) => {
  const data = { teamName: name, isActive: status };
  // const url = ENDPOINTS.TEAM
  const teamCreationPromise = axios.post(ENDPOINTS.TEAM, data);
  return (dispatch) => {
    teamCreationPromise.then((res) => {
      dispatch(addNewTeam(res.data, true));
    });
  };
};

/**
 * delete an existing team
 * @param {*} teamId  - the team to be deleted
 */
export const deleteTeam = (teamId) => {
  const deleteTeamPromise = axios.delete(ENDPOINTS.TEAM_DATA(teamId));
  return async (dispatch) => {
    deleteTeamPromise.then(() => {
      dispatch(teamsDeleteAction(teamId));
    });
  };
};

/**
 * updating the team status
 */
export const updateTeam = (teamName, teamId, isActive, teamCode) => {
  const requestData = { teamName, isActive, teamCode };
  const deleteTeamPromise = axios.put(ENDPOINTS.TEAM_DATA(teamId), requestData);
  return async (dispatch) => {
    deleteTeamPromise.then(() => {
      dispatch(updateTeamAction(teamId, isActive, teamName, teamCode));
    });
  };
};

/**
 * fetching team members
 */
export const getTeamMembers = (teamId) => {
  const teamMembersPromise = axios.get(ENDPOINTS.TEAM_USERS(teamId));
  return async (dispatch) => {
    await dispatch(teamUsersFetchAction());
    return teamMembersPromise
      .then((res) => {
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
  const requestData = { users: [{ userId, operation: 'UnAssign' }] };
  const teamMemberDeletePromise = axios.post(ENDPOINTS.TEAM_USERS(teamId), requestData);
  return async (dispatch) => {
    teamMemberDeletePromise.then(() => {
      dispatch(teamMemberDeleteAction(userId));
    });
  };
};

/**
 * Adding an existing user to team
 */
export const addTeamMember = (teamId, userId, firstName, lastName, role, addDateTime) => {
  const requestData = { users: [{ userId, operation: 'Assign' }] };
  const teamMemberAddPromise = axios.post(ENDPOINTS.TEAM_USERS(teamId), requestData);
  return async (dispatch) => {
    teamMemberAddPromise.then(() => {
      dispatch(teamMemberAddAction({ _id: userId, firstName, lastName, role, addDateTime }));
    });
  };
};
