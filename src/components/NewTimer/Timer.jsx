import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Badge, Button } from 'reactstrap';
import useInterval from '../../hooks/useInterval';
import TimeEntryForm from '../Timelog/TimeEntryForm';
import {
  GET_TIMER,
  PAUSE_TIMER,
  START_TIMER,
  STOP_TIMER,
  MAX_TIME_8_HOURS,
  useWebsocketMessage,
  client,
} from '../../services/timerService';
import './Timer.css';
import { useMemo } from 'react';
import { setTimer } from 'actions/timer';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

function Timer() {
  const dispatch = useDispatch();
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
  const [clientOffset, setClientOffset] = useState(0);
  const [timeTicksLast, setTimeTicksLast] = useState(0);

  const message = useWebsocketMessage();

  // Calculate time to readable format
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secondsRemainder = seconds % 60;
  const padZero = useCallback(number => `0${number}`.slice(-2), []);

  // Our max time allowed is 8 hours per timer
  const isPastMaxTime = useMemo(() => seconds >= MAX_TIME_8_HOURS, [seconds]);
  const data = useMemo(
    () => ({
      disabled: window.screenX <= 500,
      isTangible: true,
    }),
    [],
  );

  // This should open the timer entry form, and handle closing it as well
  const handleStop = useCallback(() => setModal(previousModal => !previousModal), []);

  /**
   * Checking websocket connection -
   *
   * If the connection fails, the UI will update accordingly.
   */
  useEffect(() => client.onStateChange(setIsConnected), [setIsConnected]);

  /**
   * On first render when connected, we would like
   * to get the timer to check if it is running and
   * all the details around it.
   * redeploy
   */
  useEffect(() => {
    if (isConnected) {
      console.log("Reconnecting")
      client?.getClient()?.send(GET_TIMER);
    } 
  }, [isConnected]);

  /** Coordinate with redux store if timer is paused */
  useEffect(() => {
    if (!isRunning) {
      dispatch(setTimer({ paused: true }));
    } else {
      dispatch(setTimer({ paused: false }));
    }
  }, [isRunning]);
  useEffect(() => {
    if (message) {
      const {
        seconds: secondsFromBackend,
        startedAtInSeconds: startedAtInSecondsFromBackend,
        isRunning: isRunningFromBackend,
        isUserPaused: isUserPausedFromBackend,
        isApplicationPaused: isApplicationPausedFromBackend,
        timeStamp,
      } = message;

      const timeNow = new Date().getTime() / 1000;

      let clientOffsetFromBackend = timeStamp - timeNow;
      setClientOffset(clientOffsetFromBackend);
      setIsRunning(isRunningFromBackend);
      setIsUserPaused(isUserPausedFromBackend);
      setIsApplicationPaused(isApplicationPausedFromBackend);

      /** Cases: Timer is reset or being cleared */
      if (!isRunningFromBackend && !isUserPausedFromBackend && !isApplicationPausedFromBackend) {
        setSeconds(secondsFromBackend);
        setStartedAt(0);
        setStartingSeconds(0);
        return;
      }

      /** If we paused the timer ourselves, no need to gain new information from backend
       * Note: This is only if this client pauses timer, but if another does we want that
       * information in our state.
       */
      if (isUserPaused && !isRunningFromBackend) {
        return;
      }

      /**
       * Cases: User closes tab or puts computer to sleep mode / refreshes
       *
       * We would like to restart the timer only if the user refreshes.
       * Otherwise we would like to keep it paused. We grab from session-storage
       * since that makes the assumption the user refreshed.
       */
      if (isApplicationPausedFromBackend) {
        const shouldRestartTimer = sessionStorage.getItem('working-session-timer');

        if (shouldRestartTimer && MAX_TIME_8_HOURS >= secondsFromBackend) {
          client.getClient().send(START_TIMER({ restartTimerWithSync: true }));
        }
      }

      /**
       * Cases: Timer is running and no pauses, sync with frontend
       */
      if (isRunningFromBackend && !isUserPausedFromBackend && !isApplicationPausedFromBackend) {
        /**
         * Calculate timer from when timer was
         * started in timer service against local
         * time and add seconds from database
         * */
        const currentTimeInSeconds = new Date().getTime() / 1000;

        // We need to calculate the offset from the backend here
        const currentTime =
          currentTimeInSeconds -
          startedAtInSecondsFromBackend +
          secondsFromBackend +
          clientOffsetFromBackend;

        // Set when started from database to be used in future calculation
        setStartedAt(startedAtInSecondsFromBackend);

        // Set current seconds to timer
        setSeconds(Math.floor(currentTime));

        // Set initial seconds received from timer
        setStartingSeconds(secondsFromBackend);

        // Set session in browser, and will help determine if the user refreshes
        sessionStorage.setItem('working-session-timer', true);
      }

      /** Cases: Timer was paused from another client and we are taking in the change */
      if (!isRunningFromBackend && (isUserPausedFromBackend || isApplicationPausedFromBackend)) {
        // When user paused we saved based off of the original second difference calculation
        setSeconds(Math.floor(secondsFromBackend));
        setStartedAt(startedAtInSecondsFromBackend);

        // Calculation is done from backend already, so we can set this to 0.
        setStartingSeconds(0);
      }
    }
  }, [message]);

  const startTimer = () => {
    if (isConnected) {
      client.getClient().send(START_TIMER({ restartTimerWithSync: false }));
    }
  };

  const pauseTimer = () => {
    if (isConnected) {
      client.getClient().send(PAUSE_TIMER({ isUserPaused: true, isApplicationPaused: false }));
    }
  };

  const resetTimer = () => {
    if (isConnected) {
      client.getClient().send(STOP_TIMER);
    }
  };

  useEffect(() => {
    if (isRunning) {
      setTimeTicksLast((new Date()).getTime())
    }
  }, [isRunning])

  /**
   * This is how we update the UI
   * to reflect an accurate time
   */
  useInterval(
    () => {
      if (
        isRunning &&
        !isUserPaused &&
        !isApplicationPaused &&
        startedAt !== 0 &&
        isConnected &&
        !isPastMaxTime
      ) {
        var current = (new Date()).getTime();
        if (current-timeTicksLast > 3000) {
          client.getClient().send(PAUSE_TIMER({ isUserPaused: false, isApplicationPaused: true }));
          setIsConnected(false)
          location.reload();  
        }
        setTimeTicksLast(current);

        /**
         * How do we calculate time?
         *
         * We take the current time right now and
         * take the difference between the time
         * when the timer started in the server
         * and add that with the starting seconds
         * from any previous timer start / stops
         */
        const currentTimeInSeconds = new Date().getTime() / 1000;

        // Calculating the offset from the server timer
        const currentTime = Math.floor(
          currentTimeInSeconds - startedAt + startingSeconds + clientOffset,
        );
        setSeconds(currentTime);

        // Edge Case, if user timer is approaching or at 8 hours we should pause.
        if (currentTime >= MAX_TIME_8_HOURS) {
          client.getClient().send(PAUSE_TIMER({ isUserPaused: false, isApplicationPaused: true }));
        }
      }
    },
    isRunning && isConnected ? 1000 : null,
  );

  useEffect(() => {
    if (!isPastMaxTime && isApplicationPaused && !sessionStorage.getItem('working-session-timer')) {
      toast.warn(
        'Your timer was paused since you left without pausing, please remember to pause or stop timer when leaving.',
      );
    }

    if (isPastMaxTime) {
      toast.error('  Your timer is paused, you reached 8 hours please log your time.');
    }
  }, [isPastMaxTime, isApplicationPaused]);

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
            disabled={!isConnected || isPastMaxTime}
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
