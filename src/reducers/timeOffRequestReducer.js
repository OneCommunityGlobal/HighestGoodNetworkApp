import * as types from './../constants/timeOffRequestConstants';

const initialState = {
  requests: [],
  error: null
};

export const timeOffRequestsReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_TIME_OFF_REQUESTS_SUCCESS:
      return { ...state, requests: action.payload, error: null };
    case types.FETCH_TIME_OFF_REQUESTS_FAILURE:
      return { ...state, requests: [], error: action.payload };
    default:
      return state;
  }
};