import axios from 'axios';
import { toast } from 'react-toastify';
import * as actions from '../constants/information';
import { ENDPOINTS } from '~/utils/URL';

// Action creators
export const deleteInfoSuccess = infoId => ({
  type: actions.DELETE_INFO_SUCCESS,
  payload: infoId,
});

export const fetchInfosSuccess = infoCollectionsData => ({
  type: actions.FETCH_INFOS_SUCCESS,
  payload: { infoCollectionsData },
});

export const updateInfoSuccess = updatedInfo => ({
  type: actions.UPDATE_INFO_SUCCESS,
  payload: updatedInfo,
});

// Get infoCollections
export const getInfoCollections = () => {
  return async dispatch => {
    try {
      const response = await axios.get(ENDPOINTS.INFO_COLLECTIONS);
      dispatch(fetchInfosSuccess(response.data));
      return response.data;
    } catch (error) {
      toast.error(error.message || 'Failed to fetch info collections.');
      return null;
    }
  };
};

// Add new info collection
export const addInfoCollection = newInfo => {
  return async () => {
    try {
      const response = await axios.post(ENDPOINTS.INFO_COLLECTIONS, newInfo);
      return response.status;
    } catch (error) {
      toast.error(error.message || 'Failed to add info collection.');
      return null;
    }
  };
};

// Update info collection
export const updateInfoCollection = (infoId, updatedInfo) => {
  return async dispatch => {
    try {
      const response = await axios.put(ENDPOINTS.INFO_COLLECTION(infoId), updatedInfo);
      dispatch(updateInfoSuccess(response.data));
      return response.status;
    } catch (error) {
      toast.error(error.message || 'Failed to update info collection.');
      return null;
    }
  };
};

// Delete info collection by id
export const deleteInfoCollectionById = infoId => {
  return async dispatch => {
    try {
      const response = await axios.delete(ENDPOINTS.INFO_COLLECTION(infoId));
      dispatch(deleteInfoSuccess(infoId));
      return response.status;
    } catch (error) {
      toast.error(error.message || 'Failed to delete info collection.');
      return null;
    }
  };
};
