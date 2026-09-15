import {
  SET_PROJECT_FILTER,
  SET_DATE_RANGE_FILTER,
  SET_COMPARISON_PERIOD_FILTER,
  FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_BEGIN,
  FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_SUCCESS,
  FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_ERROR,
} from '../../constants/bmdashboard/weeklyProjectSummaryConstants';

const initialState = {
  projectFilter: 'One Community',
  dateRangeFilter: '',
  comparisonPeriodFilter: 'No Comparison',
  projectStatusData: null,
  projectStatusLoading: false,
  projectStatusError: null,
};

// eslint-disable-next-line default-param-last, import/prefer-default-export
export const weeklyProjectSummaryReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_PROJECT_FILTER:
      return {
        ...state,
        projectFilter: action.payload,
      };

    case SET_DATE_RANGE_FILTER:
      return {
        ...state,
        dateRangeFilter: action.payload,
      };

    case SET_COMPARISON_PERIOD_FILTER:
      return {
        ...state,
        comparisonPeriodFilter: action.payload,
      };

    case FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_BEGIN:
      return {
        ...state,
        projectStatusLoading: true,
        projectStatusError: null,
      };

    case FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_SUCCESS:
      return {
        ...state,
        projectStatusLoading: false,
        projectStatusData: action.payload,
        projectStatusError: null,
      };

    case FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_ERROR:
      return {
        ...state,
        projectStatusLoading: false,
        projectStatusError: action.payload,
      };

    default:
      return state;
  }
};
