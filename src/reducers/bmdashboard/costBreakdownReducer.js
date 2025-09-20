import * as types from '../../constants/bmdashboard/costBreakdownConstants';

const costBreakdownInitial = {
  fetching: false,
  fetched: false,
  data: null,
  error: null,
  status: null,
};

export const costBreakdownReducer = (state = costBreakdownInitial, action) => {
  switch (action.type) {
    case types.FETCH_COST_BREAKDOWN_START:
      return {
        ...state,
        fetching: true,
        fetched: false,
        error: null,
        status: null,
      };

    case types.FETCH_COST_BREAKDOWN_SUCCESS:
      return {
        ...state,
        fetching: false,
        fetched: true,
        data: action.payload,
        error: null,
        status: 200,
      };

    case types.FETCH_COST_BREAKDOWN_ERROR:
      return {
        ...state,
        fetching: false,
        fetched: false,
        data: null,
        error: action.payload,
        status: 500,
      };

    case types.CLEAR_COST_BREAKDOWN:
      return costBreakdownInitial;

    default:
      return state;
  }
};
