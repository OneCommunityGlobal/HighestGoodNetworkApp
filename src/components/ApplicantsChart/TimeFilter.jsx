import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function TimeFilter({ onFilterChange, darkMode }) {
  const [selectedOption, setSelectedOption] = useState('weekly');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    onFilterChange({ selectedOption, startDate, endDate });
  }, [selectedOption, startDate, endDate]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        margin: '20px auto',
        flexWrap: 'wrap',
      }}
    >
      <label
        htmlFor="timeFilterSelect"
        style={{
          fontWeight: 500,
          color: darkMode ? '#ffffff' : '#222e3c',
          fontSize: '18px',
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
            style={{ marginRight: '10px' }}
          />
          <span>to</span>
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)}
            placeholderText="End Date"
            dateFormat="yyyy/MM/dd"
          />
        </>
      )}
    </div>
  );
}

export default TimeFilter;
