import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { logStudentTaskHours } from '../../../actions/studentTasks';
import styles from './HoursLogPanel.module.css';

const HoursLogPanel = ({ task, darkMode, onClose }) => {
  const dispatch = useDispatch();
  const [inputHours, setInputHours] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const logged = task.logged_hours ?? 0;
  const total = task.suggested_total_hours ?? 0;
  const progressPercent = total > 0 ? Math.min(Math.round((logged / total) * 100), 100) : 0;

  const handleDecrement = () => setInputHours(prev => Math.max(0.5, +(prev - 0.5).toFixed(1)));
  const handleIncrement = () => setInputHours(prev => +(prev + 0.5).toFixed(1));

  const handleSubmit = async e => {
    e.preventDefault();
    if (inputHours <= 0) return;
    setSubmitting(true);
    await dispatch(logStudentTaskHours(task.id || task._id, inputHours));
    setSubmitting(false);
    setInputHours(1);
  };

  return (
    <div
      className={`${styles.panel} ${darkMode ? styles.panelDark : ''}`}
      role="dialog"
      aria-label="Log hours panel"
    >
      <div className={styles.header}>
        <h4 className={styles.title}>Log Hours</h4>
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close hours panel"
        >
          ×
        </button>
      </div>

      {/* Real-time progress indicator */}
      <div className={styles.progressSection}>
        <div className={styles.progressLabel}>
          <span>
            {logged} / {total > 0 ? total : '—'} hrs
          </span>
          {total > 0 && <span>{progressPercent}%</span>}
        </div>
        {total > 0 && (
          <div
            className={styles.progressBar}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={`${styles.progressFill} ${
                progressPercent >= 100 ? styles.progressComplete : ''
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
        {progressPercent >= 100 && <p className={styles.eligibleMsg}>✓ Eligible to mark as done</p>}
      </div>

      {/* Hours input */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputRow}>
          <button
            type="button"
            className={styles.stepBtn}
            onClick={handleDecrement}
            aria-label="Decrease hours"
          >
            −
          </button>
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={inputHours}
            onChange={e => setInputHours(Math.max(0.5, Number(e.target.value)))}
            className={`${styles.hoursInput} ${darkMode ? styles.hoursInputDark : ''}`}
            aria-label="Hours to log"
          />
          <button
            type="button"
            className={styles.stepBtn}
            onClick={handleIncrement}
            aria-label="Increase hours"
          >
            +
          </button>
        </div>
        <button type="submit" className={styles.submitBtn} disabled={submitting || inputHours <= 0}>
          {submitting ? 'Saving…' : 'Log Hours'}
        </button>
      </form>
    </div>
  );
};

HoursLogPanel.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    _id: PropTypes.string,
    logged_hours: PropTypes.number,
    suggested_total_hours: PropTypes.number,
  }).isRequired,
  darkMode: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

HoursLogPanel.defaultProps = {
  darkMode: false,
};

export default HoursLogPanel;
