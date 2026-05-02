import React from 'react';
import { toISO, eachDay } from './bookingApi';
import styles from './booking.module.css';

export default function DateRangePicker({ checkIn, checkOut, onChange, minDate, maxDate, error }) {
  const todayISO = toISO(new Date());
  const min = minDate ? toISO(minDate) : todayISO;

  const conflict = checkIn && checkOut && eachDay(checkIn, checkOut).some(d => UNAVAILABLE.has(d));

  return (
    <div className={styles.bookingCard}>
      <h3 className={styles.bookingH3}>Select Dates</h3>
      <div className={styles.dateGrid}>
        <label className={styles.dateField}>
          <span>Check-in</span>
          <input
            type="date"
            value={checkIn || ''}
            min={min}
            max={maxDate ? toISO(maxDate) : undefined}
            onChange={e => onChange({ checkIn: e.target.value, checkOut })}
          />
        </label>

        <label className={styles.dateField}>
          <span>Check-out</span>
          <input
            type="date"
            value={checkOut || ''}
            min={checkIn || min}
            max={maxDate ? toISO(maxDate) : undefined}
            onChange={e => onChange({ checkIn, checkOut: e.target.value })}
          />
        </label>
      </div>

      <div className={styles.muted}>Unavailable: {Array.from(UNAVAILABLE).join(', ')}</div>

      {(error || conflict) && (
        <div className={styles.errorText}>
          {error || 'Your date range includes an unavailable day.'}
        </div>
      )}
    </div>
  );
}
