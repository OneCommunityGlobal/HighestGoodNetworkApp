import axios from 'axios'
import {
  FETCH_USER_PROFILES_ERROR,
  FETCH_USER_PROFILES_START,
  RECEIVE_USER_PROFILES
} from '../constants/userManagement'
import { ENDPOINTS } from '../utils/URL'

/**
 * fetching all user profiles
 */
export const getAllUserProfile = () => {
  const userProfilesPromise = axios.get(ENDPOINTS.USER_PROFILES)
  return async dispatch => {
    await dispatch(userProfilesFetchStart());
    userProfilesPromise.then(res => {
      dispatch(userProfilesFetchComplete(res.data))
    }).catch(err => {
      dispatch(userProfilesFetchError());
    })
  }
}

/**
 * Set a flag that fetching user profiles
 */
export const userProfilesFetchStart = () => {
  return {
    type: FETCH_USER_PROFILES_START
  }
}

/**
 * set Projects in store
 * @param payload : projects []
 */
export const userProfilesFetchComplete = payload => {
  return {
    type: RECEIVE_USER_PROFILES,
    payload
  }
}


/**
 * Error when setting the user profiles list
 * @param payload : error status code
 */
export const userProfilesFetchError = payload => {
  return {
    type: FETCH_USER_PROFILES_ERROR,
    payload
  }
}