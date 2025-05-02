import {
  FETCH_MESSAGES_REQUEST,
  FETCH_MESSAGES_SUCCESS,
  FETCH_MESSAGES_FAILURE,
  FETCH_EXISTING_CHATS_REQUEST,
  FETCH_EXISTING_CHATS_SUCCESS,
  FETCH_EXISTING_CHATS_FAILURE,
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
        messages: state.messages.map((msg) =>
          msg._id === action.payload.messageId
            ? { ...msg, status: action.payload.status }
            : msg
        ),
      };
    case FETCH_EXISTING_CHATS_REQUEST:
      return { ...state, loading: true, error: null };
      case FETCH_EXISTING_CHATS_SUCCESS:
        return { ...state, loading: false, existingChats: action.payload };
    case FETCH_EXISTING_CHATS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default messagingReducer;