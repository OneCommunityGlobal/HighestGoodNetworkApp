import axios from 'axios'
import {
	getUserProfile as getUserProfileActionCreator,
	CLEAR_USER_PROFILE
} from '../constants/userProfile'
import { ENDPOINTS } from '../utils/URL'

export const getUserProfile = userId => {
	const url = ENDPOINTS.USER_PROFILE(userId)
	return async dispatch => {
		const res = await axios.get(url)

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
