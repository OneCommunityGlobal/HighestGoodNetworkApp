import httpService from '../services/httpService';
import { ENDPOINTS } from '../utils/URL';
import * as meetingActions from '../constants/meetings';
import { formatMeetingDateTimeShort, resolveUserTimeZone } from '../utils/meetingTime';

const constructErrorPayload = error => {
  const { response } = error;
  if (!response) {
    return {
      status: 0,
      message: error.message || 'Network error. Please try again later.',
    };
  }
  const statusMessages = {
    401: 'You are unauthorized to access the resource.',
    403: 'You are forbidden to access the resource.',
    404: 'The resource you are trying to access is not found.',
    500: 'Internal server error. Please try again later.',
  };

  return {
    status: response.status,
    message: statusMessages[response.status] || 'Fetch unread notifications: Unexpected Error.',
  };
};

// get all the unread meetings within a time range
export function getUnreadMeetingNotification(explicitUserId) {
  return async (dispatch, getState) => {
    dispatch({ type: meetingActions.FETCH_UNREAD_UPCOMING_MEETING_BEGIN });
    try {
      const userId = explicitUserId || getState().auth?.user?.userid;
      const viewerTimeZone = resolveUserTimeZone(getState().userProfile?.timeZone);

      if (!userId || !localStorage.getItem('token')) {
        await dispatch({
          type: meetingActions.FETCH_UNREAD_UPCOMING_MEETING_SUCCESS,
          payload: [],
        });
        return;
      }

      const currentTime = new Date();
      const endTime = new Date(currentTime);
      endTime.setDate(currentTime.getDate() + 3);
      endTime.setHours(23, 59, 59, 999);
      const encodedCurrentTime = encodeURIComponent(currentTime.toISOString());
      const encodedEndTime = encodeURIComponent(endTime.toISOString());

      const url = ENDPOINTS.MEETING_GET(encodedCurrentTime, encodedEndTime);
      const response = await httpService.get(url);
      const meetings = Array.isArray(response.data) ? response.data : [];

      const meetingNotifications = meetings
        .filter(meeting => meeting.isRead === false)
        .filter(meeting => String(meeting.recipient) === String(userId))
        .map(meeting => ({
          meetingId: String(meeting._id),
          eventType: 'Meeting scheduled',
          message: `Upcoming meeting: ${formatMeetingDateTimeShort(meeting.dateTime, viewerTimeZone)}`,
          sender: String(meeting.organizer),
          recipient: String(meeting.recipient),
          isSystemGenerated: false,
          isRead: meeting.isRead,
          dateTime: meeting.dateTime,
          timeZone: meeting.timeZone || viewerTimeZone,
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
  };
}

// mark a specific meeting and recipient pair as read
export function markMeetingNotificationAsRead(notification){
  return async dispatch => {
    await dispatch({ type: meetingActions.MARK_MEETING_AS_READ_REQUEST});
    try{
      const url = ENDPOINTS.MEETING_MARK_READ(notification.meetingId, notification.recipient);
      await httpService.post(url);

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
