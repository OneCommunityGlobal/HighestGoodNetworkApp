/** *******************************************************************************
 * Action: WBS
 * Author: Henry Ng - 03/20/20
 ******************************************************************************* */
import axios from 'axios';
import { toast } from 'react-toastify';
import * as types from '../constants/WBS';
import { ENDPOINTS } from '~/utils/URL';

/**
 * Set a flag that fetching WBS
 */
export const setWBSStart = () => {
  return {
    type: types.FETCH_WBS_START,
  };
};

/**
 * set WBS in store
 * @param payload : WBS []
 */
export const setWBS = WBSItems => {
  return {
    type: types.RECEIVE_WBS,
    WBSItems,
  };
};

/**
 * Error when setting project
 * @param payload : error status code
 */
export const setWBSError = err => {
  return {
    type: types.FETCH_WBS_ERROR,
    err,
  };
};

export const removeWBS = wbsId => {
  return {
    type: types.DELETE_WBS,
    wbsId,
  };
};

export const postNewWBS = (wbs, status) => {
  return {
    type: types.ADD_NEW_WBS,
    wbs,
    status,
  };
};

export const addNewWBS = (wbsName, projectId) => {
  const url = ENDPOINTS.WBS(projectId);
  return async dispatch => {
    let status = 200;
    let _id = null;

    const isActive = true;

    try {
      const res = await axios.post(url, { wbsName, isActive });
      _id = res.data._id;
      status = res.status;
    } catch (err) {
      toast.info('TRY CATCH ERR', err);
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

export const deleteWbs = wbsId => {
  return async dispatch => {
    try {
      const response = await axios.delete(ENDPOINTS.WBS(wbsId));
      dispatch(removeWBS(wbsId));
      return response;
    } catch (err) {
      dispatch(setWBSError(err));
      return null;
    }
  };
};

export const fetchAllWBS = projectId => {
  const request = axios.get(ENDPOINTS.WBS(projectId));

  return async dispatch => {
    await dispatch(setWBSStart());
    request
      .then(res => {
        dispatch(setWBS(res.data));
      })
      .catch(err => {
        dispatch(setWBSError(err));
      });
  };
};
