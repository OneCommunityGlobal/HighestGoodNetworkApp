import {
  FETCH_MESSAGES_REQUEST,
  FETCH_MESSAGES_SUCCESS,
  FETCH_MESSAGES_FAILURE,
  SEND_MESSAGE_REQUEST,
  SEND_MESSAGE_SUCCESS,
  SEND_MESSAGE_FAILURE,
  UPDATE_MESSAGE_STATUS_REQUEST,
  UPDATE_MESSAGE_STATUS_SUCCESS,
  UPDATE_MESSAGE_STATUS_FAILURE,
  MESSAGE_RECEIVED,
  MESSAGE_STATUS_UPDATED,
} from "../../constants/lbdashboard/messagingConstants";

const initialState = {
  loading: false,
  messages: [],
  error: null,
};

export const messagingReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MESSAGES_REQUEST:
    case SEND_MESSAGE_REQUEST:
    case UPDATE_MESSAGE_STATUS_REQUEST:
      return { ...state, loading: true, error: null };

    case FETCH_MESSAGES_SUCCESS:
      return { ...state, loading: false, messages: action.payload };

    case SEND_MESSAGE_SUCCESS:
      return { ...state, loading: false, messages: [...state.messages, action.payload] };

    case UPDATE_MESSAGE_STATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        messages: state.messages.map((message) =>
          message._id === action.payload.messageId
            ? { ...message, status: action.payload.status }
            : message
        ),
      };

    case MESSAGE_RECEIVED:
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };

    case MESSAGE_STATUS_UPDATED:
      return {
        ...state,
        messages: state.messages.map((message) =>
          message._id === action.payload.messageId
            ? { ...message, status: action.payload.status }
            : message
        ),
      };

    case FETCH_MESSAGES_FAILURE:
    case SEND_MESSAGE_FAILURE:
    case UPDATE_MESSAGE_STATUS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default messagingReducer;