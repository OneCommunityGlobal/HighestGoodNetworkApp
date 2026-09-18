import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import {
  FETCH_COST_BREAKDOWN_START,
  FETCH_COST_BREAKDOWN_SUCCESS,
  FETCH_COST_BREAKDOWN_ERROR,
  FETCH_COST_DETAIL_START,
  FETCH_COST_DETAIL_SUCCESS,
  FETCH_COST_DETAIL_ERROR,
  CLEAR_COST_DETAIL,
} from '../../constants/bmdashboard/costBreakdownConstants';

export const fetchCostBreakdown = ({ projectId, startDate, endDate } = {}) => {
  return async dispatch => {
    dispatch({ type: FETCH_COST_BREAKDOWN_START });
    try {
      const url = ENDPOINTS.BM_COST_BREAKDOWN(projectId, startDate, endDate);
      const res = await axios.get(url);
      dispatch({ type: FETCH_COST_BREAKDOWN_SUCCESS, payload: res.data });
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to load cost breakdown';
      dispatch({ type: FETCH_COST_BREAKDOWN_ERROR, payload: msg });
    }
  };
};

export const fetchCostDetail = ({ projectId, startDate, endDate } = {}) => {
  return async dispatch => {
    dispatch({ type: FETCH_COST_DETAIL_START });
    try {
      const url = ENDPOINTS.BM_COST_BREAKDOWN(projectId, startDate, endDate, true);
      const res = await axios.get(url);
      dispatch({ type: FETCH_COST_DETAIL_SUCCESS, payload: res.data });
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to load category details';
      dispatch({ type: FETCH_COST_DETAIL_ERROR, payload: msg });
    }
  };
};

export const clearCostDetail = () => ({
  type: CLEAR_COST_DETAIL,
});
