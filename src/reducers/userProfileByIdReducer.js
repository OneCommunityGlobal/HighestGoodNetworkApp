import {
  GET_USER_PROFILE,
  EDIT_USER_PROFILE,
  GET_USER_TASKS,
} from '../constants/userProfile';

const initialUserProfileState = {
  firstName: '',
  lastName: '',
  jobTitle: '',
  isActive: '',
};

export const updateObject = (oldObject, updatedProperties) => {
  return {
    ...oldObject,
    ...updatedProperties,
  };
};

// Adjusted parameter order to place the default parameter last
export const userProfileByIdReducer = (
  action,
  userProfile = initialUserProfileState
) => {
  if (action.type === GET_USER_PROFILE) {
    return action.payload;
  }

  if (action.type === EDIT_USER_PROFILE) {
    return { ...userProfile, ...action.payload };
  }

  if (action.type === 'CLEAR_USER_PROFILE') {
    return null;
  }

  return userProfile;
};

// Adjusted parameter order
export const userTaskByIdReducer = (action, userTask = []) => {
  if (action.type === GET_USER_TASKS) {
    return action.payload;
  }

  return userTask;
};
