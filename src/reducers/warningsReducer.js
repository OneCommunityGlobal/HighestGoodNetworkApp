import { GET_WARNINGS_BY_USER_ID, POST_WARNINGS_BY_USER_ID } from '../constants/warning';

export const warningsByUserIdReducer = (userProfile = {}, action) => {
  switch (action.type) {
    case GET_WARNINGS_BY_USER_ID:
      return action.payload;

    case POST_WARNINGS_BY_USER_ID:
      console.log('post user id called');
      return action.payload;

    default:
      return userProfile;
  }
};
