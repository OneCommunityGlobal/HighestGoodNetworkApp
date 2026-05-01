import {
  GET_TIMELOG_TRACKING_START,
  GET_TIMELOG_TRACKING_SUCCESS,
  GET_TIMELOG_TRACKING_ERROR,
} from '../constants/timelogTracking';

const initialState = {
  trackingEvents: [],
  loading: false,
  error: null,
};

export const timelogTrackingReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_TIMELOG_TRACKING_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case GET_TIMELOG_TRACKING_SUCCESS:
      return {
        ...state,
        trackingEvents: action.payload,
        loading: false,
        error: null,
      };
    case GET_TIMELOG_TRACKING_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'ADD_TIMELOG_EVENT':
      return {
        ...state,
        trackingEvents: [action.payload, ...state.trackingEvents.slice(0, 99)], // Keep latest 100 events
      };
    default:
      return state;
  }
};

export default timelogTrackingReducer;
