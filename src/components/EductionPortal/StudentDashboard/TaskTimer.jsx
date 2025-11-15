import React, { useState, useEffect } from "react";
import styles from "./timer.module.css";

import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AccessAlarmRoundedIcon from "@mui/icons-material/AccessAlarmRounded";

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL &&
    import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "")) ||
  "http://localhost:4500";

const FALLBACK_USER_ID = "64528f5e9a3b2c0012adbe4f";

export default function TaskTimer() {
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState(2);
  const [minutes, setMinutes] = useState(0);

  const [timerInfo, setTimerInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [displayRemaining, setDisplayRemaining] = useState(null);

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    "";

  const userId =
    localStorage.getItem("userId") ||
    sessionStorage.getItem("userId") ||
    FALLBACK_USER_ID;

  const pad2 = (n) => String(n).padStart(2, "0");
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const incH = () => setHours((h) => (h + 1) % 24);
  const decH = () => setHours((h) => (h + 23) % 24);
  const incM = () => setMinutes((m) => (m + 1) % 60);
  const decM = () => setMinutes((m) => (m + 59) % 60);

  const onHoursChange = (e) => {
    const v = e.target.value.replace(/\D/g, "");
    setHours(clamp(Number(v || 0), 0, 23));
  };

  const onMinutesChange = (e) => {
    const v = e.target.value.replace(/\D/g, "");
    setMinutes(clamp(Number(v || 0), 0, 59));
  };

  const msToHMS = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return { h, m, s };
  };

  const callTimerApi = async (path, method = "GET", body = null) => {
    setLoading(true);
    setError("");

    try {
      const url = `${BASE_URL}${path}`;

      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
          "x-user-id": userId,
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);

      const contentType = response.headers.get("content-type") || "";
      let data = null;

      if (contentType.includes("application/json")) {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } else {
        const text = await response.text();
        data = text ? { message: text } : {};
      }

      if (!response.ok) {
        const msg =
          (data && (data.error || data.message)) ||
          `Request failed with status ${response.status}`;
        throw new Error(msg);
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
    const status = timerInfo?.status || "idle";

    try {
      if (status === "running") {
        const res = await callTimerApi("/api/student/timer/pause", "POST");
        setTimerInfo(res.data);
      } else if (status === "paused") {
        const res = await callTimerApi("/api/student/timer/resume", "POST");
        setTimerInfo(res.data);
      } else {
        const res = await callTimerApi("/api/student/timer/start", "POST", {
          hours,
          minutes,
        });
        setTimerInfo(res.data);
      }
    } catch (_) {}
  };

  const handleStop = async () => {
    try {
      const res = await callTimerApi("/api/student/timer/stop", "POST");
      setTimerInfo(res.data);
    } catch (_) {}
  };

  const adjustTimer = async (deltaMinutes) => {
    try {
      const res = await callTimerApi("/api/student/timer/adjust", "POST", {
        deltaMinutes,
      });
      setTimerInfo(res.data);
    } catch (_) {}
  };

  const fetchStatus = async () => {
    try {
      const res = await callTimerApi("/api/student/timer/status", "GET");
      setTimerInfo(res.data);
    } catch (_) {}
  };

  useEffect(() => {
    if (timerInfo && typeof timerInfo.remainingMs === "number") {
      setDisplayRemaining(timerInfo.remainingMs);
    } else if (timerInfo?.remaining) {
      const { hours: h, minutes: m, seconds: s } = timerInfo.remaining;
      const ms = ((h || 0) * 3600 + (m || 0) * 60 + (s || 0)) * 1000;
      setDisplayRemaining(ms);
    } else {
      setDisplayRemaining(null);
    }
  }, [timerInfo]);

  useEffect(() => {
    if (!timerInfo || timerInfo.status !== "running" || displayRemaining == null) {
      return;
    }

    const id = setInterval(() => {
      setDisplayRemaining((prev) => {
        if (prev == null) return prev;
        const next = prev - 1000;
        return next > 0 ? next : 0;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [timerInfo?.status, displayRemaining]);

  useEffect(() => {
    if (open) {
      fetchStatus();
    }
  }, [open]);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open]);

  const currentStatus = timerInfo?.status || "idle";
  const isActive = currentStatus === "running" || currentStatus === "paused";
  const isEditable =
    !timerInfo ||
    currentStatus === "idle" ||
    currentStatus === "stopped";

  let dispH;
  let dispM;
  let dispS;

  if (isActive && displayRemaining != null) {
    const { h, m, s } = msToHMS(displayRemaining);
    dispH = pad2(h);
    dispM = pad2(m);
    dispS = pad2(s);
  } else {
    dispH = pad2(hours);
    dispM = pad2(minutes);
    dispS = "00";
  }

  const primaryIcon =
    currentStatus === "running" ? (
      <PauseRoundedIcon fontSize="small" />
    ) : (
      <PlayArrowRoundedIcon fontSize="small" />
    );

  const primaryLabel = currentStatus === "running" ? "Pause" : "Start";

  const totalMs =
    timerInfo?.durationMs ||
    ((hours * 60 + minutes) * 60 * 1000 || 0);

  let elapsedMs = 0;
  if (timerInfo?.elapsedMs) {
    elapsedMs = timerInfo.elapsedMs;
  } else if (totalMs && displayRemaining != null) {
    elapsedMs = Math.max(0, totalMs - displayRemaining);
  }

  let remainingMs = displayRemaining ?? 0;
  if (!remainingMs && totalMs && elapsedMs) {
    remainingMs = Math.max(0, totalMs - elapsedMs);
  }

  const goalHMS = msToHMS(totalMs || 0);
  const elapsedHMS = msToHMS(elapsedMs || 0);
  const remainingHMS = msToHMS(remainingMs || 0);

  let progressPct = 0;
  if (totalMs) {
    const frac = elapsedMs / totalMs;
    progressPct = Math.max(0, Math.min(100, frac * 100));
  }

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (circumference * progressPct) / 100;

  return (
    <>
      <div className={styles.compactWrapper}>
        <button
          className={styles.compactIconBtn}
          onClick={() => setOpen(true)}
          aria-label="Open timer"
        >
          <AccessAlarmRoundedIcon fontSize="small" />
        </button>

        <div className={styles.compactBody}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className={styles.compactBottomRow}>
            <div className={styles.timeLabel}>
              {dispH}:{dispM}:{dispS}
            </div>
            <div className={styles.compactControls}>
              <button
                className={styles.compactCtrlBtn}
                onClick={handleTogglePlay}
                disabled={loading}
                title={primaryLabel}
              >
                {primaryIcon}
              </button>
              <button
                className={styles.compactCtrlBtn}
                onClick={handleStop}
                disabled={loading || !isActive}
                title="Stop"
              >
                <StopRoundedIcon fontSize="small" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {open && (
        <div className={styles.backdrop} onClick={() => setOpen(false)}>
          <div className={styles.card} onClick={(e) => e.stopPropagation()}>
            <div className={styles.cardHeader}>
              <span className={styles.headerTitle}>Timer</span>
              <button
                className={styles.iconGhost}
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <CloseRoundedIcon fontSize="small" />
              </button>
            </div>

            <div className={styles.circleWrapper}>
              <div className={styles.goalText}>
                Goal: {pad2(goalHMS.h)}:{pad2(goalHMS.m)}:{pad2(goalHMS.s)}
              </div>
              <div className={styles.elapsedText}>
                Elapsed: {pad2(elapsedHMS.h)}:{pad2(elapsedHMS.m)}:
                {pad2(elapsedHMS.s)}
              </div>

              <div className={styles.circleOuter}>
                <svg
                  className={styles.circleSvg}
                  viewBox="0 0 220 220"
                >
                  <circle
                    className={styles.circleTrack}
                    cx="110"
                    cy="110"
                    r={radius}
                  />
                  <circle
                    className={styles.circleProgress}
                    cx="110"
                    cy="110"
                    r={radius}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>

                <div className={styles.circleInner}>
                  <div className={styles.remainingWrapper}>
                    <div className={styles.remainingLabel}>
                      Time Remaining
                    </div>
                    <div className={styles.remainingTime}>
                      {pad2(remainingHMS.h)}:{pad2(remainingHMS.m)}:
                      {pad2(remainingHMS.s)}
                    </div>
                    <div className={styles.remainingUnitRow}>
                      <span>HOURS</span>
                      <span>MINUTES</span>
                      <span>SECONDS</span>
                    </div>
                  </div>

                  <div className={styles.circleControls}>
                    <button
                      className={styles.circleCtrlBtn}
                      onClick={handleTogglePlay}
                      disabled={loading}
                      title={primaryLabel}
                    >
                      {primaryIcon}
                    </button>
                    <button
                      className={styles.circleCtrlBtn}
                      onClick={handleStop}
                      disabled={loading || !isActive}
                      title="Stop"
                    >
                      <StopRoundedIcon />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.quickRow}>
              <button
                className={styles.quickBtn}
                onClick={() => adjustTimer(-15)}
                disabled={loading || !isActive}
              >
                -15 m
              </button>
              <button
                className={styles.quickBtn}
                onClick={() => adjustTimer(15)}
                disabled={loading || !isActive}
              >
                +15 m
              </button>
              <button
                className={styles.quickBtn}
                onClick={() => adjustTimer(30)}
                disabled={loading || !isActive}
              >
                +30 m
              </button>
              <button
                className={styles.quickBtn}
                onClick={() => adjustTimer(60)}
                disabled={loading || !isActive}
              >
                +1 h
              </button>
            </div>

            <div className={styles.timeGrid}>
              <div className={styles.slot}>
                <button
                  className={styles.stepBtn}
                  onClick={incH}
                  aria-label="Increase hours"
                  disabled={!isEditable}
                >
                  <KeyboardArrowUpRoundedIcon fontSize="small" />
                </button>

                <input
                  className={styles.digitBox}
                  value={pad2(hours)}
                  onChange={isEditable ? onHoursChange : undefined}
                  readOnly={!isEditable}
                  inputMode="numeric"
                  aria-label="Hours"
                />

                <button
                  className={styles.stepBtn}
                  onClick={decH}
                  aria-label="Decrease hours"
                  disabled={!isEditable}
                >
                  <KeyboardArrowDownRoundedIcon fontSize="small" />
                </button>
              </div>

              <div className={styles.colon}>:</div>

              <div className={styles.slot}>
                <button
                  className={styles.stepBtn}
                  onClick={incM}
                  aria-label="Increase minutes"
                  disabled={!isEditable}
                >
                  <KeyboardArrowUpRoundedIcon fontSize="small" />
                </button>

                <input
                  className={styles.digitBox}
                  value={pad2(minutes)}
                  onChange={isEditable ? onMinutesChange : undefined}
                  readOnly={!isEditable}
                  inputMode="numeric"
                  aria-label="Minutes"
                />

                <button
                  className={styles.stepBtn}
                  onClick={decM}
                  aria-label="Decrease minutes"
                  disabled={!isEditable}
                >
                  <KeyboardArrowDownRoundedIcon fontSize="small" />
                </button>
              </div>

              <div className={styles.colon}>:</div>

              <div className={styles.slot}>
                <div className={styles.stepBtn} aria-hidden="true" />
                <input
                  className={styles.digitBox}
                  value={dispS}
                  readOnly
                  aria-label="Seconds"
                />
                <div className={styles.stepBtn} aria-hidden="true" />
              </div>
            </div>

            {error && (
              <div className={styles.errorRow}>
                <span className={styles.errorText}>{error}</span>
              </div>
            )}

            <div className={styles.footer}>
              <button className={styles.okBtn} onClick={() => setOpen(false)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
