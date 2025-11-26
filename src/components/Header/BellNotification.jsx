// Version: 1.2.3 - Added memoization, accessibility, error handling, and dark mode improvements
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { getMessagingSocket } from '../../utils/messagingSocket';
import {
  clearDBNotifications,
  clearNotifications,
} from '../../actions/lbdashboard/messagingActions';
import { ENDPOINTS } from '../../utils/URL';

export default function BellNotification({ userId }) {
  // State variables to manage notifications and UI state
  const [hasNotification, setHasNotification] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const notificationRef = useRef(null);

  const [dbNotifications, setDbNotifications] = useState([]); // Notifications from the database
  const [messageNotifications, setMessageNotifications] = useState([]);
  const [hasMessageNotification, setHasMessageNotification] = useState(false);
  const notifications = useSelector(state => {
    return state.messages?.notifications || [];
  });
  // Fetching data from the Redux store
  const timeEntries = useSelector(state => state.timeEntries?.weeks?.[0] || []);
  const weeklycommittedHours = useSelector(state => state.userProfile?.weeklycommittedHours || 0);
  const darkMode = useSelector(state => state.theme.darkMode);

  const dispatch = useDispatch();
  // const userId = useSelector(state =>
  //   console.log(state.auth)
  //   return state.auth.user?.userid});
  // const checkSessionStorage = () => JSON.parse(sessionStorage.getItem('viewingUser')) ?? false;
  // const [viewingUser, setViewingUser] = useState(checkSessionStorage);
  // const [displayUserId, setDisplayUserId] = useState( viewingUser?.userId || userId);

  /**
   * Memoized function to calculate the total effort (hours + minutes) logged by the user
   */
  const calculateTotalEffort = useMemo(() => {
    return timeEntries.reduce((total, entry) => {
      const hours = parseInt(entry.hours, 10) || 0;
      const minutes = parseInt(entry.minutes, 10) || 0;
      return total + hours + minutes / 60;
    }, 0);
  }, [timeEntries]);

  /**
   * Memoized function to calculate the time left until the end of the week (Sunday 7:00 AM UTC)
   */
  const calculateTimeLeft = useMemo(() => {
    const now = new Date();

    // Calculate the end of the week (Sunday at 7:00 AM UTC)
    const endOfWeek = new Date();
    const daysUntilSunday = (7 - endOfWeek.getUTCDay()) % 7; // Ensure it wraps correctly
    endOfWeek.setUTCDate(endOfWeek.getUTCDate() + daysUntilSunday);
    endOfWeek.setUTCHours(7, 0, 0, 0);

    // Calculate time difference in milliseconds
    const msLeft = endOfWeek - now;

    // Derive time components
    const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
    const daysLeft = Math.floor(hoursLeft / 24);
    const remainingHours = hoursLeft % 24;
    const minutesLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));

    return { hoursLeft, minutesLeft, daysLeft, remainingHours };
  }, []);

  /**
   * Calculate the current week number of the year
   */
  const getCurrentWeekNumber = useCallback(() => {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), 0, 1);
    const days = Math.floor((currentDate - startDate) / (24 * 60 * 60 * 1000));
    return Math.ceil((currentDate.getDay() + 1 + days) / 7);
  }, []);

  /**
   * Function to handle notification click and mark the notification as seen
   */
  const handleNotificationClick = () => {
    setHasNotification(false);
    setShowNotification(false);
    setMessageNotifications([]);
    setHasMessageNotification(false);

    try {
      // Clear notifications from Redux state
      dispatch(clearNotifications());
      dispatch(clearDBNotifications());
    } catch (error) {
      Error('❌ Error marking notifications as read:', error);
    }
    localStorage.setItem(`${userId}_notificationSeen`, 'true');
    localStorage.setItem(`${userId}_weekNumber`, getCurrentWeekNumber().toString());
  };

  useEffect(() => {
    const fetchDbNotifications = async () => {
      try {
        const { data } = await axios.get(`${ENDPOINTS.NOTIFICATIONS}/unread/user/${userId}`);
        setDbNotifications(data);
        if (data.length > 0) {
          setHasMessageNotification(true);
        }
      } catch (error) {
        Error('❌ Error fetching notifications from DB:', error);
      }
    };

    fetchDbNotifications();
  }, [userId]);

  const allNotifications = [...(dbNotifications || []), ...messageNotifications];

  useEffect(() => {
    if (notifications.length > 0) {
      setMessageNotifications(notifications);
      setHasMessageNotification(true);
    }
  }, [notifications]);
  /**
   * useEffect to check if a notification should be triggered based on time and effort logged.
   * Triggers the notification if effort is < 50% and time left < 48 hours.
   */
  useEffect(() => {
    const checkCondition = () => {
      const currentWeekNumber = getCurrentWeekNumber();
      const storedWeekNumber = parseInt(localStorage.getItem(`${userId}_weekNumber`), 10);
      const notificationSeen = localStorage.getItem(`${userId}_notificationSeen`) === 'true';

      // Reset the notification state if it's a new week
      if (storedWeekNumber !== currentWeekNumber) {
        localStorage.removeItem(`${userId}_notificationSeen`);
        localStorage.setItem(`${userId}_weekNumber`, currentWeekNumber.toString());
      }

      const totalEffort = calculateTotalEffort;
      const effortPercentage = (totalEffort / weeklycommittedHours) * 100;
      const { hoursLeft } = calculateTimeLeft;

      // Trigger a notification if the effort is less than 50% and fewer than 48 hours remain
      if (
        weeklycommittedHours > 0 &&
        !notificationSeen &&
        effortPercentage < 50 &&
        hoursLeft <= 48
      ) {
        setHasNotification(true);
      } else {
        setHasNotification(false);
      }
      setIsDataReady(true);
    };

    // Initial check and set interval to check every hour
    checkCondition();
    const id = setInterval(checkCondition, 3600000); // Every hour

    return () => clearInterval(id); // Cleanup interval on unmount
  }, [weeklycommittedHours, calculateTotalEffort, calculateTimeLeft, getCurrentWeekNumber, userId]);

  useEffect(() => {
    const socket = getMessagingSocket();

    const handleNewMessageNotification = event => {
      try {
        const data = JSON.parse(event.data);

        if (data.action === 'NEW_NOTIFICATION') {
          setMessageNotifications(prev => [...prev, { message: data.payload }]);
          setHasMessageNotification(true);
        }
      } catch (error) {
        Error('❌ Error handling WebSocket notification:', error);
      }
    };

    if (socket) {
      socket.addEventListener('message', handleNewMessageNotification);
    } else {
      Error('❌ WebSocket is not connected.');
    }

    return () => {
      if (socket) {
        socket.removeEventListener('message', handleNewMessageNotification);
      }
    };
  }, [messageNotifications]);

  const handleMessageNotificationClick = async () => {
    setShowNotification(prev => !prev);

    if (!showNotification) {
      try {
        // Ensure notification IDs are valid before making the API call
        const notificationIds = dbNotifications.map(notification => notification._id);
        if (notificationIds.length > 0) {
          await axios.post(`${ENDPOINTS.MSG_NOTIFICATION}/mark-as-read`, { notificationIds });
        }
      } catch (error) {
        Error('❌ Error marking message notifications as read:', error);
      }
    }
  };

  /**
   * useEffect to close the notification when a click is detected outside the notification area.
   */

  useEffect(() => {
    const handleClickOutside = event => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        handleNotificationClick();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Utility function to format time values in hours and minutes
   */
  const formatTime = (hours, minutes) => {
    const hoursStr = `${hours} hour${hours !== 1 ? 's' : ''}`;
    const minutesStr = minutes > 0 ? ` and ${minutes} minute${minutes !== 1 ? 's' : ''}` : '';
    return `${hoursStr}${minutesStr}`;
  };

  // Format total effort for display
  const getFormattedEffort = () => {
    const effortHours = Math.floor(calculateTotalEffort);
    const effortMinutes = Math.round((calculateTotalEffort % 1) * 60);
    return formatTime(effortHours, effortMinutes);
  };

  // Format remaining hours to work for display
  const getFormattedLeftToWork = () => {
    const leftHours = Math.floor(weeklycommittedHours - calculateTotalEffort);
    const leftMinutes = Math.round(((weeklycommittedHours - calculateTotalEffort) % 1) * 60);
    return formatTime(leftHours, leftMinutes);
  };

  return (
    <>
      {isDataReady && (
        <button
          type="button"
          onClick={handleMessageNotificationClick}
          className={`fa fa-bell i-large ${
            hasNotification || hasMessageNotification ? 'has-notification' : ''
          }`}
          style={{
            position: 'relative',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            color: hasNotification || hasMessageNotification ? 'white' : 'rgba(255, 255, 255, .5)',
            padding: 0,
          }}
          aria-label={
            hasNotification || hasMessageNotification
              ? 'You have new notifications'
              : 'No new notifications'
          }
          title={
            hasNotification || hasMessageNotification
              ? 'You have new notifications'
              : 'No new notifications'
          }
        >
          {(hasNotification || hasMessageNotification) && (
            <span
              style={{
                position: 'absolute',
                top: '0px',
                right: '0px',
                transform: 'translateX(50%) translateY(-50%)',
                backgroundColor: 'red',
                borderRadius: '50%',
                width: '10px',
                height: '10px',
                pointerEvents: 'none',
              }}
            />
          )}
        </button>
      )}
      {showNotification && (
        <div
          ref={notificationRef}
          style={{
            position: 'absolute',
            top: '75%',
            right: '5%',
            transform: 'translateX(0)',
            backgroundColor: darkMode ? '#3A506B' : 'white',
            color: darkMode ? '#FFFFFF' : 'black',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 1000,
            width: '300px',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            wordWrap: 'break-word',
            whiteSpace: 'normal',
            lineHeight: '1.5',
            textAlign: 'left',
          }}
        >
          {hasNotification && (
            <div>
              You’ve completed {getFormattedEffort()} out of the {weeklycommittedHours} you need.
              Only {getFormattedLeftToWork()} left to go. Hurry up, there are less than 48 hours
              left to finish your tasks!
            </div>
          )}
          {hasMessageNotification && (
            <div>
              <strong>New Messages:</strong>
              {allNotifications.map((notification, index) => (
                <div key={notification._id || index}>{notification.message || notification}</div>
              ))}
            </div>
          )}
          {!hasNotification && !hasMessageNotification && <div>No new notifications.</div>}
        </div>
      )}
    </>
  );
}
