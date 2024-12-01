import httpService from '../services/httpService';
import { ApiEndpoint, ENDPOINTS } from '../utils/URL';
import * as meetingActions from '../constants/meetings';
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

export function getUnreadMeetingNotification(){
  return async dispatch => {
    dispatch({ type: meetingActions.FETCH_UNREAD_UPCOMING_MEETING_BEGIN});
    try {
      const currentTime = new Date();
      const endTime = new Date(currentTime);
      endTime.setDate(currentTime.getDate() + 3);
      endTime.setHours(23, 59, 59, 999);
      const encodedCurrentTime = encodeURIComponent(currentTime.toISOString());
      const encodedEndTime = encodeURIComponent(endTime.toISOString());

      // Fetch all meetings within 3 days from now
      const url = ENDPOINTS.MEETING_GET(encodedCurrentTime, encodedEndTime);
      const response = await axios.get(url);

      // Convert fetched meetings to notifications
      const meetingNotifications = response.data
        .filter(meeting => meeting.isRead === false)
        .map(meeting => ({
          meetingId: meeting._id,
          eventType: 'Meeting scheduled',
          message: `Upcoming meeting: ${new Date(meeting.dateTime).toLocaleString()}`,
          sender: meeting.organizer, 
          recipient: meeting.recipient,
          isSystemGenerated: false,
          isRead: meeting.isRead,
          dateTime: meeting.dateTime,
          location: meeting.location,
          notes: meeting.notes,
        }));
      await dispatch({
        type: meetingActions.FETCH_UNREAD_UPCOMING_MEETING_SUCCESS,
        payload: meetingNotifications,
      });
    } catch (error) {
      const errorPayload = constructErrorPayload(error);
      await dispatch({
        type: meetingActions.FETCH_UNREAD_UPCOMING_MEETING_FAILURE,
        payload: errorPayload,
      });
    }
  }
}

export function markMeetingNotificationAsRead(notification){
  return async dispatch => {
    await dispatch({ type: meetingActions.MARK_MEETING_AS_READ_REQUEST});
    try{
      const url = ENDPOINTS.MEETING_MARK_READ(notification.meetingId, notification.recipient);
      const response = await axios.post(url);

      await dispatch({
        type: meetingActions.MARK_MEETING_AS_READ_SUCCESS,
        payload: notification,
      });
    } catch (error) {
      const errorPayload = constructErrorPayload(error);
      await dispatch({
        type: meetingActions.MARK_MEETING_AS_READ_FAILURE,
        payload: errorPayload,
      });
    }
  }
};
