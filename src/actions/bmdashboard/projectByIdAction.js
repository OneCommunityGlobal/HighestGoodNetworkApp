import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import  { GET_BM_PROJECT_BY_ID } from '../../constants/bmdashboard/projectConstants';
import { GET_ERRORS } from '../../constants/errors';

export const setProject = payload => {
  return {
    type: GET_BM_PROJECT_BY_ID,
    payload,
  };
};

export const setErrors = payload => {
  return {
    type: GET_ERRORS,
    payload,
  };
};

export const fetchProjectById = projectId => {
  const url = ENDPOINTS.BM_PROJECT_BY_ID(projectId);
  return async dispatch => {
    try {
      const response = await axios.get(url);
      if (!response.data) {
        throw new Error('No data received from project API');
      }

      const projectData = response.data;
      dispatch(setProject(projectData));
      return projectData; 

    } catch (error) {
      dispatch(setErrors(error));
      return null; 
    }
  };
};
