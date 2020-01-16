import { GET_USER_PROFILE } from '../actionCreators/userProfile';

const initialUserProfileState = {
  firstName: '',
  lastName: '',
  isActive: '',
  profilePic: ''
};
export const userProfileByIdReducer = (
  userProfile = initialUserProfileState,
  action,
) => {
  if (action.type === GET_USER_PROFILE) {
    return action.payload;
  }

  if (action.type === 'CLEAR_USER_PROFILE') {
    return null;
  }

  return userProfile;
};
