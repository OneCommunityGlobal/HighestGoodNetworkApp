import axios from "axios";
import { ENDPOINTS } from "../../utils/URL";
import {
  FETCH_USER_WISHLIST_REQUEST,
  FETCH_USER_WISHLIST_SUCCESS,
  FETCH_USER_WISHLIST_FAILURE,
  ADD_TO_WISHLIST_REQUEST,
  ADD_TO_WISHLIST_SUCCESS,
  ADD_TO_WISHLIST_FAILURE,
  REMOVE_FROM_WISHLIST_REQUEST,
  REMOVE_FROM_WISHLIST_SUCCESS,
  REMOVE_FROM_WISHLIST_FAILURE,
} from "../../constants/lbdashboard/wishlistConstants";

export const fetchWishList = (userId) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_USER_WISHLIST_REQUEST });

    const { data } = await axios.get(ENDPOINTS.LB_GET_USER_WISHLIST(userId));

    dispatch({ type: FETCH_USER_WISHLIST_SUCCESS, payload: data });
    return data;
  } catch (error) {
    dispatch({
      type: FETCH_USER_WISHLIST_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    return null;
  }
};

export const addToWishList = (userId, listingId) => async (dispatch) => {
  try {
    dispatch({ type: ADD_TO_WISHLIST_REQUEST });

    const { data } = await axios.post(
      ENDPOINTS.LB_ADD_TO_USER_WISHLIST(userId),
      { listingId }
    );

    dispatch({ type: ADD_TO_WISHLIST_SUCCESS, payload: data });
    return data;
  } catch (error) {
    dispatch({
      type: ADD_TO_WISHLIST_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    return null;
  }
};

export const removeFromWishList = (userId, listingId) => async (dispatch) => {
  try {
    dispatch({ type: REMOVE_FROM_WISHLIST_REQUEST });

    const { data } = await axios.post(
      ENDPOINTS.LB_REMOVE_FROM_USER_WISHLIST(userId),
      { listingId }
    );

    dispatch({ type: REMOVE_FROM_WISHLIST_SUCCESS, payload: data });
    return data;
  } catch (error) {
    dispatch({
      type: REMOVE_FROM_WISHLIST_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
    return null;
  }
};

export const setCurrentWishListItem = (item) => ({
  type: "SET_CURRENT_WISHLIST_ITEM",
  payload: item,
});
