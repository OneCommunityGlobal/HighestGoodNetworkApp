// NotificationBell Component - Version 1.0.0

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';

const NotificationBell = () => {
  // State to track if there is a notification, if data is ready, and to manage intervals
  const [hasNotification, setHasNotification] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const notificationRef = useRef(null);

  // Fetch time entries and weekly committed hours from the Redux state
  const timeEntries = useSelector(state => state.timeEntries?.weeks?.[0] || []);
  const weeklycommittedHours = useSelector(state => state.userProfile?.weeklycommittedHours || 0);

  // Calculate total effort in hours
  const calculateTotalEffort = useCallback(() => {
    return timeEntries.reduce((total, entry) => {
      const hours = parseInt(entry.hours) || 0;
      const minutes = parseInt(entry.minutes) || 0;
      return total + hours + minutes / 60;
    }, 0);
  }, [timeEntries]);

  // Calculate time left until the end of the week
  const calculateTimeLeft = useCallback(() => {
    const currentTime = new Date();
    const endOfWeek = new Date(currentTime);
    endOfWeek.setUTCDate(endOfWeek.getUTCDate() + (7 - endOfWeek.getUTCDay()));
    endOfWeek.setUTCHours(7, 0, 0, 0); // Set to midnight PST (7:00 AM UTC Sunday)

    const msLeft = endOfWeek.getTime() - currentTime.getTime();
    const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
    const minutesLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
    const daysLeft = Math.floor(hoursLeft / 24);
    const remainingHours = hoursLeft % 24;

    return { hoursLeft, minutesLeft, daysLeft, remainingHours };
  }, []);

  // Calculate the current week number
  const getCurrentWeekNumber = useCallback(() => {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), 0, 1);
    const days = Math.floor((currentDate - startDate) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((currentDate.getDay() + 1 + days) / 7);
    return weekNumber;
  }, []);

  // Handle the click event on the notification to mark it as seen
  const handleNotificationClick = () => {
    setHasNotification(false);
    setShowNotification(false);
    localStorage.setItem('notificationSeen', 'true');
    localStorage.setItem('weekNumber', getCurrentWeekNumber().toString());
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  // Effect to check the notification condition every hour
  useEffect(() => {
    const checkCondition = () => {
      const currentWeekNumber = getCurrentWeekNumber();
      const storedWeekNumber = parseInt(localStorage.getItem('weekNumber'), 10);
      const notificationSeen = localStorage.getItem('notificationSeen') === 'true';

      // If it's a new week, reset the notification state
      if (storedWeekNumber !== currentWeekNumber) {
        localStorage.removeItem('notificationSeen');
      }

      // Check if the user has completed less than 50% of their hours and if less than 48 hours are left in the week
      if (timeEntries.length > 0 && weeklycommittedHours > 0 && !notificationSeen) {
        const totalEffort = calculateTotalEffort();
        const effortPercentage = (totalEffort / weeklycommittedHours) * 100;
        const { hoursLeft } = calculateTimeLeft();

        if (effortPercentage < 50 && hoursLeft <= 48) {
          setHasNotification(true);
        } else {
          setHasNotification(false);
        }

        setIsDataReady(true);
      } else {
        setHasNotification(false);
        setIsDataReady(true);
      }
    };

    // Initial condition check and set interval for hourly checks
    checkCondition();
    const id = setInterval(checkCondition, 3600000);
    setIntervalId(id);

    return () => clearInterval(id); // Cleanup interval on component unmount
  }, [timeEntries, weeklycommittedHours, calculateTotalEffort, calculateTimeLeft, getCurrentWeekNumber]);

  // Effect to handle clicks outside the notification box, which will close the notification
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        if (showNotification) {
          handleNotificationClick();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotification]);

  // Extract calculated values for time left and effort left
  const { hoursLeft, minutesLeft, daysLeft, remainingHours } = calculateTimeLeft();
  const totalEffort = calculateTotalEffort();
  const hoursLeftToWork = (weeklycommittedHours - totalEffort).toFixed(2);

  // Format time left to a readable string
  const getFormattedTimeLeft = () => {
    if (daysLeft > 0) {
      return `${daysLeft} day${daysLeft > 1 ? 's' : ''} ${remainingHours} hour${remainingHours > 1 ? 's' : ''}`;
    }
    return `${hoursLeft} hour${hoursLeft > 1 ? 's' : ''} ${minutesLeft > 0 ? `${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}` : ''}`;
  };

  // Format the total effort to a readable string
  const getFormattedEffort = () => {
    const effortHours = Math.floor(totalEffort);
    const effortMinutes = Math.round((totalEffort % 1) * 60);
    return `${effortHours} hour${effortHours !== 1 ? 's' : ''}${effortMinutes > 0 ? ` and ${effortMinutes} minute${effortMinutes !== 1 ? 's' : ''}` : ''}`;
  };

  // Format the hours left to work to a readable string
  const getFormattedLeftToWork = () => {
    const leftHours = Math.floor(weeklycommittedHours - totalEffort);
    const leftMinutes = Math.round(((weeklycommittedHours - totalEffort) % 1) * 60);
    return `${leftHours} hour${leftHours !== 1 ? 's' : ''}${leftMinutes > 0 ? ` and ${leftMinutes} minute${leftMinutes !== 1 ? 's' : ''}` : ''}`;
  };

  return (
    <>
      {isDataReady && (
        <i 
          className={`fa fa-bell i-large ${hasNotification ? 'has-notification' : ''}`} 
          onClick={() => setShowNotification(!showNotification)}
          style={{ 
            position: 'relative', 
            cursor: 'pointer', 
            color: hasNotification ? 'white' : 'rgba(255, 255, 255, .5)' 
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
                pointerEvents: 'none'
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
            backgroundColor: 'white',
            color: 'black',
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
              Just a quick reminder—there’s less than 48 hours left in the week, and I noticed you’ve completed {getFormattedEffort()} out of the {weeklycommittedHours} you need. That leaves {getFormattedLeftToWork()} to go before the week closes on Saturday night at midnight Pacific Time.
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
