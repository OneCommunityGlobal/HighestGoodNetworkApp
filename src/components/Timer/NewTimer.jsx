import moment from 'moment';
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import './NewTimer.css';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import config from '../../../src/config.json';
import {
  BsXLg,
  BsAlarmFill,
  BsPlusCircleFill,
  BsFillPlayCircleFill,
  BsStopCircleFill,
  BsPauseCircleFill,
} from 'react-icons/bs';
import { AiFillMinusCircle } from 'react-icons/ai';
import { ENDPOINTS } from '../../utils/URL';
import { useSelector } from 'react-redux';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import TimeEntryForm from '../Timelog/TimeEntryForm';
import Countdown from './Countdown';
import Stopwatch from './Stopwatch';
import TimerStatus from './TimerStatus';

export const NewTimer = () => {
  const [logModal, setLogModal] = useState(false);
  const [inacModal, setInacModal] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [triggerAudio, setTriggerAudio] = useState(false);
  const [timerIsOverModalOpen, setTimerIsOverModalIsOpen] = useState(false);
  const [userCanStop, setUserCanStop] = useState(false);

  const [confirmationResetModal, setConfirmationResetModal] = useState(false);
  const [isFirstLoading, setIsFirstLoading] = useState(true);
  const [previewTimer, setPreviewTimer] = useState(0);
  const data = {
    disabled: window.screenX <= 500,
    isTangible: true,
  };
  const userId = useSelector(state => state.auth.user.userid);
  const userProfile = useSelector(state => state.auth.user);

  const audioRef = useRef(null);

  /*
  Here are the options for the websocket client,
  For authentication we use the token stored in local storage and send it to the server in the protocols array
  We should attemp to reconnect if the connection is lost and we should do it 5 times with a 5 second interval
  On every single message from the server we check if the user has been paused due to inactivity
  If so we show a modal to the user telling that the timer was stopped
  */
  const options = {
    share: true,
    protocols: localStorage.getItem(config.tokenKey),
    shouldReconnect: () => true,
    reconnectAttempts: 5,
    reconnectInterval: 5000,
    onMessage: e => {
      if (JSON.parse(e.data).forcedPause) {
        setInacModal(true);
      }
    },
  };
  /*
  Expected message format:
  {userId: string, time: number, paused: boolean, forcedPause: boolean, stopped: boolean, goal: number, lastAccess: Date}
  */

  const { sendMessage, lastJsonMessage: message, readyState } = useWebSocket(
    ENDPOINTS.TIMER_SERVICE,
    options,
  );

  //This is the contract between server and client
  const action = {
    START_TIMER: 'START_TIMER',
    PAUSE_TIMER: 'PAUSE_TIMER',
    STOP_TIMER: 'STOP_TIMER',
    CLEAR_TIMER: 'CLEAR_TIMER',
    GET_TIMER: 'GET_TIMER',
    SWITCH_MODE: 'SWITCH_MODE',
    SET_GOAL: 'SET_GOAL=',
    ADD_GOAL: 'ADD_GOAL=',
    REMOVE_GOAL: 'REMOVE_GOAL=',
    ACK_FORCED: 'ACK_FORCED',
  };

  /*
  This are the callbacks for the buttons in the timer, here we send the message to the server
  with every single action that the user wants to perform
  the handleSetGoal and handleAddGoal are a little different, we need to send the time to the server
  so we concat the action with the time
  */
  const handleStart = useCallback(() => {
    sendMessage(action.START_TIMER);
  }, [minutes, message]);

  const handleStartAlarm = () => {
    window.focus();
    audioRef.current.play();
  };

  const handleStopAlarm = () => {
    window.focus();
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  const handleStartButton = useCallback(() => {
    // Stop alarm on Countdown.jsx if it's already playing
    setTriggerAudio(true);
    const now = moment();
    const lastAccess = moment(message?.lastAccess);
    const elapsedTime = moment.duration(now.diff(lastAccess)).asMilliseconds();
    let remaining = message?.time - elapsedTime;

    const lastTimeAdded = moment
      .utc(message?.time)
      .format('HH:mm')
      .replace('00:0', '');

    // If the timer is ZERO he adds the last time setted as GOAL (THIS IS A RULE)
    if (remaining < 0) {
      handleAddGoal(1000 * 60 * Number(lastTimeAdded > 0 ? lastTimeAdded : 5));
      sendMessage(action.START_TIMER);
      return;
    } else {
      sendMessage(action.START_TIMER);
    }
  }, [message]);

  const handleStop = useCallback(() => sendMessage(action.STOP_TIMER), []);

  const handlePause = useCallback(() => {
    handleStopAlarm();
  }, []);

  const handleClear = useCallback(() => sendMessage(action.CLEAR_TIMER), []);
  const handleSwitch = useCallback(() => sendMessage(action.SWITCH_MODE), []);
  const handleGetTimer = useCallback(() => sendMessage(action.GET_TIMER), []);
  const handleSetGoal = useCallback(time => sendMessage(action.SET_GOAL.concat(time)), []);
  const handleAddGoal = useCallback(time => {
    handlePause();
    sendMessage(action.ADD_GOAL.concat(time));
  }, []);

  const handleRemoveGoal = useCallback(
    time => {
      const now = moment();
      const lastAccess = moment(message?.lastAccess);
      const elapsedTime = moment.duration(now.diff(lastAccess)).asMilliseconds();
      let remaining = message?.time - elapsedTime;

      if (remaining <= 900000) {
        alert('Timer cannot be set to less than fifteen minutes!');
        return;
      } else if (remaining <= 1800000) {
        sendMessage(action.SET_GOAL.concat(time));
      } else {
        sendMessage(action.REMOVE_GOAL.concat(time));
      }
    },
    [message],
  );

  const handleAckForced = useCallback(() => sendMessage(action.ACK_FORCED), []);
  const toggleModal = () => {
    setLogModal(modal => !modal);
    setTimerIsOverModalIsOpen(true);
  };
  const toggleModalClose = () => {
    setLogModal(modal => !modal);
  };
  const toggleTimer = () => setShowTimer(timer => !timer);

  /*
  Here is the time to log in the timelog, we use moment to format the time
  first we check if the message is not null, if it is we set the time to 0
  if it is not we check if the timer is in countdown mode, if it is we subtract the current time from the goal
  if it is not we just use the current time
  then we get the hours and minutes from the time
  */
  const timeToLog = moment.duration(
    message ? (message.countdown ? message.goal - previewTimer : previewTimer) : 0,
  );
  const hours = timeToLog.hours();
  const minutes = timeToLog.minutes();

  /*
  Here is the the timer wrapper, we check if the timer is in countdown mode
  if it is we show the countdown timer, if it is not we show the stopwatch
  Also we check if the timer was forced to pause, if so we show the inactivity modal
  The timer status is the component that shows the status of the timer, if it is waiting for the server
  message, if some error ocurred and the ready state of the websocket connection
  */

  useEffect(() => {
    // If the user load the page and the time 0 it clear the timer and put the
    const userHasLoadedPageAndAlreadyHaveSeeTheFirstLoadingAndHisTimeIsZero =
      message?.time == 0 && isFirstLoading;

    if (userHasLoadedPageAndAlreadyHaveSeeTheFirstLoadingAndHisTimeIsZero) {
      handleClear();
    }
  }, [message, isFirstLoading]);

  useEffect(() => {
    if (userCanStop) {
      return;
    }
    const timeToLog = moment.duration(
      message ? (message.countdown ? message.goal - previewTimer : previewTimer) : 0,
    );
    setInterval(() => {
      if (timeToLog.minutes() >= 1) {
        setUserCanStop(true);
        return;
      }
    }, 60000);
  }, [message, userCanStop]);

  useEffect(() => {
    if (isFirstLoading) {
      setTimeout(() => {
        setIsFirstLoading(false);
      }, 10000);
    }
  }, [isFirstLoading]);

  const stopAllAudioAndClearIntervals = useCallback(() => {
    const audios = document.querySelectorAll('audio');
    audios.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });

    const intervals = setInterval(() => {});
    for (let i = 1; i < intervals; i++) {
      clearInterval(i);
    }
  }, []);

  return (
    <div className="timer-container">
      <BsAlarmFill className="transition-color btn-white" fontSize="2rem" onClick={toggleTimer} />
      <div className="preview" onClick={toggleTimer}>
        {moment.utc(previewTimer).format('HH:mm:ss')}
      </div>
      <div className="add-btn">
        <BsPlusCircleFill
          className="btn-white transition-color"
          fontSize="1.5rem"
          onClick={() => handleAddGoal(1000 * 60 * 15)}
        />
        <AiFillMinusCircle
          className="btn-white transition-color"
          fontSize="1.7rem"
          onClick={() => {
            handleRemoveGoal(1000 * 60 * 15);
          }}
        />
      </div>
      {message?.paused ? (
        <BsFillPlayCircleFill
          className="btn-white transition-color"
          fontSize="1.5rem"
          onClick={handleStartButton}
        />
      ) : (
        <BsPauseCircleFill
          className="btn-white transition-color"
          fontSize="1.5rem"
          onClick={handlePause}
        />
      )}
      <button
        type="button"
        disabled={!userCanStop}
        onClick={() => {
          handlePause();
          setLogModal(true);
        }}
        className="disabled"
      >
        <BsStopCircleFill
          className={`${!userCanStop ? 'transition-color disabled' : 'btn-white transition-color'}`}
          fontSize="1.5rem"
        />
      </button>

      <Modal
        isOpen={timerIsOverModalOpen}
        toggle={() => setTimerIsOverModalIsOpen(!timerIsOverModalOpen)}
        centered={true}
        size={'md'}
      >
        <ModalHeader toggle={() => setTimerIsOverModalIsOpen(false)}>Time Complete!</ModalHeader>
        <ModalBody>Click below if you’d like to add time or Log Time.</ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={() => {
              setTimerIsOverModalIsOpen(false);
              stopAllAudioAndClearIntervals();
              setLogModal(true);
            }}
          >
            Log Time
          </Button>{' '}
          <Button
            color="secondary"
            onClick={() => {
              setTimerIsOverModalIsOpen(false);
              stopAllAudioAndClearIntervals();
              handleAddGoal(1000 * 60 * 15);
              sendMessage(action.START_TIMER);
            }}
          >
            Add More Time
          </Button>{' '}
        </ModalFooter>
      </Modal>

      <Modal size={'md'} isOpen={inacModal} toggle={() => setInacModal(!inacModal)} centered={true}>
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
              handleAckForced();
            }}
          >
            I understand
          </Button>{' '}
        </ModalFooter>
      </Modal>
      <Modal
        isOpen={confirmationResetModal}
        toggle={() => setConfirmationResetModal(!confirmationResetModal)}
        centered={true}
        size={'md'}
      >
        <ModalHeader toggle={() => setConfirmationResetModal(false)}>Reset Time</ModalHeader>
        <ModalBody>Are you sure you want to reset your time?</ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            onClick={() => {
              handleClear();
              setConfirmationResetModal(false);
            }}
          >
            Yes, reset time!
          </Button>{' '}
        </ModalFooter>
      </Modal>

      <div className={`timer ${!showTimer && 'hide-me'}`}>
        <div className="timer-content">
          <BsXLg className="transition-color btn-white cross" onClick={toggleTimer} />
          {/* <SwitchTimer message={message} handleSwitch={handleSwitch} /> */}
          {readyState === ReadyState.OPEN && message && !message?.error ? (
            message?.countdown ? (
              <Countdown
                message={message}
                handlePause={handlePause}
                handleStart={handleStartButton}
                handleStop={handleStop}
                timer={{ hours, minutes }}
                handleSetGoal={handleSetGoal}
                handleAddGoal={handleAddGoal}
                handleRemoveGoal={handleRemoveGoal}
                setPreviewTimer={setPreviewTimer}
                handleClear={() => setConfirmationResetModal(true)}
                toggleModal={() => setLogModal(true)}
                alarm={handleStartAlarm}
                handlePauseAlarm={handleStopAlarm}
                logModal={logModal}
                triggerAudio={triggerAudio}
                setTimerIsOverModalIsOpen={setTimerIsOverModalIsOpen}
                userIsRunningTimerAndHasAtLeastOneMinute={userCanStop}
              />
            ) : (
              <Stopwatch
                message={message}
                handlePause={handlePause}
                handleStart={handleStart}
                handleStop={handleStop}
                handleClear={handleClear}
                setPreviewTimer={setPreviewTimer}
              />
            )
          ) : (
            <TimerStatus readyState={readyState} message={message} />
          )}
        </div>
        {logModal && (
          <TimeEntryForm
            toggleModalClose={toggleModalClose}
            edit={false}
            userId={userId}
            toggle={toggleModal}
            isOpen={logModal}
            timer={{ hours, minutes }}
            data={data}
            userProfile={userProfile}
            resetTimer={handleClear}
            handleStop={handleStop}
            handleAddGoal={handleAddGoal}
            handlePauseAlarm={handleStopAlarm}
            goal={message?.goal}
          />
        )}
      </div>
      <audio ref={audioRef} src="https://bigsoundbank.com/UPLOAD/mp3/2554.mp3" />
    </div>
  );
};

export default NewTimer;
