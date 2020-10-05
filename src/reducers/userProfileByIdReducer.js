import { object } from 'joi';
import { GET_USER_PROFILE, EDIT_USER_PROFILE, ASSIGN_TEAM_TO_TEAMS_LIST } from '../constants/userProfile'

const initialUserProfileState = {
	firstName: '',
	lastName: '',
	jobTitle: '',
	isActive: ''
}

export const updateObject = (oldObject, updatedProperties) => {
	return {
		...oldObject,
		...updatedProperties
	};
};

export const userProfileByIdReducer = (userProfile = initialUserProfileState, action) => {
	if (action.type === GET_USER_PROFILE) {
		return action.payload
	}

	if (action.type === EDIT_USER_PROFILE) {
		return { ...userProfile, ...action.payload }
	}
	if (action.type === ASSIGN_TEAM_TO_TEAMS_LIST) {
		debugger;
		let _userProfile = Object.assign({}, userProfile)
		_userProfile.teams = [..._userProfile.teams, action.payload]
		return _userProfile;

	}

	if (action.type === 'CLEAR_USER_PROFILE') {
		return null
	}

	return userProfile
}
