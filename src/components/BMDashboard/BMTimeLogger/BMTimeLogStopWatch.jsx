import { Button, CardBody, Row, Container } from 'reactstrap';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import styles from './BMTimeLogCard.module.css';
import {
  startTimeLog,
  pauseTimeLog,
  stopTimeLog,
  getCurrentTimeLog,
} from '../../../actions/bmdashboard/timeLoggerActions';

// The log-list endpoint returns updatedAt rather than currentIntervalStarted.
// Starting/resuming updates that timestamp; totalElapsedTime holds closed intervals.
const elapsedSeconds = log => {
  if (!log) return 0;
  const stored = log.totalElapsedTime || 0;
  const startedAt = log.currentIntervalStarted || log.updatedAt || log.createdAt;
  const startedMs = new Date(startedAt).getTime();
  const running =
    log.status === 'ongoing' && Number.isFinite(startedMs)
      ? Math.max(0, Date.now() - startedMs)
      : 0;
  return Math.floor((stored + running) / 1000);
};

function BMTimeLogStopWatch({ projectId, memberId, isVisible = true }) {
  const dispatch = useDispatch();
  const entry = useSelector(
    state => state.bmTimeLogger?.bmTimeLogs?.[`${memberId}_${projectId}`] || null,
  );
  // GET stores a wrapper; START/PAUSE store the log directly.
  const currentTimeLog = entry && 'currentTimeLog' in entry ? entry.currentTimeLog : entry;
  const [time, setTime] = useState(() => elapsedSeconds(currentTimeLog));
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const pendingRef = useRef(false);
  const mountedRef = useRef(true);
  const stoppedDisplayRef = useRef(null);
  const isStarted = currentTimeLog?.status === 'ongoing';

  useEffect(() => {
    let mounted = true;
    mountedRef.current = true;
    dispatch(getCurrentTimeLog(projectId, memberId)).finally(() => {
      if (mounted) setIsLoading(false);
    });
    // Unmounting only releases display resources; no timer operation is sent.
    return () => {
      mounted = false;
      mountedRef.current = false;
    };
  }, [dispatch, projectId, memberId]);

  useEffect(() => {
    const updateDisplay = () =>
      setTime(
        currentTimeLog ? elapsedSeconds(currentTimeLog) : stoppedDisplayRef.current?.time || 0,
      );
    updateDisplay();
    // Hidden cards retain local state but do no periodic rendering work.
    if (!isStarted || !isVisible) return undefined;
    const interval = setInterval(updateDisplay, 1000);
    return () => clearInterval(interval);
  }, [currentTimeLog, isStarted, isVisible]);

  const runOperation = async operation => {
    if (pendingRef.current || isLoading) return;
    pendingRef.current = true;
    setIsPending(true);
    try {
      await operation();
    } finally {
      pendingRef.current = false;
      if (mountedRef.current) setIsPending(false);
    }
  };

  const startStop = () =>
    runOperation(() => {
      if (isStarted) {
        return dispatch(pauseTimeLog(projectId, currentTimeLog._id, memberId));
      }
      stoppedDisplayRef.current = null;
      return dispatch(startTimeLog(projectId, memberId, currentTimeLog?.task || 'Default Task'));
    });

  const stop = () =>
    runOperation(async () => {
      if (currentTimeLog) {
        stoppedDisplayRef.current = {
          time: elapsedSeconds(currentTimeLog),
          createdAt: currentTimeLog.createdAt,
        };
        await dispatch(stopTimeLog(projectId, currentTimeLog._id, memberId));
      } else {
        stoppedDisplayRef.current = null;
        setTime(0);
      }
    });

  // Preserve the existing stopwatch CLEAR behavior: it uses STOP, not search.
  const clear = () => stop();
  const currentTime = currentTimeLog?.createdAt || stoppedDisplayRef.current?.createdAt;
  const startButtonText = isStarted ? 'PAUSE' : 'START';
  const disabled = isLoading || isPending;
  const hr = Math.floor(time / 3600);
  const min = Math.floor((time % 3600) / 60);
  const sec = time % 60;

  return (
    <CardBody className={styles.memberTimerBody}>
      <Container fluid className={styles.stopwatchContainer}>
        <Row className={styles.memberTimerDisplayRow}>
          <Button className={styles.memberStopwatch}>
            {hr.toString().padStart(2, '0')}:{min.toString().padStart(2, '0')}:
            {sec.toString().padStart(2, '0')}
          </Button>
        </Row>

        <Row className={styles.memberTimerControls}>
          <Button
            disabled={disabled}
            className={isStarted ? styles.memberPause : styles.memberStart}
            onClick={startStop}
          >
            <b>{startButtonText}</b>
          </Button>
          <Button className={styles.memberStop} disabled={disabled} onClick={stop}>
            <b>STOP</b>
          </Button>
        </Row>

        <Row className={styles.memberStartTime}>
          <span>Start at:</span>
          <b className={styles.memberStartTimestamp}>
            {currentTime ? moment(currentTime).format('hh:mm:ss A') : '\u00a0'}
          </b>
        </Row>

        <Row className={styles.memberTimerClearRow}>
          <Button className={styles.memberClear} disabled={disabled} onClick={clear}>
            <b>CLEAR</b>
          </Button>
        </Row>
      </Container>
    </CardBody>
  );
}

export default BMTimeLogStopWatch;
