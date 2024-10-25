import {
  GET_WARNINGS_BY_USER_ID,
  POST_WARNINGS_BY_USER_ID,
  DELETE_WARNINGS_BY_USER_ID,
} from '../constants/warning';

// eslint-disable-next-line default-param-last
export default function warningsByUserIdReducer(state = [], action) {
  switch (action.type) {
    case GET_WARNINGS_BY_USER_ID:
      return action.payload;

    case POST_WARNINGS_BY_USER_ID:
      return {
        ...state,
        ...action.payload,
      };

    case DELETE_WARNINGS_BY_USER_ID:
      return action.payload;

    default:
      return state;
  }
}
