import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import {
  FETCH_USER_PREFERENCES_REQUEST,
  FETCH_USER_PREFERENCES_SUCCESS,
  FETCH_USER_PREFERENCES_FAILURE,
  UPDATE_USER_PREFERENCES_REQUEST,
  UPDATE_USER_PREFERENCES_SUCCESS,
  UPDATE_USER_PREFERENCES_FAILURE,
} from '../../constants/lbdashboard/userPreferenceConstants';

export const fetchUserPreferences = (userId, selectedUserId) => async dispatch => {
  try {
    dispatch({ type: FETCH_USER_PREFERENCES_REQUEST });

    const { data } = await axios.post(ENDPOINTS.LB_GET_USER_PREFERENCES, {
      userId,
      selectedUserId,
    });

    dispatch({
      type: FETCH_USER_PREFERENCES_SUCCESS,
      payload: data,
    });

    return { type: FETCH_USER_PREFERENCES_SUCCESS, payload: data };
  } catch (error) {
    dispatch({
      type: FETCH_USER_PREFERENCES_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

export const updateUserPreferences = (userId, selectedUserId, preferences) => async dispatch => {
  try {
    dispatch({ type: UPDATE_USER_PREFERENCES_REQUEST });

    const { data } = await axios.put(ENDPOINTS.LB_UPDATE_USER_PREFERENCES, {
      userId,
      selectedUserId,
      notifyInApp: preferences?.notifyInApp,
      notifyEmail: preferences?.notifyEmail,
    });

    dispatch({
      type: UPDATE_USER_PREFERENCES_SUCCESS,
      payload: data,
    });

    return { type: UPDATE_USER_PREFERENCES_SUCCESS, payload: data };
  } catch (error) {
    dispatch({
      type: UPDATE_USER_PREFERENCES_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

