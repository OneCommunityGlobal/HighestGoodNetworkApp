import {
  SET_PROJECT_FILTER,
  SET_DATE_RANGE_FILTER,
  SET_COMPARISON_PERIOD_FILTER,
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
