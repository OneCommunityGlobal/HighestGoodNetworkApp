// Version: 1.2.2

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';

const NotificationBell = () => {
  // State variables to track notifications, data readiness, and total effort
  const [hasNotification, setHasNotification] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const notificationRef = useRef(null);

  // Fetch necessary data from Redux store
  const timeEntries = useSelector((state) => state.timeEntries?.weeks?.[0] || []);
  const weeklycommittedHours = useSelector((state) => state.userProfile?.weeklycommittedHours || 0);
  const darkMode = useSelector((state) => state.theme.darkMode);
  const userId = useSelector((state) => state.auth.user?.userid);

  // Calculate total effort (hours + minutes) logged by the user
  const calculateTotalEffort = useCallback(() => {
    return timeEntries.reduce((total, entry) => {
      const hours = parseInt(entry.hours) || 0;
      const minutes = parseInt(entry.minutes) || 0;
      return total + hours + minutes / 60;
    }, 0);
  }, [timeEntries]);

  // Calculate the time left until the end of the week (Sunday 7:00 AM UTC)
  const calculateTimeLeft = useCallback(() => {
    const currentTime = new Date();
    const endOfWeek = new Date(currentTime);
    endOfWeek.setUTCDate(endOfWeek.getUTCDate() + (7 - endOfWeek.getUTCDay()));
    endOfWeek.setUTCHours(7, 0, 0, 0); // Set to 7:00 AM UTC Sunday

    const msLeft = endOfWeek.getTime() - currentTime.getTime();
    const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
    const daysLeft = Math.floor(hoursLeft / 24);
    const remainingHours = hoursLeft % 24;

    return { hoursLeft, minutesLeft, daysLeft, remainingHours };
  }, []);

  // Get the current week number to store notifications and milestones per week
  const getCurrentWeekNumber = useCallback(() => {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), 0, 1);
    const days = Math.floor((currentDate - startDate) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((currentDate.getDay() + 1 + days) / 7);
    return weekNumber;
  }, []);

  // Handle user clicking on the notification to mark it as seen
  const handleNotificationClick = () => {
    setHasNotification(false);
    setShowNotification(false);
    localStorage.setItem(`${userId}_notificationSeen`, 'true');
    localStorage.setItem(`${userId}_weekNumber`, getCurrentWeekNumber().toString());
  };

  // Effect to check if a notification should be triggered based on time and effort logged
  useEffect(() => {
    const checkCondition = () => {
      const currentWeekNumber = getCurrentWeekNumber();
      const storedWeekNumber = parseInt(localStorage.getItem(`${userId}_weekNumber`), 10);
      const notificationSeen = localStorage.getItem(`${userId}_notificationSeen`) === 'true';

      // Reset the notification state if it's a new week
      if (storedWeekNumber !== currentWeekNumber) {
        localStorage.removeItem(`${userId}_notificationSeen`);
      }

      const totalEffort = calculateTotalEffort();
      const effortPercentage = (totalEffort / weeklycommittedHours) * 100;
      const { hoursLeft } = calculateTimeLeft();

      // Trigger a notification if the effort is less than 50% and fewer than 48 hours remain
      if (weeklycommittedHours > 0 && !notificationSeen && (effortPercentage < 50) && hoursLeft <= 48) {
        setHasNotification(true);
      } else {
        setHasNotification(false);
      }
      setIsDataReady(true);
    };

    // Check notification condition initially and set interval for hourly checks
    checkCondition();
    const id = setInterval(checkCondition, 3600000); // Every hour

    return () => clearInterval(id); // Cleanup interval on component unmount
  }, [weeklycommittedHours, calculateTotalEffort, calculateTimeLeft, getCurrentWeekNumber, userId]);

  // Effect to close the notification if a click is detected outside the notification area
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        handleNotificationClick();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotification]);

  // Utility function to format time values in hours and minutes
  const formatTime = (hours, minutes) => {
    const hoursStr = `${hours} hour${hours !== 1 ? 's' : ''}`;
    const minutesStr = minutes > 0 ? ` and ${minutes} minute${minutes !== 1 ? 's' : ''}` : '';
    return `${hoursStr}${minutesStr}`;
  };

  // Extract calculated values for time left and effort left
  const { hoursLeft, minutesLeft, daysLeft, remainingHours } = calculateTimeLeft();
  const hoursLeftToWork = (weeklycommittedHours - calculateTotalEffort()).toFixed(2);

  // Format the time left in a user-friendly string
  const getFormattedTimeLeft = () => {
    if (daysLeft > 0) {
      return `${daysLeft} day${daysLeft > 1 ? 's' : ''} ${remainingHours} hour${remainingHours > 1 ? 's' : ''}`;
    }
    return `${hoursLeft} hour${hoursLeft > 1 ? 's' : ''} ${minutesLeft > 0 ? `${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}` : ''}`;
  };

  // Format the total effort in a user-friendly string
  const getFormattedEffort = () => {
    const effortHours = Math.floor(calculateTotalEffort());
    const effortMinutes = Math.round((calculateTotalEffort() % 1) * 60);
    return formatTime(effortHours, effortMinutes);
  };

  // Format the hours left to work in a user-friendly string
  const getFormattedLeftToWork = () => {
    const leftHours = Math.floor(weeklycommittedHours - calculateTotalEffort());
    const leftMinutes = Math.round(((weeklycommittedHours - calculateTotalEffort()) % 1) * 60);
    return formatTime(leftHours, leftMinutes);
  };

  // Toggle the notification popup on bell icon click
  const handleClick = useCallback(() => {
    setShowNotification((prev) => !prev);
  }, []);

  return (
    <>
      {isDataReady && (
        <i
          className={`fa fa-bell i-large ${hasNotification ? 'has-notification' : ''}`}
          onClick={handleClick}
          style={{
            position: 'relative',
            cursor: 'pointer',
            color: hasNotification ? 'white' : 'rgba(255, 255, 255, .5)',
          }}
        >
          {hasNotification && (
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
        </i>
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
          {hasNotification ? (
            <div>
              You’ve completed {getFormattedEffort()} out of the {weeklycommittedHours} you need. Only {getFormattedLeftToWork()} left to go. Hurry up, there are less than 48 hours left to finish your tasks!
            </div>
          ) : (
            <div>No notifications</div>
          )}
        </div>
      )}
    </>
  );
};

export default NotificationBell;