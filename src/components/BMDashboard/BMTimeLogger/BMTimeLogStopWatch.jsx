import { Button, CardBody, Row, Col, Container } from 'reactstrap';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import styles from './BMTimeLogCard.module.css';
import {
  startTimeLog,
  pauseTimeLog,
  stopTimeLog,
  getCurrentTimeLog,
} from '../../../actions/bmdashboard/timeLoggerActions';

function BMTimeLogStopWatch({ projectId, memberId }) {
  const dispatch = useDispatch();
  const currentTimeLog = useSelector(
    state => state.bmTimeLogger?.bmTimeLogs?.[`${memberId}_${projectId}`] || null,
  );

  const initialElapsedTimeRef = useRef(0);
  const [time, setTime] = useState(0);
  const [currentTime, setCurrentTime] = useState('');
  const [startButtonText, setStartButtonText] = useState('START');
  const [isStarted, setIsStarted] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [enableStop, setEnableStop] = useState(true);
  const intervalRef = useRef(null);
  const isStartingNewLogRef = useRef(false);
  const justPausedTimeRef = useRef(null);
  const resumingFromTimeRef = useRef(null);
  const justStoppedTimeRef = useRef(null);
  const isTimerRunning = currentTimeLog?.status === 'ongoing';

  const formatTime = useCallback(totalSeconds => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return { hr: hrs, min: mins, sec: secs };
  }, []);

  useEffect(() => {
    dispatch(getCurrentTimeLog(projectId, memberId));
  }, [dispatch, projectId, memberId]);

  // Sync time with backend time log
  useEffect(() => {
    if (currentTimeLog) {
      // If we just started a new log, ignore old elapsed time and keep it at 0
      if (isStartingNewLogRef.current && currentTimeLog.status === 'ongoing') {
        isStartingNewLogRef.current = false;
        setTime(0);
        initialElapsedTimeRef.current = 0;
        setIsStarted(true);
        setStartButtonText('PAUSE');
        if (currentTimeLog.createdAt) {
          setCurrentTime(moment(currentTimeLog.createdAt).format('hh:mm:ss A'));
        }
        return;
      }

      // If we just resumed from a paused state, use the time we were at, not backend's old elapsed time
      if (resumingFromTimeRef.current !== null && currentTimeLog.status === 'ongoing') {
        const resumeTime = resumingFromTimeRef.current;
        resumingFromTimeRef.current = null;
        setTime(resumeTime);
        initialElapsedTimeRef.current = resumeTime;
        setIsStarted(true);
        setStartButtonText('PAUSE');
        if (currentTimeLog.createdAt) {
          setCurrentTime(moment(currentTimeLog.createdAt).format('hh:mm:ss A'));
        }
        return;
      }

      // If we just paused, use the local time we stored, not the backend's elapsed time
      if (justPausedTimeRef.current !== null && currentTimeLog.status === 'paused') {
        const pausedTime = justPausedTimeRef.current;
        justPausedTimeRef.current = null;
        setTime(pausedTime);
        initialElapsedTimeRef.current = pausedTime;
        setIsStarted(false);
        setStartButtonText('START');
        if (currentTimeLog.createdAt) {
          setCurrentTime(moment(currentTimeLog.createdAt).format('hh:mm:ss A'));
        }
        return;
      }

      // If we just stopped, use the local time we stored, not the backend's elapsed time
      if (justStoppedTimeRef.current !== null && currentTimeLog.status === 'completed') {
        const stoppedTime = justStoppedTimeRef.current;
        // Don't clear the ref yet - keep it until we're sure the sync is done
        setTime(stoppedTime);
        initialElapsedTimeRef.current = stoppedTime;
        setIsStarted(false);
        setStartButtonText('START');
        if (currentTimeLog.createdAt) {
          setCurrentTime(moment(currentTimeLog.createdAt).format('hh:mm:ss A'));
        }
        // Clear the ref after a short delay to prevent re-syncing
        setTimeout(() => {
          justStoppedTimeRef.current = null;
        }, 100);
        return;
      }

      // If there's a stopped time ref but log is not completed yet, preserve the time
      if (justStoppedTimeRef.current !== null) {
        const stoppedTime = justStoppedTimeRef.current;
        setTime(stoppedTime);
        initialElapsedTimeRef.current = stoppedTime;
        return;
      }

      const elapsedTime = Math.floor((currentTimeLog.totalElapsedTime || 0) / 1000);
      initialElapsedTimeRef.current = elapsedTime;

      // If we're restarting a timer that was running, adjust for time that passed
      if (currentTimeLog.status === 'ongoing' && currentTimeLog.currentIntervalStarted) {
        const additionalTime = Math.floor(
          (Date.now() - new Date(currentTimeLog.currentIntervalStarted).getTime()) / 1000,
        );
        setTime(elapsedTime + additionalTime);
      } else if (currentTimeLog.status === 'paused') {
        // For paused logs, show the elapsed time (only if we didn't just pause)
        setTime(elapsedTime);
      } else if (currentTimeLog.status === 'completed') {
        // For completed logs, show the final elapsed time (don't reset to 0)
        setTime(elapsedTime);
        initialElapsedTimeRef.current = elapsedTime;
      } else {
        // For other statuses, start from 0
        setTime(0);
        initialElapsedTimeRef.current = 0;
      }

      setIsStarted(currentTimeLog.status === 'ongoing');
      setStartButtonText(currentTimeLog.status === 'ongoing' ? 'PAUSE' : 'START');

      if (currentTimeLog.createdAt) {
        setCurrentTime(moment(currentTimeLog.createdAt).format('hh:mm:ss A'));
      }
    } else {
      // No current log
      // If we just stopped, preserve the final time instead of resetting
      if (justStoppedTimeRef.current !== null) {
        const stoppedTime = justStoppedTimeRef.current;
        setTime(stoppedTime);
        initialElapsedTimeRef.current = stoppedTime;
        setIsStarted(false);
        setStartButtonText('START');
        // Keep the ref so the time stays visible
        // Only clear it when starting a new log
        return;
      }

      // Otherwise, reset to 0
      setTime(0);
      initialElapsedTimeRef.current = 0;
      setIsStarted(false);
      setStartButtonText('START');
      isStartingNewLogRef.current = false;
      justPausedTimeRef.current = null;
      resumingFromTimeRef.current = null;
    }
  }, [currentTimeLog]);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (isStarted) {
      // Clear any existing intervals first
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isStarted]);

  // Start/Pause Handler
  const startStop = () => {
    setEnableStop(false);
    if (!currentTime) {
      setCurrentTime(moment().format('hh:mm:ss A'));
    }

    if (isStarted) {
      // Pause the time log - store the current time value before pausing
      const currentElapsedTime = time;
      justPausedTimeRef.current = currentElapsedTime;
      dispatch(pauseTimeLog(projectId, currentTimeLog._id, memberId))
        .then(() => {
          // UI will be updated by the sync useEffect when the paused log comes back
          setFeedbackMessage('Timer paused successfully');
          setTimeout(() => {
            setFeedbackMessage('');
          }, 3000);
        })
        .catch(() => {
          // On error, ensure UI still shows the correct time
          justPausedTimeRef.current = null;
          setTime(currentElapsedTime);
          setStartButtonText('START');
          setIsStarted(false);
          setFeedbackMessage('Failed to pause timer');
        });
    } else {
      // Start or resume time log
      if (currentTimeLog && currentTimeLog.status === 'paused') {
        // Resume existing paused time log - preserve the current time
        isStartingNewLogRef.current = false;
        resumingFromTimeRef.current = time; // Store current time before resuming
        dispatch(startTimeLog(projectId, memberId, currentTimeLog.task));
      } else {
        // Start new time log - always reset to 0 for new logs
        isStartingNewLogRef.current = true;
        resumingFromTimeRef.current = null;
        justStoppedTimeRef.current = null; // Clear stopped time ref when starting new
        setTime(0);
        initialElapsedTimeRef.current = 0;
        setCurrentTime(moment().format('hh:mm:ss A'));
        dispatch(startTimeLog(projectId, memberId, 'Default Task'));
      }
      setFeedbackMessage('Timer started');

      setTimeout(() => {
        setFeedbackMessage('');
      }, 3000);
      setStartButtonText('PAUSE');
      setIsStarted(true);
    }
  };

  // Stop Handler
  const stop = () => {
    setEnableStop(true);
    if (currentTimeLog) {
      // Store the current time before stopping so it remains visible
      const finalTime = time;
      justStoppedTimeRef.current = finalTime;

      // Immediately update UI to show stopped state with final time
      setTime(finalTime);
      initialElapsedTimeRef.current = finalTime;
      setStartButtonText('START');
      setIsStarted(false);
      // Don't clear currentTime - keep the start time visible

      // Then dispatch the stop action
      dispatch(stopTimeLog(projectId, currentTimeLog._id, memberId))
        .then(() => {
          setFeedbackMessage('Time logged successfully');

          setTimeout(() => {
            setFeedbackMessage('');
          }, 3000);
        })
        .catch(() => {
          // On error, still show the time
          justStoppedTimeRef.current = null;
          setTime(finalTime);
          setFeedbackMessage('Failed to stop timer');
        });
    } else {
      // No active log, just reset
      clear();
    }
  };

  // Clear Handler
  const clear = () => {
    setTime(0);
    setCurrentTime('');
    setStartButtonText('START');
    setIsStarted(false);
    setEnableStop(true);
    initialElapsedTimeRef.current = 0;
    //stop();
    setFeedbackMessage('Timer cleared');
    setTimeout(() => {
      setFeedbackMessage('');
    }, 3000);
  };

  const { hr, min, sec } = formatTime(time);
  console.log('Current Time', currentTimeLog);

  return (
    <CardBody style={{ width: '100%' }}>
      <Container className={`${styles.stopwatchContainer}`}>
        {feedbackMessage && (
          <Row className="justify-content-center gap-2 mb-3">
            <span className="text-info fw-semibold">{feedbackMessage}</span>
          </Row>
        )}
        <Row className="justify-content-center align-items-center">
          <Col xs="auto">
            <span
              className={isTimerRunning ? 'text-success fw-semibold' : 'text-secondary fw-semibold'}
            >
              ● {isTimerRunning ? 'Running' : 'Stopped'}
            </span>
          </Col>

          <Col xs="auto">
            <Button
              className={`${styles.memberStopwatch} px-4 align-items-center justify-content-center`}
            >
              {hr.toString().padStart(2, '0')}:{min.toString().padStart(2, '0')}:
              {sec.toString().padStart(2, '0')}
            </Button>
          </Col>
        </Row>

        <Row className="justify-content-center gap-3">
          <Col>
            <Button
              className={`px-0 ${isStarted ? styles.memberPause : styles.memberStart}`}
              onClick={startStop}
            >
              <b>{startButtonText}</b>
            </Button>
          </Col>
          <Col>
            <Button className={`${styles.memberStop} px-0`} onClick={stop} disabled={enableStop}>
              <b>STOP</b>
            </Button>
          </Col>
        </Row>
        <Row className="justify-content-center align-items-center m-2">
          Start at:
          <Col>
            <b className={`${styles.fontColorGray}`}>{currentTime}</b>
          </Col>
        </Row>
        {/* <Row className="mb-2">Task: </Row> */}
        <Row className="justify-content-center">
          <Button
            className={`${styles.memberClear}  px-2 py-2`}
            onClick={clear}
            disabled={isStarted}
          >
            <b>CLEAR</b>
          </Button>
        </Row>

        <Row className="mt-3 text-center">
          <small className="text-muted">
            Start begins time tracking. Stop saves the session. Clear resets the timer display.
          </small>
        </Row>
      </Container>
    </CardBody>
  );
}

export default BMTimeLogStopWatch;
