import {
    FETCH_MESSAGES_START,
    FETCH_MESSAGES_END,
    SEND_MESSAGE_START,
    SEND_MESSAGE_END
  } from '../../constants/lbdashboard/messagingConstants';
  import axios from 'axios';
  import { ENDPOINTS } from '../../utils/URL';

  // Fetch messages
  export const fetchMessagesStart = () => ({ type: FETCH_MESSAGES_START });
  export const fetchMessagesEnd = (messages) => ({ type: FETCH_MESSAGES_END, payload: messages });
  
  // Send message
  export const sendMessageStart = () => ({ type: SEND_MESSAGE_START });
  export const sendMessageEnd = (message) => ({ type: SEND_MESSAGE_END, payload: message });
  
  // Async action to fetch messages between two users
  export const fetchMessages = (userId) => {
    return async (dispatch) => {
      dispatch(fetchMessagesStart());
      try {
        const res = await axios.get(ENDPOINTS.LB_READ_MESSAGE(userId));
        dispatch(fetchMessagesEnd(res.data));
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };
  };
  
  // Async action to send a message
  export const sendMessage = (messageData) => {
    return async (dispatch) => {
      dispatch(sendMessageStart());
      try {
        const res = await axios.post(ENDPOINTS.LB_SEND_MESSAGE, messageData);
        dispatch(sendMessageEnd(res.data));
      } catch (err) {
        console.error("Failed to send message:", err);
      }
    };
  };
  