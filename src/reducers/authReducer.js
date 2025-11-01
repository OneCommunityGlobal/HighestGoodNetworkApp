import { isEmpty } from 'lodash';
import { SET_CURRENT_USER, SET_HEADER_DATA, START_FORCE_LOGOUT, STOP_FORCE_LOGOUT } from '../constants/auth';

const initialState = {
  isAuthenticated: false,
  user: {},
  firstName: '',
  profilePic: '',
  forceLogoutAt: null,
  timerId: null,
};

// eslint-disable-next-line default-param-last
export const authReducer = (auth = initialState, action) => {
  if (action.type === SET_CURRENT_USER) {
    if (!action.payload) {
      return {
        ...initialState,
        forceLogoutAt: null, // Ensure logout clears these values
        timerId: null,
      };
    }
    if (action.payload.new) {
      return {
        ...auth,
        isAuthenticated: false,
        user: action.payload,
      };
    }
    return {
      ...auth,
      isAuthenticated: !isEmpty(action.payload),
      user: action.payload,
    };
  }
  if (action.type === SET_HEADER_DATA) {
    return {
      ...auth,
      firstName: action.payload.firstName,
      profilePic: action.payload.profilePic,
    };
  }
  if (action.type === START_FORCE_LOGOUT) {
    return {
      ...auth,
      forceLogoutAt: action.payload.forceLogoutAt,
      timerId: action.payload.timerId,
    };
  }
  if (action.type === STOP_FORCE_LOGOUT) {
    return {
      ...auth,
      forceLogoutAt: null,
      timerId: null,
    };
  }

  return auth;
};

export default authReducer;
