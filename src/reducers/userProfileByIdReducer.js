import { GET_USER_PROFILE, EDIT_FIRST_NAME } from '../constants/userProfile'

const initialUserProfileState = {
	firstName: '',
	lastName: '',
	isActive: ''
}
export const userProfileByIdReducer = (userProfile = initialUserProfileState, action) => {
	if (action.type === GET_USER_PROFILE) {
		return action.payload
	}

	if (action.type === EDIT_FIRST_NAME) {
		return { ...userProfile, firstName: action.payload }
	}

	if (action.type === 'CLEAR_USER_PROFILE') {
		return null
	}

	return userProfile
}
