import {
  TOOL_REPLCEMENT_REQUEST,
  TOOL_REPLACEMENT_SUCCESS,
  TOOL_REPLACEMENT_FAILURE,
} from '../constants/toolReplacementConstants';

export const initialState = {
  loading: false,
  data: [],
  error: '',
};

export const toolReplacementReducer = (state = initialState, action) => {
  switch (action.type) {
    case TOOL_REPLCEMENT_REQUEST:
      return {
        loading: true,
        data: [],
        error: '',
      };
    case TOOL_REPLACEMENT_SUCCESS:
      return {
        loading: false,
        data: action.payload,
        error: '',
      };
    case TOOL_REPLACEMENT_FAILURE:
      return {
        loading: false,
        data: [],
        error: action.payload,
      };
    default:
      return state;
  }
};
