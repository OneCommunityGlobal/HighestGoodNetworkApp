import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import styles from './timer.module.css';
import httpService from '~/services/httpService';
import { ENDPOINTS } from '~/utils/URL';

import {
  Play as PlayIcon,
  Pause as PauseIcon,
  Square as StopIcon,
  RotateCcw as ResetIcon,
  X as CloseIcon,
  AlarmClock as AlarmIcon,
} from 'lucide-react';

const ICON_SIZE = 18;

const pad2 = n => String(n).padStart(2, '0');

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// The id the timer would send as `taskId`. Precedence is deliberately the same
// as the option values so what is validated is exactly what gets submitted.
const timerTaskIdOf = task => task.id ?? task._id;

// A timer session is recorded against a real EducationTask, so the backend
// requires a genuine ObjectId. Demo/fallback tasks carry sequential numeric ids
// and would be rejected with "taskId is required and must be a valid ObjectId",
// so they must never be offered as startable timer tasks.
const isRealTaskId = value => typeof value === 'string' && /^[0-9a-f]{24}$/i.test(value);

export default function TaskTimer({ tasks }) {
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState(2);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [timerInfo, setTimerInfo] = useState(null);
  const [error, setError] = useState('');
  const [liveElapsedMs, setLiveElapsedMs] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const darkMode = useSelector(state => state.theme.darkMode);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Recover any session still running/paused on the server after a refresh or
  // navigation. summarize() recomputes elapsed from the stored timestamps, so
  // overtime accrued while the page was closed is restored accurately.
  useEffect(() => {
    let cancelled = false;

    const recoverStatus = async () => {
      try {
        const response = await httpService.get(ENDPOINTS.STUDENT_TIMER_STATUS);
        const data = response.data?.data;
        if (!cancelled && isMountedRef.current && data && data.status !== 'idle') {
          setTimerInfo(data);
          if (data.taskId) setSelectedTaskId(String(data.taskId));
        }
      } catch {
        // A failed recovery must not block the dashboard; the timer simply
        // presents as idle and the student can start a new session.
      }
    };

    recoverStatus();
    return () => {
      cancelled = true;
    };
  }, []);

  const loggableTasks = tasks.filter(
    t =>
      t.status !== 'completed' && t.status !== 'graded' && isRealTaskId(String(timerTaskIdOf(t))),
  );

  const incH = useCallback(() => setHours(h => (h + 1) % 24), []);
  const decH = useCallback(() => setHours(h => (h + 23) % 24), []);
  const incM = useCallback(() => setMinutes(m => (m + 1) % 60), []);
  const decM = useCallback(() => setMinutes(m => (m + 59) % 60), []);
  const incS = useCallback(() => setSeconds(s => (s + 1) % 60), []);
  const decS = useCallback(() => setSeconds(s => (s + 59) % 60), []);

  const onHoursChange = useCallback(e => {
    const v = e.target.value.replace(/\D/g, '');
    setHours(clamp(Number(v || 0), 0, 23));
  }, []);

  const onMinutesChange = useCallback(e => {
    const v = e.target.value.replace(/\D/g, '');
    setMinutes(clamp(Number(v || 0), 0, 59));
  }, []);

  const onSecondsChange = useCallback(e => {
    const v = e.target.value.replace(/\D/g, '');
    setSeconds(clamp(Number(v || 0), 0, 59));
  }, []);

  const callTimerApi = useCallback(async (url, body = null) => {
    if (isMountedRef.current) setError('');

    try {
      const response = await httpService.post(url, body || {});
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Request failed';
      if (isMountedRef.current) setError(message);
      throw err;
    }
  }, []);

  const handleTogglePlay = useCallback(async () => {
    const status = timerInfo?.status || 'idle';
    if (submitting) return;
    if (status === 'idle' && !selectedTaskId) {
      setError('Select a task before starting the timer.');
      return;
    }

    setSubmitting(true);
    try {
      if (status === 'running') {
        const res = await callTimerApi(ENDPOINTS.STUDENT_TIMER_PAUSE);
        if (isMountedRef.current) setTimerInfo(res.data);
      } else if (status === 'paused') {
        const res = await callTimerApi(ENDPOINTS.STUDENT_TIMER_RESUME);
        if (isMountedRef.current) setTimerInfo(res.data);
      } else {
        let m = minutes;
        let h = hours;
        if (seconds > 0) {
          m += 1;
          if (m >= 60) {
            m -= 60;
            h = (h + 1) % 24;
          }
        }
        const res = await callTimerApi(ENDPOINTS.STUDENT_TIMER_START, {
          hours: h,
          minutes: m,
          taskId: selectedTaskId,
        });
        if (isMountedRef.current) setTimerInfo(res.data);
      }
    } catch {
      // error already recorded by callTimerApi
    } finally {
      if (isMountedRef.current) setSubmitting(false);
    }
  }, [timerInfo, callTimerApi, hours, minutes, seconds, selectedTaskId, submitting]);

  const handleStop = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      // A single request: the backend stops the timer and writes the
      // authoritative time_logged Daily Log entry from its own stored values.
      const res = await callTimerApi(ENDPOINTS.STUDENT_TIMER_STOP);
      const stopped = res.data;

      // Only claim success once the server confirms it persisted the activity
      // record for a session that had measurable time.
      if ((stopped?.elapsedMs || 0) > 0 && !stopped?.activityLogId) {
        if (isMountedRef.current) {
          setError('Timer stopped, but the session could not be saved to the Daily Log.');
        }
        return;
      }

      if (isMountedRef.current) {
        setTimerInfo(null);
        setHours(2);
        setMinutes(0);
        setSeconds(0);
        setLiveElapsedMs(null);
        setSelectedTaskId('');
      }
    } catch (err) {
      // A 409 means the backend has no active timer, so the session is
      // definitively already stopped: settle the UI to idle rather than
      // leaving a stale running state on screen.
      if (err.response?.status === 409 && isMountedRef.current) {
        setTimerInfo(null);
        setLiveElapsedMs(null);
        setSelectedTaskId('');
      }
      // Any other failure keeps the error surfaced by callTimerApi visible.
    } finally {
      if (isMountedRef.current) setSubmitting(false);
    }
  }, [callTimerApi, submitting]);

  const handleReset = useCallback(async () => {
    if (submitting) return;
    const status = timerInfo?.status || 'idle';
    const hasMeaningfulElapsed = (timerInfo?.elapsedMs || 0) >= 60000;

    if (
      (status === 'running' || status === 'paused') &&
      hasMeaningfulElapsed &&
      // eslint-disable-next-line no-alert
      !window.confirm('Resetting will discard the current unsaved timer session. Continue?')
    ) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await callTimerApi(ENDPOINTS.STUDENT_TIMER_RESET);
      if (isMountedRef.current) setTimerInfo(res.data || null);
    } catch {
      // error already recorded by callTimerApi
    } finally {
      if (isMountedRef.current) {
        setHours(2);
        setMinutes(0);
        setSeconds(0);
        setLiveElapsedMs(null);
        setSelectedTaskId('');
        setSubmitting(false);
      }
    }
  }, [callTimerApi, submitting, timerInfo]);

  const handleMiniAdjust = useCallback(
    deltaMinutes => {
      if (timerInfo && (timerInfo.status === 'running' || timerInfo.status === 'paused')) {
        callTimerApi(ENDPOINTS.STUDENT_TIMER_ADJUST, { deltaMinutes }).then(res =>
          setTimerInfo(res.data),
        );
        return;
      }

      let total = hours * 60 + minutes + deltaMinutes;
      if (total < 1) total = 1;

      setHours(Math.floor(total / 60) % 24);
      setMinutes(total % 60);
    },
    [timerInfo, callTimerApi, hours, minutes],
  );

  // Anchor the live display to the server's authoritative elapsedMs and tick
  // upward from there. Counting elapsed (rather than counting a remaining
  // value down to zero) is what lets the display continue into overtime, and
  // it re-anchors correctly after a refresh or a pause/resume round trip.
  useEffect(() => {
    setLiveElapsedMs(timerInfo?.elapsedMs ?? null);
  }, [timerInfo]);

  useEffect(() => {
    if (timerInfo?.status !== 'running') return undefined;

    const id = setInterval(() => {
      setLiveElapsedMs(prev => (prev == null ? prev : prev + 1000));
    }, 1000);

    return () => clearInterval(id);
    // Keyed on status only: a single interval per running session, never one
    // re-created on every tick.
  }, [timerInfo?.status]);

  const currentStatus = timerInfo?.status || 'idle';
  const isActive = currentStatus === 'running' || currentStatus === 'paused';

  const plannedMs = (hours * 60 + minutes + (seconds > 0 ? 1 : 0)) * 60 * 1000;
  const totalMs = timerInfo?.durationMs ?? plannedMs;
  const effectiveElapsedMs = liveElapsedMs ?? 0;

  const remainingMs = Math.max(0, totalMs - effectiveElapsedMs);
  const overtimeMs = Math.max(0, effectiveElapsedMs - totalMs);
  const isOvertime = overtimeMs > 0;

  const progressPct = totalMs ? Math.min(100, (effectiveElapsedMs / totalMs) * 100) : 0;

  // While a session exists show the countdown (floored at zero during
  // overtime); when idle show the duration the student is about to set.
  const clockMs = liveElapsedMs != null ? remainingMs : null;
  const displayH = clockMs != null ? Math.floor(clockMs / 3600000) : hours;
  const displayM = clockMs != null ? Math.floor((clockMs % 3600000) / 60000) : minutes;
  const displayS = clockMs != null ? Math.floor((clockMs % 60000) / 1000) : seconds;

  const overtimeLabel = `+${pad2(Math.floor(overtimeMs / 3600000))}:${pad2(
    Math.floor((overtimeMs % 3600000) / 60000),
  )}:${pad2(Math.floor((overtimeMs % 60000) / 1000))}`;

  const primaryIcon =
    currentStatus === 'running' ? <PauseIcon size={ICON_SIZE} /> : <PlayIcon size={ICON_SIZE} />;

  const circleRadius = 105;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const dashOffset = circleCircumference * (1 - progressPct / 100);

  const isIdle = currentStatus === 'idle';
  const canStart = !submitting && (!isIdle || Boolean(selectedTaskId));

  return (
    <>
      <div className={`${styles.compactWrapper} ${darkMode ? styles.dark : ''}`}>
        <button type="button" className={styles.compactIconBtn} onClick={() => setOpen(true)}>
          <AlarmIcon size={ICON_SIZE} />
        </button>

        <div className={styles.compactBody}>
          <div className={styles.progressBar}>
            <div
              className={`${styles.progressFill} ${isOvertime ? styles.progressOvertime : ''}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className={styles.timeLabel}>
            {pad2(displayH)}:{pad2(displayM)}:{pad2(displayS)}
          </div>
          {isOvertime && <div className={styles.compactOvertime}>Overtime {overtimeLabel}</div>}
          {error && (
            <div className={styles.compactError} role="alert">
              {error}
            </div>
          )}
        </div>

        <div className={styles.compactControlsRow}>
          <button
            type="button"
            className={`${styles.compactCtrlBtn} ${styles.compactSmallBtn}`}
            onClick={() => handleMiniAdjust(-15)}
            aria-label="Decrease 15 minutes"
          >
            −
          </button>
          <button
            type="button"
            className={`${styles.compactCtrlBtn} ${styles.compactSmallBtn}`}
            onClick={() => handleMiniAdjust(15)}
            aria-label="Increase 15 minutes"
          >
            +
          </button>
          <button
            type="button"
            className={styles.compactCtrlBtn}
            onClick={handleTogglePlay}
            disabled={!canStart}
            aria-label="Play/Pause"
          >
            {primaryIcon}
          </button>
          <button
            type="button"
            className={styles.compactCtrlBtn}
            onClick={handleStop}
            disabled={!isActive || submitting}
            aria-label="Stop"
          >
            <StopIcon size={ICON_SIZE} />
          </button>
          <button
            type="button"
            className={styles.compactCtrlBtn}
            onClick={handleReset}
            disabled={submitting}
            aria-label="Reset"
          >
            <ResetIcon size={ICON_SIZE} />
          </button>
        </div>
      </div>

      {open && (
        <div className={styles.modalOverlay}>
          <button
            type="button"
            className={styles.backdrop}
            onClick={() => setOpen(false)}
            aria-label="Close timer"
          />
          <dialog open className={`${styles.card} ${darkMode ? styles.darkCard : ''}`}>
            <div className={styles.cardHeader}>
              <span className={styles.headerTitle}>Timer</span>
              <button
                type="button"
                className={styles.iconGhost}
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <CloseIcon size={ICON_SIZE} />
              </button>
            </div>

            {isIdle && (
              <div className={styles.taskSelectRow}>
                <label className={styles.taskSelectLabel} htmlFor="timer-task-select">
                  Task
                </label>
                {loggableTasks.length > 0 ? (
                  <select
                    id="timer-task-select"
                    className={styles.taskSelect}
                    value={selectedTaskId}
                    onChange={e => setSelectedTaskId(e.target.value)}
                  >
                    <option value="">Select a task…</option>
                    {loggableTasks.map(t => (
                      <option key={timerTaskIdOf(t)} value={timerTaskIdOf(t)}>
                        {t.course_name || t.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className={styles.taskSelectEmpty}>
                    No assigned tasks available. Time can only be tracked against a task assigned to
                    you.
                  </p>
                )}
              </div>
            )}

            {isIdle && (
              <div className={styles.timeGrid}>
                <div className={styles.slot}>
                  <button
                    type="button"
                    className={styles.stepBtn}
                    onClick={incH}
                    aria-label="Increase hours"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 14l5-5 5 5z" />
                    </svg>
                  </button>
                  <input
                    className={styles.digitBox}
                    type="text"
                    value={pad2(hours)}
                    onChange={onHoursChange}
                    inputMode="numeric"
                    aria-label="Hours"
                  />
                  <button
                    type="button"
                    className={styles.stepBtn}
                    onClick={decH}
                    aria-label="Decrease hours"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  </button>
                </div>
                <span className={styles.colon}>:</span>
                <div className={styles.slot}>
                  <button
                    type="button"
                    className={styles.stepBtn}
                    onClick={incM}
                    aria-label="Increase minutes"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 14l5-5 5 5z" />
                    </svg>
                  </button>
                  <input
                    className={styles.digitBox}
                    type="text"
                    value={pad2(minutes)}
                    onChange={onMinutesChange}
                    inputMode="numeric"
                    aria-label="Minutes"
                  />
                  <button
                    type="button"
                    className={styles.stepBtn}
                    onClick={decM}
                    aria-label="Decrease minutes"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  </button>
                </div>
                <span className={styles.colon}>:</span>
                <div className={styles.slot}>
                  <button
                    type="button"
                    className={styles.stepBtn}
                    onClick={incS}
                    aria-label="Increase seconds"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 14l5-5 5 5z" />
                    </svg>
                  </button>
                  <input
                    className={styles.digitBox}
                    type="text"
                    value={pad2(seconds)}
                    onChange={onSecondsChange}
                    inputMode="numeric"
                    aria-label="Seconds"
                  />
                  <button
                    type="button"
                    className={styles.stepBtn}
                    onClick={decS}
                    aria-label="Decrease seconds"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {isIdle && (
              <div className={styles.quickRow}>
                <button
                  type="button"
                  className={styles.quickBtn}
                  onClick={() => {
                    setHours(0);
                    setMinutes(5);
                    setSeconds(0);
                  }}
                >
                  5 min
                </button>
                <button
                  type="button"
                  className={styles.quickBtn}
                  onClick={() => {
                    setHours(0);
                    setMinutes(15);
                    setSeconds(0);
                  }}
                >
                  15 min
                </button>
                <button
                  type="button"
                  className={styles.quickBtn}
                  onClick={() => {
                    setHours(0);
                    setMinutes(30);
                    setSeconds(0);
                  }}
                >
                  30 min
                </button>
                <button
                  type="button"
                  className={styles.quickBtn}
                  onClick={() => {
                    setHours(1);
                    setMinutes(0);
                    setSeconds(0);
                  }}
                >
                  1 hr
                </button>
                <button
                  type="button"
                  className={styles.quickBtn}
                  onClick={() => {
                    setHours(2);
                    setMinutes(0);
                    setSeconds(0);
                  }}
                >
                  2 hr
                </button>
              </div>
            )}

            <div className={styles.circleWrapper}>
              <div className={styles.circleOuter}>
                <svg className={styles.circleSvg} viewBox="0 0 240 240">
                  <circle className={styles.circleTrack} cx="120" cy="120" r={circleRadius} />
                  <circle
                    className={styles.circleProgress}
                    cx="120"
                    cy="120"
                    r={circleRadius}
                    strokeDasharray={circleCircumference}
                    strokeDashoffset={dashOffset}
                  />
                </svg>
                <div className={styles.circleInner}>
                  <span className={styles.remainingTime}>
                    {pad2(displayH)}:{pad2(displayM)}:{pad2(displayS)}
                  </span>
                  <div className={styles.remainingUnitRow}>
                    <span>Hrs</span>
                    <span>Min</span>
                    <span>Sec</span>
                  </div>
                  {isOvertime && (
                    <span className={styles.overtimeBadge}>Overtime {overtimeLabel}</span>
                  )}
                </div>
              </div>
            </div>

            {error && <p className={styles.errorText}>{error}</p>}

            {isIdle && (
              <div className={styles.circleControls}>
                <button
                  type="button"
                  className={styles.circleCtrlBtn}
                  onClick={handleTogglePlay}
                  disabled={!canStart}
                  aria-label="Start"
                >
                  <PlayIcon size={ICON_SIZE} />
                </button>
              </div>
            )}

            {!isIdle && (
              <div className={styles.circleControls}>
                <button
                  type="button"
                  className={styles.circleCtrlBtn}
                  onClick={handleTogglePlay}
                  disabled={submitting}
                  aria-label="Play/Pause"
                >
                  {primaryIcon}
                </button>
                <button
                  type="button"
                  className={styles.circleCtrlBtn}
                  onClick={handleStop}
                  disabled={!isActive || submitting}
                  aria-label="Stop"
                >
                  <StopIcon size={ICON_SIZE} />
                </button>
                <button
                  type="button"
                  className={styles.circleCtrlBtn}
                  onClick={handleReset}
                  disabled={submitting}
                  aria-label="Reset"
                >
                  <ResetIcon size={ICON_SIZE} />
                </button>
              </div>
            )}

            <div className={styles.footer}>
              <button type="button" className={styles.okBtn} onClick={() => setOpen(false)}>
                OK
              </button>
            </div>
          </dialog>
        </div>
      )}
    </>
  );
}

TaskTimer.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      _id: PropTypes.string,
      course_name: PropTypes.string,
      title: PropTypes.string,
      status: PropTypes.string,
    }),
  ),
};

TaskTimer.defaultProps = {
  tasks: [],
};
