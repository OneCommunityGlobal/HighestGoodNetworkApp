import * as actions from '../constants/totalOrgSummary';

const initialState = {
  volunteerstats: [],
  volunteerOverview: [],
  loading: false,
  error: null,
  fetchingError: null,
};

// eslint-disable-next-line default-param-last
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

    case actions.FETCH_TOTAL_ORG_SUMMARY_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        volunteerOverview: action.payload.volunteerOverview,
      };

    case actions.FETCH_TOTAL_ORG_SUMMARY_DATA_ERROR:
      return {
        ...state,
        loading: false,
        fetchingError: action.payload.fetchingError,
      };

    default:
      return state;
  }
};

export default totalOrgSummaryReducer;
