import axios from 'axios';
import {
  FETCH_WISHLIST_REQUEST,
  FETCH_WISHLIST_SUCCESS,
  FETCH_WISHLIST_FAIL,
  ADD_TO_WISHLIST_REQUEST,
  ADD_TO_WISHLIST_SUCCESS,
  ADD_TO_WISHLIST_FAIL,
  REMOVE_FROM_WISHLIST_REQUEST,
  REMOVE_FROM_WISHLIST_SUCCESS,
  REMOVE_FROM_WISHLIST_FAIL,
} from '../../constants/lbdashboard/wishlistConstants';
import { ENDPOINTS } from '../../utils/URL';

export const fetchWishlist = (userId) => {
  return async (dispatch) => {
    console.log('[fetchWishlist] userId:', userId);

    try {
      dispatch({ type: FETCH_WISHLIST_REQUEST });

      const url = ENDPOINTS.LB_FETCH_WISHLIST(userId);
      const res = await axios.get(url);

      console.log('[fetchWishlist] response:', res.data);

      dispatch({
        type: FETCH_WISHLIST_SUCCESS,
        payload: res.data
      });
    } catch (error) {
      console.error('[fetchWishlist] error:', error);
      dispatch({
        type: FETCH_WISHLIST_FAIL,
        payload: error.message
      });
    }
  };
};

export const addToWishlist = (userId, listingId) => {
  return async (dispatch) => {
    try {
      dispatch({ type: ADD_TO_WISHLIST_REQUEST });
      const url = ENDPOINTS.LB_ADD_TO_WISHLIST;
      const res = await axios.post(url, { userId, listingId });
      dispatch({ type: ADD_TO_WISHLIST_SUCCESS, payload: res.data });
    } catch (error) {
      dispatch({ type: ADD_TO_WISHLIST_FAIL, payload: error.message });
    }
  };
};


export const removeFromWishlist = (userId, listingId) => {
  return async (dispatch) => {
    try {
      dispatch({ type: REMOVE_FROM_WISHLIST_REQUEST });
      const url = ENDPOINTS.LB_REMOVE_FROM_WISHLIST(listingId);
      const res = await axios.delete(url, { data: { userId } }); 
      dispatch({ type: REMOVE_FROM_WISHLIST_SUCCESS, payload: res.data });
    } catch (error) {
      dispatch({ type: REMOVE_FROM_WISHLIST_FAIL, payload: error.message });
    }
  };
};
