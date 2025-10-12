import {
  FETCH_MESSAGES_REQUEST,
  FETCH_MESSAGES_SUCCESS,
  FETCH_MESSAGES_FAILURE,
  FETCH_EXISTING_CHATS_REQUEST,
  FETCH_EXISTING_CHATS_SUCCESS,
  FETCH_EXISTING_CHATS_FAILURE,
  MESSAGE_RECEIVED,
  MESSAGE_STATUS_UPDATED,
  MARK_MESSAGES_AS_READ_REQUEST,
  MARK_MESSAGES_AS_READ_SUCCESS,
  MARK_MESSAGES_AS_READ_FAILURE,
} from '../../constants/lbdashboard/messagingConstants';

const initialState = {
  loading: false,
  messages: [],
  notifications: [],
  error: null,
};

export const messagingReducer = (state, action = initialState) => {
  switch (action.type) {
    case FETCH_MESSAGES_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_MESSAGES_SUCCESS:
      return { ...state, loading: false, messages: action.payload };
    case FETCH_MESSAGES_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case MESSAGE_RECEIVED:
      return { ...state, messages: [...state.messages, action.payload] };
    case MESSAGE_STATUS_UPDATED:
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.sender === action.payload.userId && msg.status !== 'read'
            ? { ...msg, status: 'read' }
            : msg,
        ),
      };
    case 'NEW_NOTIFICATION':
      return {
        ...state,
        notifications: [...(state.notifications || []), action.payload],
      };
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };
    case 'CLEAR_DB_NOTIFICATIONS':
      return {
        ...state,
        notifications: state.notifications.filter(n => !action.payload.includes(n._id)),
      };
    case FETCH_EXISTING_CHATS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_EXISTING_CHATS_SUCCESS:
      return { ...state, loading: false, existingChats: action.payload };
    case FETCH_EXISTING_CHATS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case MARK_MESSAGES_AS_READ_REQUEST:
      return { ...state, loading: true, error: null };
    case MARK_MESSAGES_AS_READ_SUCCESS:
      return { ...state, loading: false };
    case MARK_MESSAGES_AS_READ_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state || initialState;
  }
};

export default messagingReducer;
