import { EMAIL_OUTBOX_ACTIONS } from '../actions/emailOutboxActions';

const initialState = {
  emails: [], // Parent Email records
  loading: false, // ✅ Changed from object to boolean
  error: null, // ✅ Changed from object to null
};

const emailOutboxReducer = (state = initialState, action) => {
  switch (action.type) {
    // Fetch emails (parent Email records)
    case EMAIL_OUTBOX_ACTIONS.FETCH_EMAILS_START:
      return {
        ...state,
        loading: true, // ✅ Set to true directly
        error: null,
      };

    case EMAIL_OUTBOX_ACTIONS.FETCH_EMAILS_SUCCESS:
      return {
        ...state,
        loading: false, // ✅ Set to false directly
        emails: action.payload || [],
        error: null,
      };

    case EMAIL_OUTBOX_ACTIONS.FETCH_EMAILS_ERROR:
      return {
        ...state,
        loading: false, // ✅ Set to false directly
        error: action.payload,
      };

    default:
      return state;
  }
};

export default emailOutboxReducer;
