import * as actions from '../constants/weeklySummariesReport';

const initialState = {
  summaries: [],
  loading: false,
  error: null,
};

// eslint-disable-next-line default-param-last
const weeklySummariesReportReducer = (state = initialState, action) => {
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
      };

    case actions.UPDATE_SUMMARY_REPORT: {
      // Wrap this block in braces to fix the lexical declaration issue
      const { _id, updatedField } = action.payload;
      const newSummaries = [...state.summaries];
      const summaryIndex = newSummaries.findIndex(summary => summary._id === _id);
      newSummaries[summaryIndex] = { ...newSummaries[summaryIndex], ...updatedField };
      return {
        ...state,
        summaries: newSummaries,
      };
    }

    default:
      return state;
  }
};

export default weeklySummariesReportReducer;
