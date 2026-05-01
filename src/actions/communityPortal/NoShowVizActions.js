// actions.js

import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import {
  GET_NO_SHOWS_DATA,
  GET_NO_SHOWS_BY_LOCATION,
  GET_NO_SHOWS_BY_AGE_GROUP,
  GET_NO_SHOW_PROPORTIONS,
  GET_UNIQUE_EVENT_TYPES,
  GET_ATTENDANCE_BY_DAY,
  SET_ERROR,
} from '../../constants/communityPortal/NoShowVizConstants';

export const getNoShowsData = period => async dispatch => {
  try {
    const response = await axios.get(`${ENDPOINTS.CP_NOSHOW_VIZ_PERIOD}`, {
      params: { period },
    });
    const { data } = response;
    dispatch({
      type: GET_NO_SHOWS_DATA,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: SET_ERROR,
      payload: 'Error fetching no-show data.',
    });
  }
};

export const getNoShowsByLocation = () => async dispatch => {
  try {
    // Use axios to make the GET request
    const response = await axios.get(ENDPOINTS.CP_NOSHOW_VIZ_LOCATION);
    const { data } = response; // Axios automatically parses the JSON data
    dispatch({
      type: GET_NO_SHOWS_BY_LOCATION,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: SET_ERROR,
      payload: 'Error fetching no-shows by location.',
    });
  }
};

export const getNoShowsByAgeGroup = () => async dispatch => {
  try {
    const response = await axios.get(ENDPOINTS.CP_NOSHOW_VIZ_AGEGROUP);
    const { data } = response;
    dispatch({
      type: GET_NO_SHOWS_BY_AGE_GROUP,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: SET_ERROR,
      payload: 'Error fetching no-shows by age group.',
    });
  }
};

export const getNoShowProportions = () => async dispatch => {
  try {
    const response = await axios.get(ENDPOINTS.CP_NOSHOW_VIZ_PROPORTION);
    const { data } = response;
    dispatch({
      type: GET_NO_SHOW_PROPORTIONS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: SET_ERROR,
      payload: 'Error fetching no-show proportions.',
    });
  }
};

export const getUniqueEventTypes = () => async dispatch => {
  try {
    const response = await axios.get(ENDPOINTS.CP_NOSHOW_VIZ_UNIQUE_EVENTTYPES);
    const { data } = response;
    dispatch({
      type: GET_UNIQUE_EVENT_TYPES,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: SET_ERROR,
      payload: 'Error fetching unique event types.',
    });
  }
};

export const getAttendanceByDay = selectedEventType => async dispatch => {
  try {
    const response = await axios.get(`${ENDPOINTS.CP_ATTENDENCE_VIZ_DAY}`, {
      params: { selectedEventType },
    });

    const { data } = response;
    dispatch({
      type: GET_ATTENDANCE_BY_DAY,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: SET_ERROR,
      payload: 'Error fetching attendance by day.',
    });
  }
};
