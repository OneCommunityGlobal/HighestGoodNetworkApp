import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import {
  FETCH_UNIT_DETAILS_REQUEST,
  FETCH_UNIT_DETAILS_SUCCESS,
  FETCH_UNIT_DETAILS_FAILURE,
  SUBMIT_BID_REQUEST,
  SUBMIT_BID_SUCCESS,
  SUBMIT_BID_FAILURE,
  NOTIFICATION_SUCCESS,
  NOTIFICATION_FAILURE,
} from '../../constants/lbdashboard/bidOverviewConstants';

export const fetchUnitDetails = listingId => async (dispatch) => {
  try {
    dispatch({ type: FETCH_UNIT_DETAILS_REQUEST });
    const url = ENDPOINTS.LB_BID_OVERVIEW(listingId);
    const { data } = await axios.get(url);
    dispatch({
      type: FETCH_UNIT_DETAILS_SUCCESS,
      payload: data.listingDetail,
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

export const submitBid = (listingId, bidData) => async (dispatch) => {
  try {
    dispatch({ type: SUBMIT_BID_REQUEST });
    const url = ENDPOINTS.LB_SUBMIT_BID(listingId);
    console.log('Submitting bid to:', url);
    console.log('Request body:', bidData); 
    const { data } = await axios.post(url, bidData);
    dispatch({
      type: SUBMIT_BID_SUCCESS,
      payload: data.bid,
    });
    if(data.notifications) {
      dispatch({
        type: NOTIFICATION_SUCCESS,
        payload: data.notifications,
      });
      console.log('Notifications:', data.notifications);
    }
    return data;
  } catch (error) {
    dispatch({
      type: SUBMIT_BID_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    dispatch({
      type: NOTIFICATION_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};