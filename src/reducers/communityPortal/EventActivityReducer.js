import {
  EVENT_FETCH_REQUEST,
  EVENT_FETCH_REQUEST_SUCCESS,
  EVENT_CREATE_REQUEST,
  EVENT_CREATE_REQUEST_SUCCESS,
  EVENT_REQUEST_FAILURE,
} from '../../constants/communityPortal/EventActivityConstants';

export const initialState = {
  data: null,
  loading: false,
  error: null,
};

export const EventActivityReducer = (state = initialState, action) => {
  switch (action.type) {
    case EVENT_FETCH_REQUEST:
      return {
        data: null,
        loading: true,
        error: null,
      };
    case EVENT_FETCH_REQUEST_SUCCESS:
      return {
        data: action.payload,
        loading: false,
        error: null,
      };
    case EVENT_CREATE_REQUEST:
      return {
        data: null,
        loading: true,
        error: null,
      };
    case EVENT_CREATE_REQUEST_SUCCESS:
      return {
        data: action.payload,
        loading: false,
        error: null,
      };
    case EVENT_REQUEST_FAILURE:
      return {
        data: null,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};
