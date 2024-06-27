import axios from 'axios';
import * as actions from '../constants/totalOrgSummary';
import { ENDPOINTS } from '../utils/URL';

/**
 * Action to set the 'loading' flag to true.
 */
export const fetchWeeklyVolunteerSummariesReportBegin = () => ({
  type: actions.FETCH_TOTAL_ORG_SUMMARY_BEGIN,
});

/**
 * This action is used to set the volunteer weekly summaries in store.
 *
 * @param {array} volunteerstats An array of all active users.
 */
export const fetchWeeklyVolunteerSummariesReportSuccess = volunteerstats => ({
  type: actions.FETCH_TOTAL_ORG_SUMMARY_SUCCESS,
  payload: { volunteerstats },
});

/**
 * Handle the error case.
 *
 * @param {Object} error The error object.
 */
export const fetchWeeklyVolunteerSummariesReportError = error => ({
  type: actions.FETCH_TOTAL_ORG_SUMMARY_ERROR,
  payload: { error },
});

export const getWeeklyVolunteerSummaries = () => {
  const url = ENDPOINTS.WEEKLY_VOLUNTEER_SUMMARY();
  return async dispatch => {
    dispatch(fetchWeeklyVolunteerSummariesReportBegin());
    try {
      const response = await axios.get(url);
      dispatch(fetchWeeklyVolunteerSummariesReportSuccess(response.data));
      return {status: response.status, data: response.data};
    } catch (error) {
      dispatch(fetchWeeklyVolunteerSummariesReportError(error));
      return error.response.status;
    }
  };
};
