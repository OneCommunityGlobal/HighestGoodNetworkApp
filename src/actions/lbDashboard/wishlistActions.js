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
import { ENDPOINTS } from '../../config/apiEndpoints';

export const fetchWishlist = () => async (dispatch) => {
  try {
    const token = localStorage.getItem('token');
    dispatch({ type: FETCH_WISHLIST_REQUEST });
    const response = await fetch(ENDPOINTS.LB_WISHLIST_FETCH, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: token }),
      },
    });
    const data = await response.json();
    if (!response.ok || !data || data.error) {
      throw new Error(data.error || 'Failed to fetch wishlist');
    }
    dispatch({ type: FETCH_WISHLIST_SUCCESS, payload: data.data });
  } catch (error) {
    dispatch({ type: FETCH_WISHLIST_FAIL, payload: error.message });
  } 
};

export const addToWishlist = (listingId) => async (dispatch) => {
  try {
    const token = localStorage.getItem('token');
    dispatch({ type: ADD_TO_WISHLIST_REQUEST });
    const response = await fetch(ENDPOINTS.LB_WISHLIST_ADD, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: token }),
      },
      body: JSON.stringify({ id: listingId }),
    });
    const data = await response.json();
    if (!response.ok || !data || data.error) {
      throw new Error(data.error || 'Failed to add to wishlist');
    }
    dispatch({ type: ADD_TO_WISHLIST_SUCCESS, payload: data.data });
  } catch (error) {
    dispatch({ type: ADD_TO_WISHLIST_FAIL, payload: error.message });
  } 
};

export const removeFromWishlist = (listingId) => async (dispatch) => {
  try {
    const token = localStorage.getItem('token');
    dispatch({ type: REMOVE_FROM_WISHLIST_REQUEST });
    const response = await fetch(ENDPOINTS.LB_WISHLIST_REMOVE, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: token }),
      },
      body: JSON.stringify({ id: listingId }),
    });
    const data = await response.json();
    if (!response.ok || !data || data.error) {
      throw new Error(data.error || 'Failed to remove from wishlist');
    }
    dispatch({ type: REMOVE_FROM_WISHLIST_SUCCESS, payload: data.data });
  } catch (error) {
    dispatch({ type: REMOVE_FROM_WISHLIST_FAIL, payload: error.message });
  } 
}