/* eslint-disable no-underscore-dangle */
import axios from 'axios';

import { ENDPOINTS } from '../utils/URL';
import { UserStatus } from '../utils/enums';
import {
  RECEIVE_ALL_USER_TEAMS,
  FETCH_USER_TEAMS_START,
  FETCH_USER_TEAMS_ERROR,
  USER_TEAMS_UPDATE,
  UPDATE_TEAM,
  ADD_NEW_TEAM,
  TEAMS_DELETE,
  FETCH_TEAM_USERS_START,
  RECEIVE_TEAM_USERS,
  FETCH_TEAM_USERS_ERROR,
  TEAM_MEMBER_DELETE,
} from '../constants/allTeamsConstants';

/**
 * Set a flag that fetching teams
 */
export const userTeamsFetchStartAction = () => ({
  type: FETCH_USER_TEAMS_START,
});

/**
 * set allteams in store
 * @param payload : allteams []
 */
export const userTeamsFetchCompleteACtion = (payload) => ({
  type: RECEIVE_ALL_USER_TEAMS,
  payload,
});

/**
 * Error when setting the teams list
 * @param payload : error status code
 */
export const userTeamsFetchErrorAction = (payload) => ({
  type: FETCH_USER_TEAMS_ERROR,
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
export const updateTeamAction = (teamId, isActive) => ({
  type: UPDATE_TEAM,
  teamId,
  isActive,

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

export const teamMemberDeleteAction = (member) => ({
  type: TEAM_MEMBER_DELETE,
  member,
});
/**
 * fetching all user teams
 */
export const getAllUserTeams = () => {
  const userTeamsPromise = axios.get(ENDPOINTS.TEAM);
  return async (dispatch) => {
    await dispatch(userTeamsFetchStartAction());
    userTeamsPromise.then((res) => {
      dispatch(userTeamsFetchCompleteACtion(res.data));
    }).catch(() => {
      dispatch(userTeamsFetchErrorAction());
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
 * @param {*} option - archive / delete
 */

export const deleteUser = (teamId) => {
  // const requestData = { option: option, teamId: team._id };
  const deleteTeamPromise = axios.delete(ENDPOINTS.TEAM_DATA(teamId));
  return async (dispatch) => {
    deleteTeamPromise.then(() => {
      dispatch(teamsDeleteAction(teamId));
    }).catch(() => {
      dispatch(teamsDeleteAction(teamId));
    });
  };
};

/**
 * updating the team status
 */
export const updateTeam = (teamName, teamId, isActive) => {
  const requestData = { teamName, isActive };
  const deleteTeamPromise = axios.put(ENDPOINTS.TEAM_DATA(teamId), requestData);
  return async (dispatch) => {
    deleteTeamPromise.then(() => {
      dispatch(updateTeamAction(teamId, isActive));
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
    teamMembersPromise.then((res) => {
      dispatch(teamUsersFetchCompleteAction(res.data));
    }).catch(() => {
      dispatch(teamUsersFetchErrorAction());
    });
  };
};

/**
 * delete an existing team member
 * @param {*} teamId  - the team to be deleted
 * @param {*} option - archive / delete
 */

export const deleteTeamMember = (teamId) => {
  // const requestData = { option: option, teamId: team._id };
  const teamMemberDeletePromise = axios.get(ENDPOINTS.TEAM_USERS(teamId));
  return async (dispatch) => {
    teamMemberDeletePromise.then(() => {
      dispatch(teamMemberDeleteAction(teamId));
    }).catch(() => {
      dispatch(teamMemberDeleteAction(teamId));
    });
  };
};

