import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '~/utils/URL';

/**
 * Get property details with bid overview
 */
export const getPropertyBidOverview = (listingId) => {
  const url = `${ENDPOINTS.GET_PROPERTY_BID_OVERVIEW}/${listingId}`;
  return async (dispatch) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (err) {
      if (err.response?.status !== 401) {
        toast.info(err.message);
      }
      throw err;
    }
  };
};

/**
 * Place a bid
 */
export const placeBid = (listingId, payload) => {
  const url = `${ENDPOINTS.PLACE_BID}/bid/${listingId}`;
  return async (dispatch) => {
    try {
      const res = await axios.post(url, payload);
      return res.data;
    } catch (err) {
      if (err.response?.status !== 401) {
        toast.info(err.message);
      }
      throw err;
    }
  };
};

/**
 * Get bid notifications
 */
export const getBidNotifications = (userId) => {
  const url = `${ENDPOINTS.GET_BID_NOTIFICATIONS}/bidNotifications/${userId}`;
  return async (dispatch) => {
    try {
      const res = await axios.get(url);
      return res.data;
    } catch (err) {
      if (err.response?.status !== 401) {
        toast.info(err.message);
      }
      throw err;
    }
  };
};
