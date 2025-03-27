import { Button, CardBody, Row, Col, Container } from 'reactstrap';
import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import './BMTimeLogCard.css';
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

  // const initialElapsedTimeRef = useRef(0);
  const [time, setTime] = useState(0);
  const [currentTime, setCurrentTime] = useState('');
  const [startButtonText, setStartButtonText] = useState('START');
  const [isStarted, setIsStarted] = useState(false);

  const formatTime = useCallback(totalSeconds => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return { hr: hrs, min: mins, sec: secs };
  }, []);

  // Fetch current time log on component mount
  useEffect(() => {
    dispatch(getCurrentTimeLog(projectId, memberId));
  }, [dispatch, projectId, memberId]);

  // Sync time with backend time log
  useEffect(() => {
    if (currentTimeLog) {
      if (currentTimeLog.status === 'ongoing' || currentTimeLog.status === 'paused') {
        const elapsedTime = Math.floor((currentTimeLog.totalElapsedTime || 0) / 1000);
        // initialElapsedTimeRef.current = elapsedTime;
        setTime(elapsedTime);
        setIsStarted(currentTimeLog.status === 'ongoing');
        setStartButtonText(currentTimeLog.status === 'ongoing' ? 'PAUSE' : 'START');
        setCurrentTime(moment(currentTimeLog.createdAt).format('hh:mm:ss A'));
      }
    }
  }, [currentTimeLog]);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    let intervalId;
    if (isStarted) {
      intervalId = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isStarted]);

  // Start/Pause Handler
  const startStop = () => {
    if (!currentTime) {
      setCurrentTime(moment().format('hh:mm:ss A'));
    }

    if (isStarted) {
      // Pause the time log
      dispatch(pauseTimeLog(projectId, currentTimeLog._id, memberId));
      setStartButtonText('START');
    } else {
      // Start or resume time log
      if (currentTimeLog) {
        // Resume existing time log
        dispatch(startTimeLog(projectId, memberId, currentTimeLog.task));
      } else {
        // Start new time log
        dispatch(startTimeLog(projectId, memberId, 'Default Task'));
      }
      setStartButtonText('PAUSE');
    }
    setIsStarted(!isStarted);
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
    // initialElapsedTimeRef.current = 0;
  };

  // Clear Handler
  const clear = () => {
    stop();
  };

  const { hr, min, sec } = formatTime(time);

  return (
    <CardBody style={{ width: '100%' }}>
      <Container className="stopwatch-container">
        <Row className="justify-content-center">
          <Col xs="auto">
            <Button className="member-stopwatch mb-2 px-3">
              {hr.toString().padStart(2, '0')}:{min.toString().padStart(2, '0')}:
              {sec.toString().padStart(2, '0')}
            </Button>
          </Col>
        </Row>

        <Row className="justify-content-between mb-2">
          <Button className={isStarted ? 'member-pause' : 'member-start mb-1'} onClick={startStop}>
            <b>{startButtonText}</b>
          </Button>

          <Button className="member-stop" onClick={stop}>
            <b>STOP</b>
          </Button>
        </Row>
        <Row className="justify-content-center mb-1">
          Start at:
          <Col>
            <b className="font-color-gray">{currentTime}</b>
          </Col>
        </Row>
        {/* <Row className="mb-2">Task: </Row> */}
        <Row className="justify-content-center">
          <Button className="member-clear" onClick={clear}>
            <b>CLEAR</b>
          </Button>
        </Row>
      </Container>
    </CardBody>
  );
}

export default BMTimeLogStopWatch;
