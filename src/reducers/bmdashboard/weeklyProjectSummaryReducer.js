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
  projectStatusActiveRequestId: null,
  projectStatusActiveRequestKey: null,
  projectStatusDataRequestKey: null,
  projectStatusErrorRequestKey: null,
};

const isStaleProjectStatusAction = (state, action) => {
  const activeRequestId = state.projectStatusActiveRequestId;
  const actionRequestId = action.meta?.requestId;

  return Boolean(activeRequestId && actionRequestId && actionRequestId !== activeRequestId);
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
        projectStatusData: null,
        projectStatusActiveRequestId: action.meta?.requestId || null,
        projectStatusActiveRequestKey: action.meta?.requestKey || null,
        projectStatusDataRequestKey: null,
        projectStatusErrorRequestKey: null,
      };

    case FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_SUCCESS:
      if (isStaleProjectStatusAction(state, action)) {
        return state;
      }

      return {
        ...state,
        projectStatusLoading: false,
        projectStatusData: action.payload,
        projectStatusError: null,
        projectStatusActiveRequestId: action.meta?.requestId || state.projectStatusActiveRequestId,
        projectStatusActiveRequestKey:
          action.meta?.requestKey || state.projectStatusActiveRequestKey,
        projectStatusDataRequestKey: action.meta?.requestKey || null,
        projectStatusErrorRequestKey: null,
      };

    case FETCH_WEEKLY_PROJECT_SUMMARY_PROJECT_STATUS_ERROR:
      if (isStaleProjectStatusAction(state, action)) {
        return state;
      }

      return {
        ...state,
        projectStatusLoading: false,
        projectStatusData: null,
        projectStatusError: action.payload,
        projectStatusActiveRequestId: action.meta?.requestId || state.projectStatusActiveRequestId,
        projectStatusActiveRequestKey:
          action.meta?.requestKey || state.projectStatusActiveRequestKey,
        projectStatusDataRequestKey: null,
        projectStatusErrorRequestKey: action.meta?.requestKey || null,
      };

    default:
      return state;
  }
};
