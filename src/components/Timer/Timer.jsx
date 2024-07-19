/* eslint-disable jsx-a11y/media-has-caption */
import moment from 'moment';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Progress } from 'reactstrap';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { BsAlarmFill } from 'react-icons/bs';
import {
  FaPlusCircle,
  FaMinusCircle,
  FaPlayCircle,
  FaPauseCircle,
  FaStopCircle,
  FaUndoAlt,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import cs from 'classnames';
import { connect } from 'react-redux';
import css from './Timer.module.css';
import '../Header/DarkMode.css';
import { ENDPOINTS } from '../../utils/URL';
import config from '../../config.json';
import TimeEntryForm from '../Timelog/TimeEntryForm';
import Countdown from './Countdown';
import TimerStatus from './TimerStatus';

function Timer({ authUser, darkMode }) {
  /**
   *  Because the websocket can not be closed when internet is cut off (lost server connection),
   *  the readyState will be stuck at OPEN, so here we need to use a custom readyState to
   *  mimic the real readyState, and when internet is cut off, the custom readyState will be set
   *  to CLOSED, and the user will be notified to refresh the page to reconnect to the server.
   * */
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

  /**
   * Expected message format: {
   *  userId: string,
   *  time: number,
   *  paused: boolean,
   *  forcedPause: boolean,
   *  started: boolean,
   *  goal: number,
   *  startAt: Date
   * }
   */

  const { sendMessage, sendJsonMessage, lastJsonMessage, getWebSocket } = useWebSocket(
    ENDPOINTS.TIMER_SERVICE,
    WSoptions,
  );

  // This is the contract between server and client
  const action = {
    START_TIMER: 'START_TIMER',
    PAUSE_TIMER: 'PAUSE_TIMER',
    STOP_TIMER: 'STOP_TIMER',
    CLEAR_TIMER: 'CLEAR_TIMER',
    GET_TIMER: 'GET_TIMER',
    SET_GOAL: 'SET_GOAL',
    ADD_GOAL: 'ADD_TO_GOAL',
    REMOVE_GOAL: 'REMOVE_FROM_GOAL',
    ACK_FORCED: 'ACK_FORCED',
    START_CHIME: 'START_CHIME',
    HEARTBEAT: 'ping',
  };

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
  const [confirmationResetModal, setConfirmationResetModal] = useState(false);
  const [logTimeEntryModal, setLogTimeEntryModal] = useState(false);
  const [inacModal, setInacModal] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timeIsOverModalOpen, setTimeIsOverModalIsOpen] = useState(false);
  const [remaining, setRemaining] = useState(time);
  const [logTimer, setLogTimer] = useState({ hours: 0, minutes: 0 });
  const [viewingUserId, setViewingUserId] = useState(null);
  const isWSOpenRef = useRef(0);
  const timeIsOverAudioRef = useRef(null);
  const forcedPausedAudioRef = useRef(null);

  const timeToLog = moment.duration(goal - remaining);
  const logHours = timeToLog.hours();
  const logMinutes = timeToLog.minutes();

  const sendMessageNoQueue = useCallback(msg => sendMessage(msg, false), [sendMessage]);
  const sendJsonMessageNoQueue = useCallback(msg => sendJsonMessage(msg, false), [sendMessage]);

  const wsMessageHandler = useMemo(
    () => ({
      sendStart: () => sendMessageNoQueue(action.START_TIMER),
      sendPause: () => sendMessageNoQueue(action.PAUSE_TIMER),
      sendClear: () => sendMessageNoQueue(action.CLEAR_TIMER),
      sendStop: () => sendMessageNoQueue(action.STOP_TIMER),
      sendAckForced: () => sendMessageNoQueue(action.ACK_FORCED),
      sendStartChime: state => sendMessageNoQueue(action.START_CHIME.concat(state)),
      sendSetGoal: timerGoal => sendMessageNoQueue(action.SET_GOAL.concat(timerGoal)),
      sendAddGoal: duration => sendMessageNoQueue(action.ADD_GOAL.concat(duration)),
      sendRemoveGoal: duration => sendMessageNoQueue(action.REMOVE_GOAL.concat(duration)),
      sendHeartbeat: () => sendMessageNoQueue(action.HEARTBEAT),
    }),
    [sendMessageNoQueue],
  );

  useEffect(() => {
    const handleStorageEvent = () => {
      const sessionStorageData = JSON.parse(window.sessionStorage.getItem('viewingUser'));
      if (sessionStorageData) {
        setViewingUserId(sessionStorageData.userId);
      } else {
        setViewingUserId(null);
      }
    };

    // Set the initial state when the component mounts
    handleStorageEvent();

    // Add the event listener
    window.addEventListener('storage', handleStorageEvent);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  // control whether buttons should be clickable
  const isButtonDisabled = useMemo(
    () => viewingUserId && !ALLOWED_ROLES_TO_INTERACT.includes(authUser?.role),
    [viewingUserId, authUser],
  );
  // control whether to send GET_TIMER message to avoid message overriding
  const isInitialJsonMessageReceived = useMemo(() => !!lastJsonMessage, [lastJsonMessage]);

  const wsJsonMessageHandler = useMemo(() => {
    if (viewingUserId == null) {
      return {
        sendStart: () => sendJsonMessageNoQueue({ action: action.START_TIMER }),
        sendPause: () => sendJsonMessageNoQueue({ action: action.PAUSE_TIMER }),
        sendClear: () => sendJsonMessageNoQueue({ action: action.CLEAR_TIMER }),
        sendStop: () => sendJsonMessageNoQueue({ action: action.STOP_TIMER }),
        sendAckForced: () => sendJsonMessageNoQueue({ action: action.ACK_FORCED }),
        sendGetTimer: () => sendJsonMessageNoQueue({ action: action.GET_TIMER }),
        sendStartChime: state =>
          sendJsonMessageNoQueue({ action: action.START_CHIME, value: state }),
        sendSetGoal: timerGoal =>
          sendJsonMessageNoQueue({ action: action.SET_GOAL, value: timerGoal }),
        sendAddGoal: duration =>
          sendJsonMessageNoQueue({ action: action.ADD_GOAL, value: duration }),
        sendRemoveGoal: duration =>
          sendJsonMessageNoQueue({ action: action.REMOVE_GOAL, value: duration }),
        sendHeartbeat: () => sendJsonMessageNoQueue({ action: action.HEARTBEAT }),
      };
    }
    return {
      sendStart: () =>
        sendJsonMessageNoQueue({ action: action.START_TIMER, userId: viewingUserId }),
      sendPause: () =>
        sendJsonMessageNoQueue({ action: action.PAUSE_TIMER, userId: viewingUserId }),
      sendClear: () =>
        sendJsonMessageNoQueue({ action: action.CLEAR_TIMER, userId: viewingUserId }),
      sendStop: () => sendJsonMessageNoQueue({ action: action.STOP_TIMER, userId: viewingUserId }),
      sendAckForced: () =>
        sendJsonMessageNoQueue({ action: action.ACK_FORCED, userId: viewingUserId }),
      sendGetTimer: () =>
        sendJsonMessageNoQueue({ action: action.GET_TIMER, userId: viewingUserId }),
      sendStartChime: state =>
        sendJsonMessageNoQueue({ action: action.START_CHIME, userId: viewingUserId, value: state }),
      sendSetGoal: timerGoal =>
        sendJsonMessageNoQueue({
          action: action.SET_GOAL,
          userId: viewingUserId,
          value: timerGoal,
        }),
      sendAddGoal: duration =>
        sendJsonMessageNoQueue({ action: action.ADD_GOAL, userId: viewingUserId, value: duration }),
      sendRemoveGoal: duration =>
        sendJsonMessageNoQueue({
          action: action.REMOVE_GOAL,
          userId: viewingUserId,
          value: duration,
        }),
      sendHeartbeat: () =>
        sendJsonMessageNoQueue({ action: action.HEARTBEAT, userId: viewingUserId }),
    };
  }, [sendJsonMessageNoQueue, viewingUserId]);

  const {
    sendStart,
    sendPause,
    sendClear,
    sendStop,
    sendAckForced,
    sendGetTimer,
    sendStartChime,
    sendAddGoal,
    sendRemoveGoal,
    sendHeartbeat,
  } = wsJsonMessageHandler;

  const toggleLogTimeModal = () => {
    setLogTimeEntryModal(modal => !modal);
  };

  const toggleTimer = () => setShowTimer(timer => !timer);

  const toggleTimeIsOver = () => {
    setTimeIsOverModalIsOpen(!timeIsOverModalOpen);
    sendStartChime(!timeIsOverModalOpen);
  };

  const checkBtnAvail = useCallback(
    addition => {
      const remainingDuration = moment.duration(remaining);
      const goalDuration = moment.duration(goal);
      return (
        remainingDuration.asMinutes() + addition > 0 &&
        goalDuration.asMinutes() + addition >= MIN_MINS &&
        goalDuration.asHours() < MAX_HOURS
      );
    },
    [remaining],
  );

  const handleStartButton = useCallback(() => {
    if (remaining === 0) {
      toast.error('There is no more Remaining time, please add more or log your passed time');
    } else {
      sendStart();
    }
  }, [remaining]);

  const handleAddButton = useCallback(
    duration => {
      if (goal >= MAX_HOURS * 3600000) {
        toast.error(`Goal time cannot be set over ${MAX_HOURS} hours!`);
        return;
      }
      const goalAfterAdditionAsHours = moment
        .duration(goal)
        .add(duration, 'minutes')
        .asHours();
      if (goalAfterAdditionAsHours > MAX_HOURS) {
        toast.info(`Goal time cannot be set over ${MAX_HOURS} hours, Goal time is set to 5 hours`);
      }
      sendAddGoal(moment.duration(duration, 'minutes').asMilliseconds());
    },
    [remaining],
  );

  const handleSubtractButton = useCallback(
    duration => {
      const remainingtimeAfterRemoval = moment
        .duration(remaining)
        .subtract(duration, 'minutes')
        .asMinutes();
      const goalAfterRemovalAsMinutes = moment
        .duration(goal)
        .subtract(duration, 'minutes')
        .asMinutes();
      if (started && remainingtimeAfterRemoval <= 0) {
        toast.error(`Remaining time is already less than ${duration} minutes!`);
      } else if (goalAfterRemovalAsMinutes < MIN_MINS) {
        toast.error(`Goal time cannot be set less than ${MIN_MINS} minutes!`);
      } else {
        sendRemoveGoal(moment.duration(duration, 'minutes').asMilliseconds());
      }
    },
    [remaining],
  );

  const handleStopButton = useCallback(() => {
    if (goal - remaining < 60000) {
      toast.error(`You need at least 1 minute to log time!`);
    } else {
      toggleLogTimeModal();
    }
  }, [remaining]);

  const updateRemaining = () => {
    if (!running) return;
    const now = moment.utc();
    const timePassed = moment.duration(now.diff(startAt)).asMilliseconds();
    setRemaining(time > timePassed ? time - timePassed : 0);
  };

  const checkRemainingTime = () => {
    if (remaining === 0) {
      sendPause();
    }
  };

  /**
   * This useEffect is to make sure that all the states will be updated before taking effects,
   * so that message state and other states like running, inacMoal ... will be updated together
   * at the same time.
   */
  useEffect(() => {
    // Exclude heartbeat message
    if (lastJsonMessage && lastJsonMessage.heartbeat === 'pong') {
      isWSOpenRef.current = 0;
      return;
    }

    const {
      paused: pausedLJM,
      forcedPause: forcedPauseLJM,
      started: startedLJM,
      chiming: chimingLJM,
    } = lastJsonMessage || defaultMessage; // lastJsonMessage might be null at the beginning
    setMessage(lastJsonMessage || defaultMessage);
    setRunning(startedLJM && !pausedLJM);
    setInacModal(forcedPauseLJM);
    setTimeIsOverModalIsOpen(chimingLJM);
  }, [lastJsonMessage]);

  // This useEffect is to make sure that the WS connection is maintained by sending a heartbeat every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (running) {
        isWSOpenRef.current += 1;
        sendHeartbeat();
        setTimeout(() => {
          // make sure to notify the user if the heartbeat is not responded for 3 times
          if (isWSOpenRef.current > 3) {
            setRunning(false);
            setInacModal(true);
            getWebSocket().close(); // try to close the WS connection, but it might not work when internet is cut off
            setCustomReadyState(ReadyState.CLOSED);
          }
        }, 10000); // close the WS if no response after 10 seconds
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    /**
     * This useEffect will run upon message change,
     * and message is a state as a copy of the lastJsonMessage,
     * here message works as a buffer, for details see above
     */
    let interval;
    if (running) {
      updateRemaining();
      interval = setInterval(() => {
        updateRemaining();
      }, 1000);
    } else {
      setRemaining(time);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [running, message]);

  useEffect(() => {
    checkRemainingTime();
    setLogTimer({ hours: logHours, minutes: logMinutes });
  }, [remaining]);

  useEffect(() => {
    if (timeIsOverModalOpen) {
      window.focus();
      timeIsOverAudioRef.current.play();
    } else {
      window.focus();
      timeIsOverAudioRef.current.pause();
      timeIsOverAudioRef.current.currentTime = 0;
    }
  }, [timeIsOverModalOpen]);

  useEffect(() => {
    if (inacModal) {
      window.focus();
      forcedPausedAudioRef.current.play();
    } else {
      window.focus();
      forcedPausedAudioRef.current.pause();
      forcedPausedAudioRef.current.currentTime = 0;
    }
  }, [inacModal]);

  useEffect(() => {
    // If initial json message is null, do nothing
    if (!isInitialJsonMessageReceived) return;

    sendGetTimer();
  }, [isInitialJsonMessageReceived, viewingUserId]);

  const fontColor = darkMode ? 'text-light' : '';
  const headerBg = darkMode ? 'bg-space-cadet' : '';
  const bodyBg = darkMode ? 'bg-yinmn-blue' : '';

  return (
    <div className={css.timerContainer}>
      <button
        type="button"
        disabled={isButtonDisabled}
        onClick={toggleTimer}
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
          <Progress bar value={2} color="light" />
          <Progress bar value={100 * (remaining / goal)} color="primary" animated={running} />
        </Progress>
        {customReadyState === ReadyState.OPEN ? (
          <button
            type="button"
            disabled={isButtonDisabled}
            className={cs(css.preview, isButtonDisabled && css.btnDisabled)}
            onClick={toggleTimer}
          >
            {moment.utc(remaining).format('HH:mm:ss')}
          </button>
        ) : (
          <div className={css.disconnected}>Disconnected</div>
        )}
      </div>
      {customReadyState === ReadyState.OPEN && (
        <div className={css.btns}>
          <button
            type="button"
            disabled={isButtonDisabled}
            onClick={() => {
              handleAddButton(15);
            }}
            title="Add 15min"
            aria-label="Add 15min"
          >
            <FaPlusCircle
              className={cs(
                isButtonDisabled ? css.btnDisabled : css.transitionColor,
                checkBtnAvail(15) ? css.btn : css.btnDisabled,
              )}
              fontSize="1.5rem"
            />
          </button>
          <button
            type="button"
            disabled={isButtonDisabled}
            onClick={() => handleSubtractButton(15)}
            title="Subtract 15min"
            aria-label="Subtract 15min"
          >
            <FaMinusCircle
              className={cs(
                isButtonDisabled ? css.btnDisabled : css.transitionColor,
                checkBtnAvail(-15) ? css.btn : css.btnDisabled,
              )}
              fontSize="1.5rem"
            />
          </button>
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
              onClick={sendPause}
              aria-label="Pause timer"
            >
              <FaPauseCircle
                className={cs(css.btn, isButtonDisabled ? css.btnDisabled : css.transitionColor)}
                fontSize="1.5rem"
                title="Pause timer"
              />
            </button>
          )}
          <button
            type="button"
            disabled={!started || isButtonDisabled}
            onClick={handleStopButton}
            title="Stop timer and log time"
            aria-label="Stop timer and log time"
          >
            <FaStopCircle
              className={cs(
                css.transitionColor,
                isButtonDisabled && css.btnDisabled,
                started && goal - remaining >= 60000 ? css.btn : css.btnDisabled,
              )}
              fontSize="1.5rem"
            />
          </button>
          <button
            type="button"
            disabled={isButtonDisabled}
            onClick={() => setConfirmationResetModal(true)}
            title="Reset timer"
            aria-label="Reset timer"
          >
            <FaUndoAlt
              className={cs(css.transitionColor, isButtonDisabled && css.btnDisabled, css.btn)}
              fontSize="1.3rem"
            />
          </button>
        </div>
      )}

      {showTimer && (
        <div className={css.timer}>
          <div className={css.timerContent}>
            {customReadyState === ReadyState.OPEN ? (
              <Countdown
                message={message}
                timerRange={{ MAX_HOURS, MIN_MINS }}
                running={running}
                wsMessageHandler={wsMessageHandler}
                remaining={remaining}
                setConfirmationResetModal={setConfirmationResetModal}
                checkBtnAvail={checkBtnAvail}
                handleStartButton={handleStartButton}
                handleAddButton={handleAddButton}
                handleSubtractButton={handleSubtractButton}
                handleStopButton={handleStopButton}
                toggleTimer={toggleTimer}
              />
            ) : (
              <TimerStatus
                readyState={customReadyState}
                message={message}
                toggleTimer={toggleTimer}
              />
            )}
          </div>
        </div>
      )}
      {logTimeEntryModal && (
        <TimeEntryForm
          from="Timer"
          edit={false}
          toggle={toggleLogTimeModal}
          isOpen={logTimeEntryModal}
          data={logTimer}
          sendStop={sendStop}
        />
      )}
      <audio
        ref={timeIsOverAudioRef}
        loop
        preload="auto"
        src="https://bigsoundbank.com/UPLOAD/mp3/2554.mp3"
      />
      <audio
        ref={forcedPausedAudioRef}
        loop
        preload="auto"
        src="https://bigsoundbank.com/UPLOAD/mp3/1102.mp3"
      />
      <Modal
        isOpen={confirmationResetModal}
        toggle={() => setConfirmationResetModal(!confirmationResetModal)}
        centered
        size="md"
        className={`${fontColor} dark-mode`}
      >
        <ModalHeader
          className={darkMode ? 'bg-space-cadet' : ''}
          toggle={() => setConfirmationResetModal(false)}
        >
          Reset Time
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
          Are you sure you want to reset your time?
        </ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button
            color="primary"
            onClick={() => {
              sendClear();
              setConfirmationResetModal(false);
            }}
          >
            Yes, reset time!
          </Button>{' '}
        </ModalFooter>
      </Modal>
      <Modal
        className={`${fontColor} dark-mode`}
        size="md"
        isOpen={inacModal}
        toggle={() => setInacModal(!inacModal)}
        centered
      >
        <ModalHeader className={headerBg} toggle={() => setInacModal(!inacModal)}>
          Timer Paused
        </ModalHeader>
        <ModalBody className={bodyBg}>
          The user timer has been paused due to inactivity or a lost in connection to the server.
          Please check your internet connection and refresh the page to continue. This is to ensure
          that our resources are being used efficiently and to improve performance for all of our
          users.
        </ModalBody>
        <ModalFooter className={bodyBg}>
          <Button
            color="primary"
            onClick={() => {
              setInacModal(!inacModal);
              sendAckForced();
            }}
          >
            I understand
          </Button>
        </ModalFooter>
      </Modal>
      <Modal
        className={`${fontColor} dark-mode`}
        isOpen={timeIsOverModalOpen}
        toggle={toggleTimeIsOver}
        centered
        size="md"
      >
        <ModalHeader className={headerBg} toggle={toggleTimeIsOver}>
          Time Complete!
        </ModalHeader>
        <ModalBody className={bodyBg}>{`You have worked for ${logHours ? `${logHours} hours` : ''}${
          logMinutes ? ` ${logMinutes} minutes` : ''
        }. Click below if you’d like to add time or Log Time.`}</ModalBody>
        <ModalFooter className={bodyBg}>
          <Button
            color="primary"
            onClick={() => {
              toggleTimeIsOver();
              toggleLogTimeModal();
            }}
          >
            Log Time
          </Button>{' '}
          <Button
            color="secondary"
            onClick={() => {
              toggleTimeIsOver();
              handleAddButton(15);
              sendStart();
            }}
          >
            Add More Time
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
}

const mapStateToProps = state => ({
  authUser: state.auth.user,
  userProfile: state.userProfile,
});

export default connect(mapStateToProps, {})(Timer);
