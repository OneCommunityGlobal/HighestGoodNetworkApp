import {
  FETCH_MESSAGES_START,
  FETCH_MESSAGES_END,
  SEND_MESSAGE_START,
  SEND_MESSAGE_END,
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

    default:
      return state;
  }
};

export default messageReducer;
