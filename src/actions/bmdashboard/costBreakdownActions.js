import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import {
  FETCH_COST_BREAKDOWN_START,
  FETCH_COST_BREAKDOWN_SUCCESS,
  FETCH_COST_BREAKDOWN_ERROR,
  CLEAR_COST_BREAKDOWN,
} from '../../constants/bmdashboard/costBreakdownConstants';

/**
 * Set loading state for cost breakdown
 */
export const fetchCostBreakdownStart = () => ({
  type: FETCH_COST_BREAKDOWN_START,
});

/**
 * Set cost breakdown data in store
 * @param {Object} payload - cost breakdown data
 */
export const fetchCostBreakdownSuccess = payload => ({
  type: FETCH_COST_BREAKDOWN_SUCCESS,
  payload,
});

/**
 * Set error state for cost breakdown
 * @param {string} payload - error message
 */
export const fetchCostBreakdownError = payload => ({
  type: FETCH_COST_BREAKDOWN_ERROR,
  payload,
});

/**
 * Clear cost breakdown data
 */
export const clearCostBreakdown = () => ({
  type: CLEAR_COST_BREAKDOWN,
});

/**
 * Fetch cost breakdown for all projects
 */
export const getAllProjectsCostBreakdown = () => {
  return async dispatch => {
    dispatch(fetchCostBreakdownStart());
    
    try {
      const response = await axios.get(ENDPOINTS.BM_COST_BREAKDOWN);
      dispatch(fetchCostBreakdownSuccess(response.data));
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch cost breakdown';
      dispatch(fetchCostBreakdownError(errorMessage));
      throw error;
    }
  };
};

/**
 * Fetch cost breakdown for a specific project
 * @param {string} projectId - ID of the project
 */
export const getProjectCostBreakdown = projectId => {
  return async dispatch => {
    dispatch(fetchCostBreakdownStart());
    
    try {
      const response = await axios.get(`${ENDPOINTS.BM_COST_BREAKDOWN}?projectId=${projectId}`);
      dispatch(fetchCostBreakdownSuccess(response.data));
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch project cost breakdown';
      dispatch(fetchCostBreakdownError(errorMessage));
      throw error;
    }
  };
};

/**
 * Fetch cost breakdown for a date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @param {string} projectId - Optional project ID
 */
export const getCostBreakdownByDateRange = (startDate, endDate, projectId = null) => {
  return async dispatch => {
    dispatch(fetchCostBreakdownStart());
    
    try {
      let url = `${ENDPOINTS.BM_COST_BREAKDOWN}?startDate=${startDate}&endDate=${endDate}`;
      if (projectId) {
        url += `&projectId=${projectId}`;
      }
      
      const response = await axios.get(url);
      dispatch(fetchCostBreakdownSuccess(response.data));
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch cost breakdown by date range';
      dispatch(fetchCostBreakdownError(errorMessage));
      throw error;
    }
  };
};