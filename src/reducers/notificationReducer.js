import * as actionTypes from '../constants/notification';

const initialState = {
  notifications: [],
  unreadNotifications: [],
  sentNotifications: [],
  loading: false,
  error: null,
};

// eslint-disable-next-line default-param-last
const notificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.FETCH_USER_NOTIFICATIONS_REQUEST:
    case actionTypes.FETCH_UNREAD_USER_NOTIFICATIONS_REQUEST:
    case actionTypes.FETCH_SENT_NOTIFICATIONS_REQUEST:
    case actionTypes.CREATE_NOTIFICATION_REQUEST:
    case actionTypes.DELETE_NOTIFICATION_REQUEST:
    case actionTypes.MARK_NOTIFICATION_AS_READ_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actionTypes.FETCH_USER_NOTIFICATIONS_FAILURE:
    case actionTypes.FETCH_UNREAD_USER_NOTIFICATIONS_FAILURE:
    case actionTypes.FETCH_SENT_NOTIFICATIONS_FAILURE:
    case actionTypes.CREATE_NOTIFICATION_FAILURE:
    case actionTypes.DELETE_NOTIFICATION_FAILURE:
    case actionTypes.MARK_NOTIFICATION_AS_READ_FAILURE:
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
        unreadNotifications: action.payload,
        loading: false,
        error: null,
      };

    case actionTypes.MARK_NOTIFICATION_AS_READ_SUCCESS: {
      const { unreadNotifications } = state;
      const updatedUnreadNotifications = unreadNotifications.filter(
        (notification) => notification._id !== action.payload
      );
      return {
        ...state,
        unreadNotifications: updatedUnreadNotifications,
        loading: false,
        error: null,
      };
    }

    default:
      return state;
  }
};

export default notificationReducer;
