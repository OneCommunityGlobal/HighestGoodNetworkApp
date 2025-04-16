import {
  FETCH_MESSAGES_START,
  FETCH_MESSAGES_END,
  SEND_MESSAGE_START,
  SEND_MESSAGE_END,
  UPDATE_MESSAGES_READ_STATUS,
  UPDATE_MESSAGE_STATUS,
  SEND_MESSAGE_FAILED,
  SEND_MESSAGE_PENDING,
} from '../../constants/lbdashboard/messagingConstants';

const initialState = {
  messages: [],
  loading: false,
};

// eslint-disable-next-line default-param-last
const messageReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MESSAGES_START:
    case SEND_MESSAGE_START:
      return { ...state, loading: true };

    case FETCH_MESSAGES_END:
      return { ...state, loading: false, messages: action.payload.messages };

    case SEND_MESSAGE_END:
      return {
        ...state,
        loading: false,
        messages: [...state.messages, action.payload],
      };
    case UPDATE_MESSAGES_READ_STATUS:
      return {
        ...state,
        messages: state.messages.map(message =>
          action.payload.messageIds.includes(message._id)
            ? { ...message, isRead: true, status: 'read' }
            : message,
        ),
      };
    case SEND_MESSAGE_FAILED:
      return {
        ...state,
        messages: [...state.messages, { ...action.payload }],
      };

    case UPDATE_MESSAGE_STATUS:
      return {
        ...state,
        messages: state.messages.map(message =>
          message.messageId === action.payload.messageId
            ? { ...message, status: action.payload.status }
            : message,
        ),
      };
    case SEND_MESSAGE_PENDING:
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    default:
      return state;
  }
};

export default messageReducer;
