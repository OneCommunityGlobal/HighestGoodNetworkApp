/** *******************************************************************************
 * Action: PROJECTS
 * Author: Henry Ng - 12 / 19 / 20
 ****************************************************************************** */
import axios from 'axios';
import * as types from '../constants/popupEditorConstants';
import { ENDPOINTS } from '../utils/URL';

/** *****************************************
 * ACTION CREATORS
 ****************************************** */

export const setPopup = (popupItems) => ({
  type: types.RECEIVE_POPUP,
  popupItems,
});

export const setCurrentPopup = (currPopup) => ({
  type: types.CURRENT_POPUP,
  currPopup,
});

export const setPopupError = (err) => ({
  type: types.FETCH_POPUP_ERROR,
  err,
});

export const fetchAllPopupEditor = () => {
  const request = axios.get(ENDPOINTS.POPUP_EDITORS);
  return async (dispatch) => {
    request
      .then((res) => {
        dispatch(setPopup(res.data));
      })
      .catch(() => {
        dispatch(setPopupError());
      });
  };
};

export const updatePopupEditor = (popupId, popupContent, popupName) => async (dispatch) => {
  try {
    await axios.post(ENDPOINTS.POPUP_EDITOR_BY_ID(popupId), {
      popupContent,
      popupName,
    });
    const request = await axios.get(ENDPOINTS.POPUP_EDITORS);
    dispatch(setPopup(request.data));
  } catch (err) {
    dispatch(setPopupError());
  }
};

export const getPopupById = (popupId) => async (dispatch) => {
  try {
    const request = await axios.get(ENDPOINTS.POPUP_EDITOR_BY_ID(popupId));
    dispatch(setCurrentPopup(request.data));
  } catch (err) {
    dispatch(setPopupError());
  }
};

export const backupPopupEditor = (popupId, popupContent, popupName) => async (dispatch) => {
  try {
    await axios.post(ENDPOINTS.POPUP_EDITOR_BACKUP_BY_ID(popupId), {
      popupContent,
      popupName,
    });
    const request = await axios.get(ENDPOINTS.POPUP_EDITORS);
    dispatch(setCurrentPopup(request.data));
  } catch (err) {
    dispatch(setPopupError());
  }
};
