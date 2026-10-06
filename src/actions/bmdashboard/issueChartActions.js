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
  FETCH_MOST_EXPENSIVE_ISSUES_FAILURE,
  SET_DATE_FILTER,
  SET_PROJECT_FILTER,
} from '../../constants/bmdashboard/issueConstants';
import { ENDPOINTS } from '../../utils/URL';

export const fetchIssues = () => async dispatch => {
  try {
    dispatch({ type: FETCH_ISSUES_BARCHART_REQUEST });
    const { data } = await axios.get(ENDPOINTS.BM_ISSUE_CHART);
    dispatch({ type: FETCH_ISSUES_BARCHART_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: FETCH_ISSUES_BARCHART_FAILURE,
      payload: error.message || 'Failed to fetch issues',
    });
  }
};

export const fetchIssueTypesAndYears = () => async dispatch => {
  try {
    dispatch({ type: FETCH_ISSUE_TYPES_YEARS_REQUEST });
    const { data } = await axios.get(ENDPOINTS.BM_ISSUE_CHART);
    const issueTypes = [...new Set(data.map(item => item._id.issueType))];
    const years = [...new Set(data.map(item => item._id.issueYear))];
    dispatch({ type: FETCH_ISSUE_TYPES_YEARS_SUCCESS, payload: { issueTypes, years } });
  } catch (error) {
    dispatch({
      type: FETCH_ISSUE_TYPES_YEARS_FAILURE,
      payload: error.message || 'Failed to fetch issue types and years',
    });
  }
};

const formatFilters = ({ projectIds, startDate, endDate } = {}) => {
  const formatted = {};
  if (
    (typeof projectIds === 'string' && projectIds.trim() !== '') ||
    (Array.isArray(projectIds) && projectIds.length > 0)
  ) {
    formatted.projectIds = Array.isArray(projectIds) ? projectIds.join(',') : projectIds.trim();
  }
  if (startDate !== undefined && startDate !== '') {
    formatted.startDate = startDate;
  }
  if (endDate !== undefined && endDate !== '') {
    formatted.endDate = endDate;
  }
  return formatted;
};

export const fetchLongestOpenIssues = filters => async dispatch => {
  try {
    dispatch({ type: FETCH_LONGEST_OPEN_ISSUES_REQUEST });
    const formattedFilters = formatFilters(filters);
    const response = await axios.get(ENDPOINTS.BM_LONGEST_OPEN_ISSUES, {
      params: formattedFilters,
    });
    dispatch({ type: FETCH_LONGEST_OPEN_ISSUES_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({
      type: FETCH_LONGEST_OPEN_ISSUES_FAILURE,
      payload: error.message || 'Failed to fetch longest open issues',
    });
  }
};

export const fetchMostExpensiveIssues = filters => async dispatch => {
  try {
    dispatch({ type: FETCH_MOST_EXPENSIVE_ISSUES_REQUEST });
    const formattedFilters = formatFilters(filters);
    const response = await axios.get(ENDPOINTS.BM_MOST_EXPENSIVE_ISSUES, {
      params: formattedFilters,
    });
    dispatch({ type: FETCH_MOST_EXPENSIVE_ISSUES_SUCCESS, payload: response.data });
  } catch (error) {
    dispatch({
      type: FETCH_MOST_EXPENSIVE_ISSUES_FAILURE,
      payload: error.message || 'Failed to fetch most expensive issues',
    });
  }
};

export const setDateFilter = dates => ({ type: SET_DATE_FILTER, payload: dates });

export const setProjectFilter = projects => ({ type: SET_PROJECT_FILTER, payload: projects });
