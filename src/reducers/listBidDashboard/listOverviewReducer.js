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

const initialState = {
  loading: false,
  listing: null,
  error: null,
};

const initialBookingState = {
  loading: false,
  success: false,
  error: null,
};

export const listOverviewReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case LISTING_FETCH_REQUEST:
      return { ...state, loading: true, error: null };
    case LISTING_FETCH_SUCCESS:
      return { ...state, loading: false, listing: action.payload, error: null };
    case LISTING_FETCH_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const listingAvailabilityReducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case LISTING_AVAILABILITY_REQUEST:
      return { ...state, loading: true, error: null };
    case LISTING_AVAILABILITY_SUCCESS:
      return { ...state, loading: false, availability: action.payload, error: null };
    case LISTING_AVAILABILITY_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const listingBookingReducer = (state = initialBookingState, action = {}) => {
  switch (action.type) {
    case LISTING_BOOK_REQUEST:
      return { ...state, loading: true, error: null, success: false };
    case LISTING_BOOK_SUCCESS:
      return { ...state, loading: false, success: true, error: null };
    case LISTING_BOOK_FAIL:
      return { ...state, loading: false, error: action.payload, success: false };
    case LISTING_BOOK_RESET:
      return { loading: false, success: false, error: null };
    default:
      return state;
  }
};
