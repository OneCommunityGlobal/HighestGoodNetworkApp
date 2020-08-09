import axios from 'axios'

import { ENDPOINTS } from '../utils/URL'
import { UserStatus } from '../utils/enums'
import {
  RECEIVE_ALL_USER_TEAMS,
  FETCH_USER_TEAMS_START,
  FETCH_USER_TEAMS_ERROR,
  USER_TEAMS_UPDATE
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

/**
 * update the user profile
 * @param {*} team - the user to be updated
 * @param {*} status  - Active/InActive
 */
export const updateTeamsStatus = (team, status, reactivationDate) => {
  debugger;
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
 * delete an existing user
 * @param {*} user  - the user to be deleted
 * @param {*} option - archive / delete
 */
// export const deleteUser = (user, option) => {
//   const requestData = { option: option, userId: user._id };
//   const deleteProfilePromise = axios.delete(ENDPOINTS.USER_PROFILE(user._id), { data: requestData })
//   return async dispatch => {
//     deleteProfilePromise.then(res => {
//       dispatch(userProfileDeleteAction(user));
//     }).catch(err => {
//       dispatch(userProfileDeleteAction(user));
//     })
//   }
// }

/**
 * Set a flag that fetching user profiles
 */
export const userTeamsFetchStartAction = () => {
  return {
    type: FETCH_USER_TEAMS_START
  }
}

/**
 * set Projects in store
 * @param payload : projects []
 */
export const userTeamsFetchCompleteACtion = (payload) => {
  return {
    type: RECEIVE_ALL_USER_TEAMS,
    payload
  }
}


/**
 * Error when setting the user profiles list
 * @param payload : error status code
 */
export const userTeamsFetchErrorAction = (payload) => {
  return {
    type: FETCH_USER_TEAMS_ERROR,
    payload
  }
}

/**
 * Action for Updating an user profile
 * @param {*} team : the updated user
 */
export const userTeamsUpdateAction = (team) => {
  return {
    type: USER_TEAMS_UPDATE,
    team
  }
}

/**
 * Delete user profile action
 * @param {*} user : the deleted user
 */
// export const userTeamsDeleteAction = (user) => {
//   return {
//     type: USER_TEAMS_DELETE,
//     user
//   }
// }
