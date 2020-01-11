import { getUserProfile as getUserProfileActionCreator } from '../actionCreators/userProfile'
import { ENDPOINTS } from '../utils/URL'
import axios from 'axios'
import UserProfile from '../components/UserProfile/UserProfile'

import { CLEAR_USER_PROFILE } from '../actionCreators/userProfile'
export const getUserProfile = userId => {
  const url = ENDPOINTS.USER_PROFILE(userId)
  return async dispatch => {
    const res = await axios.get(url)

    await dispatch(getUserProfileActionCreator(res.data))
  }
}

export const clearUserProfile = () => {
  return { type: CLEAR_USER_PROFILE }
}

export const updateUserProfile = (userId, userProfile) => {
  const url = ENDPOINTS.USER_PROFILE(userId)
  console.log('userProfile', userProfile)
  return async dispatch => {
    const res = await axios.put(url, userProfile)

    console.log('Result is ', res, userProfile)

    if (res.status === 200) {
      await dispatch(getUserProfileActionCreator(userProfile))
    }
  }
}
