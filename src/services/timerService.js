import { useState, useEffect } from 'react';
import { ENDPOINTS } from '../utils/URL';
import config from '../config.json';

export const MAX_TIME_8_HOURS = 28800;
export const GET_TIMER = JSON.stringify({ intent: 'GET_TIMER' });
export const START_TIMER = ({ restartTimerWithSync = false }) => JSON.stringify({ intent: 'START_TIMER', restartTimerWithSync });
export const STOP_TIMER = JSON.stringify({ intent: 'STOP_TIMER' });
export const PAUSE_TIMER = ({
  isUserPaused = true,
  isApplicationPaused = false,
  saveTimerData = false,
}) => JSON.stringify({
  intent: 'PAUSE_TIMER', isUserPaused, isApplicationPaused, saveTimerData,
});

function initializeWebsocket(url) {
  let client;
  let isConnected = false;
  let reconnectOnClose = true;
  let messageListeners = [];
  let stateChangeListeners = [];

  function on(fn) {
    messageListeners.push(fn);
  }

  function off(fn) {
    messageListeners = messageListeners.filter((l) => l !== fn);
  }

  function onStateChange(fn) {
    stateChangeListeners.push(fn);
    return () => {
      stateChangeListeners = stateChangeListeners.filter((l) => l !== fn);
    };
  }

  function start() {
    client = new WebSocket(url, localStorage.getItem(config.tokenKey));

    client.onopen = () => {
      isConnected = true;
      stateChangeListeners.forEach((fn) => fn(true));
    };

    const { close } = client;

    // Close without reconnecting;
    client.close = () => {
      reconnectOnClose = false;
      close.call(client);
    };

    client.onmessage = (event) => {
      messageListeners.forEach((fn) => fn(event.data));
    };

    client.onerror = (e) => console.error(e);

    client.onclose = () => {
      isConnected = false;
      stateChangeListeners.forEach((fn) => fn(false));

      if (!reconnectOnClose) {
        return;
      }

      // Remove session since socket is closed
      sessionStorage.removeItem('working-session-timer');

      setTimeout(start, 10000);
    };
  }

  start();

  return {
    on,
    off,
    onStateChange,
    close: () => client.close(),
    getClient: () => client,
    isConnected: () => isConnected,
  };
}

// We initialize the client with the JWT token,
// so we can verify on backend that you own the correct timer
export const client = initializeWebsocket(
  ENDPOINTS.TIMER_SERVICE,
);

export function useWebsocketMessage() {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    function handleMessage(passedInMessage) {
      setMessage(JSON.parse(passedInMessage));
    }
    client.on(handleMessage);
    return () => client.off(handleMessage);
  }, [message, setMessage]);

  return message;
}
