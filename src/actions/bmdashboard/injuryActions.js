import axios from 'axios';
import { 
  FETCH_INJURIES_REQUEST, 
  FETCH_INJURIES_SUCCESS, 
  FETCH_INJURIES_FAILURE 
} from './types';
import { ENDPOINTS } from '../../utils/URL';

// Action creator for fetching injury data
export const fetchInjuries = (projectId, startDate, endDate) => async dispatch => {
  dispatch({ type: FETCH_INJURIES_REQUEST });
  
  try {
    // Build query parameters
    const params = {};
    if (projectId && projectId !== 'all') {
      params.projectId = projectId;
    }
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    // API call
    const response = await axios.get(ENDPOINTS.INJURIES, { params });
    
    dispatch({
      type: FETCH_INJURIES_SUCCESS,
      payload: response.data
    });
    
    return response;
  } catch (error) {
    dispatch({
      type: FETCH_INJURIES_FAILURE,
      payload: { 
        message: error.response?.data?.message || 'Failed to fetch injury data',
        status: error.response?.status
      }
    });
    
    throw error;
  }
};

// Function to get injury data (non-Redux version for direct component use)
export const getInjuryData = async (projectId, startDate, endDate) => {
  // Build query parameters
  const params = {};
  if (projectId && projectId !== 'all') {
    params.projectId = projectId;
  }
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  
  // API call
  const response = await axios.get(ENDPOINTS.INJURIES, { params });
  
  // Return the data directly
  return response.data;
};
