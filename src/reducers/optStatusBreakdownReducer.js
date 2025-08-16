import { GET_OPT_STATUS_BREAKDOWN } from '../constants/optStatusBreakdownConstants';

const initialState = {
  optStatusBreakdown: [],
  loading: false,
  error: null,
};

export const optStatusBreakdownReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_OPT_STATUS_BREAKDOWN:
      return {
        ...state,
        optStatusBreakdown: action.payload,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};
