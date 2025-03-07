/* eslint-disable jsx-a11y/media-has-caption */
import moment from 'moment';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { BsAlarmFill } from 'react-icons/bs';
import {
  FaPlayCircle,
  FaPauseCircle,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import cs from 'classnames';
import { connect } from 'react-redux';
import css from './Timer.module.css';
import '../../Header/DarkModeButton';
import { ENDPOINTS } from '../../../utils/URL';
import config from '../../../../src/config.json';


function Timer({ authUser, userProfile, darkMode }) {
  console.log("Redux state in Timer:", { authUser, userProfile }); 

  const [customReadyState, setCustomReadyState] = useState(ReadyState.CONNECTING);
  const WSoptions = {
    share: false,
    protocols: localStorage.getItem(config.tokenKey),
    onOpen: () => setCustomReadyState(ReadyState.OPEN),
    onClose: () => setCustomReadyState(ReadyState.CLOSED),
    onError: error => {
      throw new Error('WebSocket Error:', error);
    },
  };

  const { sendMessage, sendJsonMessage, lastJsonMessage, getWebSocket } = useWebSocket(
    ENDPOINTS.TIMER_SERVICE,
    WSoptions,
  );

  const defaultMessage = {
    time: 900000,
    paused: false,
    forcedPause: false,
    started: false,
    goal: 900000,
    initialGoal: 900000,
    chiming: false,
    startAt: Date.now(),
  };

  const MAX_HOURS = 5;
  const MIN_MINS = 1;
  const ALLOWED_ROLES_TO_INTERACT = useMemo(() => ['Owner', 'Administrator'], []);

  const [message, setMessage] = useState(defaultMessage);
  const { time, paused, started, goal, startAt } = message;
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(time);
  const [viewingUserId, setViewingUserId] = useState(null);
  const isWSOpenRef = useRef(0);

  useEffect(() => {
    const handleStorageEvent = () => {
      const sessionStorageData = JSON.parse(window.sessionStorage.getItem('viewingUser'));
      setViewingUserId(sessionStorageData?.userId || null);
    };

    handleStorageEvent();
    window.addEventListener('storage', handleStorageEvent);
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  const isButtonDisabled = useMemo(
    () => viewingUserId && !ALLOWED_ROLES_TO_INTERACT.includes(authUser?.role),
    [viewingUserId, authUser]
  );

  const sendJsonMessageNoQueue = useCallback(msg => sendJsonMessage(msg, false), [sendMessage]);

  useEffect(() => {
    if (lastJsonMessage) {
      setMessage(lastJsonMessage);
      setRunning(lastJsonMessage.started && !lastJsonMessage.paused);
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    if (running) {
      const interval = setInterval(() => {
        const now = moment.utc();
        const timePassed = moment.duration(now.diff(startAt)).asMilliseconds();
        setRemaining(time > timePassed ? time - timePassed : 0);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [running, time, startAt]);

  const handleStartButton = useCallback(() => {
    if (remaining === 0) {
      toast.error('No more Remaining time, please add more or log your passed time');
    } else {
      sendJsonMessageNoQueue({ action: 'START_TIMER' });
    }
  }, [remaining]);

  return (
    <div className={css.timerContainer}>
      <button
        type="button"
        disabled={isButtonDisabled}
        onClick={() => setRunning(!running)}
        className={css.btnDiv}
        aria-label="Open timer dropdown"
      >
        <BsAlarmFill
          className={cs(css.transitionColor, isButtonDisabled ? css.btnDisabled : css.btn)}
          fontSize="2rem"
          title="Open timer dropdown"
        />
      </button>
      <div className={css.previewContainer} title="Open timer dropdown">
        <Progress multi style={{ height: '6px' }}>
          <Progress bar value={100 * (1 - remaining / goal)} color="success" animated={running} />
          <Progress bar value={100 * (remaining / goal)} color="primary" animated={running} />
        </Progress>
        {customReadyState === ReadyState.OPEN ? (
          <button
            type="button"
            disabled={isButtonDisabled}
            className={cs(css.preview, isButtonDisabled && css.btnDisabled)}
            onClick={() => setRunning(!running)}
          >
            {moment.utc(remaining).format('HH:mm:ss')}
          </button>
        ) : (
          <div className={css.disconnected}>Disconnected</div>
        )}
      </div>
      {customReadyState === ReadyState.OPEN && (
        <div className={css.btns}>
          {!started || paused ? (
            <button
              type="button"
              disabled={isButtonDisabled}
              onClick={handleStartButton}
              aria-label="Start timer"
            >
              <FaPlayCircle
                className={cs(
                  isButtonDisabled ? css.btnDisabled : css.transitionColor,
                  remaining !== 0 ? css.btn : css.btnDisabled,
                )}
                fontSize="1.5rem"
                title="Start timer"
              />
            </button>
          ) : (
            <button
              type="button"
              disabled={isButtonDisabled}
              onClick={() => sendJsonMessageNoQueue({ action: 'PAUSE_TIMER' })}
              aria-label="Pause timer"
            >
              <FaPauseCircle
                className={cs(css.btn, isButtonDisabled ? css.btnDisabled : css.transitionColor)}
                fontSize="1.5rem"
                title="Pause timer"
              />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const mapStateToProps = state => ({
  authUser: state.auth.user,
  userProfile: state.userProfile,
});

export default connect(mapStateToProps, {})(Timer);
