import axios from 'axios';
import * as actions from '../constants/information';
import { ENDPOINTS } from '../utils/URL';

/** *****************************************
 * ACTION CREATORS
 ****************************************** */

/**
 * Action creator for successful fetch of info collections
 * @param {Array} infoCollectionsData
 */
export const fetchInfosSuccess = (infoCollectionsData) => ({
  type: actions.FETCH_INFOS_SUCCESS,
  payload: { infoCollectionsData },
});

/**
 * Action creator for successful update of an info collection
 * @param {Object} updatedInfo
 */
export const updateInfoSuccess = (updatedInfo) => ({
  type: actions.UPDATE_INFO_SUCCESS,
  payload: updatedInfo,
});

/**
 * Action creator for successful deletion of an info collection
 * @param {string} infoId
 */
export const deleteInfoSuccess = (infoId) => ({
  type: actions.DELETE_INFO_SUCCESS,
  payload: infoId,
});

/** *****************************************
 * ACTION FUNCTIONS
 ****************************************** */

/**
 * Get all info collections
 */
export const getInfoCollections = () => {
  const url = ENDPOINTS.INFO_COLLECTIONS;
  return async (dispatch) => {
    try {
      const response = await axios.get(url);
      dispatch(fetchInfosSuccess(response.data));
      return response.status;
    } catch (error) {
      console.error(error);
      return error.response ? error.response.status : 500; // Ensure a return value
    }
  };
};

/**
 * Add a new info collection
 * @param {Object} newInfo
 */
export const addInfoCollection = (newInfo) => {
  const url = ENDPOINTS.INFO_COLLECTIONS;
  return async () => { // Removed 'dispatch' since it's not used
    try {
      const response = await axios.post(url, newInfo);
      return response.status;
    } catch (error) {
      console.error(error);
      return error.response ? error.response.status : 500; // Ensure a return value
    }
  };
};

/**
 * Update an existing info collection
 * @param {string} infoId
 * @param {Object} updatedInfo
 */
export const updateInfoCollection = (infoId, updatedInfo) => {
  const url = ENDPOINTS.INFO_COLLECTION(infoId);
  return async (dispatch) => {
    try {
      const response = await axios.put(url, updatedInfo);
      dispatch(updateInfoSuccess(response.data));
      return response.status;
    } catch (error) {
      console.error(error);
      return error.response ? error.response.status : 500; // Ensure a return value
    }
  };
};

/**
 * Delete an info collection by ID
 * @param {string} infoId
 */
export const deleteInfoCollectionById = (infoId) => {
  const url = ENDPOINTS.INFO_COLLECTION(infoId);
  return async (dispatch) => {
    try {
      const response = await axios.delete(url);
      dispatch(deleteInfoSuccess(infoId));
      return response.status;
    } catch (error) {
      console.error(error);
      return error.response ? error.response.status : 500; // Ensure a return value
    }
  };
};
