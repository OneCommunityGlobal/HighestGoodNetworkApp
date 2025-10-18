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

export const fetchIssueSummary = () => async dispatch => {
  try{
    dispatch({ type: FETCH_ISSUES_SUMMARY_REQUEST });

    const { data } = await axios.get(ENDPOINTS.BM_ISSUES_BARGRAPH_SUMMARY);
    dispatch({ type: FETCH_ISSUES_SUMMARY_SUCCESS, payload: data });
  }catch(error){
    dispatch({
      type: FETCH_ISSUES_SUMMARY_FAILURE,
      payload: error.message || 'Failed to fetch issue summary',
    });
  }
}

export const fetchIssueTrend = () => async dispatch => {
  try{
    dispatch({ type: FETCH_ISSUES_TREND_REQUEST });

    const { data } = await axios.get(ENDPOINTS.BM_ISSUES_BARGRAPH_TREND);
    dispatch({ type: FETCH_ISSUES_TREND_SUCCESS, payload: data });
  }catch(error){
    dispatch({
      type: FETCH_ISSUES_TREND_FAILURE,
      payload: error.message || 'Failed to fetch issue trend',
    });
  }
};