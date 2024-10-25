import * as types from "../constants/projects";

const allProjectsInitial = {
  fetching: false,
  fetched: false,
  projects: [],
  status: 200,
  error: null,
};

const allProjectsReducer = (action, allProjects = allProjectsInitial) => { // Moved default parameter to last
  const updateState = (updatedProperties) => {
    return {
      ...allProjects,
      ...updatedProperties,
    };
  };
  const { status, error = null } = action;
  let index;
  let projects;
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
    case types.ADD_NEW_PROJECT: {
      if (status !== 201) return updateState({ status, error });
      const { newProject } = action;
      return updateState({
        projects: [...allProjects.projects, newProject],
        status,
      });
    }
    case types.UPDATE_PROJECT: {
      if (status !== 200) return updateState({ status, error });
      const { updatedProject } = action;
      index = allProjects.projects.findIndex(
        (project) => project._id === action.projectId
      );
      projects = [
        ...allProjects.projects.slice(0, index),
        updatedProject,
        ...allProjects.projects.slice(index + 1),
      ];
      return updateState({ projects, status });
    }
    case types.DELETE_PROJECT: {
      if (status !== 200) return updateState({ status, error });
      const { projectId } = action;
      index = allProjects.projects.findIndex(
        (project) => project._id === projectId
      );
      projects = [
        ...allProjects.projects.slice(0, index),
        ...allProjects.projects.slice(index + 1),
      ];
      return updateState({ projects, status });
    }
    case types.CLEAR_ERROR:
      return updateState({ status: 200, error: null });
    default:
      return allProjects;
  }
};

export default allProjectsReducer; // Changed to default export
