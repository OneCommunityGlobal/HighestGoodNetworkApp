import axios from 'axios';
import * as actions from '../constants/weeklyVolunteerSummary';
import { ENDPOINTS } from '../utils/URL';

/**
 * Action to set the 'loading' flag to true.
 */
export const fetchWeeklySummariesReportBegin = () => ({
  type: actions.FETCH_VOLUNTEER_SUMMARIES_REPORT_BEGIN,
});

/**
 * This action is used to set the weekly summaries reports in store.
 *
 * @param {array} volunteerstats An array of all active users.
 */
export const fetchWeeklySummariesReportSuccess = volunteerstats => ({
  type: actions.FETCH_VOLUNTEER_SUMMARIES_REPORT_SUCCESS,
  payload: { volunteerstats },
});

/**
 * Handle the error case.
 *
 * @param {Object} error The error object.
 */
export const fetchWeeklySummariesReportError = error => ({
  type: actions.FETCH_VOLUNTEER_SUMMARIES_REPORT_ERROR,
  payload: { error },
});
