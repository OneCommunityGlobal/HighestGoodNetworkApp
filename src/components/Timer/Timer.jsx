/* eslint-disable jsx-a11y/media-has-caption */
import { setUser } from '@sentry/browser';
import cs from 'classnames';
import moment from 'moment';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BsAlarmFill, BsArrowClockwise } from 'react-icons/bs';
import {
  FaMinusCircle,
  FaPauseCircle,
  FaPlayCircle,
  FaPlusCircle,
  FaStopCircle,
  FaUndoAlt,
} from 'react-icons/fa';
import jwtDecode from 'jwt-decode';
import { connect, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Progress } from 'reactstrap';
import { ENDPOINTS } from '~/utils/URL';
import config from '../../config.json';
import '../Header/index.module.css';
import TimeEntryForm from '../Timelog/TimeEntryForm';
import Countdown from './Countdown';
import css from './Timer.module.css';
import TimerPopout from './TimerPopout';
import TimerStatus from './TimerStatus';

// Reconnect backoff: 1s, 2s, 4s, 8s, 16s, then every 30s thereafter, forever,
// for as long as the stored token is usable. A real backend restart/deploy can
// easily take longer than a short attempt ladder (this one used to give up
// after ~61s and strand a visible, still-open tab on "Disconnected" with
// nothing left to retry it - no visibilitychange/online event fires for a tab
// that was never backgrounded or actually offline). Only a bad/expired token
// should ever show Disconnected + the manual refresh button.
const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 30000;
// Caps the backoff exponent, not the number of attempts - purely to keep
// 2 ** n from ever overflowing across a very long-running disconnection.
const RECONNECT_BACKOFF_EXPONENT_CAP = 10;
// After this many failed attempts in a row, assume we're genuinely offline (sleep,
// wifi drop, etc.) and chime locally if a session was actually running when the
// connection dropped - we may not be able to reach the server to confirm either way.
const OFFLINE_CHIME_ATTEMPT_THRESHOLD = 3;

function Timer({ authUser, darkMode, isPopout }) {
  const dispatch = useDispatch();
  const realIsPopout = typeof isPopout === 'boolean' ? isPopout : !!globalThis.opener;
  /**
   *  Because the websocket can not be closed when internet is cut off (lost server connection),
   *  the readyState will be stuck at OPEN, so here we need to use a custom readyState to
   *  mimic the real readyState, and when internet is cut off, the custom readyState will be set
   *  to CLOSED, and the user will be notified to refresh the page to reconnect to the server.
   * */
  const [customReadyState, setCustomReadyState] = useState(ReadyState.CONNECTING);
  const [wsKey, setWsKey] = useState(0);
  // True only once the stored token is unusable - that's the one thing that
  // should ever stop auto-reconnect and show "Disconnected" + the manual
  // refresh button instead of "Reconnecting...". While the token stays valid,
  // reconnect attempts never give up.
  const [reconnectExhausted, setReconnectExhausted] = useState(false);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const offlineChimeFiredRef = useRef(false);
  // The heartbeat-miss path calls handleConnectionLost() directly (for immediate
  // feedback) and then best-effort closes the socket, whose resulting onClose would
  // call handleConnectionLost() again for the same outage. This guards against that
  // double count; it's cleared whenever a new connection attempt actually begins
  // (scheduleReconnect's timeout, onOpen, or a manual/immediate reconnect), so each
  // *new* attempt's own failure still counts once.
  const connectionLostHandledRef = useRef(false);
  // started/paused aren't declared until later (they come from the message state),
  // but WSoptions/handleConnectionLost must exist before the useWebSocket() call that
  // produces them, so this ref (kept in sync below, once they exist) lets the
  // close/error handlers check "was a session actually running when we dropped?"
  // without a direct reference that would be used before it's declared.
  const timerFlagsRef = useRef({ started: false, paused: false });

  const clearScheduledReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // No point retrying with a token the server will reject anyway (expired, or just
  // malformed/missing) - same expiry convention as utils/authInit.js.
  const isStoredTokenUsable = useCallback(() => {
    const token = localStorage.getItem(config.tokenKey);
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      const expirySec = new Date(decoded.expiryTimestamp).getTime() / 1000;
      return expirySec > Date.now() / 1000;
    } catch (_error) {
      return false;
    }
  }, []);

  // Once exhausted, nothing was going to retry on its own again - without this, a
  // tab left on "Disconnected" stays stuck until the user notices and clicks the
  // manual refresh button. Re-checking the token here (rather than just retrying
  // blindly) means a genuinely bad/expired token is the only thing that still
  // leaves it stuck - everything else gets a fresh attempt.
  const resetAndReconnectIfTokenUsable = useCallback(() => {
    if (!isStoredTokenUsable()) return false;
    clearScheduledReconnect();
    reconnectAttemptRef.current = 0;
    connectionLostHandledRef.current = false;
    setReconnectExhausted(false);
    setWsKey(k => k + 1);
    return true;
  }, [isStoredTokenUsable, clearScheduledReconnect]);

  const scheduleReconnect = useCallback(() => {
    clearScheduledReconnect();

    if (!isStoredTokenUsable()) {
      setReconnectExhausted(true);
      return;
    }

    const exponent = Math.min(reconnectAttemptRef.current - 1, RECONNECT_BACKOFF_EXPONENT_CAP);
    const delay = Math.min(RECONNECT_BASE_DELAY_MS * 2 ** exponent, RECONNECT_MAX_DELAY_MS);
    reconnectTimeoutRef.current = setTimeout(() => {
      connectionLostHandledRef.current = false; // this next attempt's own failure should count
      setWsKey(k => k + 1);
    }, delay);
  }, [clearScheduledReconnect, isStoredTokenUsable]);

  // Shared handling for "the socket just went down" - called from onClose, onError,
  // and the heartbeat-miss path below, so there's one place deciding whether to
  // chime and/or keep retrying, instead of each path guessing independently.
  const handleConnectionLost = useCallback(() => {
    if (connectionLostHandledRef.current) return; // already processed this disconnect once
    connectionLostHandledRef.current = true;

    setRunning(false);
    setCustomReadyState(ReadyState.CLOSED);

    reconnectAttemptRef.current += 1;

    const { started: wasStarted, paused: wasPaused } = timerFlagsRef.current;
    if (
      reconnectAttemptRef.current >= OFFLINE_CHIME_ATTEMPT_THRESHOLD &&
      wasStarted &&
      !wasPaused &&
      !offlineChimeFiredRef.current
    ) {
      offlineChimeFiredRef.current = true;
      setInacModal(true);
    }

    scheduleReconnect();
  }, [scheduleReconnect]);

  const WSoptions = {
    share: false,
    protocols: localStorage.getItem(config.tokenKey),
    onOpen: () => {
      setCustomReadyState(ReadyState.OPEN);
      clearScheduledReconnect();
      reconnectAttemptRef.current = 0;
      offlineChimeFiredRef.current = false;
      connectionLostHandledRef.current = false;
      setReconnectExhausted(false);
    },
    onClose: () => handleConnectionLost(),
    // A real WebSocket always follows an error with a close event, which does the
    // actual reconnect bookkeeping - this just gets the UI/countdown out of a
    // "connected" state immediately instead of waiting for that close to land.
    onError: () => {
      setRunning(false);
      setCustomReadyState(ReadyState.CLOSED);
    },
    // We drive all reconnection ourselves via wsKey (see scheduleReconnect) so the
    // library never also retries on its own.
    shouldReconnect: () => false,
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
    {
      ...WSoptions,
      queryParams: { reconnect: wsKey },
    },
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

  useEffect(() => {
    timerFlagsRef.current = { started, paused };
  }, [started, paused]);

  const [running, setRunning] = useState(false);
  const [confirmationResetModal, setConfirmationResetModal] = useState(false);
  const [confirmSubmitModalOpen, setConfirmSubmitModalOpen] = useState(false);
  const [pendingSubmitTime, setPendingSubmitTime] = useState({ hours: 0, minutes: 0 });
  const [logTimeEntryModal, setLogTimeEntryModal] = useState(false);
  const [inacModal, setInacModal] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timeIsOverModalOpen, setTimeIsOverModalIsOpen] = useState(false);
  const [remaining, setRemaining] = useState(time);
  const [logTimer, setLogTimer] = useState({ hours: 0, minutes: 0 });
  const [lastSubmittedTime, setLastSubmittedTime] = useState(null); // Add this state to track submitted time
  const [submissionHistory, setSubmissionHistory] = useState([]); // Track submission history for debugging
  const [timerState, setTimerState] = useState('idle'); // Track timer state: 'idle', 'running', 'paused', 'completed'
  const [sessionId, setSessionId] = useState(null); // Unique session identifier
  const [viewingUserId, setViewingUserId] = useState(null);
  const [weekEndModal, setWeekEndModal] = useState(false);
  const isWSOpenRef = useRef(0);
  const pendingStopRef = useRef(null);
  const stopRequestSequenceRef = useRef(0);
  const pendingGetTimerRef = useRef(null);
  const getTimerRequestSequenceRef = useRef(0);
  const timeIsOverAudioRef = useRef(null);
  const forcedPausedAudioRef = useRef(null);
  const audioUnlockedRef = useRef(false);

  const timeToLog = moment.duration(goal - remaining);
  const logHours = timeToLog.hours();
  const logMinutes = timeToLog.minutes();

  // Handle visual race conditions for the timer start and pause buttons
  const isCurrentlyPaused = !started || paused;

  const sendJsonMessageNoQueue = useCallback(msg => sendJsonMessage(msg, false), [sendJsonMessage]);

  const sendStopAndConfirm = useCallback(
    targetUserId =>
      new Promise(resolve => {
        const socket = getWebSocket();
        if (!socket || socket.readyState !== ReadyState.OPEN) {
          resolve(false);
          return;
        }

        if (pendingStopRef.current) {
          clearTimeout(pendingStopRef.current.timeoutId);
          pendingStopRef.current.resolve(false);
        }

        stopRequestSequenceRef.current += 1;
        const requestId = `stop-${Date.now()}-${stopRequestSequenceRef.current}`;
        const timeoutId = setTimeout(() => {
          if (pendingStopRef.current?.requestId === requestId) {
            pendingStopRef.current = null;
            resolve(false);
          }
        }, 10000);

        pendingStopRef.current = {
          requestId,
          timeoutId,
          resolve,
        };

        try {
          sendJsonMessageNoQueue({
            action: 'STOP_TIMER',
            ...(targetUserId == null ? {} : { userId: targetUserId }),
            requestId,
          });
        } catch (_error) {
          clearTimeout(timeoutId);
          pendingStopRef.current = null;
          resolve(false);
        }
      }),
    [getWebSocket, sendJsonMessageNoQueue],
  );

  // A stale tab's own `started` flag can lag behind the server (e.g. another tab already
  // stopped/logged this same session, or a reconnect hasn't resynced yet) - this fetches the
  // server's CURRENT state and waits for the matching response, so the Log Time form can tell
  // a genuinely-still-running session from one that was already closed out elsewhere, right
  // before it would otherwise save a duplicate entry. Resolves null on timeout/no connection,
  // or the fresh timer message on success - mirrors sendStopAndConfirm's request/response
  // pattern but kept as a separate ref/promise since the two can be in flight independently.
  const sendGetTimerAndConfirm = useCallback(
    () =>
      new Promise(resolve => {
        const socket = getWebSocket();
        if (!socket || socket.readyState !== ReadyState.OPEN) {
          resolve(null);
          return;
        }

        if (pendingGetTimerRef.current) {
          clearTimeout(pendingGetTimerRef.current.timeoutId);
          pendingGetTimerRef.current.resolve(null);
        }

        getTimerRequestSequenceRef.current += 1;
        const requestId = `resync-${Date.now()}-${getTimerRequestSequenceRef.current}`;
        const timeoutId = setTimeout(() => {
          if (pendingGetTimerRef.current?.requestId === requestId) {
            pendingGetTimerRef.current = null;
            resolve(null);
          }
        }, 10000);

        pendingGetTimerRef.current = {
          requestId,
          timeoutId,
          resolve,
        };

        try {
          sendJsonMessageNoQueue({
            action: 'GET_TIMER',
            ...(viewingUserId == null ? {} : { userId: viewingUserId }),
            requestId,
          });
        } catch (_error) {
          clearTimeout(timeoutId);
          pendingGetTimerRef.current = null;
          resolve(null);
        }
      }),
    [getWebSocket, sendJsonMessageNoQueue, viewingUserId],
  );

  // Enhanced function to clear submitted time with better logging
  const clearSubmittedTime = useCallback(() => {
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

      setLastSubmittedTime(timeKey);
      setSubmissionHistory(prev => [...prev, submissionRecord]);
      setLogTimer({ hours: 0, minutes: 0 });
      setTimerState('completed');

      // Store in localStorage for debugging (optional)
      try {
        const existingHistory = JSON.parse(localStorage.getItem('timerSubmissionHistory') || '[]');
        const updatedHistory = [...existingHistory, submissionRecord].slice(-10); // Keep last 10 entries
        localStorage.setItem('timerSubmissionHistory', JSON.stringify(updatedHistory));
      } catch (_error) {
        // localStorage unavailable - non-critical, safe to ignore
        void _error;
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
      setTimerState(newState);
    },
    [timerState],
  );

  const handleRefreshTimer = useCallback(() => {
    clearScheduledReconnect();
    reconnectAttemptRef.current = 0;
    offlineChimeFiredRef.current = false;
    connectionLostHandledRef.current = false;
    setReconnectExhausted(false);
    getWebSocket()?.close();
    setCustomReadyState(ReadyState.CONNECTING);
    setMessage(defaultMessage);
    setWsKey(k => k + 1);
  }, [getWebSocket, clearScheduledReconnect]);

  // Initialize session ID on component mount
  useEffect(() => {
    // Use cryptographically secure random values for session ID generation
    // This is safe for client-side session tracking (not used for authentication)
    let randomPart = '';
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const randomBytes = new Uint8Array(9);
      crypto.getRandomValues(randomBytes);
      randomPart = Array.from(randomBytes)
        .map(b => b.toString(36))
        .join('')
        .substring(0, 9);
    } else {
      // Fallback for environments without crypto API (should not occur in modern browsers)
      // Use timestamp as fallback (not cryptographically secure but acceptable for non-security use)
      randomPart = Date.now()
        .toString(36)
        .substring(2, 11);
    }
    const newSessionId = `session_${Date.now()}_${randomPart}`;
    setSessionId(newSessionId);
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

  const pauseAudioRef = ref => {
    if (!ref.current) return;
    ref.current.pause();
    ref.current.currentTime = 0;
  };

  useEffect(() => {
    const unlockAudio = () => {
      if (audioUnlockedRef.current) return;
      if (timeIsOverAudioRef.current) {
        timeIsOverAudioRef.current.play().catch(() => {});
        pauseAudioRef(timeIsOverAudioRef);
      }
      if (forcedPausedAudioRef.current) {
        forcedPausedAudioRef.current.play().catch(() => {});
        pauseAudioRef(forcedPausedAudioRef);
      }
      audioUnlockedRef.current = true;
    };
    document.addEventListener('click', unlockAudio, { once: true });
    return () => document.removeEventListener('click', unlockAudio);
  }, []);

  useEffect(() => {
    const handleStorageEvent = () => {
      const sessionStorageData = JSON.parse(globalThis.sessionStorage.getItem('viewingUser'));
      if (sessionStorageData) {
        setViewingUserId(sessionStorageData.userId);
      } else {
        setViewingUserId(null);
      }
    };

    // Set the initial state when the component mounts
    handleStorageEvent();

    // Add the event listener
    globalThis.addEventListener('storage', handleStorageEvent);

    // Clean up the event listener when the component unmounts
    return () => {
      globalThis.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  // control whether buttons should be clickable
  const isButtonDisabled = useMemo(
    () => viewingUserId && !ALLOWED_ROLES_TO_INTERACT.includes(authUser?.role),
    [viewingUserId, authUser],
  );

  // Modify the sendStop function to track submitted time
  const wsJsonMessageHandler = useMemo(() => {
    if (viewingUserId == null) {
      return {
        sendStart: () => {
          sendJsonMessageNoQueue({ action: action.START_TIMER });
        },
        sendPause: () => {
          sendJsonMessageNoQueue({ action: action.PAUSE_TIMER });
        },
        sendClear: () => sendJsonMessageNoQueue({ action: action.CLEAR_TIMER }),
        sendStop: async () => {
          const stopped = await sendStopAndConfirm(null);
          // Clear the submitted time when stopping
          clearSubmittedTime();
          return stopped;
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
      sendStart: () => {
        sendJsonMessageNoQueue({ action: action.START_TIMER, userId: viewingUserId });
      },
      sendPause: () => {
        sendJsonMessageNoQueue({ action: action.PAUSE_TIMER, userId: viewingUserId });
      },
      sendClear: () =>
        sendJsonMessageNoQueue({ action: action.CLEAR_TIMER, userId: viewingUserId }),
      sendStop: async () => {
        const stopped = await sendStopAndConfirm(viewingUserId);
        // Clear the submitted time when stopping
        clearSubmittedTime();
        return stopped;
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
  }, [sendJsonMessageNoQueue, sendStopAndConfirm, viewingUserId, clearSubmittedTime]);

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

      // Show success message
      toast.success(`✅ Time logged successfully!`);
    },
    [trackTimeSubmission],
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
      return;
    }
    setMessage(prev => ({
      ...prev,
      started: true,
      paused: false,
      // The server resets startAt to now on every START_TIMER, and only resets time to goal
      // on a *first* start (mirrored here from startTimer() in clientsHandler.js). Without this,
      // updateRemaining() runs against the stale/invalid startAt left over from before the click
      // and immediately computes remaining as 0, which pops the time-over modal before the
      // server's real response arrives - most visible on short goals (1-2 min) since any amount
      // of staleness is likely to exceed them.
      startAt: Date.now(),
      time: prev.started ? prev.time : prev.goal,
    }));
    setRunning(true);
    sendStart();
  }, [remaining, sendStart]);

  const handlePauseButton = useCallback(() => {
    setMessage(prev => ({
      ...prev,
      started: true,
      paused: true,
    }));
    setRunning(false);

    sendPause();
  }, [sendPause]);

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

    if (!validateTimeForSubmission(timeToSubmit)) return;

    // Show confirmation popup for longer sessions
    if (logHours >= 2) {
      setPendingSubmitTime(timeToSubmit);
      setConfirmSubmitModalOpen(true);
      return;
    }

    toggleLogTimeModal();
  }, [logHours, logMinutes, validateTimeForSubmission, toggleLogTimeModal]);

  const updateRemaining = () => {
    if (!running) return;
    const now = moment.utc();
    const timePassed = moment.duration(now.diff(startAt)).asMilliseconds();
    setRemaining(time > timePassed ? time - timePassed : 0);
  };

  const checkRemainingTime = () => {
    if (remaining === 0) {
      sendPause();
      if (!timeIsOverModalOpen && !weekEndModal) {
        setTimeIsOverModalIsOpen(true);
        sendStartChime(true);
      }
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
    if (
      lastJsonMessage?.requestId &&
      pendingStopRef.current?.requestId === lastJsonMessage.requestId
    ) {
      const { timeoutId, resolve } = pendingStopRef.current;
      clearTimeout(timeoutId);
      pendingStopRef.current = null;
      resolve(lastJsonMessage.started === false);
    }
    if (
      lastJsonMessage?.requestId &&
      pendingGetTimerRef.current?.requestId === lastJsonMessage.requestId
    ) {
      const { timeoutId, resolve } = pendingGetTimerRef.current;
      clearTimeout(timeoutId);
      pendingGetTimerRef.current = null;
      resolve(lastJsonMessage);
    }
    // Handle explicit week close pause action messages
    if (lastJsonMessage && lastJsonMessage.action === 'WEEK_CLOSE_PAUSE') {
      handleWeekEndPause();
      return; // Exit early to prevent other modal logic
    }

    const { paused: pausedLJM, forcedPause: forcedPauseLJM, started: startedLJM } =
      lastJsonMessage || defaultMessage;

    // console.log('DEBUG WS TIMER RECEIVED', {
    //   time: lastJsonMessage?.time,
    //   started: lastJsonMessage?.started,
    //   paused: lastJsonMessage?.paused,
    //   receivedAt: Date.now(),
    // });

    setMessage(lastJsonMessage || defaultMessage);
    setRunning(startedLJM && !pausedLJM);
    if (!startedLJM || pausedLJM) {
      setRemaining(lastJsonMessage?.time ?? defaultMessage.time);
    }

    // Show inactivity modal based on message state
    setInacModal(forcedPauseLJM);
    // Deliberately NOT depending on customReadyState/weekEndModal here: this effect
    // should only re-derive message/running/remaining when a genuinely NEW message
    // arrives. Reconnecting (customReadyState flipping CLOSED -> OPEN) with no fresh
    // GET_TIMER reply yet must not re-apply a stale lastJsonMessage and resurrect
    // running=true from before the disconnect - see the time-over-modal effect below
    // for the one case that does want to react to customReadyState.
  }, [lastJsonMessage]);

  // The time-over ("Time Complete!") modal specifically does want to react to
  // reconnects/week-end-pause changes (e.g. show it once back online if the
  // session was already chiming), so this stays a separate effect rather than
  // folding it into the one above.
  useEffect(() => {
    if (
      lastJsonMessage &&
      (lastJsonMessage.heartbeat === 'pong' ||
        lastJsonMessage.type === 'TIMELOG_EVENT' ||
        lastJsonMessage.action === 'WEEK_CLOSE_PAUSE')
    ) {
      return;
    }
    const { chiming: chimingLJM } = lastJsonMessage || defaultMessage;
    setTimeIsOverModalIsOpen(chimingLJM && (customReadyState === ReadyState.OPEN || !weekEndModal));
  }, [lastJsonMessage, customReadyState, weekEndModal]);

  // This useEffect is to make sure that the WS connection is maintained by sending a heartbeat every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (running) {
        isWSOpenRef.current += 1;
        sendHeartbeat();
        setTimeout(() => {
          // make sure to notify the user if the heartbeat is not responded for 3 times
          if (isWSOpenRef.current > 3) {
            // Don't decide locally that this is a genuine forced pause - a background/
            // throttled tab can miss heartbeats for a long time and then "wake up" with
            // a wildly stale assumption. Route through the same handling as a real
            // close/error so reconnecting resyncs with the server's actual state
            // (already logged elsewhere, or a real forced pause) instead of guessing.
            handleConnectionLost();
            getWebSocket()?.close(); // best-effort; may not fire a close event if truly offline
            isWSOpenRef.current = 0;
          }
        }, 10000); // close the WS if no response after 10 seconds
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (!running) {
      return undefined;
    }
    updateRemaining();
    const interval = setInterval(() => {
      updateRemaining();
    }, 1000);
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
      }
    }
  }, [remaining, logHours, logMinutes, goal, lastSubmittedTime, validateTimeForSubmission]);

  // Reset the submission guard once the timer is no longer started (e.g. after
  // Reset/Clear, whose server response flips started to false). This used to also
  // fire on "goal !== lastSubmittedTime?.goal", but lastSubmittedTime is a plain
  // dedup-key string (see trackTimeSubmission), not an object, so .goal was always
  // undefined - making that half of the condition always true. That wiped logTimer
  // back to 0/0 on every goal/started change, including right after a reload synced
  // the real goal/remaining from the server and the effect above had just computed
  // the correct hours/minutes still owed. The goal check was also redundant: the
  // dedup key below already embeds goal, so a changed goal naturally produces a
  // different key without needing separate invalidation here.
  useEffect(() => {
    if (!started) {
      clearSubmittedTime();
    }
  }, [started, clearSubmittedTime]);

  useEffect(() => {
    if (timeIsOverModalOpen) {
      window.focus();
      const playPromise = timeIsOverAudioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      globalThis.focus();
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
      const playPromise = forcedPausedAudioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      globalThis.focus();
      forcedPausedAudioRef.current.pause();
      forcedPausedAudioRef.current.currentTime = 0;
    }
  }, [inacModal]);

  useEffect(() => {
    if (weekEndModal) {
      window.focus();
      const playPromise = timeIsOverAudioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      globalThis.focus();
      timeIsOverAudioRef.current.pause();
      timeIsOverAudioRef.current.currentTime = 0;
    }
  }, [weekEndModal]);

  useEffect(() => {
    if (customReadyState !== ReadyState.OPEN) return; // only request when connected

    sendGetTimer();
  }, [customReadyState, viewingUserId, wsKey]);

  // Resync with the server as soon as a backgrounded tab becomes visible again, and
  // either resync or jump straight to a reconnect attempt (instead of waiting out
  // the rest of the backoff) as soon as the browser reports it's back online.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      if (customReadyState === ReadyState.OPEN) {
        sendGetTimer();
      } else if (reconnectExhausted) {
        // Only a still-bad/expired token should leave this stuck - anything else
        // deserves a fresh attempt now that the tab is actually being looked at.
        resetAndReconnectIfTokenUsable();
      }
    };

    const handleOnline = () => {
      if (customReadyState === ReadyState.OPEN) {
        sendGetTimer();
      } else if (reconnectExhausted) {
        resetAndReconnectIfTokenUsable();
      } else {
        // Already mid-backoff (not yet exhausted) - don't make the user wait out
        // the rest of it now that the browser says we're back online.
        clearScheduledReconnect();
        setWsKey(k => k + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    globalThis.addEventListener('online', handleOnline);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      globalThis.removeEventListener('online', handleOnline);
    };
  }, [
    customReadyState,
    reconnectExhausted,
    sendGetTimer,
    clearScheduledReconnect,
    resetAndReconnectIfTokenUsable,
  ]);

  // Cancel any pending reconnect attempt on unmount.
  useEffect(() => clearScheduledReconnect, [clearScheduledReconnect]);

  // Enhanced cleanup when viewing user changes
  useEffect(() => {
    clearSubmittedTime();
  }, [viewingUserId, clearSubmittedTime]);

  // Enhanced cleanup on component unmount
  useEffect(() => {
    return () => {
      clearSubmittedTime();
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
        sendGetTimerAndConfirm={sendGetTimerAndConfirm}
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

  const renderConfirmSubmitModal = () => (
    <Modal
      isOpen={confirmSubmitModalOpen}
      toggle={() => setConfirmSubmitModalOpen(false)}
      centered
      size="md"
      className={cs(fontColor, darkMode ? 'dark-mode' : '')}
    >
      <ModalHeader
        className={darkMode ? 'bg-space-cadet' : ''}
        toggle={() => setConfirmSubmitModalOpen(false)}
      >
        Confirm submission
      </ModalHeader>

      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <div style={{ fontSize: '1rem', lineHeight: 1.4 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            Are you sure you want to submit{' '}
            {pendingSubmitTime.hours ? `${pendingSubmitTime.hours} hour(s)` : ''}
            {pendingSubmitTime.minutes ? ` ${pendingSubmitTime.minutes} minute(s)` : ''}?
          </div>
          <div style={{ opacity: 0.9 }}>This action cannot be undone.</div>
        </div>
      </ModalBody>

      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <Button color="secondary" onClick={() => setConfirmSubmitModalOpen(false)}>
          Cancel
        </Button>

        <Button
          color="primary"
          onClick={() => {
            setConfirmSubmitModalOpen(false);
            toggleLogTimeModal();
          }}
        >
          Yes, submit
        </Button>
      </ModalFooter>
    </Modal>
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
              toggleTimer={() => globalThis.close()}
            />
          )}
          {customReadyState !== ReadyState.OPEN && (
            <TimerStatus
              readyState={customReadyState}
              message={message}
              toggleTimer={() => globalThis.close()}
              handleRefreshTimer={handleRefreshTimer}
              reconnectExhausted={reconnectExhausted}
            />
          )}
        </div>
        {renderTimeEntryForm()}
        {renderAudioElements()}
        {renderConfirmationResetModal()}
        {renderInactivityModal()}
        {renderTimeCompleteModal()}
        {renderConfirmSubmitModal()}
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
          <div className={css.disconnected}>
            <span>{reconnectExhausted ? 'Disconnected' : 'Reconnecting...'}</span>
            {reconnectExhausted && (
              <button
                type="button"
                onClick={handleRefreshTimer}
                className={css.disconnectedRefreshBtn}
                aria-label="Reload timer"
                title="Reload timer"
              >
                <BsArrowClockwise />
              </button>
            )}
          </div>
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
          {isCurrentlyPaused ? (
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
              onClick={handlePauseButton}
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
                handleRefreshTimer={handleRefreshTimer}
                reconnectExhausted={reconnectExhausted}
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
      {renderConfirmSubmitModal()}
    </div>
  );
}

Timer.propTypes = {
  authUser: PropTypes.shape({
    userid: PropTypes.string,
    role: PropTypes.string,
  }),
  darkMode: PropTypes.bool,
  isPopout: PropTypes.bool,
};

const mapStateToProps = state => ({
  authUser: state.auth.user,
  userProfile: state.userProfile,
});

export default connect(mapStateToProps, {})(Timer);
