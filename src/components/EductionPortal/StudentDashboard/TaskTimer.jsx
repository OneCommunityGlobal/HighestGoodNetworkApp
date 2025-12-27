import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styles from './timer.module.css';

import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AccessAlarmRoundedIcon from '@mui/icons-material/AccessAlarmRounded';

const pad2 = n => String(n).padStart(2, '0');
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const msToHMS = ms => {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return { h, m, s };
};

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')) ||
  'http://localhost:4500';

export default function TaskTimer({ userid }) {
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState(2);
  const [minutes, setMinutes] = useState(0);
  const [timerInfo, setTimerInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [displayRemaining, setDisplayRemaining] = useState(null);

  const darkMode = useSelector(state => state.theme.darkMode);

  const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';

  const incH = () => setHours(h => (h + 1) % 24);
  const decH = () => setHours(h => (h + 23) % 24);
  const incM = () => setMinutes(m => (m + 1) % 60);
  const decM = () => setMinutes(m => (m + 59) % 60);

  const onHoursChange = e => {
    const v = e.target.value.replace(/\D/g, '');
    setHours(clamp(Number(v || 0), 0, 23));
  };

  const onMinutesChange = e => {
    const v = e.target.value.replace(/\D/g, '');
    setMinutes(clamp(Number(v || 0), 0, 59));
  };

  const callTimerApi = async (path, method = 'GET', body = null) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlay = async () => {
    const status = timerInfo?.status || 'idle';

    try {
      if (status === 'running') {
        const res = await callTimerApi('/api/student/timer/pause', 'POST');
        setTimerInfo(res.data);
      } else if (status === 'paused') {
        const res = await callTimerApi('/api/student/timer/resume', 'POST');
        setTimerInfo(res.data);
      } else {
        const res = await callTimerApi('/api/student/timer/start', 'POST', {
          hours,
          minutes,
        });
        setTimerInfo(res.data);
      }
    } catch {}
  };

  const handleStop = async () => {
    try {
      await callTimerApi('/api/student/timer/stop', 'POST');
      setTimerInfo(null);
      setHours(2);
      setMinutes(0);
      setDisplayRemaining(null);
    } catch {}
  };

  const handleReset = async () => {
    try {
      const res = await callTimerApi('/api/student/timer/reset', 'POST');
      setTimerInfo(res.data || null);
    } catch {}

    setHours(2);
    setMinutes(0);
    setDisplayRemaining(null);
  };

  const handleMiniAdjust = deltaMinutes => {
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
  };

  useEffect(() => {
    if (timerInfo?.remainingMs) setDisplayRemaining(timerInfo.remainingMs);
  }, [timerInfo]);

  useEffect(() => {
    if (!timerInfo || timerInfo.status !== 'running' || displayRemaining == null) return;

    const id = setInterval(
      () => setDisplayRemaining(prev => (prev && prev > 1000 ? prev - 1000 : 0)),
      1000,
    );

    return () => clearInterval(id);
  }, [timerInfo, displayRemaining]);

  const currentStatus = timerInfo?.status || 'idle';
  const isRunning = currentStatus === 'running';
  const isActive = currentStatus === 'running' || currentStatus === 'paused';

  const totalMs = timerInfo?.durationMs || (hours * 60 + minutes) * 60 * 1000 || 0;
  const elapsedMs = timerInfo?.elapsedMs || Math.max(0, totalMs - (displayRemaining || 0));

  const progressPct = totalMs ? Math.min(100, (elapsedMs / totalMs) * 100) : 0;

  const primaryIcon =
    currentStatus === 'running' ? (
      <PauseRoundedIcon fontSize="small" />
    ) : (
      <PlayArrowRoundedIcon fontSize="small" />
    );

  return (
    <>
      <div className={`${styles.compactWrapper} ${darkMode ? styles.dark : ''}`}>
        <button className={styles.compactIconBtn} onClick={() => setOpen(true)}>
          <AccessAlarmRoundedIcon fontSize="small" />
        </button>

        <div className={styles.compactBody}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
          </div>
          <div className={styles.timeLabel}>
            {pad2(hours)}:{pad2(minutes)}:00
          </div>
        </div>

        <div className={styles.compactControlsRow}>
          <button
            className={`${styles.compactCtrlBtn} ${styles.compactSmallBtn}`}
            onClick={() => handleMiniAdjust(-15)}
          >
            −
          </button>
          <button
            className={`${styles.compactCtrlBtn} ${styles.compactSmallBtn}`}
            onClick={() => handleMiniAdjust(15)}
          >
            +
          </button>
          <button className={styles.compactCtrlBtn} onClick={handleTogglePlay}>
            {primaryIcon}
          </button>
          <button className={styles.compactCtrlBtn} onClick={handleStop} disabled={!isActive}>
            <StopRoundedIcon fontSize="small" />
          </button>
          <button className={styles.compactCtrlBtn} onClick={handleReset}>
            <RestartAltRoundedIcon fontSize="small" />
          </button>
        </div>
      </div>

      {open && (
        <div className={styles.backdrop} role="button" tabIndex={0} onClick={() => setOpen(false)}>
          <div
            className={`${styles.card} ${darkMode ? styles.darkCard : ''}`}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.cardHeader}>
              <span className={styles.headerTitle}>Timer</span>
              <button className={styles.iconGhost} onClick={() => setOpen(false)}>
                <CloseRoundedIcon fontSize="small" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
