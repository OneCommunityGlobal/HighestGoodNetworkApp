/* eslint-disable react/jsx-no-constructed-context-values */
/* eslint-disable no-console */
import React, { createContext, useContext, useState, useEffect } from 'react';
import moment from 'moment-timezone';
import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';

const ServerTimeContext = createContext();

export const useServerTime = () => {
  const context = useContext(ServerTimeContext);
  if (!context) {
    throw new Error('useServerTime must be used within a ServerTimeProvider');
  }
  return context;
};

export const ServerTimeProvider = ({ children }) => {
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastKnownClientTime, setLastKnownClientTime] = useState(Date.now());

  // Detect if system clock has been changed
  const detectClockChange = () => {
    const currentTime = Date.now();
    const expectedTime = lastKnownClientTime + 1000; // Expected time plus 1 second
    const timeDifference = Math.abs(currentTime - expectedTime);

    // If time difference is more than 5 seconds, clock was likely changed
    if (timeDifference > 5000) {
      console.warn('System clock change detected! Re-syncing with server...');
      fetchServerTime();
    }

    setLastKnownClientTime(currentTime);
  };

  const fetchServerTime = async () => {
    try {
      console.log('Fetching server time from backend...');
      console.log('Endpoint URL:', ENDPOINTS.GET_SERVER_DATE);

      // Get real server time from backend
      const response = await axios.get(ENDPOINTS.GET_SERVER_DATE);
      console.log('Raw server response:', response.data);

      // Extract server time - check for multiple possible response formats
      const serverTimeString =
        response.data.currentTime || response.data.date || response.data.datetime || response.data;
      const formattedDate = response.data.formattedDate; // Your backend's formatted date for forms

      console.log('Extracted server time string:', serverTimeString);
      console.log('Formatted date for forms:', formattedDate);

      if (!serverTimeString) {
        throw new Error('Server response does not contain valid time data');
      }

      const clientTime = Date.now();
      const serverTime = new Date(serverTimeString).getTime();

      if (isNaN(serverTime)) {
        throw new Error(`Invalid server time format: ${serverTimeString}`);
      }

      const offset = serverTime - clientTime;

      console.log('Server time sync SUCCESS:', {
        serverTime: new Date(serverTime).toISOString(),
        clientTime: new Date(clientTime).toISOString(),
        offset,
        offsetHours: (offset / (1000 * 60 * 60)).toFixed(2),
      });

      setServerTimeOffset(offset);
      setLastSyncTime(clientTime);
      setIsInitialized(true);

      return serverTime;
    } catch (error) {
      console.error('Failed to fetch server time:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
      });

      // Fallback to client time if server fails
      console.warn('Using client time as fallback');
      setServerTimeOffset(0);
      setLastSyncTime(Date.now());
      setIsInitialized(true);

      // Don't throw error, use fallback instead
      return Date.now();
    }
  };

  const getServerSyncedTime = () => {
    if (!isInitialized) {
      console.warn('Server time not initialized, using client time');
      return Date.now();
    }

    const currentClientTime = Date.now();
    const serverSyncedTime = currentClientTime + serverTimeOffset;

    console.log('🕐 Getting server synced time:', {
      clientTime: new Date(currentClientTime).toISOString(),
      serverSyncedTime: new Date(serverSyncedTime).toISOString(),
      offset: serverTimeOffset,
    });

    return serverSyncedTime;
  };

  const getServerDateISO = () => {
    const serverTime = getServerSyncedTime();
    const isoString = new Date(serverTime).toISOString();
    console.log('Server date ISO:', isoString);
    return isoString;
  };

  const getServerDateFormatted = () => {
    const serverTime = getServerSyncedTime();
    const formattedDate = new Date(serverTime).toISOString().split('T')[0]; // YYYY-MM-DD format
    console.log('Server date formatted for forms:', formattedDate);
    return formattedDate;
  };

  // Initialize server time on component mount
  useEffect(() => {
    fetchServerTime().catch(error => {
      console.error('Failed to initialize server time:', error);
    });
  }, []);

  // Periodic server time synchronization and clock change detection
  useEffect(() => {
    // Re-sync with server every 30 seconds to catch clock changes
    const syncInterval = setInterval(() => {
      console.log('Periodic server time sync...');
      fetchServerTime().catch(error => {
        console.error('Periodic sync failed:', error);
      });
    }, 30000); // 30 seconds

    // Check for clock changes every second
    const clockCheckInterval = setInterval(() => {
      detectClockChange();
    }, 1000); // 1 second

    // Cleanup intervals on unmount
    return () => {
      clearInterval(syncInterval);
      clearInterval(clockCheckInterval);
    };
  }, []);

  // Re-sync when user focuses back on the window (in case they changed time while away)
  useEffect(() => {
    const handleFocus = () => {
      console.log('🎯 Window focused - checking for time changes...');
      detectClockChange();
      fetchServerTime().catch(error => {
        console.error('Focus sync failed:', error);
      });
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const value = {
    fetchServerTime,
    getServerSyncedTime,
    getServerDateISO,
    getServerDateFormatted,
    isInitialized,
    serverTimeOffset,
    lastSyncTime,
  };

  return <ServerTimeContext.Provider value={value}>{children}</ServerTimeContext.Provider>;
};
