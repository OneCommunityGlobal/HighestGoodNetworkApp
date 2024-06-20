import * as actions from '../constants/weeklyVolunteerSummary';

const initialState = {
  volunteerstats: [],
  loading: false,
  error: null,
};

export const weeklyVolunteerSummariesReducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.FETCH_VOLUNTEER_SUMMARIES_REPORT_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actions.FETCH_VOLUNTEER_SUMMARIES_REPORT_SUCCESS:
      return {
        ...state,
        loading: false,
        volunteerstats: action.payload.volunteerstats,
      };

    case actions.FETCH_VOLUNTEER_SUMMARIES_REPORT_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };

    default:
      return state;
  }
};
