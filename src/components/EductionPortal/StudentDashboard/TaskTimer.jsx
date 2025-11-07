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
    const v = e.target.value.replace(/\D/g, ""
    );
    setMinutes(clamp(Number(v || 0), 0, 59));
  };

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open]);

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
                title="Close"
              >
                <CloseRoundedIcon fontSize="small" />
              </button>
            </div>

            <div className={styles.timeGrid}>
              <div className={styles.slot}>
                <button className={styles.stepBtn} onClick={incH} aria-label="Increase hours" title="Increase hours">
                  <KeyboardArrowUpRoundedIcon fontSize="small" />
                </button>
                <input
                  className={styles.digitBox}
                  value={pad2(hours)}
                  onChange={onHoursChange}
                  inputMode="numeric"
                  aria-label="Hours"
                />
                <button className={styles.stepBtn} onClick={decH} aria-label="Decrease hours" title="Decrease hours">
                  <KeyboardArrowDownRoundedIcon fontSize="small" />
                </button>
              </div>

              <div className={styles.colon}>:</div>

              <div className={styles.slot}>
                <button className={styles.stepBtn} onClick={incM} aria-label="Increase minutes" title="Increase minutes">
                  <KeyboardArrowUpRoundedIcon fontSize="small" />
                </button>
                <input
                  className={styles.digitBox}
                  value={pad2(minutes)}
                  onChange={onMinutesChange}
                  inputMode="numeric"
                  aria-label="Minutes"
                />
                <button className={styles.stepBtn} onClick={decM} aria-label="Decrease minutes" title="Decrease minutes">
                  <KeyboardArrowDownRoundedIcon fontSize="small" />
                </button>
              </div>
            </div>

            <div className={styles.footer}>
              <div className={styles.controls}>
                <button className={styles.ctrlBtn} title="Play">
                  <PlayArrowRoundedIcon fontSize="small" />
                </button>
                <button className={styles.ctrlBtn} title="Pause">
                  <PauseRoundedIcon fontSize="small" />
                </button>
                <button className={styles.ctrlBtn} title="Stop">
                  <StopRoundedIcon fontSize="small" />
                </button>
              </div>
              <button className={styles.okBtn} onClick={() => setOpen(false)}>OK</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
