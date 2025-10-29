import { EMAIL_BATCH_ACTIONS } from '../actions/emailBatchActions';

const initialState = {
  batches: [],
  pagination: {},
  dashboardStats: null,
  batchAuditTrail: [],
  itemAuditTrail: [],
  auditStats: null,
  loading: {
    batches: false,
    dashboardStats: false,
    batchAudit: false,
    itemAudit: false,
    auditStats: false,
  },
  error: {
    batches: null,
    dashboardStats: null,
    batchAudit: null,
    itemAudit: null,
    auditStats: null,
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

    // Fetch batch audit trail
    case EMAIL_BATCH_ACTIONS.FETCH_BATCH_AUDIT_START:
      return {
        ...state,
        loading: { ...state.loading, batchAudit: true },
        error: { ...state.error, batchAudit: null },
      };

    case EMAIL_BATCH_ACTIONS.FETCH_BATCH_AUDIT_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, batchAudit: false },
        batchAuditTrail: action.payload,
        error: { ...state.error, batchAudit: null },
      };

    case EMAIL_BATCH_ACTIONS.FETCH_BATCH_AUDIT_ERROR:
      return {
        ...state,
        loading: { ...state.loading, batchAudit: false },
        error: { ...state.error, batchAudit: action.payload },
      };

    // Fetch item audit trail
    case EMAIL_BATCH_ACTIONS.FETCH_ITEM_AUDIT_START:
      return {
        ...state,
        loading: { ...state.loading, itemAudit: true },
        error: { ...state.error, itemAudit: null },
      };

    case EMAIL_BATCH_ACTIONS.FETCH_ITEM_AUDIT_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, itemAudit: false },
        itemAuditTrail: action.payload,
        error: { ...state.error, itemAudit: null },
      };

    case EMAIL_BATCH_ACTIONS.FETCH_ITEM_AUDIT_ERROR:
      return {
        ...state,
        loading: { ...state.loading, itemAudit: false },
        error: { ...state.error, itemAudit: action.payload },
      };

    // Fetch audit stats
    case EMAIL_BATCH_ACTIONS.FETCH_AUDIT_STATS_START:
      return {
        ...state,
        loading: { ...state.loading, auditStats: true },
        error: { ...state.error, auditStats: null },
      };

    case EMAIL_BATCH_ACTIONS.FETCH_AUDIT_STATS_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, auditStats: false },
        auditStats: action.payload,
        error: { ...state.error, auditStats: null },
      };

    case EMAIL_BATCH_ACTIONS.FETCH_AUDIT_STATS_ERROR:
      return {
        ...state,
        loading: { ...state.loading, auditStats: false },
        error: { ...state.error, auditStats: action.payload },
      };

    default:
      return state;
  }
};

export default emailBatchReducer;
