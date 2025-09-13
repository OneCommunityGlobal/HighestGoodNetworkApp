import {
  FETCH_UNIT_DETAILS_SUCCESS,
  FETCH_UNIT_DETAILS_REQUEST,
  FETCH_UNIT_DETAILS_FAILURE,
  SUBMIT_BID_SUCCESS,
  SUBMIT_BID_REQUEST,
  SUBMIT_BID_FAILURE,
  GENRATE_NOTIFICATION_SUCCESS,
  GENRATE_NOTIFICATION_REQUEST,
  GENRATE_NOTIFICATION_FAILURE,
} from '../../constants/lbdashboard/bidOverviewConstants';

const initialState = {
  loading: false,
  unitDetails: null,
  error: null,
  bidSubmissionStatus: null,
  notificationStatus: null,
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
      return { ...state, loading: true, bidSubmissionStatus: null, error: null };
    case SUBMIT_BID_SUCCESS:
      return { ...state, loading: false, bidSubmissionStatus: action.payload };
    case SUBMIT_BID_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case GENRATE_NOTIFICATION_REQUEST:
      return { ...state, loading: true, notificationStatus: null, error: null };
    case GENRATE_NOTIFICATION_SUCCESS:
      return { ...state, loading: false, notificationStatus: action.payload };
    case GENRATE_NOTIFICATION_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default bidOverviewReducer;
