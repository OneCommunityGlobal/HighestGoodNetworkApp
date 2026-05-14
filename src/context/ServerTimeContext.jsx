import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import moment from 'moment-timezone';
import { ENDPOINTS } from '../utils/URL';

const DEFAULT_TIMEZONE = 'America/Los_Angeles';
const SYNC_INTERVAL_MS = 30000;
const CLOCK_DRIFT_THRESHOLD_MS = 5000;

const ServerTimeContext = createContext(null);

const parseServerTime = data => data?.currentTime || data?.date || data?.datetime || data;

export const useServerTime = () => {
  const context = useContext(ServerTimeContext);

  if (!context) {
    throw new Error('useServerTime must be used within a ServerTimeProvider');
  }

  return context;
};

export function ServerTimeProvider({ children }) {
  const [serverTimeOffset, setServerTimeOffset] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastKnownClientTimeRef = useRef(Date.now());

  const syncServerTime = async () => {
    try {
      const response = await axios.get(ENDPOINTS.GET_SERVER_DATE);
      const serverTimeString = parseServerTime(response.data);
      const serverTime = new Date(serverTimeString).getTime();

      if (Number.isNaN(serverTime)) {
        throw new Error('Server response does not contain a valid date');
      }

      const clientTime = Date.now();
      setServerTimeOffset(serverTime - clientTime);
      setLastSyncTime(clientTime);
      lastKnownClientTimeRef.current = clientTime;
      setIsInitialized(true);

      return serverTime;
    } catch (error) {
      const clientTime = Date.now();
      setServerTimeOffset(0);
      setLastSyncTime(clientTime);
      lastKnownClientTimeRef.current = clientTime;
      setIsInitialized(true);

      return clientTime;
    }
  };

  const detectClockChange = () => {
    const currentTime = Date.now();
    const expectedTime = lastKnownClientTimeRef.current + 1000;
    const timeDifference = Math.abs(currentTime - expectedTime);

    if (timeDifference > CLOCK_DRIFT_THRESHOLD_MS) {
      syncServerTime().catch(() => {});
    }

    lastKnownClientTimeRef.current = currentTime;
  };

  const getServerSyncedTime = () => Date.now() + serverTimeOffset;

  const getServerDateISO = () => new Date(getServerSyncedTime()).toISOString();

  const getServerDateMoment = (timezone = DEFAULT_TIMEZONE) =>
    moment(getServerDateISO()).tz(timezone);

  useEffect(() => {
    syncServerTime().catch(() => {});
  }, []);

  useEffect(() => {
    const syncInterval = window.setInterval(() => {
      syncServerTime().catch(() => {});
    }, SYNC_INTERVAL_MS);

    const clockCheckInterval = window.setInterval(() => {
      detectClockChange();
    }, 1000);

    return () => {
      window.clearInterval(syncInterval);
      window.clearInterval(clockCheckInterval);
    };
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      syncServerTime().catch(() => {});
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const value = useMemo(
    () => ({
      fetchServerTime: syncServerTime,
      getServerSyncedTime,
      getServerDateISO,
      getServerDateMoment,
      isInitialized,
      lastSyncTime,
      serverTimeOffset,
    }),
    [isInitialized, lastSyncTime, serverTimeOffset],
  );

  return <ServerTimeContext.Provider value={value}>{children}</ServerTimeContext.Provider>;
}

ServerTimeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
