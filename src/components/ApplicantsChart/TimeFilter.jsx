import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function TimeFilter({ onFilterChange, darkMode }) {
  const [selectedOption, setSelectedOption] = useState('weekly');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedOption === 'custom' && startDate && endDate) {
      if (startDate > endDate) {
        setError('🚨 Start date cannot be after end date.');
        return;
      } else {
        setError('');
      }
    } else {
      setError('');
    }

    onFilterChange({ selectedOption, startDate, endDate, error: '' });
  }, [selectedOption, startDate, endDate]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        margin: '20px auto',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <label
          htmlFor="timeFilterSelect"
          style={{
            fontWeight: 600,
            color: darkMode ? '#fff' : '#000',
          }}
        >
          Time Filter:
        </label>

        <select
          id="timeFilterSelect"
          value={selectedOption}
          onChange={e => setSelectedOption(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '14px',
          }}
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
          <option value="custom">Custom Dates</option>
        </select>

        {selectedOption === 'custom' && (
          <>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              placeholderText="Start Date"
              dateFormat="yyyy/MM/dd"
            />
            <span style={{ color: darkMode ? '#fff' : '#000' }}>to</span>
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              placeholderText="End Date"
              dateFormat="yyyy/MM/dd"
            />
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p
          style={{
            color: 'red',
            fontSize: '18px',
            fontWeight: '600',
            textAlign: 'center',
            marginTop: '8px',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default TimeFilter;
