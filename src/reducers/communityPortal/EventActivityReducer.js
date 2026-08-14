import {
  EVENT_FETCH_REQUEST,
  EVENT_FETCH_REQUEST_SUCCESS,
  EVENT_FETCH_REQUEST_FAILURE,
  EVENT_CREATE_REQUEST,
  EVENT_CREATE_REQUEST_SUCCESS,
  EVENT_CREATE_REQUEST_FAILURE,
  CALENDAR_EVENT_FETCH_REQUEST,
  CALENDAR_EVENT_FETCH_REQUEST_SUCCESS,
  CALENDAR_EVENT_FETCH_REQUEST_FAILURE,
} from '../../constants/communityPortal/EventActivityConstants';

const FetchEventInitialState = {
  data: null,
  loading: false,
  error: null,
};

const CreateEventInitialState = {
  loading: false,
  status: null,
  error: null,
};

const FetchCalendarEventInitialState = {
  data: null,
  loading: false,
  error: null,
};

export const FetchEventReducer = (state = FetchEventInitialState, action) => {
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
    case EVENT_FETCH_REQUEST_FAILURE:
      return {
        data: null,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export const CreateEventReducer = (state = CreateEventInitialState, action) => {
  switch (action.type) {
    case EVENT_CREATE_REQUEST:
      return {
        loading: true,
        status: null,
        error: null,
      };
    case EVENT_CREATE_REQUEST_SUCCESS:
      return {
        loading: false,
        status: action.payload,
        error: null,
      };
    case EVENT_CREATE_REQUEST_FAILURE:
      return {
        loading: false,
        status: null,
        error: action.payload,
      };
    default:
      return state;
  }
};

export const FetchCalendarEventReducer = (state = FetchCalendarEventInitialState, action) => {
  switch (action.type) {
    case CALENDAR_EVENT_FETCH_REQUEST:
      return {
        data: null,
        loading: true,
        error: null,
      };
    case CALENDAR_EVENT_FETCH_REQUEST_SUCCESS:
      return {
        data: action.payload,
        loading: false,
        error: null,
      };
    case CALENDAR_EVENT_FETCH_REQUEST_FAILURE:
      return {
        data: null,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};
