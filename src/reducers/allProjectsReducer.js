import * as types from "../constants/projects";

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

export const allProjectsReducer = (action, allProjects = allProjectsInital) => {
  switch (action.type) {
    case types.FETCH_PROJECTS_START:
      return { ...allProjects, fetching: true, status: '200' };
    case types.FETCH_PROJECTS_ERROR:
      return { ...allProjects, fetching: false, status: action.payload };
    case types.RECEIVE_PROJECTS:
      return updateObject(allProjects, {
        projects: action.payload,
        fetching: false,
        fetched: true,
        status: '200',
      });
    case types.ADD_NEW_PROJECT:
      if (action.status === 201) {
        return { ...allProjects, projects: [action.payload, ...allProjects.projects] };
      }
        return { ...allProjects, status: action.status };

    case types.DELETE_PROJECT:
      if (action.status === 200) {
        const index = allProjects.projects.findIndex(project => project._id === action.projectId);
        return updateObject(allProjects, {
          projects: Object.assign([
            ...allProjects.projects.slice(0, index),
            ...allProjects.projects.slice(index + 1),
          ]),
        });
      }

    // eslint-disable-next-line no-fallthrough
    case types.UPDATE_PROJECT: {
      const index = allProjects.projects.findIndex(project => project._id === action.projectId);
      return updateObject(allProjects, {
        projects: Object.assign([
          ...allProjects.projects.slice(0, index),
          {
            category: action.category,
            _id: action.projectId,
            isActive: action.isActive,
            projectName: action.projectName,
          },
          ...allProjects.projects.slice(index + 1),
        ]),
      });
    }
    default:
      return allProjects;

  }
};
