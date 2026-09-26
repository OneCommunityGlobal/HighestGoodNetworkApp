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
  fetchError: null,
  submitting: false,
  submitError: null,
  bidResponse: null,
  notifications: [],
};

const bidOverviewReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_UNIT_DETAILS_REQUEST:
      return { ...state, loading: true, fetchError: null };
    case FETCH_UNIT_DETAILS_SUCCESS:
      return { ...state, loading: false, unitDetails: action.payload };
    case FETCH_UNIT_DETAILS_FAILURE:
      return { ...state, loading: false, fetchError: action.payload };
    case SUBMIT_BID_REQUEST:
      return { ...state, submitting: true, submitError: null };
    case SUBMIT_BID_SUCCESS:
      return { ...state, submitting: false, bidResponse: action.payload };
    case SUBMIT_BID_FAILURE:
      return { ...state, submitting: false, submitError: action.payload };
    case NOTIFICATION_SUCCESS:
      return {
        ...state,
        notifications: Array.isArray(action.payload) ? action.payload : [action.payload],
      };
    case NOTIFICATION_FAILURE:
      return { ...state, submitError: action.payload };
    default:
      return state;
  }
};

export default bidOverviewReducer;
