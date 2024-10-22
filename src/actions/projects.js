import axios from 'axios';
import * as types from "../constants/projects";
import { ENDPOINTS } from '../utils/URL';

/** *****************************************
 * ACTION CREATORS
 ****************************************** */

/**
 * Call API to get all projects
 */
export const fetchAllProjects = () => {
  return async dispatch => {
    const url = ENDPOINTS.PROJECTS;
    let status, error;
    dispatch(setProjectsStart());
    try {
      const res = await axios.get(url);
      status = res.status;
      const projects = res.data;
      dispatch(setProjectsSuccess({ projects, status }));
    } catch (err) {
      status = err.response.status;
      error = err.response.data;
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
    let status, error;
    dispatch(setProjectsStart());
    try {
      const res = await axios.post(url, { projectName, projectCategory });
      const _id = res.data._id;
      status = res.status;
      const newProject = {
        _id,
        projectName,
        category: projectCategory,
        isActive: true,
      };
      dispatch(addNewProject({ newProject, status }));
    } catch (err) {
      status = err.response.status;
      error = err.response.data;
      dispatch(addNewProject({ status, error }));
    }
  };
};

export const modifyProject = (updatedProject) => {
  return async dispatch => {
    const url = ENDPOINTS.PROJECT + updatedProject._id;

    // new 
    dispatch(updateProject({ updatedProject, status: 'PENDING' }));
    
    let status, error;
    try {
      const res = await axios.put(url, updatedProject);
      status = res.status;
      dispatch(updateProject({ updatedProject, status }));
    } catch (err) {
      status = err.response.status;
      error = err.response.data;
      dispatch(updateProject({ status, error }));
    }
  };
};

/**
 * Post new project to DB
 * @param {projectId}: Id of deleted project
 */
export const deleteProject = projectId => {
  return async dispatch => {
    const url = ENDPOINTS.PROJECT + projectId;
    let status, error;
    try {
      const res = await axios.delete(url);
      status = res.status;
      dispatch(removeProject({ projectId, status }));
    } catch (err) {
      status = err.response.status;
      error = err.response.data;
      dispatch(removeProject({ status, error }));
    }
  };
}

/** *****************************************
 * PLAIN OBJECT ACTIONS
 ****************************************** */

/**
 * Set a flag that fetching projects
 */
const setProjectsStart = () => ({
  type: types.FETCH_PROJECTS_START,
});

/**
 * set Projects in store
 * @param projects: projects
 * @param status: status code
 */
const setProjectsSuccess = ({ projects, status }) => ({
  type: types.FETCH_PROJECTS_SUCCESS,
  projects,
  status,
});

/**
 * Error when setting project
 * @param payload: error status code
 */
const setProjectsError = ({ status, error }) => ({
  type: types.FETCH_PROJECTS_ERROR,
  status,
  error,
});

/** 
 * Add new project to store
 * @param payload : new project
 * @param status: status code
 * @param error: error message
 */
const addNewProject = ({ newProject, status, error }) => ({
  type: types.ADD_NEW_PROJECT,
  newProject,
  status,
  error,
});

/**
 * Update project in store
 * @param updatedProject: updated project
 * @param status: status code
 * @param error: error message
 */
// const updateProject = (projectId, projectName, category, isActive, status, error) => {
const updateProject = ({ updatedProject, status, error}) => ({
  type: types.UPDATE_PROJECT,
  updatedProject,
  status,
  error,
});

/**
 * Remove project from store
 * @param projectId: id of project to remove
 * @param status: status code
 */
const removeProject = ({ projectId, status, error }) => ({
  type: types.DELETE_PROJECT,
  projectId,
  status,
  error,
});

/**
 * Clear error in store
 */
export const clearError = () => ({
  type: types.CLEAR_ERROR,
});

