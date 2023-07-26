import * as actions from '../constants/weeklySummaries';

const initialState = {
  summaries: [],
  loading: false,
  fetchError: null,
};

// eslint-disable-next-line import/prefer-default-export
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

    default:
      return state;
  }
};
