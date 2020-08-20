import axios from 'axios'

import { ENDPOINTS } from '../utils/URL'
import { UserStatus } from '../utils/enums'
import {
  RECEIVE_ALL_USER_TEAMS,
  FETCH_USER_TEAMS_START,
  FETCH_USER_TEAMS_ERROR,
  USER_TEAMS_UPDATE,
  UPDATE_TEAM,
  ADD_NEW_TEAM,
  TEAMS_DELETE
} from '../constants/allTeamsConstants'

/**
 * fetching all user teams
 */
export const getAllUserTeams = () => {
  debugger;
  const userTeamsPromise = axios.get(ENDPOINTS.TEAM)
  return async dispatch => {
    await dispatch(userTeamsFetchStartAction());
    userTeamsPromise.then(res => {
      dispatch(userTeamsFetchCompleteACtion(res.data))
    }).catch(err => {
      dispatch(userTeamsFetchErrorAction());
    })
  }
}

export const postNewTeam = (name, status) => {
  const data = { teamName: name, isActive: status }
  // const url = ENDPOINTS.TEAM
  const teamCreationPromise = axios.post(ENDPOINTS.TEAM, data)
  return dispatch => {
    teamCreationPromise.then(res => {
      console.log(res.data)
      dispatch(addNewTeam(res.data, true))
    })


  }
}

/**
 * update the teams
 * @param {*} team - the team to be updated
 * @param {*} status  - Active/InActive
 */
export const updateTeamsStatus = (team, status, reactivationDate) => {
  const allTeams = Object.assign({}, team);
  allTeams.isActive = (status === UserStatus.Active);
  allTeams.reactivationDate = reactivationDate;
  const patchData = { status: status, reactivationDate: reactivationDate };
  const updateTeamsPromise = axios.patch(ENDPOINTS.TEAM(team._id), patchData)
  return async dispatch => {
    updateTeamsPromise.then(res => {
      dispatch(userTeamsUpdateAction(allTeams));
    })
  }
}

/**
 * delete an existing team
 * @param {*} team  - the team to be deleted
 * @param {*} option - archive / delete
 */

export const deleteUser = (teamId, option) => {
  // const requestData = { option: option, teamId: team._id };
  const deleteTeamPromise = axios.delete(ENDPOINTS.TEAM_DELETE(teamId))
  return async dispatch => {
    deleteTeamPromise.then(res => {
      dispatch(teamsDeleteAction(teamId));
    }).catch(err => {
      dispatch(teamsDeleteAction(teamId));
    })
  }
}

export const updateTeam = (teamName, teamId, isActive) => {
  const requestData = { teamName: teamName, isActive: isActive };
  const deleteTeamPromise = axios.put(ENDPOINTS.TEAM_UPDATE(teamId), requestData)
  return async dispatch => {
    deleteTeamPromise.then(res => {
      debugger;
      dispatch(updateTeamAction(teamId, isActive));
    })
  }
}






/**
 * Set a flag that fetching teams
 */
export const userTeamsFetchStartAction = () => {
  return {
    type: FETCH_USER_TEAMS_START
  }
}

/**
 * set allteams in store
 * @param payload : allteams []
 */
export const userTeamsFetchCompleteACtion = (payload) => {
  return {
    type: RECEIVE_ALL_USER_TEAMS,
    payload
  }
}


/**
 * Error when setting the teams list
 * @param payload : error status code
 */
export const userTeamsFetchErrorAction = (payload) => {
  return {
    type: FETCH_USER_TEAMS_ERROR,
    payload
  }
}

/**
 * Action for Updating an teams
 * @param {*} team : the updated user
 */
export const userTeamsUpdateAction = (team) => {
  return {
    type: USER_TEAMS_UPDATE,
    team
  }
}

/**
 * Action for Creating New Team
 */
export const addNewTeam = (payload, status) => {
  return {
    type: ADD_NEW_TEAM,
    payload,
    status
  }
}
/**
 * Delete user profile action
 * @param {*} team : the deleted team
 */
export const teamsDeleteAction = (team) => {
  return {
    type: TEAMS_DELETE,
    team
  }
}

export const updateTeamAction = (teamId, isActive) => {
  return {
    type: UPDATE_TEAM,
    teamId, isActive

  }
}