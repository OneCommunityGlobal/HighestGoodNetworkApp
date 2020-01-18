import * as types  from './../constants/projects'
export const allProjectsReducer = (allProjects = null, action) => {
  if (action.type === types.GET_ALL_PROJECTS) {
    return action.payload;
  }

  return allProjects;
};
