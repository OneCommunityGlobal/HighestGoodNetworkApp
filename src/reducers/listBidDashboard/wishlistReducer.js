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

const initialState = {
  loading: false,
  wishlist: [],
  error: null,
};

export const wishlistsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_WISHLIST_REQUEST:
    case ADD_TO_WISHLIST_REQUEST:
    case REMOVE_FROM_WISHLIST_REQUEST:
      return { ...state, loading: true, error: null };

    case FETCH_WISHLIST_SUCCESS:
      return { ...state, loading: false, wishlist: action.payload };

    case ADD_TO_WISHLIST_SUCCESS:
      return { ...state, loading: false, wishlist: [...state.wishlist, action.payload] };

    case REMOVE_FROM_WISHLIST_SUCCESS:
      return {
        ...state,
        loading: false,
        wishlist: state.wishlist.filter(item => item.id !== action.payload.id),
      };

    case FETCH_WISHLIST_FAIL:
    case ADD_TO_WISHLIST_FAIL:
    case REMOVE_FROM_WISHLIST_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default wishlistsReducer;
