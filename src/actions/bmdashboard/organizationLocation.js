// Fix import order
import axios from "axios";
import { GET_ERRORS } from "constants/errors";
import { ENDPOINTS } from "utils/URL";
import { GET_MAP_ORGS, GET_MAP_ORG_DETAILS } from '../../constants/bmdashboard/orgLocationConstants';

// Action creators (moved to the top to fix "used before defined" errors)
export const setOrgs = payload => {
  return {
    type: GET_MAP_ORGS,
    payload
  };
};

export const setOrgDetails = payload => {
  return {
    type: GET_MAP_ORG_DETAILS,
    payload
  };
};

export const setErrors = payload => {
  return {
    type: GET_ERRORS,
    payload
  };
};

// fetch all orgs for dispatch calls
export const fetchOrgsWithLocation = (startDate = null, endDate = null) => {
  let url = ENDPOINTS.BM_ORGS_WITH_LOCATION;
  
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
      const orgsData = response.data.data;
      dispatch(setOrgs(orgsData));
      return orgsData;
    } catch (error) {
      dispatch(setErrors(error));
      throw error;
    }
  };
};

// Fetch orgs details by ID
export const fetchMapOrgById = (orgId) => {
  const url = ENDPOINTS.ORG_DETAILS(orgId);
  
  return async (dispatch) => {
    try {
      const response = await axios.get(url);
      const orgData = response.data.data;
      dispatch(setOrgDetails(orgData));
      return orgData;
    } catch (error) {
      dispatch(setErrors(error));
      throw error;
    }
  };
};
