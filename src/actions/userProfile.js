import axios from 'axios';
import {
	getUserProfile as getUserProfileActionCreator,
	editFirstName as editFirstNameActionCreator,
	editUserProfile as editUserProfileActionCreator,
	CLEAR_USER_PROFILE,
} from '../constants/userProfile';
import { ENDPOINTS } from '../utils/URL';

export const getUserProfile = (userId) => {
	const url = ENDPOINTS.USER_PROFILE(userId);
	return async (dispatch) => {
		let loggedOut = false;
		const res = await axios.get(url).catch((error)=>{
			if (error.status==401) {
				//logout error
				loggedOut = true;
			}
		});
		// console.log('GET user profile: response:', res)
		if (!loggedOut) {
			await dispatch(getUserProfileActionCreator(res.data));
		}
	};
};

export const editFirstName = data => (dispatch) => {
	dispatch(editFirstNameActionCreator(data));
};

export const editUserProfile = data => (dispatch) => {
	dispatch(editUserProfileActionCreator(data));
};

export const clearUserProfile = () => ({ type: CLEAR_USER_PROFILE });

export const updateUserProfile = (userId, userProfile) => {
	// console.log('updateUserProfile');
	const url = ENDPOINTS.USER_PROFILE(userId);
	// console.log('userProfile', userProfile);
	return async (dispatch) => {
		const res = await axios.put(url, userProfile);

		if (res.status === 200) {
			await dispatch(getUserProfileActionCreator(userProfile));
		}
		return res.status;
	};
};
