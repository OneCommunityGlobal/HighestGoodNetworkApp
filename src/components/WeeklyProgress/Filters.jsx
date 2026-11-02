import React from 'react';
import styles from './WeeklyProgress.module.css';

const Filters = ({ startDate, endDate, weeks, onDateChange, onPresetRange, rangeError }) => {
  const handleStartChange = e => {
    onDateChange({ start: e.target.value || '' });
  };

  const handleEndChange = e => {
    onDateChange({ end: e.target.value || '' });
  };

  const presetOptions = [
    { label: 'Last 4 Weeks', value: 4 },
    { label: 'Last 8 Weeks', value: 8 },
    { label: 'Last 12 Weeks', value: 12 },
  ];

  return (
    <div className={styles.filters}>
      <div className={styles.dateRow}>
        <div className={styles.dateField}>
          <label htmlFor="weekly-progress-start">Start date</label>
          <input
            id="weekly-progress-start"
            type="date"
            value={startDate || ''}
            onChange={handleStartChange}
          />
        </div>

        <div className={styles.dateField}>
          <label htmlFor="weekly-progress-end">End date</label>
          <input
            id="weekly-progress-end"
            type="date"
            value={endDate || ''}
            onChange={handleEndChange}
          />
        </div>
      </div>

      <div className={styles.presetRow}>
        {presetOptions.map(opt => (
          <button
            key={opt.value}
            type="button"
            className={`${styles.presetButton} ${
              weeks === opt.value ? styles.presetButtonActive : ''
            }`}
            onClick={() => onPresetRange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {rangeError && <p className={styles.rangeError}>{rangeError}</p>}
    </div>
  );
};

export default Filters;
