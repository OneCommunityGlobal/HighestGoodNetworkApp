import * as actions from '../constants/weeklySummariesReport';

const initialState = {
  summaries: [],
  loading: false,
  error: null,
};

// eslint-disable-next-line default-param-last
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
      };

    case actions.UPDATE_SUMMARY_REPORT: {
      const { _id, updatedField } = action.payload;
      const newSummaries = [...state.summaries];
      console.log(newSummaries)
      for (let i = 0; i < newSummaries.length; i++) {
        if (newSummaries[i]._id === _id) {
          console.log(newSummaries[i]._id);
          console.log(newSummaries[i]);
          // update top-level fields
          newSummaries[i] = { ...newSummaries[i], ...updatedField };

          // update only matching weeklySummaries entries
          if (Array.isArray(newSummaries[i].weeklySummaries)) {
            newSummaries[i].weeklySummaries = newSummaries[i].weeklySummaries.map(summary => {
              if (!summary) return summary; // preserve null slots

              // match by week (we assume same bioPosted for all weeks)
              return {
                ...summary,
                bioPosted: updatedField.bioPosted ?? summary.bioPosted,
              };
            });
          }
        }
      }

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
