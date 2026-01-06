import axios from 'axios';
import {
  FETCH_ISSUES_BARCHART_REQUEST,
  FETCH_ISSUES_BARCHART_SUCCESS,
  FETCH_ISSUES_BARCHART_FAILURE,
  FETCH_LONGEST_OPEN_ISSUES_REQUEST,
  FETCH_LONGEST_OPEN_ISSUES_SUCCESS,
  FETCH_LONGEST_OPEN_ISSUES_FAILURE,
  SET_DATE_FILTER,
  SET_PROJECT_FILTER,
} from '../../constants/bmdashboard/issueConstants';
import { ENDPOINTS, ApiEndpoint } from '../../utils/URL';

// eslint-disable-next-line import/prefer-default-export
export const fetchIssues = () => async dispatch => {
  try {
    dispatch({ type: FETCH_ISSUES_BARCHART_REQUEST });

    // Fetch all data without applying any filters
    const { data } = await axios.get(ENDPOINTS.BM_ISSUE_CHART);
    dispatch({ type: FETCH_ISSUES_BARCHART_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: FETCH_ISSUES_BARCHART_FAILURE,
      payload: error.message || 'Failed to fetch issues',
    });
  }
};


export const fetchLongestOpenIssues = (dates = [], projects = []) => async dispatch => {
  try {
    dispatch({ type: FETCH_LONGEST_OPEN_ISSUES_REQUEST });

    const params = new URLSearchParams();
    if (dates.length) params.append('dates', dates.join(','));
    if (projects.length) params.append('projects', projects.join(','));
    console.log("==========", projects)

    const response = await axios.get(`${ApiEndpoint}/bm/issues/longest-open?${params}`);
    dispatch({
      type: FETCH_LONGEST_OPEN_ISSUES_SUCCESS,
      payload: response.data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_LONGEST_OPEN_ISSUES_FAILURE,
      payload: error.message,
    });
  }
};

export const setDateFilter = dates => ({
  type: SET_DATE_FILTER,
  payload: dates,
});

export const setProjectFilter = projects => ({
  type: SET_PROJECT_FILTER,
  payload: projects,
});
