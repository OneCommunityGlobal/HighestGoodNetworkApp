import axios from 'axios';
import {
  GET_TIMELOG_TRACKING_START,
  GET_TIMELOG_TRACKING_SUCCESS,
  GET_TIMELOG_TRACKING_ERROR,
} from '../constants/timelogTracking';
import { ENDPOINTS } from '~/utils/URL';

export const getTimelogTrackingStart = () => ({
  type: GET_TIMELOG_TRACKING_START,
});

export const getTimelogTrackingSuccess = data => ({
  type: GET_TIMELOG_TRACKING_SUCCESS,
  payload: data,
});

export const getTimelogTrackingError = error => ({
  type: GET_TIMELOG_TRACKING_ERROR,
  payload: error,
});

export const addTimelogEvent = event => ({
  type: 'ADD_TIMELOG_EVENT',
  payload: event,
});

export const getTimelogTracking = userId => {
  const url = ENDPOINTS.TIMELOG_TRACKING(userId);
  return async dispatch => {
    dispatch(getTimelogTrackingStart());
    try {
      const response = await axios.get(url);
      dispatch(getTimelogTrackingSuccess(response.data));
    } catch (error) {
      dispatch(getTimelogTrackingError(error));
    }
  };
};
