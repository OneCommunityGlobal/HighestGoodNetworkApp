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

const formatDateValue = date => {
  if (!date) return undefined;
  if (typeof date === 'string') {
    return date.split('T')[0];
  }
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return undefined;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatFilters = ({ projectIds, projects, startDate, endDate, dates } = {}) => {
  const formatted = {};
  const proj = projects || projectIds;
  if (
    (typeof proj === 'string' && proj.trim() !== '') ||
    (Array.isArray(proj) && proj.length > 0)
  ) {
    const projStr = Array.isArray(proj) ? proj.join(',') : proj.trim();
    formatted.projects = projStr;
    formatted.projectIds = projStr;
  }

  const startFormatted = formatDateValue(startDate);
  const endFormatted = formatDateValue(endDate);

  if (startFormatted !== undefined) {
    formatted.startDate = startFormatted;
  }
  if (endFormatted !== undefined) {
    formatted.endDate = endFormatted;
  }

  if (dates) {
    formatted.dates = dates;
  } else if (startFormatted && endFormatted) {
    formatted.dates = `${startFormatted},${endFormatted}`;
  } else if (startFormatted) {
    formatted.dates = startFormatted;
  } else if (endFormatted) {
    formatted.dates = endFormatted;
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
    dispatch({ type: FETCH_LONGEST_OPEN_ISSUES_SUCCESS, payload: response.data.data });
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
    dispatch({ type: FETCH_MOST_EXPENSIVE_ISSUES_SUCCESS, payload: response.data.data });
  } catch (error) {
    dispatch({
      type: FETCH_MOST_EXPENSIVE_ISSUES_FAILURE,
      payload: error.message || 'Failed to fetch most expensive issues',
    });
  }
};

export const setDateFilter = dates => ({ type: SET_DATE_FILTER, payload: dates });

export const setProjectFilter = projects => ({ type: SET_PROJECT_FILTER, payload: projects });