import axios from 'axios';
import {
  FETCH_ISSUES_BARCHART_REQUEST,
  FETCH_ISSUES_BARCHART_SUCCESS,
  FETCH_ISSUES_BARCHART_FAILURE,
} from '../../constants/bmdashboard/issueConstants';
import { ENDPOINTS } from '../../utils/URL';

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
      payload: error.response?.data?.message || 'Server Error',
    });
  }
};
