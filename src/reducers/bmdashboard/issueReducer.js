import {
  FETCH_ISSUES_BARCHART_REQUEST,
  FETCH_ISSUES_BARCHART_SUCCESS,
  FETCH_ISSUES_BARCHART_FAILURE,
  FETCH_ISSUE_TYPES_YEARS_REQUEST,
  FETCH_ISSUE_TYPES_YEARS_SUCCESS,
  FETCH_ISSUE_TYPES_YEARS_FAILURE,
  SET_ISSUES,
  FETCH_LONGEST_OPEN_ISSUES_REQUEST,
  FETCH_LONGEST_OPEN_ISSUES_SUCCESS,
  FETCH_LONGEST_OPEN_ISSUES_FAILURE,
  SET_DATE_FILTER,
  SET_PROJECT_FILTER,
} from '../../constants/bmdashboard/issueConstants';

const initialState = {
  loading: false,
  issues: [],
  issueTypes: [], // Store for issue types
  years: [], // Store for years
  error: null,
  selectedDates: [],
  selectedProjects: [],
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
    case SET_ISSUES:
      return { ...state, loading: false, issues: action.payload };
    case FETCH_LONGEST_OPEN_ISSUES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_LONGEST_OPEN_ISSUES_SUCCESS:
      return {
        ...state,
        loading: false,
        issues: action.payload,
        error: null,
      };
    case FETCH_LONGEST_OPEN_ISSUES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case SET_DATE_FILTER:
      return {
        ...state,
        selectedDates: action.payload,
      };
    case SET_PROJECT_FILTER:
      return {
        ...state,
        selectedProjects: action.payload,
      };
    default:
      return state;
  }
};

export default issueReducer;
