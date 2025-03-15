import * as actions from '../constants/weeklySummaries';

const initialState = {
  summaries: {},
  loading: false,
  fetchError: null,
};

export const weeklySummariesReducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.FETCH_WEEKLY_SUMMARIES_BEGIN:
      return {
        ...state,
        loading: true,
        fetchError: null,
      };

    case actions.FETCH_WEEKLY_SUMMARIES_SUCCESS:
      return {
        ...state,
        loading: false,
        summaries: action.payload.weeklySummariesData,
      };
      
    case actions.FETCH_WEEKLY_SUMMARIES_ERROR:
      return {
        ...state,
        loading: false,
        fetchError: action.payload.error,
      };

      case actions.POST_WEEKLY_SUMMARY_FILTERS:
        console.log("reducer file data", action)
        debugger;
        return {
          ...state,
          loading: false,
          weeklySummaryFiltersSaved: action.data
        };

        case actions.GET_USER_WEEKLY_SUMMARY_FILTER:
          console.log("reducer file data", action)
        debugger;
          return {
            ...state,
            loading: false,
            savedWeeklySummaryFilters: action.data
          };

    default:
      return state;
  }
};
