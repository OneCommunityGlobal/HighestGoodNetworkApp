import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './ApplicationChart.module.css';

function TimeFilter({ onFilterChange }) {
  const [selectedOption, setSelectedOption] = useState('weekly');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    onFilterChange({ selectedOption, startDate, endDate });
  }, [selectedOption, startDate, endDate]);

  return (
    <div className={`${styles.TimeFilter}`}>
      <label htmlFor="timeFilterSelect">Time Filter:</label>
      <select
        id="timeFilterSelect"
        value={selectedOption}
        onChange={e => setSelectedOption(e.target.value)}
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
