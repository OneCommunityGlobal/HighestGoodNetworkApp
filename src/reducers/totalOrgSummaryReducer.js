import * as actions from '../constants/totalOrgSummary';

const initialState = {
  volunteerstats: [],
  loading: false,
  error: null,
};

export const totalOrgSummaryReducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.FETCH_TOTAL_ORG_SUMMARY_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actions.FETCH_TOTAL_ORG_SUMMARY_SUCCESS:
      return {
        ...state,
        loading: false,
        volunteerstats: action.payload.volunteerstats,
      };

    case actions.FETCH_TOTAL_ORG_SUMMARY_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };

    default:
      return state;
  }
};
