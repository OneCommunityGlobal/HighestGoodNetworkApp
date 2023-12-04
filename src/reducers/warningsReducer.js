import { GET_WARNINGS_BY_ID } from '../constants/warning';

export const warningsByUserIdReducer = (userProfile = {}, action) => {
  if (action.type === GET_WARNINGS_BY_ID) {
    return action.payload;
  }
  return userProfile;
};
