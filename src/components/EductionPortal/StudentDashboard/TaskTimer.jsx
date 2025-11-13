import React, { useState, useEffect } from "react";
import styles from "./timer.module.css";

import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

export default function TaskTimer() {
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState(2);
  const [minutes, setMinutes] = useState(0);

  const [timerInfo, setTimerInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    "";

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

  const callTimerApi = async (path, method = "GET", body = null) => {
    setLoading(true);
    setError("");

    try {
      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`, 
        },
      };

      if (body) options.body = JSON.stringify(body);

      const response = await fetch(`/api/student${path}`, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Timer API request failed");
      }

      return data; // { ok: true, data }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = async () => {
    try {
      if (timerInfo?.status === "paused") {
        const res = await callTimerApi("/timer/resume", "POST");
        setTimerInfo(res.data);
      } else {
        const res = await callTimerApi("/timer/start", "POST", {
          hours,
          minutes,
        });
        setTimerInfo(res.data);
      }
    } catch (err) {}
  };

  const handlePause = async () => {
    try {
      const res = await callTimerApi("/timer/pause", "POST");
      setTimerInfo(res.data);
    } catch (err) {}
  };

  const handleStop = async () => {
    try {
      const res = await callTimerApi("/timer/stop", "POST");
      setTimerInfo(res.data);
    } catch (err) {}
  };

  const fetchStatus = async () => {
    try {
      const res = await callTimerApi("/timer/status", "GET");
      setTimerInfo(res.data);
    } catch (err) {}
  };

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
              >
                <CloseRoundedIcon fontSize="small" />
              </button>
            </div>

            <div className={styles.timeGrid}>
              {/* Hours */}
              <div className={styles.slot}>
                <button className={styles.stepBtn} onClick={incH}>
                  <KeyboardArrowUpRoundedIcon fontSize="small" />
                </button>

                <input
                  className={styles.digitBox}
                  value={pad2(hours)}
                  onChange={onHoursChange}
                  inputMode="numeric"
                />

                <button className={styles.stepBtn} onClick={decH}>
                  <KeyboardArrowDownRoundedIcon fontSize="small" />
                </button>
              </div>

              <div className={styles.colon}>:</div>

              {/* Minutes */}
              <div className={styles.slot}>
                <button className={styles.stepBtn} onClick={incM}>
                  <KeyboardArrowUpRoundedIcon fontSize="small" />
                </button>

                <input
                  className={styles.digitBox}
                  value={pad2(minutes)}
                  onChange={onMinutesChange}
                  inputMode="numeric"
                />

                <button className={styles.stepBtn} onClick={decM}>
                  <KeyboardArrowDownRoundedIcon fontSize="small" />
                </button>
              </div>
            </div>

            {/* Status + Error */}
            <div className={styles.statusRow}>
              <span className={styles.statusText}>
                Status: {loading ? "loading..." : currentStatus}
              </span>

              {timerInfo?.remaining && (
                <span className={styles.statusText}>
                  Remaining: {pad2(timerInfo.remaining.hours)}:
                  {pad2(timerInfo.remaining.minutes)}:
                  {pad2(timerInfo.remaining.seconds)}
                </span>
              )}

              {error && <span className={styles.errorText}>{error}</span>}
            </div>

            {/* Controls */}
            <div className={styles.footer}>
              <div className={styles.controls}>
                <button
                  className={styles.ctrlBtn}
                  onClick={handlePlay}
                  disabled={loading}
                >
                  <PlayArrowRoundedIcon fontSize="small" />
                </button>

                <button
                  className={styles.ctrlBtn}
                  onClick={handlePause}
                  disabled={loading || currentStatus !== "running"}
                >
                  <PauseRoundedIcon fontSize="small" />
                </button>

                <button
                  className={styles.ctrlBtn}
                  onClick={handleStop}
                  disabled={loading || currentStatus === "idle"}
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
