import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Badge, Button } from 'reactstrap';
import useWindowFocus from '../../hooks/useWindowFocus';
import useInterval from '../../hooks/useInterval';
import TimeEntryForm from '../Timelog/TimeEntryForm';
import {
  GET_TIMER,
  PAUSE_TIMER,
  START_TIMER,
  STOP_TIMER,
  useWebsocketMessage,
  client,
} from '../../services/timerService';

import './Timer.css';

function Timer() {
  const userId = useSelector(state => state.auth.user.userid);
  const userProfile = useSelector(state => state.auth.user);
  const [startedAt, setStartedAt] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [startingSeconds, setStartingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isApplicationPaused, setIsApplicationPaused] = useState(false);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const [modal, setModal] = useState(false);
  const [isConnected, setIsConnected] = useState(client.isConnected());

  const isWindowFocused = useWindowFocus();
  const message = useWebsocketMessage();

  // Calculate time to readable format
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsRemainder = seconds % 60;
  const data = {
    disabled: window.screenX <= 500,
    isTangible: true,
    seconds,
    isRunning,
  };

  /**
   * If window is not focused,
   * we should pause the timer
   * for the user.
   */
  useEffect(() => {
    if (isConnected) {
      if (!isWindowFocused && !isUserPaused && isRunning) {
        client
          .getClient()
          .send(
            PAUSE_TIMER({ isUserPaused: false, isApplicationPaused: true, saveTimerData: false }),
          );
      } else if (isApplicationPaused) {
        client.getClient().send(START_TIMER({ restartTimerWithSync: true }));
      }
    }
  }, [isWindowFocused]);

  // Toggle modal to open
  const handleStop = useCallback(() => setModal(previousModal => !previousModal), []);

  /**
   * Checking websocket connection -
   *
   * If the connection fails, the UI will update accordingly.
   */
  useEffect(() => client.onStateChange(setIsConnected), [setIsConnected]);

  /**
   * Checking websocket connection -
   *
   * When we gain connection we will re-sync the timer
   * against the backend server
   */
  useEffect(() => {
    if (isConnected) {
      client.getClient().send(GET_TIMER);
    }
  }, [isConnected]);

  useEffect(() => {
    if (message) {
      const {
        seconds: secondsFromBackend,
        startedAtInSeconds: startedAtInSecondsFromBackend,
        isRunning: isRunningFromBackend,
        isUserPaused: isUserPausedFromBackend,
        isApplicationPaused: isApplicationPausedFromBackend,
      } = message;

      if (isUserPaused && !isRunningFromBackend) {
        setIsRunning(isRunningFromBackend);
        setIsUserPaused(isUserPausedFromBackend);
        setIsApplicationPaused(isApplicationPausedFromBackend);
        return;
      }

      setIsRunning(isRunningFromBackend);
      setIsUserPaused(isUserPausedFromBackend);
      setIsApplicationPaused(isApplicationPausedFromBackend);

      if (isWindowFocused && isApplicationPausedFromBackend) {
        client.getClient().send(START_TIMER({ restartTimerWithSync: true }));
      }

      if (isRunningFromBackend && !isUserPausedFromBackend && !isApplicationPausedFromBackend) {
        /**
         * Calculate timer from when timer was
         * started in timer service against local
         * time and add seconds from database
         * */
        const currentTimeInSeconds = new Date().getTime() / 1000;
        const currentTime =
          currentTimeInSeconds - startedAtInSecondsFromBackend + secondsFromBackend;

        // Set when started from database to be used in future calculation
        setStartedAt(startedAtInSecondsFromBackend);

        // Set current seconds to timer
        setSeconds(Math.floor(currentTime));

        // Set initial seconds received from timer
        setStartingSeconds(secondsFromBackend);
      }

      if (!isRunningFromBackend && (isUserPausedFromBackend || isApplicationPausedFromBackend)) {
        setSeconds(Math.floor(secondsFromBackend));
        setStartedAt(startedAtInSecondsFromBackend);

        // Calculation is done from backend already, so we can set this to 0.
        setStartingSeconds(0);
      }

      // Timer was reset
      if (!isRunningFromBackend && !isUserPausedFromBackend && !isApplicationPausedFromBackend) {
        setSeconds(secondsFromBackend);
        setStartedAt(0);
        setStartingSeconds(0);
      }
    }
  }, [message]);

  // Start the timer
  const startTimer = () => {
    if (isConnected) {
      client.getClient().send(START_TIMER({ restartTimerWithSync: false }));
    }
  };

  // Pause the timer
  const pauseTimer = () => {
    if (isConnected) {
      client.getClient().send(PAUSE_TIMER({ isUserPaused: true, isApplicationPaused: false }));
    }
  };

  // Reset the timer
  const resetTimer = () => {
    if (isConnected) {
      client.getClient().send(STOP_TIMER);
    }
  };

  /**
   * This is how we update the UI
   * to reflect an accurate time
   */
  useInterval(() => {
    if (isRunning && !isUserPaused && !isApplicationPaused && startedAt !== 0 && isConnected) {
      /**
       * How do we calculate time?
       *
       * We take the current time right now and
       * take the difference between the time
       * when the timer started in the server
       * and add that with the starting seconds
       */
      const currentTimeInSeconds = new Date().getTime() / 1000;
      const currentTime = Math.floor(currentTimeInSeconds - startedAt + startingSeconds);

      // Set to UI
      setSeconds(currentTime);
    }
  }, 1000);

  const padZero = number => `0${number}`.slice(-2);

  return (
    <div style={{ zIndex: 2 }} className="timer">
      <Button
        onClick={resetTimer}
        color="secondary"
        className="mr-1 align-middle"
        disabled={seconds === 0 || !isConnected}
      >
        Clear
      </Button>

      {isConnected ? (
        <Badge className="mr-1 align-middle">
          {hours}:{padZero(minutes)}:{padZero(secondsRemainder)}
        </Badge>
      ) : (
        <Badge className="mr-1 align-middle">
          <span className="visually-hidden">Loading...</span>
        </Badge>
      )}

      <div className="button-container">
        <Button
          id="start"
          onClick={isRunning ? pauseTimer : startTimer}
          color="primary"
          className="ml-xs-1 align-middle start-btn"
          disabled={!isConnected || isApplicationPaused}
        >
          {isRunning ? 'Pause' : 'Start'}
        </Button>
        <Button
          onClick={seconds !== 0 ? handleStop : null}
          color="danger"
          className="ml-1 align-middle"
          disabled={seconds === 0 || !isConnected}
        >
          Stop
        </Button>
      </div>
      {modal && (
        <TimeEntryForm
          edit={false}
          userId={userId}
          toggle={handleStop}
          isOpen
          timer={{ hours, minutes }}
          data={data}
          userProfile={userProfile}
          resetTimer={resetTimer}
        />
      )}
    </div>
  );
}

export default Timer;
