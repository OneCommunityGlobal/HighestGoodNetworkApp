import { EMAIL_OUTBOX_ACTIONS } from '../actions/emailOutboxActions';

const initialState = {
  emails: [], // Parent Email records
  loading: {
    emails: false,
  },
  error: {
    emails: null,
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

    default:
      return state;
  }
};

export default emailOutboxReducer;
