import { GET_USER_PROFILE, EDIT_USER_PROFILE, GET_USER_TASKS } from '../constants/userProfile';

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

// eslint-disable-next-line default-param-last
export const userProfileByIdReducer = (userProfile = initialUserProfileState, action) => {
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

// eslint-disable-next-line default-param-last
export const userTaskByIdReducer = (userTask = [], action) => {
  if (action.type === GET_USER_TASKS) {
    return action.payload;
  }

  return userTask;
};
