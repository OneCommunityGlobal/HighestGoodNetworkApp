import {
  GET_USER_PROJECTS
} from '../constants/userProjects'

const initialState = {
  projects: []
}

export const userProjectsReducer = (state = initialState, action) => {
  if (action.type === GET_USER_PROJECTS) {
    return {
      projects: action.payload
    };
  }

  return state;
};
