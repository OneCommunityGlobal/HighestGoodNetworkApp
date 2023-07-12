//actions/actions.js
import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';
import * as types from '../constants/info';

export const fetchAllInfos = infos => {
  return {
    type: types.RECEIVE_INFOS,
    infos,
  };
};


export const postNewInfo = payload => {
  return {
    type: types.ADD_NEW_INFO,
    payload,
  };
};

export const modifyInfo = payload => {
  return {
    type: types.UPDATE_INFO,
    payload,
  };
};

export const addNewInfo = newInfo => {
  return async dispatch => {
    let info = {};
    let status = 200;
    try {
      const res = await axios.post(ENDPOINTS.INFOS(), newInfo);
      info = res.data;
    } catch (error) {
      status = 400;
    }

    dispatch(postNewInfo(info, status));
  };
};

export const updateInfo = (infoId, updatedInfo) => {
  return async dispatch => {
      const res = await axios.patch(ENDPOINTS.INFOS_BY_ID(infoId), updatedInfo);
      dispatch(modifyInfo(updatedInfo));
  };
};

export const getAllInfos = () => async dispatch => {
  const URL = ENDPOINTS.INFOS();
  const { data } = await axios.get(URL);
  return dispatch(fetchAllInfos(data));
};

export const setInfosStart = () => {
  return {
    type: types.FETCH_INFOS_START,
  };
};

export const setInfosError = payload => {
  return {
    type: types.FETCH_INFOS_ERROR,
    payload,
  };
};

