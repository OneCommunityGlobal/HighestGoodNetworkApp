import React from 'react';
import { toISO, eachDay } from './bookingApi';
import './booking.css';

export default function DateRangePicker({ checkIn, checkOut, onChange, minDate, maxDate, error }) {
  const todayISO = toISO(new Date());
  const min = minDate ? toISO(minDate) : todayISO;

  const conflict = checkIn && checkOut && eachDay(checkIn, checkOut).some(d => UNAVAILABLE.has(d));

  return (
    <div className="booking-card">
      <h3 className="booking-h3">Select Dates</h3>
      <div className="date-grid">
        <label className="date-field">
          <span>Check-in</span>
          <input
            type="date"
            value={checkIn || ''}
            min={min}
            max={maxDate ? toISO(maxDate) : undefined}
            onChange={e => onChange({ checkIn: e.target.value, checkOut })}
          />
        </label>

        <label className="date-field">
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

      <div className="muted">Unavailable: {Array.from(UNAVAILABLE).join(', ')}</div>

      {(error || conflict) && (
        <div className="error-text">{error || 'Your date range includes an unavailable day.'}</div>
      )}
    </div>
  );
}
