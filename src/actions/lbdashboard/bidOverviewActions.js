import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import {
  FETCH_UNIT_DETAILS_REQUEST,
  FETCH_UNIT_DETAILS_SUCCESS,
  FETCH_UNIT_DETAILS_FAILURE,
  SUBMIT_BID_REQUEST,
  SUBMIT_BID_SUCCESS,
  SUBMIT_BID_FAILURE,
} from '../../constants/lbdashboard/bidOverviewConstants';

export const fetchUnitDetails = (listingId) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_UNIT_DETAILS_REQUEST });

    const { data } = await axios.get(`${ENDPOINTS.LB_BID_OVERVIEW}/${listingId}`);

    dispatch({
      type: FETCH_UNIT_DETAILS_SUCCESS,
      payload: data,
    });
    return data;
  } catch (error) {
    dispatch({
      type: FETCH_UNIT_DETAILS_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    return null;
  }
};

export const submitBid = (bidData) => async (dispatch) => {
  try {
    dispatch({ type: SUBMIT_BID_REQUEST });

    const { data } = await axios.post(ENDPOINTS.LB_SUBMIT_BID, bidData);

    dispatch({
      type: SUBMIT_BID_SUCCESS,
      payload: data,
    });
    return data;
  } catch (error) {
    dispatch({
      type: SUBMIT_BID_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    return null;
  }
};