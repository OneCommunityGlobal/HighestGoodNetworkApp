import * as meetingActions from '../constants/meetings';

const initialState = {
  loading: false,
  error: null,
  unreadMeetingNotifications: [],  
};

const meetingNotificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case meetingActions.FETCH_UNREAD_UPCOMING_MEETING_BEGIN:
    case meetingActions.MARK_MEETING_AS_READ_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    // Handle success and failure cases
    case meetingActions.FETCH_UNREAD_UPCOMING_MEETING_FAILURE:
    case meetingActions.MARK_MEETING_AS_READ_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
    };

    case meetingActions.FETCH_UNREAD_UPCOMING_MEETING_SUCCESS:
      return {
        ...state,
        unreadMeetingNotifications: action.payload,
        loading: false,
        error: null,
      }
    
    case meetingActions.MARK_MEETING_AS_READ_SUCCESS:
      const { unreadMeetingNotifications } = state;
      const newUnreadMeetingNotifications = unreadMeetingNotifications.filter((notification) => !(notification.meetingId === action.payload.meetingId && notification.recipient === action.payload.recipient));
      return {
        ...state,
        unreadMeetingNotifications: newUnreadMeetingNotifications,
        loading: false,
        error: null,
      };
    
    default:
      return state;
  }
};

export default meetingNotificationReducer;
