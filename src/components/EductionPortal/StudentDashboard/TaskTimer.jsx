import React, { useState, useEffect } from "react";
import styles from "./timer.module.css";

export default function TaskTimer() {
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const pad2 = (n) => String(n).padStart(2, "0");

  const incH = () => setHours((h) => (h + 1) % 24);
  const decH = () => setHours((h) => (h + 23) % 24);
  const incM = () => setMinutes((m) => (m + 5) % 60);
  const decM = () => setMinutes((m) => (m + 55) % 60);

  const handleStart = () => {
    const totalMs = (hours * 60 + minutes) * 60 * 1000;

    console.log("Timer started with:", {
      hours,
      minutes,
      totalMs
    });

    setOpen(false);
  };

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open]);

  const onHoursChange = (e) => {
    const v = e.target.value.replace(/\D/g, "");
    setHours(clamp(Number(v || 0), 0, 23));
  };

  const onMinutesChange = (e) => {
    const v = e.target.value.replace(/\D/g, "");
    setMinutes(clamp(Number(v || 0), 0, 59));
  };

  return (
    <>
      <button className={styles.timerBtn} onClick={() => setOpen(true)}>
        Timer
      </button>

      {open && (
        <div className={styles.backdrop} onClick={() => setOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.header}>
              <span>Enter time</span>
              <button className={styles.iconBtn} onClick={() => setOpen(false)}>Close</button>
            </div>

            <div className={styles.clockRow}>
              <div className={styles.col}>
                <button className={styles.step} onClick={incH}>▲</button>
                <input
                  className={styles.timeInput}
                  value={pad2(hours)}
                  onChange={onHoursChange}
                  inputMode="numeric"
                />
                <button className={styles.step} onClick={decH}>▼</button>
                <div className={styles.label}>Hour</div>
              </div>

              <div className={styles.sep}>:</div>

              <div className={styles.col}>
                <button className={styles.step} onClick={incM}>higher</button>
                <input
                  className={styles.timeInput}
                  value={pad2(minutes)}
                  onChange={onMinutesChange}
                  inputMode="numeric"
                />
                <button className={styles.step} onClick={decM}>Lower</button>
                <div className={styles.label}>Minute</div>
              </div>
            </div>

            <div className={styles.actions}>
              <button className={styles.secondary} onClick={() => setOpen(false)}>Cancel</button>
              <button className={styles.primary} onClick={handleStart}>Start</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
