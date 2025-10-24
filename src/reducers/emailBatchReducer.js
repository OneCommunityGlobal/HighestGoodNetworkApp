import { EMAIL_BATCH_ACTIONS } from '../actions/emailBatchActions';

const initialState = {
  batches: [],
  pagination: {},
  dashboardStats: null,
  loading: {
    batches: false,
    dashboardStats: false,
  },
  error: {
    batches: null,
    dashboardStats: null,
  },
};

const emailBatchReducer = (state = initialState, action) => {
  switch (action.type) {
    // Fetch batches
    case EMAIL_BATCH_ACTIONS.FETCH_BATCHES_START:
      return {
        ...state,
        loading: { ...state.loading, batches: true },
        error: { ...state.error, batches: null },
      };

    case EMAIL_BATCH_ACTIONS.FETCH_BATCHES_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, batches: false },
        batches: action.payload.batches,
        pagination: action.payload.pagination,
        error: { ...state.error, batches: null },
      };

    case EMAIL_BATCH_ACTIONS.FETCH_BATCHES_ERROR:
      return {
        ...state,
        loading: { ...state.loading, batches: false },
        error: { ...state.error, batches: action.payload },
      };

    // Fetch dashboard stats
    case EMAIL_BATCH_ACTIONS.FETCH_DASHBOARD_STATS_START:
      return {
        ...state,
        loading: { ...state.loading, dashboardStats: true },
        error: { ...state.error, dashboardStats: null },
      };

    case EMAIL_BATCH_ACTIONS.FETCH_DASHBOARD_STATS_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, dashboardStats: false },
        dashboardStats: action.payload,
        error: { ...state.error, dashboardStats: null },
      };

    case EMAIL_BATCH_ACTIONS.FETCH_DASHBOARD_STATS_ERROR:
      return {
        ...state,
        loading: { ...state.loading, dashboardStats: false },
        error: { ...state.error, dashboardStats: action.payload },
      };

    default:
      return state;
  }
};

export default emailBatchReducer;
