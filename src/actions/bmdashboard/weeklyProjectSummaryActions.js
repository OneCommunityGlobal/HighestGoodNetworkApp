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

let weeklyProjectSummaryProjectStatusRequestCounter = 0;

const createWeeklyProjectSummaryProjectStatusRequestId = () => {
  weeklyProjectSummaryProjectStatusRequestCounter += 1;
  return `weekly-project-summary-project-status-${Date.now()}-${weeklyProjectSummaryProjectStatusRequestCounter}`;
};

export const getWeeklyProjectSummaryProjectStatusRequestKey = params => {
  const queryParams = new URLSearchParams();
  Object.entries(params || {})
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .forEach(([key, value]) => {
      queryParams.append(key, value);
    });

  return queryParams.toString();
};

export const fetchWeeklyProjectSummaryProjectStatusBegin = meta => ({
  type: FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_BEGIN,
  meta,
});

export const fetchWeeklyProjectSummaryProjectStatusSuccess = (payload, meta) => ({
  type: FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_SUCCESS,
  payload,
  meta,
});

export const fetchWeeklyProjectSummaryProjectStatusError = (error, meta) => ({
  type: FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_ERROR,
  payload: error,
  meta,
});

export const fetchWeeklyProjectSummaryProjectStatus = params => async dispatch => {
  const requestId = createWeeklyProjectSummaryProjectStatusRequestId();
  const requestKey = getWeeklyProjectSummaryProjectStatusRequestKey(params);
  const requestMeta = { requestId, requestKey };

  dispatch(fetchWeeklyProjectSummaryProjectStatusBegin(requestMeta));

  try {
    const queryParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const url = `${ENDPOINTS.BM_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS}?${queryParams.toString()}`;
    const response = await axios.get(url);
    dispatch(fetchWeeklyProjectSummaryProjectStatusSuccess(response.data, requestMeta));
    return response.data;
  } catch (error) {
    dispatch(fetchWeeklyProjectSummaryProjectStatusError(error, requestMeta));
    return null;
  }
};
