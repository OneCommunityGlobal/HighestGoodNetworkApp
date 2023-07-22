import * as types from './../constants/projects';

const allProjectsInital = {
  fetching: false,
  fetched: false,
  projects: [],
  status: 404,
};

export const updateObject = (oldObject, updatedProperties) => {
  return {
    ...oldObject,
    ...updatedProperties,
  };
};

export const allProjectsReducer = (allProjects = allProjectsInital, action) => {
  switch (action.type) {
    case types.FETCH_PROJECTS_START:
      return { ...allProjects, fetching: true, status: '200' };
    case types.FETCH_PROJECTS_ERROR:
      return { ...allProjects, fetching: false, status: action.payload };
    case types.RECEIVE_PROJECTS:
      //console.log("Reducers projects", action.payload);
      return updateObject(allProjects, {
        projects: action.payload,
        fetching: false,
        fetched: true,
        status: '200',
      });
    case types.ADD_NEW_PROJECT:
      if (action.status === 201) {
        return { ...allProjects, projects: [action.payload, ...allProjects.projects] };
      } else {
        return { ...allProjects, status: action.status };
      }
    case types.DELETE_PROJECT:
      if (action.status === 200) {
        let index = allProjects.projects.findIndex(project => project._id === action.projectId);
        return updateObject(allProjects, {
          projects: Object.assign([
            ...allProjects.projects.slice(0, index),
            ...allProjects.projects.slice(index + 1),
          ]),
        });
      }
    case types.UPDATE_PROJECT:
      let index = allProjects.projects.findIndex(project => project._id === action.projectId);
      return updateObject(allProjects, {
        projects: Object.assign([
          ...allProjects.projects.slice(0, index),
          {
            _id: action.projectId,
            isActive: action.isActive,
            projectName: action.projectName,
          },
          ...allProjects.projects.slice(index + 1),
        ]),
      });
    default:
      return allProjects;
  }
};
