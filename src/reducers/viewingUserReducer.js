import { isEmpty } from "lodash";
import { SET_VIEWING_USER, SET_VIEWING_USER_HEADER_DATA } from "../constants/viewingUser";

const initialState = {
  isViewing: false, 
  user: {},
  firstName: '',
  profilePic: '/pfp-default-header.png',
  role: '',
};

export const viewingUserReducer = (viewingUser = initialState, action) => {
  if (action.type === SET_VIEWING_USER) {
    if (!action.payload) {
      return initialState;
    } else if (action.payload.new) {
      return {
        ...initialState, 
        isViewing: action.payload.isViewing,
        role: action.payload.role,
        firstName: action.payload.firstName,
        profilePic: action.payload.profilePic || initialState.profilePic,
        user: action.payload.user,
      };
    } else {
      return {
        ...viewingUser,
        isViewing: action.payload.isViewing,
        role: action.payload.role || initialState.role,
        firstName: action.payload.firstName || initialState.firstName,
        profilePic: action.payload.profilePic || initialState.profilePic,
        user: action.payload.user || initialState.user,
      };
    }
  } else if (action.type === SET_VIEWING_USER_HEADER_DATA) {
    return {
      ...viewingUser,
      firstName: action.payload.firstName,
      profilePic: action.payload.profilePic || initialState.profilePic,
      role: action.payload.role,
      user: action.payload.user,
    };
  }

  return viewingUser;
};