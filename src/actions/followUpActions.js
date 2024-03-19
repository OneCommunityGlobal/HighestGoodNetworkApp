import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';
import * as types from '../constants/followUpConstants';

const getAllFollowUps = allFollowUps => ({
  type: types.FETCH_ALL_FOLLOWUPS,
  payload: allFollowUps,
});

const followUpFetchError = error => ({
  type: types.SET_FOLLOWUP_ERROR,
  payload: error,
});

const setFollowUp = followUp => ({
  type: types.SET_FOLLOWUP,
  payload: followUp,
});

export const fetchAllFollowUps = () => {
  const url = ENDPOINTS.GET_ALL_FOLLOWUPS();
  return async dispatch => {
    try {
      const response = await axios.get(url);
      if (response.status === 200) {
        dispatch(getAllFollowUps(response.data));
      } else {
        dispatch(followUpFetchError(response.data));
      }
    } catch (err) {
      dispatch(followUpFetchError(err));
    }
  };
};

export const setUserFollowUp = (userId, taskId, updateData) => {
  const url = ENDPOINTS.SET_USER_FOLLOWUP(userId, taskId);
  return async dispatch => {
    try {
      const response = await axios.post(url, updateData);
      if (response.status === 200) {
        dispatch(setFollowUp(response.data));
      } else {
        dispatch(followUpFetchError(response.data));
      }
    } catch (err) {
      dispatch(followUpFetchError(err));
    }
  };
};

