import {
  GET_WARNINGS_BY_USER_ID,
  POST_WARNINGS_BY_USER_ID,
  DELETE_WARNINGS_BY_USER_ID,
  CURRENT_WARNINGS,
  POST_NEW_WARNING,
} from '../constants/warning';

export const warningsByUserIdReducer = (state = [], action) => {
  switch (action.type) {
    case GET_WARNINGS_BY_USER_ID:
      return action.payload;

    case POST_WARNINGS_BY_USER_ID:
      return {
        ...state,
        ...action.payload,
      };
    case CURRENT_WARNINGS:
      return action.payload;
    case POST_NEW_WARNING:
      return action.payload;
    case DELETE_WARNINGS_BY_USER_ID:
      return action.payload;

    default:
      return state;
  }
};
