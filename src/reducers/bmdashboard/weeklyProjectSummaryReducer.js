import {
  SET_PROJECT_FILTER,
  SET_DATE_RANGE_FILTER,
  SET_COMPARISON_PERIOD_FILTER,
} from '../../constants/bmdashboard/weeklyProjectSummaryConstants';

const initialState = {
  projectFilter: 'One Community',
  dateRangeFilter: '',
  comparisonPeriodFilter: '',
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

    default:
      return state;
  }
};
