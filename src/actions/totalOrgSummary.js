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

export const getTaskAndProjectStats = (startDate, endDate) => {
  const url = ENDPOINTS.HOURS_TOTAL_ORG_SUMMARY(startDate, endDate);
  return async dispatch => {
    await dispatch(fetchTotalOrgSummaryReportBegin());
    try {
      const response = await axios.get(url);
      dispatch(fetchTotalOrgSummaryReportSuccess(response.data));
      return response.data;
    } catch (error) {
      dispatch(fetchTotalOrgSummaryReportError(error));
      return error.response.status;
    }
  };
};

/**
 * This action is used to set the volunteer stats data in store.
 *
 * @param {array} volunteerOverview An array of all volunteer stats data
 */
export const fetchTotalOrgSummaryDataSuccess = volunteerOverview => ({
  type: actions.FETCH_TOTAL_ORG_SUMMARY_DATA_SUCCESS,
  payload: { volunteerOverview },
});

/**
 * keep record of error while fetching the volunteer stats data
 *
 * @param {Object} error The error object.
 */
export const fetchTotalOrgSummaryDataError = fetchingError => ({
  type: actions.FETCH_TOTAL_ORG_SUMMARY_DATA_ERROR,
  payload: { fetchingError },
});

export const getTotalOrgSummary = (startDate, endDate) => {
  const url = ENDPOINTS.TOTAL_ORG_SUMMARY(startDate, endDate);
  return async dispatch => {
    dispatch(fetchTotalOrgSummaryReportBegin());
    try {
      const response = await axios.get(url);
      dispatch(fetchTotalOrgSummaryDataSuccess(response.data));
      return {status: response.status, data: response.data};
    } catch (error) {
      dispatch(fetchTotalOrgSummaryDataError(error));
      return error.response.status;
    }
  };
};

/**
 * Action to set the 'loading' flag to true.
 */
export const fetchVolunteerRolesTeamStatsBegin = () => ({
  type: actions.FETCH_VOLUNTEER_ROLES_TEAM_STATS_BEGIN
});

/**
 * This action is used to set the Team Stats in Volunteer Roles Weekly Summary Dashboard
 *
 * @param {object} volunteerRoleTeamStats An Object with the count of active members in the team.
 */
export const fetchVolunteerRolesTeamStatsSuccess = (volunteerRoleTeamStats) => ({
  type: actions.FETCH_VOLUNTEER_ROLES_TEAM_STATS_SUCCESS,
  payload: { volunteerRoleTeamStats },
});

/**
 * Handle the error case.
 *
 * @param {Object} error The error object.
 */
export const fetchVolunteerRolesTeamStatsError = error => ({
  type: actions.FETCH_VOLUNTEER_ROLES_TEAM_STATS_ERROR,
  payload: { error },
});

export const getTeamStatsActiveMembers = (endDate, activeMembersMinimum) =>{

const url =  ENDPOINTS.VOLUNTEER_ROLES_TEAM_STATS(endDate, activeMembersMinimum);
  return async dispatch => {
    dispatch(fetchVolunteerRolesTeamStatsBegin());
    try {
      const response = await axios.get(url);
      dispatch(fetchVolunteerRolesTeamStatsSuccess(response.data));
      return {
        data: response.data
      };
    } catch (error) {
      dispatch(fetchVolunteerRolesTeamStatsError(error));
      return error.response.status;
    }
  };
}
