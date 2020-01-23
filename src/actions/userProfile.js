import axios from 'axios'
import {
	getUserProfile as getUserProfileActionCreator,
	CLEAR_USER_PROFILE
} from '../constants/userProfile'
import { GET_ERRORS } from '../constants/errors'
import { ENDPOINTS } from '../utils/URL'

export const getUserProfile = userId => {
	const url = ENDPOINTS.USER_PROFILE(userId)
	return async dispatch => {
		const res = await axios.get(url)
		console.log('userrprofie', res)

		await dispatch(getUserProfileActionCreator(res.data))
	}
}

export const clearUserProfile = () => ({ type: CLEAR_USER_PROFILE })

export const updateUserProfile = (userId, userProfile) => {
	const url = ENDPOINTS.USER_PROFILE(userId)
	console.log('userProfile', userProfile)
	return async dispatch => {
		const res = await axios.put(url, userProfile)

		console.log('Result is ', res, userProfile)

		if (res.status === 200) {
			await dispatch(getUserProfileActionCreator(userProfile))
		}
		return res.status
	}
}

export const updatePassword = (userId, newpasswordData) => {
  const url = ENDPOINTS.UPDATE_PASSWORD(userId)
  return async dispatch => {
    try {
      const res = await axios.patch(url, newpasswordData)
      return res.status
    } catch(e){
      dispatch({
        type: GET_ERRORS,
        payload: e.response.data
      })
      return e.response.status
    }
	}
}
