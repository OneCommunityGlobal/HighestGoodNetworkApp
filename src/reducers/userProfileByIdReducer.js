import { GET_USER_PROFILE, EDIT_USER_PROFILE } from '../constants/userProfile'

const initialUserProfileState = {
	firstName: '',
	lastName: '',
	isActive: ''
}
export const userProfileByIdReducer = (userProfile = initialUserProfileState, action) => {
	if (action.type === GET_USER_PROFILE) {
		return action.payload
	}

	if (action.type === EDIT_USER_PROFILE) {
		console.log('Payload is ', action.payload)

		return { ...userProfile, ...action.payload }
		//return userProfile
	}

	if (action.type === 'CLEAR_USER_PROFILE') {
		return null
	}

	return userProfile
}
