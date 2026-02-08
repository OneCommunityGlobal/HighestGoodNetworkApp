import axios from 'axios';
import { toast } from 'react-toastify';
import * as actions from '../constants/weeklySummariesReport';
import { ENDPOINTS } from '../utils/URL';

/**
 * Action to set the 'loading' flag to true for fetching saved filters.
 */
export const fetchSavedFiltersBegin = () => ({
  type: actions.FETCH_SAVED_FILTERS_BEGIN,
});

/**
 * Action to set the saved filters in store.
 * @param {array} savedFiltersData An array of all saved filters.
 */
export const fetchSavedFiltersSuccess = savedFiltersData => ({
  type: actions.FETCH_SAVED_FILTERS_SUCCESS,
  payload: { savedFiltersData },
});

/**
 * Handle the error case for fetching saved filters.
 * @param {Object} error The error object.
 */
export const fetchSavedFiltersError = error => ({
  type: actions.FETCH_SAVED_FILTERS_ERROR,
  payload: { error },
});

/**
 * Action to set the 'loading' flag to true for creating saved filter.
 */
export const createSavedFilterBegin = () => ({
  type: actions.CREATE_SAVED_FILTER_BEGIN,
});

/**
 * Action to add the new saved filter to store.
 * @param {Object} savedFilterData The new saved filter data.
 */
export const createSavedFilterSuccess = savedFilterData => ({
  type: actions.CREATE_SAVED_FILTER_SUCCESS,
  payload: { savedFilterData },
});

/**
 * Handle the error case for creating saved filter.
 * @param {Object} error The error object.
 */
export const createSavedFilterError = error => ({
  type: actions.CREATE_SAVED_FILTER_ERROR,
  payload: { error },
});

/**
 * Action to set the 'loading' flag to true for deleting saved filter.
 */
export const deleteSavedFilterBegin = () => ({
  type: actions.DELETE_SAVED_FILTER_BEGIN,
});

/**
 * Action to remove the saved filter from store.
 * @param {string} filterId The ID of the deleted filter.
 */
export const deleteSavedFilterSuccess = filterId => ({
  type: actions.DELETE_SAVED_FILTER_SUCCESS,
  payload: { filterId },
});

/**
 * Handle the error case for deleting saved filter.
 * @param {Object} error The error object.
 */
export const deleteSavedFilterError = error => ({
  type: actions.DELETE_SAVED_FILTER_ERROR,
  payload: { error },
});

/**
 * Action to set the 'loading' flag to true for updating saved filter.
 */
export const updateSavedFilterBegin = () => ({
  type: actions.UPDATE_SAVED_FILTER_BEGIN,
});

/**
 * Action to update the saved filter in store.
 * @param {Object} savedFilterData The updated saved filter data.
 */
export const updateSavedFilterSuccess = savedFilterData => ({
  type: actions.UPDATE_SAVED_FILTER_SUCCESS,
  payload: { savedFilterData },
});

/**
 * Handle the error case for updating saved filter.
 * @param {Object} error The error object.
 */
export const updateSavedFilterError = error => ({
  type: actions.UPDATE_SAVED_FILTER_ERROR,
  payload: { error },
});

/**
 * Gets all saved filters from the database.
 */
export const getSavedFilters = () => {
  return async dispatch => {
    dispatch(fetchSavedFiltersBegin());
    try {
      const response = await axios.get(ENDPOINTS.SAVED_FILTERS());
      dispatch(fetchSavedFiltersSuccess(response.data));
      return { status: response.status, data: response.data };
    } catch (error) {
      dispatch(fetchSavedFiltersError(error));
      return error.response ? error.response.status : 500;
    }
  };
};

/**
 * Creates a new saved filter.
 * @param {Object} filterData The filter data to save.
 */
export const createSavedFilter = filterData => {
  return async (dispatch, getState) => {
    dispatch(createSavedFilterBegin());
    try {
      const state = getState();
      const user = state.auth?.user;

      // Create requestor object in the format expected by backend
      const requestor = {
        requestorId: user?.userid || user?.requestorId,
        role: user?.role,
        permissions: user?.permissions,
      };

      const requestData = {
        ...filterData,
        requestor,
      };

      const response = await axios.post(ENDPOINTS.SAVED_FILTERS(), requestData);
      dispatch(createSavedFilterSuccess(response.data));
      toast.success('Filter saved successfully!');
      return { status: response.status, data: response.data };
    } catch (error) {
      dispatch(createSavedFilterError(error));
      const errorMessage = error.response?.data || 'Failed to save filter';
      toast.error(errorMessage);
      return error.response ? error.response.status : 500;
    }
  };
};

/**
 * Deletes a saved filter.
 * @param {string} filterId The ID of the filter to delete.
 */
export const deleteSavedFilter = filterId => {
  return async (dispatch, getState) => {
    dispatch(deleteSavedFilterBegin());
    try {
      const state = getState();
      const user = state.auth?.user;

      // Create requestor object in the format expected by backend
      const requestor = {
        requestorId: user?.userid || user?.requestorId,
        role: user?.role,
        permissions: user?.permissions,
      };

      const response = await axios.delete(ENDPOINTS.SAVED_FILTER_BY_ID(filterId), {
        data: { requestor },
      });
      dispatch(deleteSavedFilterSuccess(filterId));
      toast.success('Filter deleted successfully!');
      return { status: response.status, data: response.data };
    } catch (error) {
      dispatch(deleteSavedFilterError(error));
      const errorMessage = error.response?.data || 'Failed to delete filter';
      toast.error(errorMessage);
      return error.response ? error.response.status : 500;
    }
  };
};

/**
 * Updates a saved filter.
 * @param {string} filterId The ID of the filter to update.
 * @param {Object} filterData The updated filter data.
 */
export const updateSavedFilter = (filterId, filterData) => {
  return async (dispatch, getState) => {
    dispatch(updateSavedFilterBegin());
    try {
      const state = getState();
      const user = state.auth?.user;

      // Create requestor object in the format expected by backend
      const requestor = {
        requestorId: user?.userid || user?.requestorId,
        role: user?.role,
        permissions: user?.permissions,
      };

      const requestData = {
        ...filterData,
        requestor,
      };

      const response = await axios.put(ENDPOINTS.SAVED_FILTER_BY_ID(filterId), requestData);
      dispatch(updateSavedFilterSuccess(response.data));
      toast.success('Filter updated successfully!');
      return { status: response.status, data: response.data };
    } catch (error) {
      dispatch(updateSavedFilterError(error));
      const errorMessage = error.response?.data || 'Failed to update filter';
      toast.error(errorMessage);
      return error.response ? error.response.status : 500;
    }
  };
};

/**
 * Updates saved filters when team codes change.
 * @param {Array} oldTeamCodes Array of old team codes to replace
 * @param {string} newTeamCode New team code to replace old ones with
 */
export const updateSavedFiltersForTeamCodeChange = (oldTeamCodes, newTeamCode) => {
  return async dispatch => {
    try {
      const response = await axios.patch(ENDPOINTS.UPDATE_SAVED_FILTERS_TEAM_CODES(), {
        oldTeamCodes,
        newTeamCode,
      });

      if (response.status === 200) {
        // Refresh the saved filters to get the updated data
        dispatch(getSavedFilters());
        toast.success(`Updated ${response.data.updatedFilters} saved filters with new team code.`);
      }

      return { status: response.status, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data || 'Failed to update saved filters for team code change';
      toast.error(errorMessage);
      return error.response ? error.response.status : 500;
    }
  };
};

/**
 * Updates saved filters when individual team code changes.
 * @param {string} oldTeamCode Old team code
 * @param {string} newTeamCode New team code
 * @param {string} userId User ID whose team code is being changed
 */
export const updateSavedFiltersForIndividualTeamCodeChange = (oldTeamCode, newTeamCode, userId) => {
  return async dispatch => {
    try {
      const response = await axios.patch(ENDPOINTS.UPDATE_SAVED_FILTERS_INDIVIDUAL_TEAM_CODE(), {
        oldTeamCode,
        newTeamCode,
        userId,
      });

      if (response.status === 200) {
        // Refresh the saved filters to get the updated data
        dispatch(getSavedFilters());
        toast.success(`Updated ${response.data.updatedFilters} saved filters with new team code.`);
      }

      return { status: response.status, data: response.data };
    } catch (error) {
      const errorMessage =
        error.response?.data || 'Failed to update saved filters for individual team code change';
      toast.error(errorMessage);
      return error.response ? error.response.status : 500;
    }
  };
};
