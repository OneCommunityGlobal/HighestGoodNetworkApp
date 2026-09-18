/* eslint-disable import/prefer-default-export */
import * as actions from '../constants/meetings';

const initialState = {
  meetings: [],
  loading: false,
  error: null,
};

// eslint-disable-next-line default-param-last
export const timeEntriesReducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.FETCH_MEETING_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actions.FETCH_MEETING_SUCCESS:
      return {
        ...state,
        loading: false,
        meeting: action.payload.meeting,
      };

    case actions.FETCH_MEETING_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };

    default:
      return state;
  }
};
