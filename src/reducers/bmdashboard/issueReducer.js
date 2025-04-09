import {
  FETCH_ISSUES_BARCHART_REQUEST,
  FETCH_ISSUES_BARCHART_SUCCESS,
  FETCH_ISSUES_BARCHART_FAILURE,
} from '../../constants/bmdashboard/issueConstants';

const initialState = {
  loading: false,
  issues: [],
  issueTypes: [], // Store for issue types
  years: [], // Store for years
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
    default:
      return state;
  }
};

export default issueReducer;
