import { GET_USER_PROJECTS } from '../constants/userProjects';

const initialState = {
  projects: [],
};

// eslint-disable-next-line import/prefer-default-export,default-param-last
export const userProjectsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_USER_PROJECTS:
      return {
        projects: action.payload,
      };
    default:
      return state;
  }
};
