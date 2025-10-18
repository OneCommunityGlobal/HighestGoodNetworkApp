import {
  FETCH_ISSUES_SUMMARY_REQUEST,
  FETCH_ISSUES_SUMMARY_SUCCESS,
  FETCH_ISSUES_SUMMARY_FAILURE,
  FETCH_ISSUES_TREND_REQUEST,
  FETCH_ISSUES_TREND_SUCCESS,
  FETCH_ISSUES_TREND_FAILURE,
} from '../../constants/bmdashboard/issueGraphConstants';

const initialState = {
  loading: false,
  issueSummary: null,
  issueTrend: null,
  error: null,
};

const issueGraphReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ISSUES_SUMMARY_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_ISSUES_TREND_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_ISSUES_SUMMARY_SUCCESS:
      return { ...state, loading: false, issueSummary: action.payload };
    case FETCH_ISSUES_TREND_SUCCESS:
      return { ...state, loading: false, issueTrend: action.payload };
    case FETCH_ISSUES_SUMMARY_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case FETCH_ISSUES_TREND_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default issueGraphReducer;
