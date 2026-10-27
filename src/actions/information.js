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

export const fetchInfosBegin = () => ({
  type: actions.FETCH_INFOS_BEGIN,
});

export const fetchInfosError = () => ({
  type: actions.FETCH_INFOS_ERROR,
})

// Get infoCollections
export const getInfoCollections = (retrieveInfos=false) => {
  return async (dispatch, getState) => {
    try {
      const { infoCollections } = getState();
      if (!retrieveInfos && (infoCollections.loading || infoCollections.loaded)) {
        return;
      }
      dispatch(fetchInfosBegin())
      const response = await axios.get(ENDPOINTS.INFO_COLLECTIONS);
      dispatch(fetchInfosSuccess(response.data));
      return response.data;
    } catch (error) {
      dispatch(fetchInfosError)
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
