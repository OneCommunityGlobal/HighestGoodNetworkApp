// blueSquareEmailCCAction.js

import axios from 'axios';
import { toast } from 'react-toastify';
import * as types from '../constants/BlueSquareEmailCCConstants';
import { ENDPOINTS } from '~/utils/URL';

// ========== ACTION CREATORS ==========
const addBlueSquareEmailCC = data => ({
  type: types.ADD_BLUE_SQUARE_EMAIL_CC,
  payload: {
    list: data.infringementCCList || [],
    message: data.message,
  },
});

const removeBlueSquareEmailCC = data => ({
  type: types.REMOVE_BLUE_SQUARE_EMAIL_CC,
  payload: {
    list: data.infringementCCList || [],
    message: data.message,
  },
});

const blueSquareEmailCCError = error => ({
  type: types.BLUE_SQUARE_EMAIL_CC_ERROR,
  payload: error,
});


// ===================== API ACTIONS =====================

// ADD CC EMAIL
export const addCCEmail = (userId, payload) => {
  return async dispatch => {
    try {
      const response = await axios.post(ENDPOINTS.ADD_BLUE_SQUARE_EMAIL_CC(userId), payload);
      if (response.status === 200) {
        const infringementCCList = response.data.infringementCCList || [];

        dispatch(addBlueSquareEmailCC(response.data));
        toast.success(response.data.message || 'CC email added successfully!');

        return {ccList: infringementCCList, ccCount: infringementCCList.length};
      } else {
        dispatch(blueSquareEmailCCError(response.data));
        toast.error('Failed to add CC email.');
        return null;
      }
    } catch (err) {
      dispatch(blueSquareEmailCCError(err));
      toast.error(err?.response?.data?.error || 'Failed to add CC email.');
      throw err;
    }
  };
};


// DELETE CC EMAIL
export const deleteCCEmail = (userId, email) => {
  return async dispatch => {
    try {

      const url = ENDPOINTS.DELETE_BLUE_SQUARE_EMAIL_CC(userId, encodeURIComponent(email));
      const response = await axios.delete(url);

      if (response.status === 200) {
        const infringementCCList = response.data.infringementCCList || [];

        dispatch(removeBlueSquareEmailCC(response.data));

        toast.info(response.data.message || 'CC email removed successfully!');
        return {ccList: infringementCCList, ccCount: infringementCCList.length};
      } else {
        dispatch(blueSquareEmailCCError(response.data));
        toast.error('Failed to remove CC email.');
        return null;
      }
    } catch (err) {
      dispatch(blueSquareEmailCCError(err));
      toast.error(err?.response?.data?.error || 'Failed to remove CC email.');
      throw err;
    }
  };
};
