import {
  GET_PROJECT_BY_USER_NAME,
  USER_NOT_FOUND_ERROR,
} from '../constants/userProfile';

const initialUserProject = {
  projects: [],
  error: null,
};

// Adjusted parameter order
export default function userProjectsByUserNameReducer(
  action,
  state = initialUserProject
) {
  switch (action.type) {
    case GET_PROJECT_BY_USER_NAME:
      return {
        ...state,
        projects: action.payload,
      };
    case USER_NOT_FOUND_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
}
