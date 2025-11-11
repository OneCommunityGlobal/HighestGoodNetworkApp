import { EMAIL_OUTBOX_ACTIONS } from '../actions/emailOutboxActions';

const initialState = {
  emails: [], // Parent Email records
  pagination: {},
  // Audit trail removed - error details are now captured directly in EmailBatch records
  // Keeping these for backward compatibility but they will always be empty
  emailAuditTrail: [], // @deprecated - Audit trail removed from backend
  emailBatchAuditTrail: [], // @deprecated - Audit trail removed from backend
  loading: {
    emails: false,
    emailAudit: false, // @deprecated
    emailBatchAudit: false, // @deprecated
  },
  error: {
    emails: null,
    emailAudit: null, // @deprecated
    emailBatchAudit: null, // @deprecated
  },
};

const emailOutboxReducer = (state = initialState, action) => {
  switch (action.type) {
    // Fetch emails (parent Email records)
    case EMAIL_OUTBOX_ACTIONS.FETCH_EMAILS_START:
      return {
        ...state,
        loading: { ...state.loading, emails: true },
        error: { ...state.error, emails: null },
      };

    case EMAIL_OUTBOX_ACTIONS.FETCH_EMAILS_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, emails: false },
        emails: action.payload || [],
        error: { ...state.error, emails: null },
      };

    case EMAIL_OUTBOX_ACTIONS.FETCH_EMAILS_ERROR:
      return {
        ...state,
        loading: { ...state.loading, emails: false },
        error: { ...state.error, emails: action.payload },
      };

    // Dashboard stats removed

    // Fetch email audit trail (parent Email)
    case EMAIL_OUTBOX_ACTIONS.FETCH_EMAIL_AUDIT_START:
      return {
        ...state,
        loading: { ...state.loading, emailAudit: true },
        error: { ...state.error, emailAudit: null },
      };

    case EMAIL_OUTBOX_ACTIONS.FETCH_EMAIL_AUDIT_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, emailAudit: false },
        emailAuditTrail: action.payload,
        error: { ...state.error, emailAudit: null },
      };

    case EMAIL_OUTBOX_ACTIONS.FETCH_EMAIL_AUDIT_ERROR:
      return {
        ...state,
        loading: { ...state.loading, emailAudit: false },
        error: { ...state.error, emailAudit: action.payload },
      };

    // Fetch email batch audit trail (child EmailBatch)
    case EMAIL_OUTBOX_ACTIONS.FETCH_EMAIL_BATCH_AUDIT_START:
      return {
        ...state,
        loading: { ...state.loading, emailBatchAudit: true },
        error: { ...state.error, emailBatchAudit: null },
      };

    case EMAIL_OUTBOX_ACTIONS.FETCH_EMAIL_BATCH_AUDIT_SUCCESS:
      return {
        ...state,
        loading: { ...state.loading, emailBatchAudit: false },
        emailBatchAuditTrail: action.payload,
        error: { ...state.error, emailBatchAudit: null },
      };

    case EMAIL_OUTBOX_ACTIONS.FETCH_EMAIL_BATCH_AUDIT_ERROR:
      return {
        ...state,
        loading: { ...state.loading, emailBatchAudit: false },
        error: { ...state.error, emailBatchAudit: action.payload },
      };

    default:
      return state;
  }
};

export default emailOutboxReducer;
