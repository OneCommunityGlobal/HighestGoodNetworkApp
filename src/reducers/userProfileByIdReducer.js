import { GET_USER_PROFILE } from '../constants/userProfile'

const initialUserProfileState = {
	firstName: '',
	lastName: '',
	isActive: ''
}
export const userProfileByIdReducer = (userProfile = initialUserProfileState, action) => {
	console.log('action', userProfile, action)
	if (action.type === GET_USER_PROFILE) {
		return action.payload
	}

	if (action.type === 'CLEAR_USER_PROFILE') {
		return null
	}

	return userProfile
}
