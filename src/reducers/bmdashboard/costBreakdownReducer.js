import {
  FETCH_COST_BREAKDOWN_START,
  FETCH_COST_BREAKDOWN_SUCCESS,
  FETCH_COST_BREAKDOWN_ERROR,
  FETCH_COST_DETAIL_START,
  FETCH_COST_DETAIL_SUCCESS,
  FETCH_COST_DETAIL_ERROR,
  CLEAR_COST_DETAIL,
} from '../../constants/bmdashboard/costBreakdownConstants';

const defaultState = {
  loading: false,
  data: null,
  error: null,

  detailLoading: false,
  detailData: null,
  detailError: null,
};

// eslint-disable-next-line default-param-last
export const costBreakdownReducer = (state = defaultState, action) => {
  switch (action.type) {
    case FETCH_COST_BREAKDOWN_START:
      return { ...state, loading: true, error: null };
    case FETCH_COST_BREAKDOWN_SUCCESS:
      return { ...state, loading: false, data: action.payload, error: null };
    case FETCH_COST_BREAKDOWN_ERROR:
      return { ...state, loading: false, data: null, error: action.payload };

    case FETCH_COST_DETAIL_START:
      return { ...state, detailLoading: true, detailError: null };
    case FETCH_COST_DETAIL_SUCCESS:
      return { ...state, detailLoading: false, detailData: action.payload, detailError: null };
    case FETCH_COST_DETAIL_ERROR:
      return { ...state, detailLoading: false, detailData: null, detailError: action.payload };

    case CLEAR_COST_DETAIL:
      return { ...state, detailLoading: false, detailData: null, detailError: null };

    default:
      return state;
  }
};

export default costBreakdownReducer;
