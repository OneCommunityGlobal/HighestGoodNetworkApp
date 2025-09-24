// blueSquareEmailCCAction.js

import axios from 'axios';
import { toast } from 'react-toastify';
import * as types from '../constants/BlueSquareEmailCCConstants'; // <-- You'll need to create this constants file
import { ENDPOINTS } from '~/utils/URL';

const addBlueSquareEmailCC = ccList => ({
  type: types.ADD_BLUE_SQUARE_EMAIL_CC,
  payload: ccList,
});

const removeBlueSquareEmailCC = ccList => ({
  type: types.REMOVE_BLUE_SQUARE_EMAIL_CC,
  payload: ccList,
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
      console.log('Dispatching addCCEmail with:', userId, payload);

      const response = await axios.post(ENDPOINTS.ADD_BLUE_SQUARE_EMAIL_CC(userId), payload);

      if (response.status === 200) {
        console.log('Add CC success:', response.data);

        // Update the store with the latest list
        dispatch(addBlueSquareEmailCC(response.data.infringementCCList));

        toast.success('CC email added successfully!');
      } else {
        dispatch(blueSquareEmailCCError(response.data));
        toast.error('Failed to add CC email.');
      }
    } catch (err) {
      console.error('Add CC error:', err);
      dispatch(blueSquareEmailCCError(err));
      toast.error(err?.response?.data?.error || 'Failed to add CC email.');
    }
  };
};


// DELETE CC EMAIL
export const deleteCCEmail = (userId, email) => {
  return async dispatch => {
    try {
      console.log('Dispatching deleteCCEmail with:', userId, email);

      const url = ENDPOINTS.DELETE_BLUE_SQUARE_EMAIL_CC(userId, encodeURIComponent(email));
      const response = await axios.delete(url);

      if (response.status === 200) {
        console.log('Delete CC success:', response.data);

        // Update the store with the latest list
        dispatch(removeBlueSquareEmailCC(response.data.infringementCCList));

        toast.info('CC email removed successfully!');
      } else {
        dispatch(blueSquareEmailCCError(response.data));
        toast.error('Failed to remove CC email.');
      }
    } catch (err) {
      console.error('Delete CC error:', err);
      dispatch(blueSquareEmailCCError(err));
      toast.error(err?.response?.data?.error || 'Failed to remove CC email.');
    }
  };
};
