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
import { connect, useDispatch } from 'react-redux';
import css from './Timer.module.css';
import '../Header/index.css';
import { ENDPOINTS } from '~/utils/URL';
import config from '../../config.json';
import TimeEntryForm from '../Timelog/TimeEntryForm';
import Countdown from './Countdown';
import TimerStatus from './TimerStatus';
import TimerPopout from './TimerPopout';
import { postTimeEntry, editTimeEntry } from '../../actions/timeEntries';

function Timer({ authUser, darkMode, isPopout }) {
  const dispatch = useDispatch();
  const realIsPopout = typeof isPopout === 'boolean' ? isPopout : !!window.opener;
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
   *  startAt: Date,
   *  weekEndPause: boolean
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
    weekEndPause: false,
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
  const [lastSubmittedTime, setLastSubmittedTime] = useState(null); // Add this state to track submitted time
  const [submissionHistory, setSubmissionHistory] = useState([]); // Track submission history for debugging
  const [timerState, setTimerState] = useState('idle'); // Track timer state: 'idle', 'running', 'paused', 'completed'
  const [lastActivity, setLastActivity] = useState(null); // Track last user activity
  const [sessionId, setSessionId] = useState(null); // Unique session identifier
  const [viewingUserId, setViewingUserId] = useState(null);
  const [weekEndModal, setWeekEndModal] = useState(false);
  const isWSOpenRef = useRef(0);
  const timeIsOverAudioRef = useRef(null);
  const forcedPausedAudioRef = useRef(null);

  const timeToLog = moment.duration(goal - remaining);
  const logHours = timeToLog.hours();
  const logMinutes = timeToLog.minutes();

  const sendJsonMessageNoQueue = useCallback(msg => sendJsonMessage(msg, false), [sendMessage]);

  // Enhanced function to clear submitted time with better logging
  const clearSubmittedTime = useCallback(() => {
    console.log(' Clearing submitted time - Timer reset or user change detected');
    setLastSubmittedTime(null);
    setLogTimer({ hours: 0, minutes: 0 });
    setTimerState('idle');
  }, []);

  // Enhanced function to track time submission with detailed logging
  const trackTimeSubmission = useCallback(
    submittedTime => {
      const timeKey = `${submittedTime.hours}_${submittedTime.minutes}_${goal}_${remaining}`;
      const submissionRecord = {
        id: Date.now(),
        time: submittedTime,
        timestamp: new Date().toISOString(),
        sessionId,
        userId: viewingUserId || authUser?.userid,
        goal,
        remaining,
      };

      console.log('✅ Time submitted successfully:', submissionRecord);

      setLastSubmittedTime(timeKey);
      setSubmissionHistory(prev => [...prev, submissionRecord]);
      setLogTimer({ hours: 0, minutes: 0 });
      setTimerState('completed');

      // Store in localStorage for debugging (optional)
      try {
        const existingHistory = JSON.parse(localStorage.getItem('timerSubmissionHistory') || '[]');
        const updatedHistory = [...existingHistory, submissionRecord].slice(-10); // Keep last 10 entries
        localStorage.setItem('timerSubmissionHistory', JSON.stringify(updatedHistory));
      } catch (error) {
        console.warn('Could not save submission history to localStorage:', error);
      }
    },
    [goal, remaining, sessionId, viewingUserId, authUser?.userid],
  );

  // Enhanced function to validate time before submission
  const validateTimeForSubmission = useCallback(
    timeToSubmit => {
      const { hours, minutes } = timeToSubmit;
      const totalMinutes = hours * 60 + minutes;

      // Check minimum time requirement
      if (totalMinutes < 1) {
        toast.error('❌ You need at least 1 minute to log time!');
        return false;
      }

      // Check maximum time limit (5 hours)
      if (totalMinutes > 300) {
        toast.error('❌ Maximum time limit is 5 hours per session!');
        return false;
      }

      // Check if this exact time was already submitted
      const timeKey = `${hours}_${minutes}_${goal}_${remaining}`;
      if (lastSubmittedTime === timeKey) {
        toast.info('ℹ️ This time has already been submitted in this session.');
        return false;
      }

      return true;
    },
    [goal, remaining, lastSubmittedTime],
  );

  // Enhanced function to get timer statistics
  const getTimerStats = useCallback(() => {
    const today = new Date().toDateString();
    const todaySubmissions = submissionHistory.filter(
      record => new Date(record.timestamp).toDateString() === today,
    );

    const totalTimeToday = todaySubmissions.reduce((total, record) => {
      return total + (record.time.hours * 60 + record.time.minutes);
    }, 0);

    return {
      totalSubmissions: submissionHistory.length,
      todaySubmissions: todaySubmissions.length,
      totalTimeToday: {
        hours: Math.floor(totalTimeToday / 60),
        minutes: totalTimeToday % 60,
      },
      lastSubmission: submissionHistory[submissionHistory.length - 1],
    };
  }, [submissionHistory]);

  // Enhanced function to handle timer state changes
  const updateTimerState = useCallback(
    newState => {
      console.log(`🔄 Timer state changed: ${timerState} → ${newState}`);
      setTimerState(newState);
      setLastActivity(new Date().toISOString());
    },
    [timerState],
  );

  // Initialize session ID on component mount
  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    setSessionId(newSessionId);
    console.log('🚀 Timer session initialized:', newSessionId);
  }, []);

  // Enhanced useEffect for timer state management
  useEffect(() => {
    if (running && !paused) {
      updateTimerState('running');
    } else if (paused && started) {
      updateTimerState('paused');
    } else if (!started) {
      updateTimerState('idle');
    }
  }, [running, paused, started, updateTimerState]);

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

  // Modify the sendStop function to track submitted time
  const wsJsonMessageHandler = useMemo(() => {
    if (viewingUserId == null) {
      return {
        sendStart: () => sendJsonMessageNoQueue({ action: action.START_TIMER }),
        sendPause: () => sendJsonMessageNoQueue({ action: action.PAUSE_TIMER }),
        sendClear: () => sendJsonMessageNoQueue({ action: action.CLEAR_TIMER }),
        sendStop: () => {
          sendJsonMessageNoQueue({ action: action.STOP_TIMER });
          // Clear the submitted time when stopping
          clearSubmittedTime();
        },
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
      sendStop: () => {
        sendJsonMessageNoQueue({ action: action.STOP_TIMER, userId: viewingUserId });
        // Clear the submitted time when stopping
        clearSubmittedTime();
      },
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
  }, [sendJsonMessageNoQueue, viewingUserId, clearSubmittedTime]);

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

  // Enhanced TimeEntryForm callback
  const handleTimeSubmitted = useCallback(
    submittedTime => {
      trackTimeSubmission(submittedTime);

      // Show success message with statistics
      const stats = getTimerStats();
      toast.success(
        `✅ Time logged successfully!`,
      );
    },
    [trackTimeSubmission, getTimerStats],
  );

  const toggleTimer = () => setShowTimer(timer => !timer);

  const toggleTimeIsOver = () => {
    setTimeIsOverModalIsOpen(!timeIsOverModalOpen);
    sendStartChime(!timeIsOverModalOpen);
  };

  const toggleWeekEndModal = () => {
    setWeekEndModal(!weekEndModal);
    if (weekEndModal) {
      // When closing the modal, stop chiming
      sendStartChime(false);
    }
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

  // Enhanced handleStopButton with better validation and user feedback
  const handleStopButton = useCallback(() => {
    const timeToSubmit = { hours: logHours, minutes: logMinutes };

    if (!validateTimeForSubmission(timeToSubmit)) {
      return;
    }

    // Show confirmation dialog for longer sessions
    if (logHours >= 2) {
      const confirmed = window.confirm(
        `Are you sure you want to submit ${logHours} hours and ${logMinutes} minutes? This action cannot be undone.`,
      );
      if (!confirmed) {
        return;
      }
    }

    console.log('🛑 Stop button clicked - preparing to log time:', timeToSubmit);
    toggleLogTimeModal();
  }, [logHours, logMinutes, validateTimeForSubmission]);

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

  const handleWeekEndPause = () => {
    if (goal - remaining < 60000) {
      return; // Don't show modal if less than 1 minute
    }

    // Prevent duplicate calls if modal is already open
    if (weekEndModal) {
      return;
    }

    setWeekEndModal(true);
    sendPause(); // Pause timer
    toast.info('The week is close to ending! Please log your time.');
    sendStartChime(true); // Start chiming
  };

  /**
   * This useEffect is to make sure that all the states will be updated before taking effects,
   * so that message state and other states like running, inacMoal ... will be updated together
   * at the same time.
   */
  useEffect(() => {
    // Exclude heartbeat message and timelog event messages
    if (lastJsonMessage && lastJsonMessage.heartbeat === 'pong') {
      isWSOpenRef.current = 0;
      return;
    }

    // Ignore TIMELOG_EVENT messages - they're for the timestamps tab, not the timer
    if (lastJsonMessage && lastJsonMessage.type === 'TIMELOG_EVENT') {
      return;
    }
    // Handle explicit week close pause action messages
    if (lastJsonMessage && lastJsonMessage.action === 'WEEK_CLOSE_PAUSE') {
      if (running) {
        handleWeekEndPause();
      }
      return; // Exit early to prevent other modal logic
    }

    const {
      paused: pausedLJM,
      forcedPause: forcedPauseLJM,
      started: startedLJM,
      chiming: chimingLJM,
      weekEndPause: weekEndPauseLJM,
    } = lastJsonMessage || defaultMessage;

    setMessage(lastJsonMessage || defaultMessage);
    setRunning(startedLJM && !pausedLJM);

    // Show inactivity or time-over modals based on message state
    setInacModal(forcedPauseLJM);
    setTimeIsOverModalIsOpen(chimingLJM && (customReadyState === ReadyState.OPEN || !weekEndModal));
  }, [lastJsonMessage, customReadyState, running, message, weekEndModal]);

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

  // Enhanced useEffect that updates logTimer with better validation
  useEffect(() => {
    checkRemainingTime();

    const currentTimeToLog = { hours: logHours, minutes: logMinutes };
    const timeKey = `${logHours}_${logMinutes}_${goal}_${remaining}`;

    // Only update logTimer if we haven't submitted this time yet and it's valid
    if (lastSubmittedTime !== timeKey && (logHours > 0 || logMinutes > 0)) {
      if (validateTimeForSubmission(currentTimeToLog)) {
        setLogTimer(currentTimeToLog);
        console.log('⏱️ Time to log updated:', currentTimeToLog);
      }
    }
  }, [remaining, logHours, logMinutes, goal, lastSubmittedTime, validateTimeForSubmission]);

  // Enhanced useEffect for timer state changes
  useEffect(() => {
    if (!started || goal !== lastSubmittedTime?.goal) {
      clearSubmittedTime();
      console.log('🔄 Timer reset detected - clearing submitted time');
    }
  }, [started, goal, clearSubmittedTime]);

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

  // Close time over modal if connection is lost
  useEffect(() => {
    if (customReadyState !== ReadyState.OPEN && timeIsOverModalOpen) {
      setTimeIsOverModalIsOpen(false);
    }
  }, [customReadyState, timeIsOverModalOpen]);

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
    if (weekEndModal) {
      window.focus();
      timeIsOverAudioRef.current.play();
    } else {
      window.focus();
      timeIsOverAudioRef.current.pause();
      timeIsOverAudioRef.current.currentTime = 0;
    }
  }, [weekEndModal]);

  useEffect(() => {
    if (!isInitialJsonMessageReceived) return;

    sendGetTimer();
  }, [isInitialJsonMessageReceived, viewingUserId]);

  // Enhanced cleanup when viewing user changes
  useEffect(() => {
    clearSubmittedTime();
    console.log('👤 User changed - clearing timer state');
  }, [viewingUserId, clearSubmittedTime]);

  // Enhanced cleanup on component unmount
  useEffect(() => {
    return () => {
      clearSubmittedTime();
      console.log('🔚 Timer component unmounting - cleanup complete');
    };
  }, [clearSubmittedTime]);

  const fontColor = darkMode ? 'text-light' : '';
  const headerBg = darkMode ? 'bg-space-cadet' : '';
  const bodyBg = darkMode ? 'bg-yinmn-blue' : '';

  const renderTimeEntryForm = () =>
    logTimeEntryModal && (
      <TimeEntryForm
        from="Timer"
        edit={false}
        toggle={toggleLogTimeModal}
        isOpen={logTimeEntryModal}
        data={logTimer}
        sendStop={sendStop}
        timerConnected={customReadyState === ReadyState.OPEN}
        onTimeSubmitted={handleTimeSubmitted}
        sessionId={sessionId}
        timerStats={getTimerStats()}
      />
    );

  const renderAudioElements = () => (
    <>
      <audio
        ref={timeIsOverAudioRef}
        key="timeIsOverAudio"
        loop
        preload="auto"
        src="https://bigsoundbank.com/UPLOAD/mp3/2554.mp3"
      />
      <audio
        ref={forcedPausedAudioRef}
        key="forcedPausedAudio"
        loop
        preload="auto"
        src="https://bigsoundbank.com/UPLOAD/mp3/1102.mp3"
      />
    </>
  );

  const renderConfirmationResetModal = () => (
    <Modal
      isOpen={confirmationResetModal}
      toggle={() => setConfirmationResetModal(!confirmationResetModal)}
      centered
      size="md"
      className={cs(fontColor, darkMode ? 'dark-mode' : '')}
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
  );

  const renderInactivityModal = () => (
    <Modal
      className={cs(fontColor, darkMode ? 'dark-mode' : '')}
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
  );

  const renderTimeCompleteModal = () => (
    <Modal
      className={cs(fontColor, darkMode ? 'dark-mode' : '')}
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
      }. Click below if you'd like to add time or Log Time.`}</ModalBody>
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
  );

  if (realIsPopout) {
    return (
      <div className={cs(css.timer, darkMode ? 'dark-mode' : '')}>
        <div className={css.timerContent}>
          {customReadyState === ReadyState.OPEN && (
            <Countdown
              message={message}
              timerRange={{ MAX_HOURS, MIN_MINS }}
              running={running}
              wsMessageHandler={wsJsonMessageHandler}
              remaining={remaining}
              setConfirmationResetModal={setConfirmationResetModal}
              checkBtnAvail={checkBtnAvail}
              handleStartButton={handleStartButton}
              handleAddButton={handleAddButton}
              handleSubtractButton={handleSubtractButton}
              handleStopButton={handleStopButton}
              toggleTimer={() => window.close()}
            />
          )}
          {customReadyState !== ReadyState.OPEN && (
            <TimerStatus
              readyState={customReadyState}
              message={message}
              toggleTimer={() => window.close()}
            />
          )}
        </div>
        {renderTimeEntryForm()}
        {renderAudioElements()}
        {renderConfirmationResetModal()}
        {renderInactivityModal()}
        {renderTimeCompleteModal()}
      </div>
    );
  }

  return (
    <div className={cs(css.timerContainer)}>
      <button
        type="button"
        disabled={isButtonDisabled}
        onClick={toggleTimer}
        className={css.btnDiv}
        aria-label="Open timer dropdown"
      >
        <div className={cs(css.iconWrapper, isButtonDisabled ? css.btnDisabled : css.btn)}>
          <BsAlarmFill fontSize="2rem" title="Open timer dropdown" />
        </div>
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
            className={css.preview}
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
            style={{ background: 'none', border: 'none' }}
          >
            <div
              className={cs(
                css.iconWrapper,
                isButtonDisabled ? css.btnDisabled : css.transitionColor,
              )}
            >
              <FaPlusCircle
                className={checkBtnAvail(15) ? css.btn : css.btnDisabled}
                fontSize="1.5rem"
              />
            </div>
          </button>
          <button
            type="button"
            disabled={isButtonDisabled}
            onClick={() => handleSubtractButton(15)}
            title="Subtract 15min"
            aria-label="Subtract 15min"
            style={{ background: 'none', border: 'none' }}
          >
            <div
              className={cs(
                css.iconWrapper,
                isButtonDisabled ? css.btnDisabled : css.transitionColor,
              )}
            >
              <FaMinusCircle
                className={checkBtnAvail(-15) ? css.btn : css.btnDisabled}
                fontSize="1.5rem"
              />
            </div>
          </button>
          {!started || paused ? (
            <button
              type="button"
              disabled={isButtonDisabled}
              onClick={handleStartButton}
              aria-label="Start timer"
              style={{ background: 'none', border: 'none' }}
            >
              <div
                className={cs(
                  css.iconWrapper,
                  isButtonDisabled ? css.btnDisabled : css.transitionColor,
                )}
              >
                <FaPlayCircle
                  className={remaining !== 0 ? css.btn : css.btnDisabled}
                  fontSize="1.5rem"
                  title="Start timer"
                />
              </div>
            </button>
          ) : (
            <button
              type="button"
              disabled={isButtonDisabled}
              onClick={sendPause}
              aria-label="Pause timer"
              style={{ background: 'none', border: 'none' }}
            >
              <div
                className={cs(
                  css.iconWrapper,
                  isButtonDisabled ? css.btnDisabled : css.transitionColor,
                )}
              >
                <FaPauseCircle className={css.btn} fontSize="1.5rem" title="Pause timer" />
              </div>
            </button>
          )}
          <button
            type="button"
            disabled={!started || isButtonDisabled}
            onClick={handleStopButton}
            title="Stop timer and log time"
            aria-label="Stop timer and log time"
            style={{ background: 'none', border: 'none' }}
          >
            <div
              className={cs(
                css.iconWrapper,
                isButtonDisabled ? css.btnDisabled : css.transitionColor,
              )}
            >
              <FaStopCircle
                className={started && goal - remaining >= 60000 ? css.btn : css.btnDisabled}
                fontSize="1.5rem"
              />
            </div>
          </button>
          <button
            type="button"
            disabled={isButtonDisabled}
            onClick={() => setConfirmationResetModal(true)}
            title="Reset timer"
            aria-label="Reset timer"
            style={{ background: 'none', border: 'none' }}
          >
            <div
              className={cs(
                css.iconWrapper,
                isButtonDisabled ? css.btnDisabled : css.transitionColor,
              )}
            >
              <FaUndoAlt className={css.btn} fontSize="1.3rem" />
            </div>
          </button>
          {!realIsPopout && (
            <TimerPopout authUser={authUser} darkMode={darkMode} TimerComponent={Timer} />
          )}
        </div>
      )}

      {showTimer && (
        <div className={`${css.timer} ${css.smallTimer}`}>
          <div className={css.timerContent}>
            {customReadyState === ReadyState.OPEN && (
              <Countdown
                message={message}
                timerRange={{ MAX_HOURS, MIN_MINS }}
                running={running}
                wsMessageHandler={wsJsonMessageHandler}
                remaining={remaining}
                setConfirmationResetModal={setConfirmationResetModal}
                checkBtnAvail={checkBtnAvail}
                handleStartButton={handleStartButton}
                handleAddButton={handleAddButton}
                handleSubtractButton={handleSubtractButton}
                handleStopButton={handleStopButton}
                toggleTimer={toggleTimer}
              />
            )}
            {customReadyState !== ReadyState.OPEN && (
              <TimerStatus
                readyState={customReadyState}
                message={message}
                toggleTimer={toggleTimer}
              />
            )}
          </div>
        </div>
      )}
      {renderTimeEntryForm()}
      {renderAudioElements()}
      {renderConfirmationResetModal()}
      {renderInactivityModal()}
      {renderTimeCompleteModal()}
    </div>
  );
}

const mapStateToProps = state => ({
  authUser: state.auth.user,
  userProfile: state.userProfile,
});

export default connect(mapStateToProps, {})(Timer);
