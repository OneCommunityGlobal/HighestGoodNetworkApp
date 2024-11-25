/** *******************************************************************************
 * Action: WBS
 * Author: Henry Ng - 03/20/20
 ******************************************************************************* */
import axios from 'axios';
import * as types from '../constants/WBS';
import { ENDPOINTS } from '../utils/URL';

/**
 * Set a flag that fetching WBS
 */
export const setWBSStart = () => ({
  type: types.FETCH_WBS_START,
});

/**
 * Set WBS in store
 * @param {Array} WBSItems - WBS items array
 */
export const setWBS = (WBSItems) => ({
  type: types.RECEIVE_WBS,
  WBSItems,
});

/**
 * Error when setting WBS
 * @param {Object} err - Error object
 */
export const setWBSError = (err) => ({
  type: types.FETCH_WBS_ERROR,
  err,
});

/**
 * Remove WBS from store
 * @param {string} wbsId - WBS ID to remove
 */
export const removeWBS = (wbsId) => ({
  type: types.DELETE_WBS,
  wbsId,
});

/**
 * Post new WBS to store
 * @param {Object} wbs - WBS object
 * @param {number} status - HTTP status code
 */
export const postNewWBS = (wbs, status) => ({
  type: types.ADD_NEW_WBS,
  wbs,
  status,
});

export const addNewWBS = (wbsName, projectId) => {
  const url = ENDPOINTS.WBS(projectId);
  return async (dispatch) => {
    let status = 200;
    let _id = null;

    const isActive = true;

    try {
      const res = await axios.post(url, { wbsName, isActive });
      _id = res.data._id;
      status = res.status;
    } catch (err) {
      // Removed console.log as per no-console rule
      status = 400;
    }

    await dispatch(
      postNewWBS(
        {
          _id,
          wbsName,
          isActive,
        },
        status,
      ),
    );
  };
};

export const deleteWbs = (wbsId) => {
  const request = axios.delete(ENDPOINTS.WBS(wbsId));
  return async (dispatch) => {
    try {
      axios.post(ENDPOINTS.TASK_WBS_DELETE(wbsId));
    } catch (err) {
      dispatch(setWBSError(err));
    }

    request
      .then(() => {
        dispatch(removeWBS(wbsId));
      })
      .catch((err) => {
        dispatch(setWBSError(err));
      });
  };
};

export const fetchAllWBS = (projectId) => {
  const request = axios.get(ENDPOINTS.WBS(projectId));

  return async (dispatch) => {
    await dispatch(setWBSStart());
    request
      .then((res) => {
        dispatch(setWBS(res.data));
      })
      .catch((err) => {
        dispatch(setWBSError(err));
      });
  };
};
