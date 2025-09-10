import axios from "axios";
import { ENDPOINTS } from "../../utils/URL";
import {
  FETCH_USER_PREFERENCES_REQUEST,
  FETCH_USER_PREFERENCES_SUCCESS,
  FETCH_USER_PREFERENCES_FAILURE,
  UPDATE_USER_PREFERENCES_REQUEST,
  UPDATE_USER_PREFERENCES_SUCCESS,
  UPDATE_USER_PREFERENCES_FAILURE,
} from "../../constants/lbdashboard/userPreferenceConstants";

// Fetch user preferences
export const fetchUserPreferences = (userId, selectedUserId = null) => async (dispatch) => {
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

    return data;
  } catch (error) {
    Error("Error fetching user preferences:", error);
    dispatch({
      type: FETCH_USER_PREFERENCES_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    return null;
  }
};

// Update user preferences
export const updateUserPreferences = (userId, selectedUserId, preferences) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_USER_PREFERENCES_REQUEST });

    const { data } = await axios.put(ENDPOINTS.LB_UPDATE_USER_PREFERENCES, {
      userId,
      selectedUserId,
      ...preferences,
    });

    dispatch({
      type: UPDATE_USER_PREFERENCES_SUCCESS,
      payload: data,
    });

    return data;
  } catch (error) {
    dispatch({
      type: UPDATE_USER_PREFERENCES_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};