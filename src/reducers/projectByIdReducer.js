import { GET_PROJECT_BY_ID } from '../constants/project';

// eslint-disable-next-line import/prefer-default-export,default-param-last
export const projectByIdReducer = (project = null, action) => {
  if (action.type === GET_PROJECT_BY_ID) {
    return action.payload;
  }

  return project;
};
