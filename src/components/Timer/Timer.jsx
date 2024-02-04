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
import css from './Timer.module.css';
import { ENDPOINTS } from '../../utils/URL';
import config from '../../config.json';
import TimeEntryForm from '../Timelog/TimeEntryForm';
import Countdown from './Countdown';
import TimerStatus from './TimerStatus';

export default function Timer() {
  const WSoptions = {
    share: true,
    protocols: localStorage.getItem(config.tokenKey),
    shouldReconnect: () => true,
    reconnectAttempts: 5,
    reconnectInterval: 5000,
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

  const { sendMessage, lastJsonMessage, readyState } = useWebSocket(
    ENDPOINTS.TIMER_SERVICE,
    WSoptions,
  );

  // This is the contract between server and client
  const action = {
    START_TIMER: 'START_TIMER',
    PAUSE_TIMER: 'PAUSE_TIMER',
    STOP_TIMER: 'STOP_TIMER',
    CLEAR_TIMER: 'CLEAR_TIMER',
    SET_GOAL: 'SET_GOAL=',
    ADD_GOAL: 'ADD_TO_GOAL=',
    REMOVE_GOAL: 'REMOVE_FROM_GOAL=',
    ACK_FORCED: 'ACK_FORCED',
    START_CHIME: 'START_CHIME=',
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

  const [message, setMessage] = useState(defaultMessage);
  const { time, paused, started, goal, startAt } = message;

  const [running, setRunning] = useState(false);
  const [confirmationResetModal, setConfirmationResetModal] = useState(false);
  const [logTimeEntryModal, setLogTimeEntryModal] = useState(false);
  const [inacModal, setInacModal] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timeIsOverModalOpen, setTimeIsOverModalIsOpen] = useState(false);
  const [remaining, setRemaining] = useState(time);
  const [logTimer, setLogTimer] = useState({ hours: 0, minutes: 0, isTangible: true });
  const timeIsOverAudioRef = useRef(null);
  const forcedPausedAudioRef = useRef(null);

  const timeToLog = moment.duration(goal - remaining);
  const logHours = timeToLog.hours();
  const logMinutes = timeToLog.minutes();

  const wsMessageHandler = useMemo(
    () => ({
      sendStart: () => sendMessage(action.START_TIMER),
      sendPause: () => sendMessage(action.PAUSE_TIMER),
      sendClear: () => sendMessage(action.CLEAR_TIMER),
      sendStop: () => sendMessage(action.STOP_TIMER),
      sendAckForced: () => sendMessage(action.ACK_FORCED),
      sendStartChime: state => sendMessage(action.START_CHIME.concat(state)),
      sendSetGoal: timerGoal => sendMessage(action.SET_GOAL.concat(timerGoal)),
      sendAddGoal: duration => sendMessage(action.ADD_GOAL.concat(duration)),
      sendRemoveGoal: duration => sendMessage(action.REMOVE_GOAL.concat(duration)),
    }),
    [sendMessage],
  );

  const {
    sendStart,
    sendPause,
    sendClear,
    sendStop,
    sendAckForced,
    sendStartChime,
    sendAddGoal,
    sendRemoveGoal,
  } = wsMessageHandler;

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
        goalDuration.asHours() + addition / 60 <= MAX_HOURS
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
      const goalAfterAdditionAsHours = moment
        .duration(goal)
        .add(duration, 'minutes')
        .asHours();
      if (goalAfterAdditionAsHours > MAX_HOURS) {
        toast.error(`Goal time cannot be set over ${MAX_HOURS} hours!`);
      } else {
        sendAddGoal(moment.duration(duration, 'minutes').asMilliseconds());
      }
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

  useEffect(() => {
    /**
     * This useEffect is to make sure that all the states will be updated before taking effects,
     * so that message state and other states like running, inacMoal ... will be updated together
     * at the same time.
     */
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
    setLogTimer({ hours: logHours, minutes: logMinutes, isTangible: true });
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

  return (
    <div className={css.timerContainer}>
      <button type="button" onClick={toggleTimer}>
        <BsAlarmFill
          className={cs(css.transitionColor, css.btn)}
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
        <button type="button" className={css.preview} onClick={toggleTimer}>
          {moment.utc(remaining).format('HH:mm:ss')}
        </button>
      </div>
      <div className={css.btns}>
        <button
          type="button"
          onClick={() => {
            handleAddButton(15);
          }}
          title="Add 15min"
        >
          <FaPlusCircle
            className={cs(css.transitionColor, checkBtnAvail(15) ? css.btn : css.btnDisabled)}
            fontSize="1.5rem"
          />
        </button>
        <button type="button" onClick={() => handleSubtractButton(15)} title="Subtract 15min">
          <FaMinusCircle
            className={cs(css.transitionColor, checkBtnAvail(-15) ? css.btn : css.btnDisabled)}
            fontSize="1.5rem"
          />
        </button>
        {!started || paused ? (
          <button type="button" onClick={handleStartButton}>
            <FaPlayCircle
              className={cs(css.transitionColor, remaining !== 0 ? css.btn : css.btnDisabled)}
              fontSize="1.5rem"
              title="Start timer"
            />
          </button>
        ) : (
          <button type="button" onClick={sendPause}>
            <FaPauseCircle
              className={cs(css.btn, css.transitionColor)}
              fontSize="1.5rem"
              title="Pause timer"
            />
          </button>
        )}
        <button
          type="button"
          onClick={handleStopButton}
          disable={`${!started}`}
          title="Stop timer and log time"
        >
          <FaStopCircle
            className={cs(
              css.transitionColor,
              started && goal - remaining >= 60000 ? css.btn : css.btnDisabled,
            )}
            fontSize="1.5rem"
          />
        </button>
        <button type="button" onClick={() => setConfirmationResetModal(true)} title="Reset timer">
          <FaUndoAlt className={cs(css.transitionColor, css.btn)} fontSize="1.3rem" />
        </button>
      </div>

      {showTimer && (
        <div className={css.timer}>
          <div className={css.timerContent}>
            {readyState === ReadyState.OPEN ? (
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
              <TimerStatus readyState={readyState} message={message} toggleTimer={toggleTimer} />
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
      <audio ref={timeIsOverAudioRef} loop src="https://bigsoundbank.com/UPLOAD/mp3/2554.mp3" />
      <audio ref={forcedPausedAudioRef} loop src="https://bigsoundbank.com/UPLOAD/mp3/1102.mp3" />
      <Modal
        isOpen={confirmationResetModal}
        toggle={() => setConfirmationResetModal(!confirmationResetModal)}
        centered
        size="md"
      >
        <ModalHeader toggle={() => setConfirmationResetModal(false)}>Reset Time</ModalHeader>
        <ModalBody>Are you sure you want to reset your time?</ModalBody>
        <ModalFooter>
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
      <Modal size="md" isOpen={inacModal} toggle={() => setInacModal(!inacModal)} centered>
        <ModalHeader toggle={() => setInacModal(!inacModal)}>Timer Paused</ModalHeader>
        <ModalBody>
          The user timer has been paused due to inactivity or a lost in connection to the server.
          This is to ensure that our resources are being used efficiently and to improve performance
          for all of our users.
        </ModalBody>
        <ModalFooter>
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
      <Modal isOpen={timeIsOverModalOpen} toggle={toggleTimeIsOver} centered size="md">
        <ModalHeader toggle={toggleTimeIsOver}>Time Complete!</ModalHeader>
        <ModalBody>{`You have worked for ${logHours ? `${logHours} hours` : ''}${
          logMinutes ? ` ${logMinutes} minutes` : ''
        }. Click below if you’d like to add time or Log Time.`}</ModalBody>
        <ModalFooter>
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
