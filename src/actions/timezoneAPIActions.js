import httpService from 'services/httpService';
import * as actions from '../constants/timezoneApiConstants';

import { ENDPOINTS } from '../utils/URL';

/**
 *
 * Action to fetch API Key, set loading true
 */
export const fetchAPIKeyBegin = () => ({
  type: actions.FETCH_TIMEZONE_KEY,
});

/**
 * Action to set API key in store
 * @param {Object} API_KEY User's API Key
 */
export const fetchAPIKeySuccess = userAPIKey => ({
  type: actions.RECEIVE_TIMEZONE_KEY,
  payload: { userAPIKey },
});

/**
 * Action to set Error if fetching API Key fails
 * @param {Object} error Fetch Error object
 */
export const fetchAPIKeyError = error => ({
  type: actions.FETCH_TIMEZONE_KEY_ERROR,
  payload: { error },
});

/**
 * Fetch API Key
 *
 */
export const getTimeZoneAPIKey = () => {
  const url = ENDPOINTS.TIMEZONE_KEY;
  return async dispatch => {
    await dispatch(fetchAPIKeyBegin());
    const response = await httpService.get(url).catch(error => {
      dispatch(fetchAPIKeyError(error));
      return error.response;
    });
    const { userAPIKey } = response.data;
    await dispatch(fetchAPIKeySuccess(userAPIKey));
  };
};
