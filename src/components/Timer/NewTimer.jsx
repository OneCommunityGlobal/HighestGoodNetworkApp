import moment from 'moment';
import React, { useState, useCallback, useEffect, useRef } from 'react';
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
import TimerStatus from './TimerStatus';

export const NewTimer = () => {
  const [logModal, setLogModal] = useState(false);
  const [oneMinuteMinimumModal, setOneMinuteMinimumModal] = useState(false);
  const [inacModal, setInacModal] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [triggerAudio, setTriggerAudio] = useState(false);
  const [timerIsOverModalOpen, setTimerIsOverModalIsOpen] = useState(false);
  const [userCanStop, setUserCanStop] = useState(false);

  const [confirmationResetModal, setConfirmationResetModal] = useState(false);
  const [isFirstLoading, setIsFirstLoading] = useState(true);
  const [previewTimer, setPreviewTimer] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [prevLogModal, setPrevLogModal] = useState(false);
  const [initialRender, setInitialRender] = useState(true);

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
    // SWITCH_MODE: 'SWITCH_MODE',
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
  }, [sendMessage]);

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
    const now = moment();
    const lastAccess = moment(message?.lastAccess);
    const elapsed = moment.duration(now.diff(lastAccess)).asMilliseconds();
    let remaining = message?.time - elapsed;

    const lastTimeAdded = moment.utc(remainingTime).format('HH:mm').replace('00:0', '');

    if (remaining <= 0) {
      handleAddGoal(1000 * 60 * (Number(lastTimeAdded) > 0 ? Number(lastTimeAdded) : 5));
    }

    setElapsedTime(elapsed);
    sendMessage(action.START_TIMER);
  }, [message, remainingTime, sendMessage, handleAddGoal]);

  const handleStop = useCallback(() => {
    sendMessage(action.STOP_TIMER);
  }, [sendMessage]);

  const handlePause = useCallback(() => {
    handleStopAlarm();
    sendMessage(action.PAUSE_TIMER);
  }, [handleStopAlarm, sendMessage]);

  const handleClear = useCallback(() => {
    sendMessage(action.CLEAR_TIMER); 
    setRemainingTime(0); // Reset the remaining time to 0
  }, [sendMessage]);
  const handleSetGoal = useCallback(time => sendMessage(action.SET_GOAL.concat(time)), [sendMessage]);
  const handleAddGoal = useCallback(time => {
  sendMessage(action.ADD_GOAL.concat(time));
}, [sendMessage]);

const handleRemoveGoal = useCallback((time) => {
  const now = moment();
  const lastAccess = moment(message?.lastAccess);
  console.log(message.lastAccess);
  const elapsedTime = moment.duration(now.diff(lastAccess)).asMilliseconds();
  let remaining = message?.time - elapsedTime;

  if (remaining <= 900000) {
    alert('Timer cannot be set to less than fifteen minutes!');
    return;
  }

  if (message?.countdown) {
    // Adjust the remaining time based on the removed goal
    const adjustedRemaining = remaining + time;

    if (adjustedRemaining <= message?.goal) {
      // If the adjusted remaining time is less than or equal to the goal, set the goal as the new remaining time
      setRemainingTime(message?.goal);
    } else {
      // If the adjusted remaining time is greater than the goal, subtract the removed goal from the remaining time
      setRemainingTime(adjustedRemaining - time);
    }
  }

  sendMessage(action.REMOVE_GOAL.concat(time));
}, [message, sendMessage]);

  const handleAckForced = useCallback(() => sendMessage(action.ACK_FORCED), []);
  const toggleModal = () => {
    setLogModal(modal => !modal);
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

  function handleUserCanStop() {
    const timePassed = moment.duration(
      message ? (message.countdown ? message.goal - previewTimer : previewTimer) : 0,
    );
    if (timePassed.minutes() >= 1) {
      setLogModal(true)
    } else {
      setOneMinuteMinimumModal(true);
    }
  }

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

  useEffect(() => {
    if (!initialRender  && logModal) {
      handlePause();
    }
  }, [logModal,  initialRender]);

  useEffect(() => {
    setInitialRender(false);
  }, []);

  useEffect(() => {
    // If the user load the page and the time 0 it clear the timer and put the
    const userHasLoadedPageAndAlreadyHaveSeeTheFirstLoadingAndHisTimeIsZero =
      message?.time == 0 && isFirstLoading;

    if (userHasLoadedPageAndAlreadyHaveSeeTheFirstLoadingAndHisTimeIsZero) {
      handleClear();
    }

    if((message?.goal - message?.time) >= 60000){
      setUserCanStop(true)
    } else {
      setUserCanStop(false)
    }
  }, [message, isFirstLoading]);

  useEffect(() => {
    setTimeout(() => {
      setIsFirstLoading(false);
    }, 10000);
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
        onClick={handleUserCanStop}
      >
        <BsStopCircleFill
          className="btn-white transition-color"
          fontSize="1.5rem"
        />
      </button>

      <Modal size={'md'} isOpen={oneMinuteMinimumModal} toggle={() => setOneMinuteMinimumModal(!oneMinuteMinimumModal)} centered={true}>
        <ModalHeader toggle={() => setOneMinuteMinimumModal(!oneMinuteMinimumModal)}>Alert</ModalHeader>
        <ModalBody>
        <strong>You need at least 1 minute to log time!</strong>
        </ModalBody>
      </Modal>


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
          {readyState === ReadyState.OPEN && message ? (
            <Countdown
              message={message}
              handlePause={handlePause}
              handleStart={handleStartButton}
              handleStop={handleStop}
              timer={{ hours, minutes }}
              handleSetGoal={handleSetGoal}
              handleAddGoal={handleAddGoal}
              handleRemoveGoal={handleRemoveGoal}
              handleUserCanStop={handleUserCanStop}
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
            handleStart={handleStart}
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