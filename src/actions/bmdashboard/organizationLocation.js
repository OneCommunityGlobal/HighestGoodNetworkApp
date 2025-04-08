organizationLocation.js in actions

import axios from "axios";
import { ENDPOINTS } from "utils/URL";
import { GET_MAP_ORGS, GET_MAP_ORG_DETAILS } from '../../constants/bmdashboard/orgLocationConstants';
import { GET_ERRORS } from "constants/errors";

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
      
      // Console log the location data
      console.log('Orgs with location data:', orgsData);
      
      // Log each org's coordinates
      orgsData.forEach(org => {
        console.log(`Org ${org.orgId} (${org.name}): Lat ${org.latitude}, Lng ${org.longitude}, Status: ${org.status}`);
      });
      
      dispatch(setOrgs(orgsData));
      return orgsData;
    } catch (error) {
      console.error('Error fetching organizations with location:', error);
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
      const orgData = response.data.data; // Assuming your API returns { data: {...} }
      
      // Console log the organization details
      console.log('org details:', orgData);
      console.log(`org ${orgData.orgId} location: Lat ${orgData.location.coordinates[1]}, Lng ${orgData.location.coordinates[0]}`);
      
      dispatch(setOrgDetails(orgData));
      return orgData;
    } catch (error) {
      console.error(`Error fetching org ${orgId} details:`, error);
      dispatch(setErrors(error));
      throw error;
    }
  };
};

// Action creators
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

