import {
    LISTING_FETCH_REQUEST,
    LISTING_FETCH_SUCCESS,
    LISTING_FETCH_FAIL,
    LISTING_AVAILABILITY_REQUEST,
    LISTING_AVAILABILITY_SUCCESS,
    LISTING_AVAILABILITY_FAIL,
    LISTING_BOOK_REQUEST,
    LISTING_BOOK_SUCCESS,
    LISTING_BOOK_FAIL,
    LISTING_BOOK_RESET,
} from '../../constants/lbDashboard/listOverviewConstants';
import { ENDPOINTS } from '../../utils/URL';

export const fetchListingById = (listingId) => async (dispatch) => {
    try {
        const token = localStorage.getItem('token');
        dispatch({ type: LISTING_FETCH_REQUEST });
        const response = await fetch(ENDPOINTS.LB_LISTING_GET_BY_ID, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: token }),
            },
            body: JSON.stringify({ id: listingId }),
        });
        const data = await response.json();
        if (!response.ok || !data || data.error) {
            throw new Error(data.error || 'Failed to fetch listing');
        }
        dispatch({ type: LISTING_FETCH_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({ type: LISTING_FETCH_FAIL, payload: error.message });
    }
};

export const fetchListingAvailability = (listingId) => async (dispatch) => {
    try {
        const token = localStorage.getItem('token');
        dispatch({ type: LISTING_AVAILABILITY_REQUEST });
        const response = await fetch(ENDPOINTS.LB_LISTING_AVAILABILITY, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: token }),
                listingid: listingId,
            },
        });
        const data = await response.json();
        if (!response.ok || !data || data.error) {
            throw new Error(data.error || 'Failed to fetch availability');
        }
        dispatch({ type: LISTING_AVAILABILITY_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({ type: LISTING_AVAILABILITY_FAIL, payload: error.message });
    }
};

export const bookListing = ({ listingId, from, to, userId }) => async (dispatch) => {
    try {
        const token = localStorage.getItem('token');
        dispatch({ type: LISTING_BOOK_REQUEST });
        const response = await fetch(ENDPOINTS.LB_LISTING_BOOK, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: token }),
            },
            body: JSON.stringify({ listingId, from, to, userId }),
        });
        const data = await response.json();
        if (!response.ok || !data || data.error) {
            throw new Error(data.error || 'Failed to book listing');
        }
        dispatch({ type: LISTING_BOOK_SUCCESS, payload: data.data });
        dispatch(fetchListingAvailability(listingId));
    } catch (error) {
        dispatch({ type: LISTING_BOOK_FAIL, payload: error.message });
    }
};

export const resetBooking = () => ({ type: LISTING_BOOK_RESET });