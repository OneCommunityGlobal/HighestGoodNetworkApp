import httpService from '../services/httpService';
import { ApiEndpoint } from '../utils/URL';
import * as actionTypes from '../constants/notification';
import axios from 'axios';

const APIEndpoint = ApiEndpoint;

const constructErrorPayload = error => {
  const { response } = error;
  let message = 'Unexpected Error';
  switch (response.status) {
    case 401:
      message = 'You are unauthorized to access the resource.';
      break;
    case 403:
      message = 'You are forbidden to access the resource.';
      break;
    case 404:
      message = 'The resource you are trying to access is not found.';
      break;
    case 500:
      message = 'Internal server error. Please try again later.';
      break;
    default:
      message = 'Fetch unread notifications: Unexpected Error.';
  }

  return {
    status: response.status,
    message: message,
  };
};

/**
 * Retrieve all notifications for the given userId.
 * @param {*} userId 
 * @returns 
 */
export function getNotifications(userId) {
  return async dispatch => {
    dispatch({ type: actionTypes.FETCH_USER_NOTIFICATIONS_REQUEST });
    try {
      const response = await axios.get(`${APIEndpoint}/notification/user/${userId}`);

      await dispatch({
        type: actionTypes.FETCH_USER_NOTIFICATIONS_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
  
      const errorPayload = constructErrorPayload(error);
      await dispatch({
        type: actionTypes.FETCH_USER_NOTIFICATIONS_FAILURE,
        payload: errorPayload,
      });
    }
  };
}

/**
 * Retrieve a list of unread notifications for the given userId.
 * @param {*} userId 
 * @returns 
 */
export function getUnreadUserNotifications(userId) {
  return async dispatch => {
    dispatch({ type: actionTypes.FETCH_UNREAD_USER_NOTIFICATIONS_REQUEST });
    try {
      const response = await axios.get(`${APIEndpoint}/notification/unread/user/${userId}`);

      await dispatch({
        type: actionTypes.FETCH_UNREAD_USER_NOTIFICATIONS_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      const errorPayload = constructErrorPayload(error);
      await dispatch({
        type: actionTypes.FETCH_USER_NOTIFICATIONS_FAILURE,
        payload: errorPayload,
      });
    }
  };
}

/**
 * Mark the notification as read and remove the record from redux if success.
 * @param {*} notificationId 
 * @returns 
 *  */ 
export function markNotificationAsRead(notificationId) {
  return async dispatch => {
    dispatch({ type: actionTypes.MARK_NOTIFICATION_AS_READ_REQUEST });
    try {
      const response = await axios.post(`${APIEndpoint}/notification/markRead/${notificationId}`);

      await dispatch({
        type: actionTypes.MARK_NOTIFICATION_AS_READ_SUCCESS,
        payload: notificationId,
      });
    } catch (error) {
      const errorPayload = constructErrorPayload(error);
      await dispatch({
        type: actionTypes.MARK_NOTIFICATION_AS_READ_FAILURE,
        payload: errorPayload,
      });
    }
  };
}


/**
 * Reset error state in redux store for the notification component.
 *  */ 
export function resetNotificationError() {
  return dispatch => {
    dispatch({ type: actionTypes.RESET_ERROR });
  };
} 

// Comment out unused functions
// export function getSentNotifications() {
//   return async dispatch => {
//     dispatch({ type: actionTypes.FETCH_SENT_NOTIFICATIONS_REQUEST });
//     const request = await httpService.get(`${APIEndpoint}/notification/sendHistory/`);
//     request.then(({ response }) => {
//       dispatch({
//         type: actionTypes.FETCH_SENT_NOTIFICATIONS_SUCCESS,
//         payload: response.data,
//       });
//     });
//   };
// }

// export function createUserNotification(notificationData) {
//   return async dispatch => {
//     dispatch({ type: actionTypes.CREATE_NOTIFICATION_REQUEST });
//     const request = await httpService.post(`${APIEndpoint}/notification/`, notificationData);
//     request.then(({ response }) => {
//       dispatch({
//         type: actionTypes.CREATE_NOTIFICATION_SUCCESS,
//         payload: response.data,
//       });
//     });
//   };
// }

// export function deleteUserNotification(notificationId) {
//   return async dispatch => {
//     dispatch({ type: actionTypes.DELETE_NOTIFICATION_REQUEST });
//     const request = await httpService.delete(`${APIEndpoint}/notification/${notificationId}`);
//     request.then(() => {
//       dispatch({
//         type: actionTypes.DELETE_NOTIFICATION_SUCCESS,
//         payload: notificationId,
//       });
//     });
//   };
// }




