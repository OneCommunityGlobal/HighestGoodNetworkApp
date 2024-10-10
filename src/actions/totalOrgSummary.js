import axios from 'axios';
import * as actions from '../constants/totalOrgSummary';
import { ENDPOINTS } from '../utils/URL';

/**
 * Action to set the 'loading' flag to true.
 */
export const fetchTotalOrgSummaryReportBegin = () => ({
  type: actions.FETCH_TOTAL_ORG_SUMMARY_BEGIN,
});

/**
 * This action is used to set the volunteer weekly summaries in store.
 *
 * @param {array} volunteerstats An array of all active users.
 */
export const fetchTotalOrgSummaryReportSuccess = volunteerstats => ({
  type: actions.FETCH_TOTAL_ORG_SUMMARY_SUCCESS,
  payload: { volunteerstats },
});
/**
 * Handle the error case.
 *
 * @param {Object} error The error object.
 */
export const fetchTotalOrgSummaryReportError = error => ({
  type: actions.FETCH_TOTAL_ORG_SUMMARY_ERROR,
  payload: { error },
});

export const getTotalOrgSummary = (startDate, endDate) => {
  const url = ENDPOINTS.TOTAL_ORG_SUMMARY(startDate, endDate);
  return async dispatch => {
    await dispatch(fetchTotalOrgSummaryReportBegin());
    try {
      const response = await axios.get(url);
      dispatch(fetchTotalOrgSummaryReportSuccess(response.data));
      return {status: response.status, data: response.data};
    } catch (error) {
      dispatch(fetchTotalOrgSummaryReportError(error));
      return error.response.status;
    }
  };
};
