import _ from 'lodash';
import { SET_CURRENT_USER, SET_HEADER_DATA } from '../constants/auth';

const initialState = {
  isAuthenticated: false,
  user: {},
  firstName: '',
  profilePic: '',
};

export const authReducer = (auth = initialState, action) => {
  if (action.type === SET_CURRENT_USER) {
    if (!action.payload) {
      return initialState;
    } else if (action.payload.new) {
      return {
        ...auth,
        isAuthenticated: false,
        user: action.payload,
      };
    } else {
      return {
        ...auth,
        isAuthenticated: !_.isEmpty(action.payload),
        user: action.payload,
      };
    }
  } else if (action.type === SET_HEADER_DATA) {
    return {
      ...auth,
      firstName: action.payload.firstName,
      profilePic: action.payload.profilePic,
    };
  }

  return auth;
};
