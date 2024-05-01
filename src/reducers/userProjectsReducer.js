import { GET_USER_PROJECTS, GET_USER_WBS } from '../constants/userProjects';

const initialState = {
  projects: [],
  wbs: [],
};

export const userProjectsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_USER_PROJECTS:
      return {
        ...state,
        projects: action.payload,
      };
    case GET_USER_WBS:
      return {
        ...state,
        wbs: action.payload,
      };
    default:
      return state;
  }
};
