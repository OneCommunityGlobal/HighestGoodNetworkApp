import axios from 'axios';
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
  FETCH_MOST_EXPENSIVE_ISSUES_FAILURE
} from '../../constants/bmdashboard/issueConstants';
import { ENDPOINTS } from '../../utils/URL'; // Import the endpoints

// Action to fetch issues for the bar chart
export const fetchIssues = filters => async dispatch => {
  try {
    dispatch({ type: FETCH_ISSUES_BARCHART_REQUEST });

    const { data } = await axios.get(ENDPOINTS.BM_ISSUE_CHART, { params: filters });

    dispatch({
      type: FETCH_ISSUES_BARCHART_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_ISSUES_BARCHART_FAILURE,
      payload: error.message || 'Failed to fetch issues',
    });
  }
};

// Action to fetch issue types and years (used for dropdowns)
export const fetchIssueTypesAndYears = () => async dispatch => {
  try {
    dispatch({ type: FETCH_ISSUE_TYPES_YEARS_REQUEST });

    const { data } = await axios.get(ENDPOINTS.BM_ISSUE_CHART);

    // Extract unique issueTypes and years from the response data
    const issueTypes = [...new Set(data.map(item => item._id.issueType))];
    const years = [...new Set(data.map(item => item._id.issueYear))];
    dispatch({
      type: FETCH_ISSUE_TYPES_YEARS_SUCCESS,
      payload: {
        issueTypes,
        years,
      },
    });
  } catch (error) {
    dispatch({
      type: FETCH_ISSUE_TYPES_YEARS_FAILURE,
      payload: error.message || 'Failed to fetch issue types and years',
    });
  }
};

// GET / issues / longest - open ? projectIds = proj1, proj2 & startDate=xxx & endDate=xxx
export const fetchLongestOpenIssues = (filters) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_LONGEST_OPEN_ISSUES_REQUEST });

    const response = await axios.get(ENDPOINTS.BM_LONGEST_OPEN_ISSUES, { params: filters });

    // Add validation
    if (!response.data) {
      throw new Error('Empty response from server');
    }

    dispatch({
      type: FETCH_LONGEST_OPEN_ISSUES_SUCCESS,
      payload: response.data
    });
  } catch (error) {

    dispatch({
      type: FETCH_LONGEST_OPEN_ISSUES_FAILURE,
      payload: error.message || 'Failed to parse server response'
    });
  }
};

// GET /issues/most-expensive?projectIds=proj1,proj2&startDate=xxx&endDate=xxx
export const fetchMostExpensiveIssues = (filters) => async dispatch => {
  try {
    dispatch({ type: FETCH_MOST_EXPENSIVE_ISSUES_REQUEST });

    const response = await axios.get(ENDPOINTS.BM_MOST_EXPENSIVE_ISSUES, { params: filters });

     if (!response.data) {
      throw new Error('Empty response from server');
     }

    dispatch({
      type: FETCH_MOST_EXPENSIVE_ISSUES_SUCCESS,
      payload: response.data
    });
  } catch (error) {

    dispatch({
      type: FETCH_MOST_EXPENSIVE_ISSUES_FAILURE,
      payload: error.message || 'Failed to fetch most expensive issues',
    });
  }
};
