import httpService from 'services/httpService';
import * as actions from '../constants/timezoneApiConstants';

import { ENDPOINTS } from '../utils/URL';

/**
 *
 * Action to fetch Timezone data, set loading true
 */
export const fetchAPILocationBegin = () => ({
  type: actions.FETCH_TIMEZONE_LOCATION,
});

/**
 * Action to set Timezone data in store
 * @param {Object} timezone User's timezone name
 * @param {Object} currentLocation User's currentLocation details
 */
export const fetchAPILocationSuccess = ({ timezone, currentLocation }) => ({
  type: actions.RECEIVE_TIMEZONE_LOCATION,
  payload: { timezone, currentLocation },
});

/**
 * Action to set Error if fetching Timezone data fails
 * @param {Object} error Fetch Error object
 */
export const fetchAPILocationError = error => ({
  type: actions.FETCH_TIMEZONE_LOCATION_ERROR,
  payload: { error },
});

/**
 * Fetch Timezone data
 *
 */
export const getTimeZone = (location) => {
  const url = ENDPOINTS.TIMEZONE_LOCATION(location);
  return async dispatch => {
    await dispatch(fetchAPILocationBegin());
    try {
      const response = await httpService.get(url);
      const {timezone, currentLocation }  = response.data;
      await dispatch(fetchAPILocationSuccess({ timezone, currentLocation }));
      return { timezone, currentLocation };
    } catch (error) {
      dispatch(fetchAPILocationError(error));
      return error.response;
    }
  };
};

/**
 * Fetch Timezone data specifically for initial setup
 * @param {string} location User's location
 * @param {string} token User's set up token
 */
export const getTimeZoneProfileInitialSetup = (location, token) => {
  const url = ENDPOINTS.TIMEZONE_LOCATION(location);
  return async dispatch => {
    await dispatch(fetchAPILocationBegin());
    try {
      const response = await httpService.post(url, { token });
      const {timezone, currentLocation }  = response.data;
      await dispatch(fetchAPILocationSuccess({ timezone, currentLocation }));
      return { timezone, currentLocation };
    } catch (error) {
      dispatch(fetchAPILocationError(error));
      return error.response;
    }
  };
};