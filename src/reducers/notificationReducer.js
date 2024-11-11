import * as actionTypes from '../constants/notification';
import * as meetingActions from '../constants/meetings';

const initialState = {
  notifications: [], // all notifications. This is used in the notification history for admin/owner.
  unreadNotifications: [], // unread notifications. This is to store all unread notification for a user.
  sentNotifications: [],
  loading: false,
  error: null,
};

const notificationReducer = (state = initialState, action) => {
  
  switch (action.type) {
    case actionTypes.FETCH_USER_NOTIFICATIONS_REQUEST:
    case actionTypes.FETCH_UNREAD_USER_NOTIFICATIONS_REQUEST:
    case actionTypes.FETCH_SENT_NOTIFICATIONS_REQUEST:
    case actionTypes.CREATE_NOTIFICATION_REQUEST:
    case actionTypes.DELETE_NOTIFICATION_REQUEST:
    case actionTypes.MARK_NOTIFICATION_AS_READ_REQUEST:
    case meetingActions.FETCH_UNREAD_UPCOMING_MEETING_BEGIN:
    case meetingActions.MARK_MEETING_AS_READ_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    // Handle success and failure cases

    case actionTypes.FETCH_USER_NOTIFICATIONS_FAILURE:
    case actionTypes.FETCH_UNREAD_USER_NOTIFICATIONS_FAILURE:
    case actionTypes.FETCH_SENT_NOTIFICATIONS_FAILURE:
    case actionTypes.CREATE_NOTIFICATION_FAILURE:
    case actionTypes.DELETE_NOTIFICATION_FAILURE:
    case actionTypes.MARK_NOTIFICATION_AS_READ_FAILURE:
    case meetingActions.FETCH_UNREAD_UPCOMING_MEETING_FAILURE:
    case meetingActions.MARK_MEETING_AS_READ_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
    };

    case actionTypes.RESET_ERROR:
      return {
        ...state,
        error: null,
      };

    case actionTypes.FETCH_USER_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        notifications: action.payload,
        loading: false,
        error: null,
      };

    case actionTypes.FETCH_UNREAD_USER_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        unreadNotifications: [...state.unreadNotifications, ...action.payload],
        loading: false,
        error: null,
      };

    case meetingActions.FETCH_UNREAD_UPCOMING_MEETING_SUCCESS:
      return {
        ...state,
        unreadNotifications: [...state.unreadNotifications, ...action.payload],
        loading: false,
        error: null,
      }

    // case actionTypes.FETCH_SENT_NOTIFICATIONS_SUCCESS:
    //   return {
    //     ...state,
    //     sentNotifications: action.payload,
    //     loading: false,
    //     error: null,
    //   };

    // case actionTypes.CREATE_NOTIFICATION_SUCCESS:
    //   return {
    //     ...state,
    //     notifications: [...state.notifications, action.payload],
    //     loading: false,
    //     error: null,
    //   };

    // case actionTypes.DELETE_NOTIFICATION_SUCCESS:
    //   return {
    //     ...state,
    //     notifications: state.notifications.filter((notification) => notification.id !== action.payload),
    //     loading: false,
    //     error: null,
    //   };

    case actionTypes.MARK_NOTIFICATION_AS_READ_SUCCESS:
      const { unreadNotifications } = state;
      const updatedUnreadNotifications = unreadNotifications.filter((notification) => notification._id !== action.payload);
      return {
        ...state,
        // remove the notification from unreadNotifications
        unreadNotifications: updatedUnreadNotifications,
        loading: false,
        error: null,
      };
    
    case meetingActions.MARK_MEETING_AS_READ_SUCCESS:
      const { newNotifications } = state;
      const newUnreadNotifications = newNotifications.filter((notification) => notification.eventType !== 'Meeting scheduled' || notification.meetingId !== action.payload);
      return {
        ...state,
        // remove the meeting notification from unreadNotifications
        unreadNotifications: newUnreadNotifications,
        loading: false,
        error: null,
      };

    
    default:
      return state;
  }
};

export default notificationReducer;