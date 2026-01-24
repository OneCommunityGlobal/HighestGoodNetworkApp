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
  const intervalRef = useRef(null);

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
      const elapsedTime = Math.floor((currentTimeLog.totalElapsedTime || 0) / 1000);
      initialElapsedTimeRef.current = elapsedTime;

      // If we're restarting a timer that was running, adjust for time that passed
      if (currentTimeLog.status === 'ongoing' && currentTimeLog.currentIntervalStarted) {
        const additionalTime = Math.floor(
          (Date.now() - new Date(currentTimeLog.currentIntervalStarted).getTime()) / 1000,
        );
        setTime(elapsedTime + additionalTime);
      } else {
        setTime(elapsedTime);
      }

      setIsStarted(currentTimeLog.status === 'ongoing');
      setStartButtonText(currentTimeLog.status === 'ongoing' ? 'PAUSE' : 'START');

      if (currentTimeLog.createdAt) {
        setCurrentTime(moment(currentTimeLog.createdAt).format('hh:mm:ss A'));
      }
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
    if (!currentTime) {
      setCurrentTime(moment().format('hh:mm:ss A'));
    }

    if (isStarted) {
      // Pause the time log - store the current time value before pausing
      const currentElapsedTime = time;
      dispatch(pauseTimeLog(projectId, currentTimeLog._id, memberId))
        .then(() => {
          // If pauseTimeLog fails, at least keep the UI consistent
          setStartButtonText('START');
          setIsStarted(false);
        })
        .catch(() => {
          // On error, ensure UI still shows the correct time
          setTime(currentElapsedTime);
        });
    } else {
      // Start or resume time log
      if (currentTimeLog && currentTimeLog.status === 'paused') {
        // Resume existing time log
        dispatch(startTimeLog(projectId, memberId, currentTimeLog.task));
      } else {
        // Start new time log
        dispatch(startTimeLog(projectId, memberId, 'Default Task'));
      }
      setStartButtonText('PAUSE');
      setIsStarted(true);
    }
  };

  // Stop Handler
  const stop = () => {
    if (currentTimeLog) {
      dispatch(stopTimeLog(projectId, currentTimeLog._id, memberId));
    }
    setTime(0);
    setCurrentTime('');
    setStartButtonText('START');
    setIsStarted(false);
    initialElapsedTimeRef.current = 0;
  };

  // Clear Handler
  const clear = () => {
    stop();
  };

  const { hr, min, sec } = formatTime(time);

  return (
    <CardBody style={{ width: '100%' }}>
      <Container className={`${styles.stopwatchContainer}`}>
        <Row className="justify-content-center">
          <Col xs="auto">
            <Button className={`${styles.memberStopwatch} mb-2 px-3`}>
              {hr.toString().padStart(2, '0')}:{min.toString().padStart(2, '0')}:
              {sec.toString().padStart(2, '0')}
            </Button>
          </Col>
        </Row>

        <Row className="justify-content-between mb-2">
          <Button className={isStarted ? 'member-pause' : 'member-start mb-1'} onClick={startStop}>
            <b>{startButtonText}</b>
          </Button>

          <Button className={`${styles.memberStop}`} onClick={stop}>
            <b>STOP</b>
          </Button>
        </Row>
        <Row className="justify-content-center mb-1">
          Start at:
          <Col>
            <b className={`${styles.fontColorGray}`}>{currentTime}</b>
          </Col>
        </Row>
        {/* <Row className="mb-2">Task: </Row> */}
        <Row className="justify-content-center">
          <Button className={`${styles.memberClear}`} onClick={clear}>
            <b>CLEAR</b>
          </Button>
        </Row>
      </Container>
    </CardBody>
  );
}

export default BMTimeLogStopWatch;
