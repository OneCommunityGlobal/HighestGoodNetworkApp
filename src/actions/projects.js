import axios from 'axios';
import * as types from "../constants/projects";
import { ENDPOINTS } from '../utils/URL';

/** *****************************************
 * ACTION CREATORS
 ****************************************** */

/**
 * Set a flag that fetching projects
 */
function setProjectsStart() {
  return {
    type: types.FETCH_PROJECTS_START,
  };
}

/**
 * Set Projects in store
 * @param projects: projects
 * @param status: status code
 */
function setProjectsSuccess({ projects, status }) {
  return {
    type: types.FETCH_PROJECTS_SUCCESS,
    projects,
    status,
  };
}

/**
 * Error when setting project
 * @param payload: error status code
 */
function setProjectsError({ status, error }) {
  return {
    type: types.FETCH_PROJECTS_ERROR,
    status,
    error,
  };
}

/** 
 * Add new project to store
 * @param payload : new project
 * @param status: status code
 * @param error: error message
 */
function addNewProject({ newProject, status, error }) {
  return {
    type: types.ADD_NEW_PROJECT,
    newProject,
    status,
    error,
  };
}

/**
 * Update project in store
 * @param updatedProject: updated project
 * @param status: status code
 * @param error: error message
 */
function updateProject({ updatedProject, status, error }) {
  return {
    type: types.UPDATE_PROJECT,
    updatedProject,
    status,
    error,
  };
}

/**
 * Remove project from store
 * @param projectId: id of project to remove
 * @param status: status code
 */
function removeProject({ projectId, status, error }) {
  return {
    type: types.DELETE_PROJECT,
    projectId,
    status,
    error,
  };
}

/**
 * Clear error in store
 */
export const clearError = () => ({
  type: types.CLEAR_ERROR,
});

/** *****************************************
 * THUNKS
 ****************************************** */

/**
 * Call API to get all projects
 */
export const fetchAllProjects = () => {
  return async dispatch => {
    const url = ENDPOINTS.PROJECTS;
    let status;
    let error;
    dispatch(setProjectsStart());
    try {
      const res = await axios.get(url);
      status = res.status;
      const projects = res.data;
      dispatch(setProjectsSuccess({ projects, status }));
    } catch (err) {
      status = err.response ? err.response.status : 500;
      error = err.response ? err.response.data : 'Unknown error';
      dispatch(setProjectsError({ status, error }));
    }
  };
};

/**
 * Post new project to DB
 * @param {projectName}: name of new project
 * @param {projectCategory}: category of new project
 */
export const postNewProject = (projectName, projectCategory) => {
  return async dispatch => {
    const url = ENDPOINTS.PROJECTS;
    let status;
    let error;
    dispatch(setProjectsStart());
    try {
      const res = await axios.post(url, { projectName, projectCategory });
      const { _id } = res.data;
      status = res.status;
      const newProject = {
        _id,
        projectName,
        category: projectCategory,
        isActive: true,
      };
      dispatch(addNewProject({ newProject, status }));
    } catch (err) {
      status = err.response ? err.response.status : 500;
      error = err.response ? err.response.data : 'Unknown error';
      dispatch(addNewProject({ status, error }));
    }
  };
};

export const modifyProject = (updatedProject) => {
  return async dispatch => {
    const url = ENDPOINTS.PROJECT + updatedProject._id;
    let status;
    let error;
    try {
      const res = await axios.put(url, updatedProject);
      status = res.status;
      dispatch(updateProject({ updatedProject, status }));
    } catch (err) {
      status = err.response ? err.response.status : 500;
      error = err.response ? err.response.data : 'Unknown error';
      dispatch(updateProject({ status, error }));
    }
  };
};

/**
 * Delete a project from DB
 * @param {projectId}: Id of deleted project
 */
export const deleteProject = projectId => {
  return async dispatch => {
    const url = ENDPOINTS.PROJECT + projectId;
    let status;
    let error;
    try {
      const res = await axios.delete(url);
      status = res.status;
      dispatch(removeProject({ projectId, status }));
    } catch (err) {
      status = err.response ? err.response.status : 500;
      error = err.response ? err.response.data : 'Unknown error';
      dispatch(removeProject({ status, error }));
    }
  };
};

/** *****************************************
 * PLAIN OBJECT ACTIONS
 ****************************************** */

/* 
   The action creators have been moved above the thunk actions by converting 
   them from arrow functions assigned to constants to function declarations.
   This resolves the 'no-use-before-define' linting errors without altering 
   the order or functionality of the code.
*/

