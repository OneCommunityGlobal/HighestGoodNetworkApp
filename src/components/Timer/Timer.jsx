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
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import cs from 'classnames';
import ReactTooltip from 'react-tooltip';
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
  };

  const defaultMessage = {
    time: 900000,
    paused: false,
    forcedPause: false,
    started: false,
    goal: 900000,
    startAt: Date.now(),
  };

  const MAX_HOURS = 5;
  const MIN_MINS = 1;

  const userId = useSelector(state => state.auth.user.userid);
  const userProfile = useSelector(state => state.auth.user);

  const [message, setMessage] = useState(defaultMessage);
  const { time, paused, started, goal, startAt } = message;

  const [running, setRunning] = useState(false);
  const [confirmationResetModal, setConfirmationResetModal] = useState(false);
  const [logTimeEntryModal, setLogTimeEntryModal] = useState(false);
  const [oneMinuteMinimumModal, setOneMinuteMinimumModal] = useState(false);
  const [inacModal, setInacModal] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [triggerAudio, setTriggerAudio] = useState(false);
  const [timerIsOverModalOpen, setTimerIsOverModalIsOpen] = useState(false);
  const [userCanAddGoal, setUserCanAddGoal] = useState(true);
  const [userCanRemoveGoal, setUserCanRemoveGoal] = useState(true);
  const [remaining, setRemaining] = useState(time);
  const [logTimer, setLogTimer] = useState({ hours: 0, minutes: 0 });
  const audioRef = useRef(null);

  const data = {
    isTangible: true,
  };

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
    sendSetGoal,
    sendAddGoal,
    sendRemoveGoal,
  } = wsMessageHandler;

  const toggleLogTimeModal = () => {
    setLogTimeEntryModal(modal => !modal);
  };

  const handleLogTime = () => {
    toggleLogTimeModal(true);
  };

  const toggleTimer = () => setShowTimer(timer => !timer);

  const toggleTimeIsOver = () => {
    setTimerIsOverModalIsOpen(!timerIsOverModalOpen);
    setTriggerAudio(!triggerAudio);
  };

  const checkBtnAvail = addition => {
    const remainingDuration = moment.duration(remaining);
    const goalDuration = moment.duration(goal);
    return (
      remainingDuration.asMinutes() + addition > 0 &&
      goalDuration.asMinutes() + addition >= MIN_MINS &&
      goalDuration.asHours() + addition / 60 <= MAX_HOURS
    );
  };

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

  const handleStopButton = () => {
    if (goal - remaining < 60000) {
      setOneMinuteMinimumModal(true);
    } else {
      handleLogTime();
    }
  };

  const updateRemaining = () => {
    if (!running) return remaining;
    const now = moment.utc();
    const timePassed = moment.duration(now.diff(startAt)).asMilliseconds();
    return setRemaining(time > timePassed ? time - timePassed : 0);
  };

  const checkRemainingTime = () => {
    if (remaining === 0) {
      sendPause();
      toggleTimeIsOver();
    }
  };

  useEffect(() => {
    /**
     * This useEffect is to make sure that all the states will be updated before taking effects,
     * so that message state and other states like running, inacMoal ... will be updated together
     * at the same time.
     */
    const {
      time: timeLJM,
      paused: pausedLJM,
      forcedPause: forcedPauseLJM,
      started: startedLJM,
      goal: goalLJM,
    } = lastJsonMessage || defaultMessage; // lastJsonMessage might be null at the beginning
    const maxHoursAsMillieseconds = moment.duration(MAX_HOURS, 'hours').asMilliseconds();
    const minMinutesAsMillieseconds = moment.duration(MIN_MINS, 'minutes').asMilliseconds();
    setMessage(lastJsonMessage || defaultMessage);
    setRunning(startedLJM && !pausedLJM);
    setInacModal(forcedPauseLJM);
    setUserCanRemoveGoal(
      (startedLJM && timeLJM > minMinutesAsMillieseconds) || goalLJM > minMinutesAsMillieseconds,
    );
    setUserCanAddGoal(goalLJM <= maxHoursAsMillieseconds); // 9h 45min as milliseconds
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
    ReactTooltip.rebuild();
    checkRemainingTime();
    setLogTimer({ hours: logHours, minutes: logMinutes });
  }, [remaining]);

  useEffect(() => {
    if (triggerAudio) {
      window.focus();
      audioRef.current.play();
    } else {
      window.focus();
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [triggerAudio]);

  return (
    <div className={css.timerContainer}>
      <ReactTooltip id="tooltip" place="bottom" type="dark" effect="solid" delayShow={500} />
      <BsAlarmFill
        className={cs(css.transitionColor, css.btn)}
        fontSize="2rem"
        onClick={toggleTimer}
      />
      <div className={css.previewContainer}>
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
          data-for="tooltip"
          data-tip="Add 15min"
        >
          <FaPlusCircle
            className={cs(css.transitionColor, checkBtnAvail(15) ? css.btn : css.btnDisabled)}
            fontSize="1.5rem"
          />
        </button>
        <button
          type="button"
          onClick={() => handleSubtractButton(15)}
          data-for="tooltip"
          data-tip="Subtract 15min"
        >
          <FaMinusCircle
            className={cs(css.transitionColor, checkBtnAvail(-15) ? css.btn : css.btnDisabled)}
            fontSize="1.5rem"
          />
        </button>
        {!started || paused ? (
          <button type="button" onClick={sendStart}>
            <FaPlayCircle
              className={cs(css.btn, css.transitionColor)}
              fontSize="1.5rem"
              data-for="tooltip"
              data-tip="Start timer"
            />
          </button>
        ) : (
          <button type="button" onClick={sendPause}>
            <FaPauseCircle
              className={cs(css.btn, css.transitionColor)}
              fontSize="1.5rem"
              data-for="tooltip"
              data-tip="Pause timer"
            />
          </button>
        )}
        <button
          type="button"
          onClick={handleStopButton}
          disable={`${!started}`}
          data-for="tooltip"
          data-tip="Stop timer and log time"
        >
          <FaStopCircle
            className={cs(css.transitionColor, started ? css.btn : css.btnDisabled)}
            fontSize="1.5rem"
          />
        </button>
        <button
          type="button"
          onClick={() => setConfirmationResetModal(true)}
          data-for="tooltip"
          data-tip="Reset timer"
        >
          <FaUndoAlt className={cs(css.transitionColor, css.btn)} fontSize="1.3rem" />
        </button>
      </div>

      <div className={cs(css.timer, !showTimer && css.hideTimer)}>
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
              handleAddButton={handleAddButton}
              handleSubtractButton={handleSubtractButton}
              handleStopButton={handleStopButton}
              toggleTimer={toggleTimer}
            />
          ) : (
            <TimerStatus readyState={readyState} message={message} />
          )}
        </div>
        {logTimeEntryModal && (
          <TimeEntryForm
            edit={false}
            userId={userId}
            toggle={toggleLogTimeModal}
            isOpen={logTimeEntryModal}
            timer={logTimer}
            data={data}
            userProfile={userProfile}
            sendClear={sendClear}
            sendStop={sendStop}
          />
        )}
      </div>
      <audio ref={audioRef} loop src="https://bigsoundbank.com/UPLOAD/mp3/2554.mp3" />
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
      <Modal
        size="md"
        isOpen={oneMinuteMinimumModal}
        toggle={() => setOneMinuteMinimumModal(!oneMinuteMinimumModal)}
        centered
      >
        <ModalHeader toggle={() => setOneMinuteMinimumModal(!oneMinuteMinimumModal)}>
          Alert
        </ModalHeader>
        <ModalBody>
          <strong>You need at least 1 minute to log time!</strong>
        </ModalBody>
      </Modal>
      <Modal isOpen={timerIsOverModalOpen} toggle={toggleTimeIsOver} centered size="md">
        <ModalHeader toggle={toggleTimeIsOver}>Time Complete!</ModalHeader>
        <ModalBody>{`You have worked for ${logHours ? `${logHours} hours` : ''}${
          logMinutes ? ` ${logMinutes} minutes` : ''
        }. Click below if you’d like to add time or Log Time.`}</ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={() => {
              toggleTimeIsOver();
              handleLogTime();
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
