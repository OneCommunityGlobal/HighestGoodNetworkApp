import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import {
  SET_PROJECT_FILTER,
  SET_DATE_RANGE_FILTER,
  SET_COMPARISON_PERIOD_FILTER,
  FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_BEGIN,
  FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_SUCCESS,
  FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_ERROR,
} from '../../constants/bmdashboard/weeklyProjectSummaryConstants';

export const setProjectFilter = project => ({
  type: SET_PROJECT_FILTER,
  payload: project,
});

export const setDateRangeFilter = dateRange => ({
  type: SET_DATE_RANGE_FILTER,
  payload: dateRange,
});

export const setComparisonPeriodFilter = comparisonPeriod => ({
  type: SET_COMPARISON_PERIOD_FILTER,
  payload: comparisonPeriod,
});

export const fetchWeeklyProjectSummaryProjectStatusBegin = () => ({
  type: FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_BEGIN,
});

export const fetchWeeklyProjectSummaryProjectStatusSuccess = payload => ({
  type: FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_SUCCESS,
  payload,
});

export const fetchWeeklyProjectSummaryProjectStatusError = error => ({
  type: FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_ERROR,
  payload: error,
});

export const fetchWeeklyProjectSummaryProjectStatus = params => async dispatch => {
  dispatch(fetchWeeklyProjectSummaryProjectStatusBegin());

  try {
    const queryParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const url = `${ENDPOINTS.BM_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS}?${queryParams.toString()}`;
    const response = await axios.get(url);
    dispatch(fetchWeeklyProjectSummaryProjectStatusSuccess(response.data));
    return response.data;
  } catch (error) {
    dispatch(fetchWeeklyProjectSummaryProjectStatusError(error));
    return null;
  }
};
