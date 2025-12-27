import axios from 'axios';
import {
  FETCH_ISSUES_SUMMARY_REQUEST,
  FETCH_ISSUES_SUMMARY_SUCCESS,
  FETCH_ISSUES_SUMMARY_FAILURE,
  FETCH_ISSUES_TREND_REQUEST,
  FETCH_ISSUES_TREND_SUCCESS,
  FETCH_ISSUES_TREND_FAILURE,
} from '../../constants/bmdashboard/issueGraphConstants';
import { ENDPOINTS } from '../../utils/URL';

export const fetchIssueSummary = (params = {}) => async dispatch => {
  try{
    dispatch({ type: FETCH_ISSUES_SUMMARY_REQUEST });
    const { data } = await axios.get(ENDPOINTS.BM_ISSUES_BARGRAPH_SUMMARY, { params });
    const normalizedData = data.data ? {
      total: data.data.totalIssues,
      newThisWeek: data.data.newIssues,
      resolved: data.data.resolvedIssues,
      avgResolution: data.data.averageResolutionTimeDays,
    } : {};
    dispatch({ type: FETCH_ISSUES_SUMMARY_SUCCESS, payload: normalizedData });
  }catch(error){
    dispatch({
      type: FETCH_ISSUES_SUMMARY_FAILURE,
      payload: error.message || 'Failed to fetch issue summary',
    });
  }
}

export const fetchIssueTrend = (params = {}) => async dispatch => {
  try{
    dispatch({ type: FETCH_ISSUES_TREND_REQUEST });
    const { data } = await axios.get(ENDPOINTS.BM_ISSUES_BARGRAPH_TREND, { params });
    const trendData = data.data || [];
    dispatch({ type: FETCH_ISSUES_TREND_SUCCESS, payload: trendData });
  }catch(error){
    dispatch({
      type: FETCH_ISSUES_TREND_FAILURE,
      payload: error.message || 'Failed to fetch issue trend',
    });
  }
};