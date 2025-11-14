import React, { useState, useEffect } from "react";
import styles from "./timer.module.css";

import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

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

      console.log("Timer request:", method, url);

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
      console.error("Timer API error:", err);
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
  const isIdleLike = !isActive; 

  let dispH, dispM, dispS;

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

  return (
    <>
      <button className={styles.timerBtn} onClick={() => setOpen(true)}>
        Timer
      </button>

      {open && (
        <div className={styles.backdrop} onClick={() => setOpen(false)}>
          <div className={styles.card} onClick={(e) => e.stopPropagation()}>
            <div className={styles.cardHeader}>
              <span>Enter time</span>
              <button
                className={styles.iconGhost}
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <CloseRoundedIcon fontSize="small" />
              </button>
            </div>

            <div className={styles.timeGrid}>
              {/* Hours */}
              <div className={styles.slot}>
                <button
                  className={styles.stepBtn}
                  onClick={incH}
                  aria-label="Increase hours"
                  disabled={!isIdleLike}
                >
                  <KeyboardArrowUpRoundedIcon fontSize="small" />
                </button>

                <input
                  className={styles.digitBox}
                  value={dispH}
                  onChange={isIdleLike ? onHoursChange : undefined}
                  readOnly={!isIdleLike}
                  inputMode="numeric"
                  aria-label="Hours"
                />

                <button
                  className={styles.stepBtn}
                  onClick={decH}
                  aria-label="Decrease hours"
                  disabled={!isIdleLike}
                >
                  <KeyboardArrowDownRoundedIcon fontSize="small" />
                </button>
              </div>

              <div className={styles.colon}>:</div>

              {/* Minutes */}
              <div className={styles.slot}>
                <button
                  className={styles.stepBtn}
                  onClick={incM}
                  aria-label="Increase minutes"
                  disabled={!isIdleLike}
                >
                  <KeyboardArrowUpRoundedIcon fontSize="small" />
                </button>

                <input
                  className={styles.digitBox}
                  value={dispM}
                  onChange={isIdleLike ? onMinutesChange : undefined}
                  readOnly={!isIdleLike}
                  inputMode="numeric"
                  aria-label="Minutes"
                />

                <button
                  className={styles.stepBtn}
                  onClick={decM}
                  aria-label="Decrease minutes"
                  disabled={!isIdleLike}
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
              <div className={styles.controls}>
                {/* TOGGLE Start / Pause */}
                <button
                  className={styles.ctrlBtn}
                  onClick={handleTogglePlay}
                  disabled={loading}
                  title={primaryLabel}
                >
                  {primaryIcon}
                </button>

                {/* STOP */}
                <button
                  className={styles.ctrlBtn}
                  onClick={handleStop}
                  disabled={loading || !isActive}
                  title="Stop"
                >
                  <StopRoundedIcon fontSize="small" />
                </button>
              </div>

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
