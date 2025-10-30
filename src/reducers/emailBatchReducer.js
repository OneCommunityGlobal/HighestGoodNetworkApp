import { EMAIL_BATCH_ACTIONS } from '../actions/emailBatchActions';

const initialState = {
  emails: [], // Parent Email records
  pagination: {},
  // dashboardStats removed
  emailAuditTrail: [], // Audit trail for parent Email
  emailBatchAuditTrail: [], // Audit trail for child EmailBatch
  loading: {
    emails: false,
    emailAudit: false,
    emailBatchAudit: false,
  },
  error: {
    emails: null,
    emailAudit: null,
    emailBatchAudit: null,
  },
};

const emailBatchReducer = (state = initialState, action) => {
  switch (action.type) {
    // Fetch emails (parent Email records)
    case EMAIL_BATCH_ACTIONS.FETCH_EMAILS_START:
      return {
        ...state,
        loading: { ...state.loading, emails: true },
        error: { ...state.error, emails: null },
      };

    case EMAIL_BATCH_ACTIONS.FETCH_EMAILS_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, emails: false },
        emails: action.payload || [],
        error: { ...state.error, emails: null },
      };

    case EMAIL_BATCH_ACTIONS.FETCH_EMAILS_ERROR:
      return {
        ...state,
        loading: { ...state.loading, emails: false },
        error: { ...state.error, emails: action.payload },
      };

    // Dashboard stats removed

    // Fetch email audit trail (parent Email)
    case EMAIL_BATCH_ACTIONS.FETCH_EMAIL_AUDIT_START:
      return {
        ...state,
        loading: { ...state.loading, emailAudit: true },
        error: { ...state.error, emailAudit: null },
      };

    case EMAIL_BATCH_ACTIONS.FETCH_EMAIL_AUDIT_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, emailAudit: false },
        emailAuditTrail: action.payload,
        error: { ...state.error, emailAudit: null },
      };

    case EMAIL_BATCH_ACTIONS.FETCH_EMAIL_AUDIT_ERROR:
      return {
        ...state,
        loading: { ...state.loading, emailAudit: false },
        error: { ...state.error, emailAudit: action.payload },
      };

    // Fetch email batch audit trail (child EmailBatch)
    case EMAIL_BATCH_ACTIONS.FETCH_EMAIL_BATCH_AUDIT_START:
      return {
        ...state,
        loading: { ...state.loading, emailBatchAudit: true },
        error: { ...state.error, emailBatchAudit: null },
      };

    case EMAIL_BATCH_ACTIONS.FETCH_EMAIL_BATCH_AUDIT_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, emailBatchAudit: false },
        emailBatchAuditTrail: action.payload,
        error: { ...state.error, emailBatchAudit: null },
      };

    case EMAIL_BATCH_ACTIONS.FETCH_EMAIL_BATCH_AUDIT_ERROR:
      return {
        ...state,
        loading: { ...state.loading, emailBatchAudit: false },
        error: { ...state.error, emailBatchAudit: action.payload },
      };

    default:
      return state;
  }
};

export default emailBatchReducer;
