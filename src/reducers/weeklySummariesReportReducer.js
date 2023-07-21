import * as actions from '../constants/weeklySummariesReport';

const initialState = {
  summaries: [],
  loading: false,
  error: null,
};

// eslint-disable-next-line import/prefer-default-export
export const weeklySummariesReportReducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.FETCH_SUMMARIES_REPORT_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actions.FETCH_SUMMARIES_REPORT_SUCCESS:
      return {
        ...state,
        loading: false,
        summaries: action.payload.weeklySummariesData,
      };

    case actions.FETCH_SUMMARIES_REPORT_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        // summaries: [],
      };

    default:
      return state;
  }
};
