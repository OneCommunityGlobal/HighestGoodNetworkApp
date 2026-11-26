import axios from 'axios';

import { ENDPOINTS } from '~/utils/URL';
import GET_BM_PROJECTS from '../../constants/bmdashboard/projectConstants';
import { GET_ERRORS } from '../../constants/errors';

export const setProjects = payload => {
  return {
    type: GET_BM_PROJECTS,
    payload,
  };
};

export const setErrors = payload => {
  return {
    type: GET_ERRORS,
    payload,
  };
};

export const fetchBMProjects = () => async dispatch => {
  try {
    const response = await axios.get(ENDPOINTS.BM_PROJECTS);
    dispatch(setProjects(response.data));
    return response.data;
  } catch (error) {
    dispatch(setErrors(error));
    throw error;
  }
};

export const createBMProject = payload => async () => {
  const response = await axios.post(ENDPOINTS.BM_PROJECTS, payload);
  return response.data;
};

export const updateBMProject = (projectId, payload) => async () => {
  const response = await axios.put(ENDPOINTS.BM_UPDATE_PROJECT(projectId), payload);
  return response.data;
};

export const getProjectGlobalDistribution = async (payload) => {
  const url = ENDPOINTS.PROJECT_GLOBAL_DISTRIBUTION

  const res = await axios.get(url, {params: payload});
  
  return res.data
  };
