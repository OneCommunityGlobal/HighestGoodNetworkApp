import axios from 'axios';
import * as actions from '../constants/information';
import { ENDPOINTS } from '../utils/URL';

// Get infoCollections
export const getInfoCollections = () => {
  const url = ENDPOINTS.INFO_COLLECTIONS;
  return async (dispatch) => {
    try {
      const response = await axios.get(url);
      dispatch(fetchInfosSuccess(response.data));
      return response.status;
    } catch (error) {
      console.error(error);
    }
  };
};

// Add new info collection
export const addInfoCollection = (newInfo) => {
  
  const url = ENDPOINTS.INFO_COLLECTIONS;
  return async (dispatch) => {
    try {
      const response = await axios.post(url, newInfo);
      return response.status;
    } catch (error) {
      console.error(error);
    }
  };
};

// Update info collection
export const updateInfoCollection = (infoId, updatedInfo) => {
  const url = ENDPOINTS.INFO_COLLECTION(infoId);
  return async (dispatch) => {
    try {
      const response = await axios.put(url, updatedInfo);
      dispatch(updateInfoSuccess(response.data));
      return response.status;
    } catch (error) {
      console.error(error);
    }
  };
};

// Delete info collection by id
export const deleteInfoCollectionById = (infoId) => {
  const url = ENDPOINTS.INFO_COLLECTION(infoId);
  return async (dispatch) => {
    try {
      const response = await axios.delete(url);
      dispatch(deleteInfoSuccess(infoId));
      return response.status;
    } catch (error) {
      console.error(error);
    }
  };
};

// Action creator
export const deleteInfoSuccess = infoId => ({
  type: actions.DELETE_INFO_SUCCESS,
  payload: infoId,
});


// Actions creators
export const fetchInfosSuccess = infoCollectionsData => ({
  type: actions.FETCH_INFOS_SUCCESS,
  payload: { infoCollectionsData },
});

export const updateInfoSuccess = updatedInfo => ({
  type: actions.UPDATE_INFO_SUCCESS,
  payload: updatedInfo,
});



