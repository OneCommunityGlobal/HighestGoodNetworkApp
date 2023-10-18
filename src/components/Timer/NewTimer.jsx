/* eslint-disable jsx-a11y/media-has-caption */
import moment from 'moment';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Progress } from 'reactstrap';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import {
  BsAlarmFill,
  BsPlusCircleFill,
  BsFillPlayCircleFill,
  BsStopCircleFill,
  BsPauseCircleFill,
} from 'react-icons/bs';
import { AiFillMinusCircle } from 'react-icons/ai';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import cs from 'classnames';
import css from './NewTimer.module.css';
import { ENDPOINTS } from '../../utils/URL';
import config from '../../config.json';
import TimeEntryForm from '../Timelog/TimeEntryForm';
import Countdown from './Countdown';
import TimerStatus from './TimerStatus';

export default function NewTimer() {
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

  const [message, setMessage] = useState(defaultMessage);
  const { time, paused, started, goal, startAt } = message;
  const [running, setRunning] = useState(false);
  const [logTimeEntryModal, setLogTimeEntryModal] = useState(false);
  const [oneMinuteMinimumModal, setOneMinuteMinimumModal] = useState(false);
  const [inacModal, setInacModal] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [triggerAudio, setTriggerAudio] = useState(false);
  const [timerIsOverModalOpen, setTimerIsOverModalIsOpen] = useState(false);
  const [userCanAddGoal, setUserCanAddGoal] = useState(true);
  const [userCanRemoveGoal, setUserCanRemoveGoal] = useState(true);
  const [userCanStop, setUserCanStop] = useState(true);
  const [remaining, setRemaining] = useState(time);
  const [logTimer, setLogTimer] = useState({ hours: 0, minutes: 0 });

  const data = {
    disabled: window.screenX <= 500,
    isTangible: true,
  };

  const userId = useSelector(state => state.auth.user.userid);
  const userProfile = useSelector(state => state.auth.user);

  const audioRef = useRef(null);

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
    const timeToLog = moment.duration(goal - remaining);
    const hours = timeToLog.hours();
    const minutes = timeToLog.minutes();
    setLogTimer({ hours, minutes });
    toggleLogTimeModal(true);
  };

  const toggleTimer = () => setShowTimer(timer => !timer);

  const toggleTimeIsOver = () => {
    setTimerIsOverModalIsOpen(!timerIsOverModalOpen);
    if (running && !triggerAudio) setTriggerAudio(!triggerAudio);
  };

  const handleAddButton = useCallback(
    duration => {
      const goalAfterAdditionAsHours = moment
        .duration(goal)
        .add(duration, 'minutes')
        .asHours();
      if (goalAfterAdditionAsHours >= 10) {
        toast.error('Goal time cannot be set over 10 hours!');
        sendSetGoal(moment.duration(10, 'hours').asMilliseconds());
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
        toast.error('Remaining time is already less than 15 minutes!');
      } else if (goalAfterRemovalAsMinutes < 15) {
        toast.error('Timer cannot be set less than 15 minutes!');
        sendSetGoal(moment.duration(15, 'minutes').asMilliseconds());
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
    setMessage(lastJsonMessage || defaultMessage);
    setRunning(startedLJM && !pausedLJM);
    setInacModal(forcedPauseLJM);
    setUserCanRemoveGoal((startedLJM && timeLJM > 900000) || goalLJM > 900000);
    setUserCanAddGoal(goalLJM <= 35100000); // 9h 45min as milliseconds
    setUserCanStop(startedLJM);
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
      <div className={css.addBtn}>
        <button type="button" onClick={() => handleAddButton(15)}>
          <BsPlusCircleFill
            className={cs(css.transitionColor, userCanAddGoal ? css.btn : css.btnDisabled)}
            fontSize="1.5rem"
          />
        </button>
        <button type="button" onClick={() => handleSubtractButton(15)}>
          <AiFillMinusCircle
            className={cs(css.transitionColor, userCanRemoveGoal ? css.btn : css.btnDisabled)}
            fontSize="1.7rem"
          />
        </button>
      </div>
      {!started || paused ? (
        <button type="button" onClick={sendStart}>
          <BsFillPlayCircleFill className={cs(css.btn, css.transitionColor)} fontSize="1.5rem" />
        </button>
      ) : (
        <button type="button" onClick={sendPause}>
          <BsPauseCircleFill className={cs(css.btn, css.transitionColor)} fontSize="1.5rem" />
        </button>
      )}
      <button type="button" onClick={handleStopButton} disable={`${!userCanStop}`}>
        <BsStopCircleFill
          className={cs(css.transitionColor, userCanStop ? css.btn : css.btnDisabled)}
          fontSize="1.5rem"
        />
      </button>
      <div className={cs(css.timer, !showTimer && css.hideTimer)}>
        <div className={css.timerContent}>
          {readyState === ReadyState.OPEN ? (
            <Countdown
              message={message}
              running={running}
              wsMessageHandler={wsMessageHandler}
              remaining={remaining}
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
        <ModalBody>Click below if you’d like to add time or Log Time.</ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={() => {
              setTimerIsOverModalIsOpen(false);
              setTriggerAudio(false);
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
            }}
          >
            Add More Time
          </Button>{' '}
        </ModalFooter>
      </Modal>
    </div>
  );
}
