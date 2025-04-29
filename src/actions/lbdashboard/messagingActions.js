import axios from "axios";
import { ENDPOINTS } from "../../utils/URL";
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

// Fetch messages
export const fetchMessages = (userId, selectedUserId) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_MESSAGES_REQUEST });

    const { data } = await axios.get(ENDPOINTS.LB_READ_MESSAGE, {
      params: { userId, contactId: selectedUserId },
    });

    dispatch({
      type: FETCH_MESSAGES_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_MESSAGES_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Send a message
export const sendMessage = (messageData) => async (dispatch) => {
  try {
    dispatch({ type: SEND_MESSAGE_REQUEST });

    const { data } = await axios.post(ENDPOINTS.LB_SEND_MESSAGE, messageData);
    dispatch({
      type: SEND_MESSAGE_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: SEND_MESSAGE_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Update message status
export const updateMessageStatus = (messageId, status) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_MESSAGE_STATUS_REQUEST });

    const { data } = await axios.patch(ENDPOINTS.LB_UPDATE_MESSAGE_STATUS, {
      messageId,
      status,
    });

    dispatch({
      type: UPDATE_MESSAGE_STATUS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: UPDATE_MESSAGE_STATUS_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Handle real-time message reception
export const handleMessageReceived = (message) => (dispatch) => {
  dispatch({
    type: MESSAGE_RECEIVED,
    payload: message,
  });
};

// Handle real-time message status updates
export const handleMessageStatusUpdated = (statusUpdate) => (dispatch) => {
  dispatch({
    type: MESSAGE_STATUS_UPDATED,
    payload: statusUpdate,
  });
};