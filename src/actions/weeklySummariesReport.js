import axios from 'axios';
import * as actions from '../constants/weeklySummariesReport';
import { ENDPOINTS } from '../utils/URL';

/**
 * Action to set the 'loading' flag to true.
 */
export const fetchWeeklySummariesReportBegin = () => ({
  type: actions.FETCH_SUMMARIES_REPORT_BEGIN,
});

/**
 * This action is used to set the weekly summaries reports in store.
 *
 * @param {array} weeklySummariesData An array of all active users.
 */
export const fetchWeeklySummariesReportSuccess = weeklySummariesData => ({
  type: actions.FETCH_SUMMARIES_REPORT_SUCCESS,
  payload: { weeklySummariesData },
});

/**
 * Handle the error case.
 *
 * @param {Object} error The error object.
 */
export const fetchWeeklySummariesReportError = error => ({
  type: actions.FETCH_SUMMARIES_REPORT_ERROR,
  payload: { error },
});

/**
 * Update one summary report
 * 
 * @param {Object} updatedField the updated field object, dynamic 
 */
export const updateSummaryReport = ({ _id, updatedField }) => ({
  type: actions.UPDATE_SUMMARY_REPORT,
  payload: { _id, updatedField },
});

/**
 * Gets all active users' summaries + a few other selected fields from the userProfile that
 * might be useful for the weekly summary report.
 */
export const getWeeklySummariesReport = () => {
  const url = ENDPOINTS.WEEKLY_SUMMARIES_REPORT();
  return async dispatch => {
    dispatch(fetchWeeklySummariesReportBegin());
    try {
      const response = await axios.get(url);
      dispatch(fetchWeeklySummariesReportSuccess(response.data));
      return response.status;
    } catch (error) {
      dispatch(fetchWeeklySummariesReportError(error));
      return error.response.status;
    }
  };
};

export const updateOneSummaryReport = (userId, updatedField) => {
  const url = ENDPOINTS.USER_PROFILE(userId);
  return async dispatch => {
    try {
      const { data: userProfile } = await axios.get(url);
      const res = await axios.put(url, {
        ...userProfile,
        ...updatedField,
      });
      if (res.status === 200) {
        dispatch(updateSummaryReport({ _id: userId, updatedField }));
        return res;
      } else {
        throw new Error(`An error occurred while attempting to save the changes to the profile.`)
      }
    } catch (err) {
      throw err;
    }
  }
};
