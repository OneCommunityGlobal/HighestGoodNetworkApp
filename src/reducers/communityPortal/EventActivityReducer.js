import {
  EVENT_CREATE_REQUEST,
  EVENT_CREATE_REQUEST_SUCCESS,
  EVENT_CREATE_REQUEST_FAILURE,
} from '../../constants/communityPortal/EventActivityConstants';

const CreateEventInitialState = {
  loading: false,
  status: null,
  error: null,
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
