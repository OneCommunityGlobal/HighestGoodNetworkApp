import {
  FETCH_INJURIES_REQUEST,
  FETCH_INJURIES_SUCCESS,
  FETCH_INJURIES_FAILURE,
} from '../actions/bmdashboard/types';

const initialState = {
  data: [],
  loading: false,
  error: null,
};

const injuriesReducer = (state, action = {}) => {
  const currentState = typeof state === 'undefined' ? initialState : state;

  switch (action.type) {
    case FETCH_INJURIES_REQUEST:
      return {
        ...currentState,
        loading: true,
        error: null,
      };

    case FETCH_INJURIES_SUCCESS:
      return {
        ...currentState,
        loading: false,
        data: action.payload,
        error: null,
      };

    case FETCH_INJURIES_FAILURE:
      return {
        ...currentState,
        loading: false,
        error: action.payload,
      };

    default:
      return currentState;
  }
};

export default injuriesReducer;
