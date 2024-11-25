/** ******************************************************************************
 * Action: PROJECTS
 * Author: Henry Ng - 12 / 19 / 20
 ***************************************************************************** */
import axios from 'axios';
import * as types from '../constants/popupEditorConstants';
import { ENDPOINTS } from '../utils/URL';

/** *****************************************
 * ACTION CREATORS
 ****************************************** */

/**
 * Set popup items in the store
 * @param {Array} popupItems
 */
export const setPopup = (popupItems) => {
  return {
    type: types.RECEIVE_POPUP,
    popupItems,
  };
};

/**
 * Set the current popup in the store
 * @param {Object} currPopup
 */
export const setCurrentPopup = (currPopup) => {
  return {
    type: types.CURRENT_POPUP,
    currPopup,
  };
};

/**
 * Set an error when fetching or updating popups
 * @param {Object} err
 */
export const setPopupError = (err) => {
  return {
    type: types.FETCH_POPUP_ERROR,
    err,
  };
};

/** *****************************************
 * ACTION FUNCTIONS
 ****************************************** */

/**
 * Fetch all popup editors
 */
export const fetchAllPopupEditor = () => {
  const request = axios.get(ENDPOINTS.POPUP_EDITORS);
  return async (dispatch) => {
    request
      .then((res) => {
        dispatch(setPopup(res.data));
      })
      .catch((err) => {
        dispatch(setPopupError(err)); // Pass the error to the action creator
      });
  };
};

/**
 * Update a popup editor
 * @param {string} popupId
 * @param {string} popupContent
 * @param {string} popupName
 */
export const updatePopupEditor = (popupId, popupContent, popupName) => {
  return async (dispatch) => {
    try {
      await axios.post(ENDPOINTS.POPUP_EDITOR_BY_ID(popupId), {
        popupContent,
        popupName,
      });
      const request = await axios.get(ENDPOINTS.POPUP_EDITORS);
      dispatch(setPopup(request.data));
    } catch (err) {
      dispatch(setPopupError(err)); // Pass the error to the action creator
    }
  };
};

/**
 * Get a popup by its ID
 * @param {string} popupId
 */
export const getPopupById = (popupId) => {
  return async (dispatch) => {
    try {
      const request = await axios.get(ENDPOINTS.POPUP_EDITOR_BY_ID(popupId));
      dispatch(setCurrentPopup(request.data));
    } catch (err) {
      dispatch(setPopupError(err)); // Pass the error to the action creator
    }
  };
};

/**
 * Backup a popup editor
 * @param {string} popupId
 * @param {string} popupContent
 * @param {string} popupName
 */
export const backupPopupEditor = (popupId, popupContent, popupName) => {
  return async (dispatch) => {
    try {
      await axios.post(ENDPOINTS.POPUP_EDITOR_BACKUP_BY_ID(popupId), {
        popupContent,
        popupName,
      });
      const request = await axios.get(ENDPOINTS.POPUP_EDITORS);
      dispatch(setCurrentPopup(request.data));
    } catch (err) {
      dispatch(setPopupError(err)); // Pass the error to the action creator
    }
  };
};
