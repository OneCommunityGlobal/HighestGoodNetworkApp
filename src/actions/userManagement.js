import axios from 'axios';
import {
  FETCH_USER_PROFILES_ERROR,
  FETCH_USER_PROFILES_START,
  RECEIVE_ALL_USER_PROFILES,
  USER_PROFILE_UPDATE,
  USER_PROFILE_DELETE
} from '../constants/userManagement'
import { ENDPOINTS } from '../utils/URL'
import { UserStatus } from '../utils/enums'
import moment from 'moment'

/**
 * fetching all user profiles
 */
export const getAllUserProfile = () => {
  const userProfilesPromise = axios.get(ENDPOINTS.USER_PROFILES)
  return async dispatch => {
    await dispatch(userProfilesFetchStartAction());
    userProfilesPromise.then(res => {
      dispatch(userProfilesFetchCompleteACtion(res.data))
    }).catch(err => {
      dispatch(userProfilesFetchErrorAction());
    })
  }
}

/**
 * update the user profile
 * @param {*} user - the user to be updated
 * @param {*} status  - Active/InActive
 */
export const updateUserStatus = (user, status, reactivationDate) => {
  const userProfile = Object.assign({}, user);
  userProfile.isActive = (status === UserStatus.Active);
  userProfile.reactivationDate = reactivationDate;
  const patchData = { status: status, reactivationDate: reactivationDate };
  if (status === UserStatus.InActive) {
    patchData.endDate = moment(new Date()).format('YYYY-MM-DD')
    userProfile.endDate = moment(new Date()).format('YYYY-MM-DD')
  }else {
    patchData.endDate = undefined;
    userProfile.endDate = undefined;
  }

  const updateProfilePromise = axios.patch(ENDPOINTS.USER_PROFILE(user._id), patchData)
  return async dispatch => {
    updateProfilePromise.then(res => {
      dispatch(userProfileUpdateAction(userProfile));
    })
  }
}

/**
 * delete an existing user
 * @param {*} user  - the user to be deleted
 * @param {*} option - archive / delete
 */
export const deleteUser = (user, option) => {
  const requestData = { option: option, userId: user._id };
  const deleteProfilePromise = axios.delete(ENDPOINTS.USER_PROFILE(user._id), { data: requestData })
  return async dispatch => {
    deleteProfilePromise.then(res => {
      dispatch(userProfileDeleteAction(user));
    }).catch(err => {
      dispatch(userProfileDeleteAction(user));
    })
  }
}

/**
 * Set a flag that fetching user profiles
 */
export const userProfilesFetchStartAction = () => {
  return {
    type: FETCH_USER_PROFILES_START
  }
}

/**
 * set Projects in store
 * @param payload : projects []
 */
export const userProfilesFetchCompleteACtion = (payload) => {
  return {
    type: RECEIVE_ALL_USER_PROFILES,
    payload
  }
}


/**
 * Error when setting the user profiles list
 * @param payload : error status code
 */
export const userProfilesFetchErrorAction = (payload) => {
  return {
    type: FETCH_USER_PROFILES_ERROR,
    payload
  }
}

/**
 * Action for Updating an user profile
 * @param {*} user : the updated user
 */
export const userProfileUpdateAction = (user) => {
  return {
    type: USER_PROFILE_UPDATE,
    user
  }
}

/**
 * Delete user profile action
 * @param {*} user : the deleted user
 */
export const userProfileDeleteAction = (user) => {
  return {
    type: USER_PROFILE_DELETE,
    user
  }
}
