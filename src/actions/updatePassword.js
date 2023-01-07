import axios from 'axios';
import { GET_ERRORS } from '../constants/errors';
import { ENDPOINTS } from '../utils/URL';

export const updatePassword = (userId, newpasswordData) => {
  const url = ENDPOINTS.UPDATE_PASSWORD(userId);
  return async dispatch => {
    try {
      const res = await axios.patch(url, newpasswordData);
      return res.status;
    } catch (e) {
      dispatch({
        type: GET_ERRORS,
        payload: e.response.data,
      });
      return e.response.status;
    }
  };
};

export const forcePasswordUpdate = data => {
  const url = ENDPOINTS.FORCE_PASSWORD;
  return async dispatch => {
    try {
      const res = await axios.patch(url, data);
      return res.status;
    } catch (e) {
      dispatch({
        type: GET_ERRORS,
        payload: e.response.data,
      });
      return e.response.status;
    }
  };
};
