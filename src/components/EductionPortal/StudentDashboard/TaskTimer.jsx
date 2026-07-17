import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import styles from './timer.module.css';

import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AccessAlarmRoundedIcon from '@mui/icons-material/AccessAlarmRounded';

const pad2 = n => String(n).padStart(2, '0');

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:4500';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export default function TaskTimer({ userid }) {
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState(2);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [timerInfo, setTimerInfo] = useState(null);
  const [error, setError] = useState('');
  const [displayRemaining, setDisplayRemaining] = useState(null);

  const darkMode = useSelector(state => state.theme.darkMode);

  const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';

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

  const callTimerApi = useCallback(
    async (path, method = 'GET', body = null) => {
      setError('');

      try {
        const url = `${BASE_URL}${path}`;
        const options = {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
            'x-user-id': userid,
          },
        };

        if (body) options.body = JSON.stringify(body);

        const response = await fetch(url, options);
        const contentType = response.headers.get('content-type') || '';
        const text = await response.text();
        const data = contentType.includes('application/json') && text ? JSON.parse(text) : {};

        if (!response.ok) {
          throw new Error(data.error || data.message || 'Request failed');
        }

        return data;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [token, userid],
  );

  const handleTogglePlay = useCallback(async () => {
    const status = timerInfo?.status || 'idle';

    try {
      if (status === 'running') {
        const res = await callTimerApi('/api/student/timer/pause', 'POST');
        setTimerInfo(res.data);
      } else if (status === 'paused') {
        const res = await callTimerApi('/api/student/timer/resume', 'POST');
        setTimerInfo(res.data);
      } else {
        const totalMinutes = hours * 60 + minutes + (seconds > 0 ? 1 : 0);
        const res = await callTimerApi('/api/student/timer/start', 'POST', {
          hours,
          minutes: totalMinutes,
        });
        setTimerInfo(res.data);
      }
    } catch {
      setError('Failed to toggle timer');
    }
  }, [timerInfo, callTimerApi, hours, minutes, seconds]);

  const handleStop = useCallback(async () => {
    try {
      await callTimerApi('/api/student/timer/stop', 'POST');
      setTimerInfo(null);
      setHours(2);
      setMinutes(0);
      setSeconds(0);
      setDisplayRemaining(null);
    } catch {
      setError('Failed to stop timer');
    }
  }, [callTimerApi]);

  const handleReset = useCallback(async () => {
    try {
      const res = await callTimerApi('/api/student/timer/reset', 'POST');
      setTimerInfo(res.data || null);
    } catch {
      setError('Failed to reset timer');
    }

    setHours(2);
    setMinutes(0);
    setSeconds(0);
    setDisplayRemaining(null);
  }, [callTimerApi]);

  const handleMiniAdjust = useCallback(
    deltaMinutes => {
      if (timerInfo && (timerInfo.status === 'running' || timerInfo.status === 'paused')) {
        callTimerApi('/api/student/timer/adjust', 'POST', { deltaMinutes }).then(res =>
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

  useEffect(() => {
    if (timerInfo?.remainingMs) setDisplayRemaining(timerInfo.remainingMs);
  }, [timerInfo]);

  useEffect(() => {
    if (timerInfo?.status !== 'running' || displayRemaining == null) return;

    const id = setInterval(
      () => setDisplayRemaining(prev => (prev && prev > 1000 ? prev - 1000 : 0)),
      1000,
    );

    return () => clearInterval(id);
  }, [timerInfo, displayRemaining]);

  const currentStatus = timerInfo?.status || 'idle';
  const isActive = currentStatus === 'running' || currentStatus === 'paused';

  const totalMs =
    timerInfo?.durationMs || (hours * 60 + minutes + (seconds > 0 ? 1 : 0)) * 60 * 1000 || 0;
  const elapsedMs = timerInfo?.elapsedMs || Math.max(0, totalMs - (displayRemaining || 0));

  const progressPct = totalMs ? Math.min(100, (elapsedMs / totalMs) * 100) : 0;

  const displayH = displayRemaining != null ? Math.floor(displayRemaining / 3600000) : hours;
  const displayM =
    displayRemaining != null ? Math.floor((displayRemaining % 3600000) / 60000) : minutes;
  const displayS =
    displayRemaining != null ? Math.floor((displayRemaining % 60000) / 1000) : seconds;

  const primaryIcon =
    currentStatus === 'running' ? (
      <PauseRoundedIcon fontSize="small" />
    ) : (
      <PlayArrowRoundedIcon fontSize="small" />
    );

  const circleRadius = 105;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const dashOffset = circleCircumference * (1 - progressPct / 100);

  const isIdle = currentStatus === 'idle';

  return (
    <>
      <div className={`${styles.compactWrapper} ${darkMode ? styles.dark : ''}`}>
        <button type="button" className={styles.compactIconBtn} onClick={() => setOpen(true)}>
          <AccessAlarmRoundedIcon fontSize="small" />
        </button>

        <div className={styles.compactBody}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
          </div>
          <div className={styles.timeLabel}>
            {pad2(displayH)}:{pad2(displayM)}:{pad2(displayS)}
          </div>
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
            aria-label="Play/Pause"
          >
            {primaryIcon}
          </button>
          <button
            type="button"
            className={styles.compactCtrlBtn}
            onClick={handleStop}
            disabled={!isActive}
            aria-label="Stop"
          >
            <StopRoundedIcon fontSize="small" />
          </button>
          <button
            type="button"
            className={styles.compactCtrlBtn}
            onClick={handleReset}
            aria-label="Reset"
          >
            <RestartAltRoundedIcon fontSize="small" />
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
                <CloseRoundedIcon fontSize="small" />
              </button>
            </div>

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
                </div>
              </div>
            </div>

            {error && <p className={styles.errorText}>{error}</p>}

            {!isIdle && (
              <div className={styles.circleControls}>
                <button
                  type="button"
                  className={styles.circleCtrlBtn}
                  onClick={handleTogglePlay}
                  aria-label="Play/Pause"
                >
                  {primaryIcon}
                </button>
                <button
                  type="button"
                  className={styles.circleCtrlBtn}
                  onClick={handleStop}
                  disabled={!isActive}
                  aria-label="Stop"
                >
                  <StopRoundedIcon fontSize="small" />
                </button>
                <button
                  type="button"
                  className={styles.circleCtrlBtn}
                  onClick={handleReset}
                  aria-label="Reset"
                >
                  <RestartAltRoundedIcon fontSize="small" />
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
