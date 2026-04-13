import {
  FETCH_UNIT_DETAILS_SUCCESS,
  FETCH_UNIT_DETAILS_REQUEST,
  FETCH_UNIT_DETAILS_FAILURE,
  SUBMIT_BID_SUCCESS,
  SUBMIT_BID_REQUEST,
  SUBMIT_BID_FAILURE,
  NOTIFICATION_SUCCESS,
  NOTIFICATION_FAILURE,
} from '../../constants/lbdashboard/bidOverviewConstants';

const initialState = {
  loading: false,
  unitDetails: null,
  error: null,
  bidResponse: null,
  notifications: [],
};

const bidOverviewReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_UNIT_DETAILS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_UNIT_DETAILS_SUCCESS:
      return { ...state, loading: false, unitDetails: action.payload };
    case FETCH_UNIT_DETAILS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case SUBMIT_BID_REQUEST:
      return { ...state, loading: true, error: null };
    case SUBMIT_BID_SUCCESS:
      return { ...state, loading: false, bidResponse: action.payload };
    case SUBMIT_BID_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case 'NOTIFICATION_SUCCESS':
      return {
        ...state,
        notifications: Array.isArray(action.payload) ? action.payload : [action.payload],
      };
    case NOTIFICATION_FAILURE:
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export default bidOverviewReducer;
