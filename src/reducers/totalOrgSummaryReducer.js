import * as actions from '../constants/totalOrgSummary';

const initialState = {
  volunteerstats: [],
  loading: false,
  error: null,
};

// eslint-disable-next-line default-param-last
export default function totalOrgSummaryReducer(state = initialState, action) {
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
}
