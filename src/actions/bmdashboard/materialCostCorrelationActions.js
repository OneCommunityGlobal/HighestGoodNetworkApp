import axios from 'axios';
import { toast } from 'react-toastify';
import {
  FETCH_MATERIAL_COST_CORRELATION_REQUEST,
  FETCH_MATERIAL_COST_CORRELATION_SUCCESS,
  FETCH_MATERIAL_COST_CORRELATION_FAILURE,
  SET_MATERIAL_COST_CORRELATION_PROJECT_FILTER,
  SET_MATERIAL_COST_CORRELATION_MATERIAL_TYPE_FILTER,
  SET_MATERIAL_COST_CORRELATION_DATE_RANGE_FILTER,
  RESET_MATERIAL_COST_CORRELATION_FILTERS,
} from '../../constants/bmdashboard/materialCostCorrelationConstants';
import { ENDPOINTS } from '../../utils/URL';

// Action Creators
export const fetchMaterialCostCorrelationRequest = () => ({
  type: FETCH_MATERIAL_COST_CORRELATION_REQUEST,
});

export const fetchMaterialCostCorrelationSuccess = payload => ({
  type: FETCH_MATERIAL_COST_CORRELATION_SUCCESS,
  payload,
});

export const fetchMaterialCostCorrelationFailure = error => ({
  type: FETCH_MATERIAL_COST_CORRELATION_FAILURE,
  payload: error,
});

export const setProjectFilter = projectIds => ({
  type: SET_MATERIAL_COST_CORRELATION_PROJECT_FILTER,
  payload: projectIds,
});

export const setMaterialTypeFilter = materialTypeIds => ({
  type: SET_MATERIAL_COST_CORRELATION_MATERIAL_TYPE_FILTER,
  payload: materialTypeIds,
});

export const setDateRangeFilter = (startDate, endDate) => ({
  type: SET_MATERIAL_COST_CORRELATION_DATE_RANGE_FILTER,
  payload: { startDate, endDate },
});

export const resetFilters = () => ({
  type: RESET_MATERIAL_COST_CORRELATION_FILTERS,
});

// Helper function to format date to YYYY-MM-DD
const formatDate = date => {
  if (!date) return null;
  if (typeof date === 'string') return date;
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  return null;
};

// Thunk Action for Fetching Data
export const fetchMaterialCostCorrelation = (
  projectIds = [],
  materialTypeIds = [],
  startDate = null,
  endDate = null,
) => async dispatch => {
  try {
    dispatch(fetchMaterialCostCorrelationRequest());

    // Build query parameters
    const params = new URLSearchParams();

    if (projectIds && projectIds.length > 0) {
      params.append('projectId', projectIds.join(','));
    }

    if (materialTypeIds && materialTypeIds.length > 0) {
      params.append('materialType', materialTypeIds.join(','));
    }

    const formattedStartDate = formatDate(startDate);
    if (formattedStartDate) {
      params.append('startDate', formattedStartDate);
    }

    const formattedEndDate = formatDate(endDate);
    if (formattedEndDate) {
      params.append('endDate', formattedEndDate);
    }

    // Construct URL with query string
    const queryString = params.toString();
    const url = queryString
      ? `${ENDPOINTS.BM_MATERIAL_COST_CORRELATION}?${queryString}`
      : ENDPOINTS.BM_MATERIAL_COST_CORRELATION;

    // Make API request
    const response = await axios.get(url);

    // Dispatch success action with response data
    dispatch(fetchMaterialCostCorrelationSuccess(response.data));
  } catch (error) {
    // Extract error message from response
    let errorMessage = 'Failed to fetch material cost correlation data';
    if (error.response) {
      // Server responded with error status
      errorMessage =
        error.response.data?.error || error.response.data?.message || errorMessage;
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'Network error: Unable to connect to server';
    } else {
      // Something else happened
      errorMessage = error.message || errorMessage;
    }

    // Dispatch failure action
    dispatch(fetchMaterialCostCorrelationFailure(errorMessage));

    // Display error toast notification
    toast.error(errorMessage, {
      toastId: 'materialCostCorrelationError',
      autoClose: 5000,
    });
  }
};

