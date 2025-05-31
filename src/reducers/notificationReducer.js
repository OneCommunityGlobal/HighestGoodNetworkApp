import * as actionTypes from '../constants/notification';

const initialState = {
  notifications: [], // all notifications. This is used in the notification history for admin/owner.
  unreadNotifications: [], // unread notifications. This is to store all unread notification for a user.
  sentNotifications: [],
  loading: false,
  error: null,
};

// eslint-disable-next-line default-param-last
const notificationReducer = (state = initialState, action) => {
  switch (action.type) {
    // Handle request actions
    case actionTypes.FETCH_USER_NOTIFICATIONS_REQUEST:
    case actionTypes.FETCH_UNREAD_USER_NOTIFICATIONS_REQUEST:
    case actionTypes.FETCH_SENT_NOTIFICATIONS_REQUEST:
    case actionTypes.CREATE_NOTIFICATION_REQUEST:
    case actionTypes.DELETE_NOTIFICATION_REQUEST:
    case actionTypes.MARK_NOTIFICATION_AS_READ_REQUEST: {
      return {
        ...state,
        loading: true,
        error: null,
      };
    }

    // Handle failure actions
    case actionTypes.FETCH_USER_NOTIFICATIONS_FAILURE:
    case actionTypes.FETCH_UNREAD_USER_NOTIFICATIONS_FAILURE:
    case actionTypes.FETCH_SENT_NOTIFICATIONS_FAILURE:
    case actionTypes.CREATE_NOTIFICATION_FAILURE:
    case actionTypes.DELETE_NOTIFICATION_FAILURE:
    case actionTypes.MARK_NOTIFICATION_AS_READ_FAILURE: {
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    }

    // Reset error state
    case actionTypes.RESET_ERROR: {
      return {
        ...state,
        error: null,
      };
    }

    // Handle success actions
    case actionTypes.FETCH_USER_NOTIFICATIONS_SUCCESS: {
      return {
        ...state,
        notifications: action.payload,
        loading: false,
        error: null,
      };
    }

    case actionTypes.FETCH_UNREAD_USER_NOTIFICATIONS_SUCCESS: {
      return {
        ...state,
        unreadNotifications: action.payload,
        loading: false,
        error: null,
      };
    }

    case actionTypes.FETCH_SENT_NOTIFICATIONS_SUCCESS: {
      return {
        ...state,
        sentNotifications: action.payload,
        loading: false,
        error: null,
      };
    }

    case actionTypes.CREATE_NOTIFICATION_SUCCESS: {
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
        loading: false,
        error: null,
      };
    }

    case actionTypes.DELETE_NOTIFICATION_SUCCESS: {
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload,
        ),
        loading: false,
        error: null,
      };
    }

    case actionTypes.MARK_NOTIFICATION_AS_READ_SUCCESS: {
      const updatedUnreadNotifications = state.unreadNotifications.filter(
        notification => notification._id !== action.payload,
      );
      return {
        ...state,
        unreadNotifications: updatedUnreadNotifications,
        loading: false,
        error: null,
      };
    }

    // Default case
    default:
      return state;
  }
};

export default notificationReducer;
