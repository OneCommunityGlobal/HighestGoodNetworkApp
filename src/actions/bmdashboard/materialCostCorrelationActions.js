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
import logger from '../../services/logService';

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

// Helper function to validate MongoDB ObjectId format
const isValidObjectId = id => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Helper function to validate date range
const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return { valid: true };
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);
  if (start > end) {
    return {
      valid: false,
      error: 'Start date cannot be after end date',
    };
  }
  return { valid: true };
};

// Thunk Action for Fetching Data
export const fetchMaterialCostCorrelation = (
  projectIds = [],
  materialTypeIds = [],
  startDate = null,
  endDate = null,
) => async dispatch => {
  try {
    // Client-side validation
    const dateValidation = validateDateRange(startDate, endDate);
    if (!dateValidation.valid) {
      const validationError = dateValidation.error;
      logger.logInfo(
        `[MaterialCostCorrelation] Validation failed: ${validationError} - Start: ${startDate}, End: ${endDate}`,
      );
      toast.warning(validationError, {
        toastId: 'materialCostCorrelationValidation',
        autoClose: 5000,
      });
      dispatch(fetchMaterialCostCorrelationFailure(validationError));
      return;
    }

    // Validate ObjectIds if provided
    const invalidProjectIds =
      projectIds && projectIds.length > 0
        ? projectIds.filter(id => !isValidObjectId(id))
        : [];
    const invalidMaterialTypeIds =
      materialTypeIds && materialTypeIds.length > 0
        ? materialTypeIds.filter(id => !isValidObjectId(id))
        : [];

    if (invalidProjectIds.length > 0 || invalidMaterialTypeIds.length > 0) {
      const validationError = 'Invalid project or material type IDs provided';
      logger.logInfo(
        `[MaterialCostCorrelation] Validation failed: ${validationError} - Invalid Project IDs: ${JSON.stringify(invalidProjectIds)}, Invalid Material Type IDs: ${JSON.stringify(invalidMaterialTypeIds)}`,
      );
      toast.warning(validationError, {
        toastId: 'materialCostCorrelationValidation',
        autoClose: 5000,
      });
      dispatch(fetchMaterialCostCorrelationFailure(validationError));
      return;
    }

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

    // Validate response structure
    if (!response.data) {
      throw new Error('Invalid response: missing data property');
    }

    // Dispatch success action with response data
    dispatch(fetchMaterialCostCorrelationSuccess(response.data));
  } catch (error) {
    // Extract error message based on error type
    let errorMessage = 'Failed to fetch material cost correlation data';
    let errorType = 'unknown';
    let statusCode = null;

    if (error.response) {
      // Server responded with error status
      statusCode = error.response.status;
      errorType = 'server';

      if (statusCode === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
        // Store attempted action for retry after login
        sessionStorage.setItem(
          'materialCostCorrelationRetryAction',
          JSON.stringify({ projectIds, materialTypeIds, startDate, endDate }),
        );
        // Redirect to login after short delay
        setTimeout(() => {
          window.location.href = '/bmdashboard/login';
        }, 2000);
      } else if (statusCode === 403) {
        errorMessage =
          'You do not have permission to access this data. Please contact an administrator for BM Portal access.';
        errorType = 'permission';
      } else if (statusCode >= 500) {
        errorMessage = 'Server error. Please try again later or contact support if the issue persists.';
        errorType = 'server';
      } else {
        errorMessage =
          error.response.data?.error ||
          error.response.data?.message ||
          `Request failed with status ${statusCode}`;
      }
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'Network error: Unable to connect to server. Please check your internet connection.';
      errorType = 'network';
    } else {
      // Something else happened
      errorMessage = error.message || errorMessage;
      if (errorMessage.includes('Invalid response')) {
        errorType = 'malformed';
      }
    }

    logger.logError(
      new Error(
        `[MaterialCostCorrelation] Error - Type: ${errorType}, Status: ${statusCode}, Message: ${errorMessage}`,
      ),
    );

    // Dispatch failure action
    dispatch(fetchMaterialCostCorrelationFailure(errorMessage));

    // Display error toast notification with appropriate configuration
    const toastOptions = {
      toastId: `materialCostCorrelationError-${errorType}`,
      autoClose: errorType === 'network' ? false : errorType === 'permission' ? false : 5000,
      position: 'top-right',
      closeOnClick: true,
      pauseOnHover: true,
    };

    if (errorType === 'permission' || errorType === 'network') {
      toast.error(errorMessage, toastOptions);
    } else {
      toast.error(errorMessage, toastOptions);
    }
  }
};

