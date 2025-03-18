import * as types from '../constants/projects';

const allProjectsInital = {
  fetching: false,
  fetched: false,
  projects: [],
  status: 200,
  error: null,
};

// eslint-disable-next-line default-param-last
export const allProjectsReducer = (allProjects = allProjectsInital, action) => {
  const updateState = updatedProperties => ({
    ...allProjects,
    ...updatedProperties,
  });

  const { status, error = null } = action;

  switch (action.type) {
    case types.FETCH_PROJECTS_START: {
      return updateState({ fetching: true });
    }

    case types.FETCH_PROJECTS_ERROR: {
      return updateState({ fetching: false, status, error });
    }

    case types.FETCH_PROJECTS_SUCCESS: {
      return updateState({
        fetching: false,
        fetched: true,
        projects: action.projects,
        status,
      });
    }

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
      const index = allProjects.projects.findIndex(project => project._id === updatedProject._id);

      if (index !== -1) {
        const updatedProjects = [
          ...allProjects.projects.slice(0, index),
          updatedProject,
          ...allProjects.projects.slice(index + 1),
        ];
        return updateState({ projects: updatedProjects, status });
      }

      return updateState({ status: 404, error: 'Project not found.' });
    }

    case types.DELETE_PROJECT: {
      if (status !== 200) return updateState({ status, error });
      const { projectId } = action;
      const updatedProjects = allProjects.projects.filter(project => project._id !== projectId);
      return updateState({ projects: updatedProjects, status });
    }

    case types.CLEAR_ERROR: {
      return updateState({ status: 200, error: null });
    }

    default: {
      return allProjects;
    }
  }
};

export default allProjectsReducer;
