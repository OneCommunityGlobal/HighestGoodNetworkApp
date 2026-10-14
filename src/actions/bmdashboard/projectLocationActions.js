import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import { GET_ERRORS } from '../../constants/errors';

// Action types
export const GET_PROJECTS_WITH_LOCATION = 'GET_PROJECTS_WITH_LOCATION';
export const GET_PROJECT_LOCATION_DETAILS = 'GET_PROJECT_LOCATION_DETAILS';

// Action creators
export const setProjectsWithLocation = payload => {
  return {
    type: GET_PROJECTS_WITH_LOCATION,
    payload
  };
};

export const setProjectLocationDetails = payload => {
  return {
    type: GET_PROJECT_LOCATION_DETAILS,
    payload
  };
};

export const setErrors = payload => {
  return {
    type: GET_ERRORS,
    payload
  };
};

// Fetch all projects with location data for the interactive map
export const fetchProjectsWithLocation = (startDate = null, endDate = null) => {
  let url = ENDPOINTS.BM_PROJECTS_WITH_LOCATION;
  
  // Add query parameters if dates are provided
  if (startDate || endDate) {
    url += '?';
    if (startDate) {
      url += `startDate=${startDate}`;
    }
    if (startDate && endDate) {
      url += '&';
    }
    if (endDate) {
      url += `endDate=${endDate}`;
    }
  }
  
  return async (dispatch) => {
    try {
      const response = await axios.get(url);
      const projectsData = response.data.data;
      dispatch(setProjectsWithLocation(projectsData));
      return projectsData;
    } catch (error) {
      dispatch(setErrors(error));
      throw error;
    }
  };
};

// Fetch project details by ID
export const fetchProjectLocationById = (projectId) => {
  const url = ENDPOINTS.BM_PROJECT_BY_ID(projectId);
  
  return async (dispatch) => {
    try {
      const response = await axios.get(url);
      const projectData = response.data;
      dispatch(setProjectLocationDetails(projectData));
      return projectData;
    } catch (error) {
      dispatch(setErrors(error));
      throw error;
    }
  };
};
