/*********************************************************************************
 * Action: PROJECTS
 * Author: Henry Ng - 12 / 19 / 20
 ****************************************************************************** */
import axios from 'axios';
import * as types from '../constants/popupEditorConstants';
import { ENDPOINTS } from '../utils/URL';

export const fetchAllPopupEditor = () => {
  const request = axios.get(ENDPOINTS.POPUP_EDITORS);
  return async dispatch => {
    request
      .then(res => {
        console.log('res', res);
        dispatch(setPopup(res.data));
      })
      .catch(err => {
        dispatch(setPopupError());
      });
  };
};

export const updatePopupEditor = (popupId, popupContent, popupName) => {
  return async dispatch => {
    try {
      await axios.post(ENDPOINTS.POPUP_EDITOR_BY_ID(popupId), {
        popupContent: popupContent,
        popupName: popupName,
      });
      const request = await axios.get(ENDPOINTS.POPUP_EDITORS);
      dispatch(setPopup(request.data));
    } catch (err) {
      dispatch(setPopupError());
    }
  };
};

export const getPopupById = popupId => {
  return async dispatch => {
    try {
      const request = await axios.get(ENDPOINTS.POPUP_EDITOR_BY_ID(popupId));
      dispatch(setCurrentPopup(request.data));
    } catch (err) {
      dispatch(setPopupError());
    }
  };
};

export const backupPopupEditor = (popupId, popupContent, popupName) => {
  return async dispatch => {
    try {
      await axios.post(ENDPOINTS.POPUP_EDITOR_BACKUP_BY_ID(popupId), {
        popupContent: popupContent,
        popupName: popupName,
      });
      const request = await axios.get(ENDPOINTS.POPUP_EDITORS);
      dispatch(setCurrentPopup(request.data));
    } catch (err) {
      dispatch(setPopupError());
    }
  };
};

/*******************************************
 * ACTION CREATORS
 *******************************************/

export const setPopup = popupItems => {
  return {
    type: types.RECEIVE_POPUP,
    popupItems,
  };
};

export const setCurrentPopup = currPopup => {
  return {
    type: types.CURRENT_POPUP,
    currPopup,
  };
};

export const setPopupError = err => {
  return {
    type: types.FETCH_POPUP_ERROR,
    err,
  };
};
