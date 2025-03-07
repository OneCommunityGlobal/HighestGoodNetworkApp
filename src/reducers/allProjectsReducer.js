import * as types from "../constants/projects";

const allProjectsInital = {
  fetching: false,
  fetched: false,
  projects: [],
  status: 200,
  error: null,
};

export const allProjectsReducer = (allProjects = allProjectsInital, action) => {
  const updateState = (updatedProperties) => {
    return {
      ...allProjects,
      ...updatedProperties,
    };
  };
  const { status, error = null } = action;
  let index, projects;
  switch (action.type) {
    case types.FETCH_PROJECTS_START:
      return updateState({ fetching: true });
    case types.FETCH_PROJECTS_ERROR:
      return updateState({ fetching: false, status, error });
    case types.FETCH_PROJECTS_SUCCESS:
      return updateState({
        fetching: false,
        fetched: true,
        projects: action.projects,
        status,
      });
    case types.ADD_NEW_PROJECT:
      if (status !== 201) return updateState({ status, error });
      const { newProject } = action;
      return updateState({
        projects: [...allProjects.projects, newProject],
        status,
      });
    case types.UPDATE_PROJECT:
      if (status !== 200) return updateState({ status, error });
      const { updatedProject } = action;
      index = allProjects.projects.findIndex(project => project._id === updatedProject._id);
      if (index !== -1) {
        projects = [
          ...allProjects.projects.slice(0, index),
          updatedProject,
          ...allProjects.projects.slice(index + 1),
        ];
        return updateState({ projects, status });
      } 
      else {
        return updateState({ status:404, error: "Project not found." });
      }
    case types.DELETE_PROJECT:
      if (status !== 200) return updateState({ status, error });
      const { projectId } = action;
      index = allProjects.projects.findIndex(project => project._id === projectId);
      projects = Object.assign([
        ...allProjects.projects.slice(0, index),
        ...allProjects.projects.slice(index + 1),
      ]);
      return updateState({ projects, status });
    case types.CLEAR_ERROR:
      return updateState({ status: 200, error: null });
    default:
      return allProjects;
  }
};
