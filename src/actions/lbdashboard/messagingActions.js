import axios from "axios";
import { ENDPOINTS } from "../../utils/URL";
import {
  FETCH_MESSAGES_REQUEST,
  FETCH_MESSAGES_SUCCESS,
  FETCH_MESSAGES_FAILURE,
  SEND_MESSAGE_REQUEST,
  SEND_MESSAGE_SUCCESS,
  SEND_MESSAGE_FAILURE,
  FETCH_EXISTING_CHATS_REQUEST,
  FETCH_EXISTING_CHATS_SUCCESS,
  FETCH_EXISTING_CHATS_FAILURE,
  MESSAGE_RECEIVED,
  MESSAGE_STATUS_UPDATED,
} from "../../constants/lbdashboard/messagingConstants";
import { getMessagingSocket } from "utils/messagingSocket";

export const fetchMessages = (userId, selectedUserId) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_MESSAGES_REQUEST });

    const { data } = await axios.get(ENDPOINTS.LB_READ_MESSAGE, {
      headers: {
        'user-id': userId,
        'contact-id': selectedUserId,
      },
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

export const sendMessage = (messageData) => (dispatch) => {
  const socket = getMessagingSocket();
  if (socket && socket.readyState === WebSocket.OPEN) {
    dispatch({ type: SEND_MESSAGE_REQUEST });

    socket.send(JSON.stringify({
      action: "SEND_MESSAGE",
      ...messageData,
    }));

    dispatch({ type: SEND_MESSAGE_SUCCESS });
  } else {
    dispatch({
      type: SEND_MESSAGE_FAILURE,
      payload: "WebSocket is not connected.",
    });
  }
};

export const handleMessageReceived = (message) => (dispatch) => {
  dispatch({
    type: MESSAGE_RECEIVED,
    payload: message,
  });
};

export const handleMessageStatusUpdated = (statusUpdate) => (dispatch) => {
  dispatch({
      type: MESSAGE_STATUS_UPDATED,
      payload: statusUpdate,
  });
};

export const fetchMessageStatuses = (userId, selectedUserId, messageIds) => async (dispatch) => {
  if (!messageIds || messageIds.length === 0) return;
  try {
    const { data } = await axios.get(ENDPOINTS.LB_UPDATE_MESSAGE_STATUS, {
      headers: {
        'user-id': userId,
        'contact-id': selectedUserId,
      },
    });

    data.forEach((statusUpdate) => {
      dispatch({
        type: MESSAGE_STATUS_UPDATED,
        payload: statusUpdate,
      });
    });
  } catch (error) {
    console.error("Error fetching message statuses:", error);
  }
  
};

export const fetchExistingChats = (userId) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_EXISTING_CHATS_REQUEST });

    const { data } = await axios.get(ENDPOINTS.LB_EXISTING_CHATS, {
      headers: { "user-id": userId },
    });

    dispatch({
      type: FETCH_EXISTING_CHATS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: FETCH_EXISTING_CHATS_FAILURE,
      payload: error.response?.data?.message || error.message,
    });
  }
};