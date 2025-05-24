import {
  FETCH_ISSUES_BARCHART_REQUEST,
  FETCH_ISSUES_BARCHART_SUCCESS,
  FETCH_ISSUES_BARCHART_FAILURE,
  FETCH_ISSUE_TYPES_YEARS_REQUEST,
  FETCH_ISSUE_TYPES_YEARS_SUCCESS,
  FETCH_ISSUE_TYPES_YEARS_FAILURE,
  FETCH_LONGEST_OPEN_ISSUES_REQUEST,
  FETCH_LONGEST_OPEN_ISSUES_SUCCESS,
  FETCH_LONGEST_OPEN_ISSUES_FAILURE,
  FETCH_MOST_EXPENSIVE_ISSUES_REQUEST,
  FETCH_MOST_EXPENSIVE_ISSUES_SUCCESS,
  FETCH_MOST_EXPENSIVE_ISSUES_FAILURE,
} from '../../constants/bmdashboard/issueConstants';

const initialState = {
  loading: false,
  issues: [],
  issueTypes: [], // Store for issue types
  years: [], // Store for years
  longestOpenIssues: [], // Store for longest open issues
  mostExpensiveIssues: [], // Store for most expensive issues
  error: null,
};

// eslint-disable-next-line default-param-last
const issueReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ISSUES_BARCHART_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_ISSUES_BARCHART_SUCCESS:
      return { ...state, loading: false, issues: action.payload };
    case FETCH_ISSUES_BARCHART_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // New cases for fetching issue types and years
    case FETCH_ISSUE_TYPES_YEARS_REQUEST:
      return { ...state, loading: true };
    case FETCH_ISSUE_TYPES_YEARS_SUCCESS:
      return {
        ...state,
        loading: false,
        issueTypes: action.payload.issueTypes,
        years: action.payload.years,
      };
    case FETCH_ISSUE_TYPES_YEARS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    // Cases for longest open issues
    case FETCH_LONGEST_OPEN_ISSUES_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_LONGEST_OPEN_ISSUES_SUCCESS:
      return { ...state, loading: false, longestOpenIssues: action.payload.data };
    case FETCH_LONGEST_OPEN_ISSUES_FAILURE:
      return { ...state, loading: false, error: action.payload };

    // Cases for most expensive issues
    case FETCH_MOST_EXPENSIVE_ISSUES_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_MOST_EXPENSIVE_ISSUES_SUCCESS:
      return { ...state, loading: false, mostExpensiveIssues: action.payload.data };
    case FETCH_MOST_EXPENSIVE_ISSUES_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default issueReducer;
