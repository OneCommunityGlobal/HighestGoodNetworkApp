import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AgeChart from './AgeChart';
import fetchApplicantsData from './api';

function ApplicantsDashboard() {
  const [selectedOption, setSelectedOption] = useState('weekly');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [compareLabel, setCompareLabel] = useState('last week');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // dark mode from Redux
  const darkMode = useSelector(state => state.theme.darkMode);

  const handleFilterChange = async (option, start, end) => {
    setLoading(true);
    setError(null);

    // validation for custom dates
    if (option === 'custom') {
      if (!start || !end) {
        setLoading(false);
        return;
      }
      if (start > end) {
        setError('🚨 Start date cannot be after end date.');
        setChartData([]);
        setLoading(false);
        return;
      }
    }

    try {
      const filter = { selectedOption: option, startDate: start, endDate: end };
      const data = await fetchApplicantsData(filter);

      if (!data || data.length === 0) {
        setError('⚠️ No data available for the selected filter.');
        setChartData([]);
      } else {
        setChartData(data);
        setCompareLabel(option === 'custom' ? null : `last ${option.slice(0, -2)}`);
      }
    } catch (err) {
      setError('❌ Failed to load data. Please try again.');
      setChartData([]);
    }

    setLoading(false);
  };

  // initial load
  useEffect(() => {
    handleFilterChange('weekly', null, null);
  }, []);

  return (
    <div
      className={darkMode ? 'bg-oxford-blue text-light' : 'bg-white text-black'}
      style={{
        padding: '20px',
        borderRadius: '8px',
        minHeight: '100vh',
      }}
    >
      {/* Time Filter */}
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
            fontWeight: 600,
            color: darkMode ? '#fff' : '#000',
          }}
        >
          Time Filter:
        </label>

        <select
          id="timeFilterSelect"
          value={selectedOption}
          onChange={e => {
            const val = e.target.value;
            setSelectedOption(val);
            setStartDate(null);
            setEndDate(null);
            handleFilterChange(val, null, null);
          }}
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
              onChange={date => {
                setStartDate(date);
                handleFilterChange('custom', date, endDate);
              }}
              placeholderText="Start Date"
              dateFormat="yyyy/MM/dd"
            />
            <span style={{ color: darkMode ? '#fff' : '#000' }}>to</span>
            <DatePicker
              selected={endDate}
              onChange={date => {
                setEndDate(date);
                handleFilterChange('custom', startDate, date);
              }}
              placeholderText="End Date"
              dateFormat="yyyy/MM/dd"
            />
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex justify-center items-center h-20">
          <p
            style={{
              color: 'red',
              fontSize: '18px',
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            {error}
          </p>
        </div>
      )}

      {/* Chart */}
      {loading ? (
        <div className="flex justify-center items-center h-52">
          <p
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: darkMode ? '#fff' : '#000',
              textAlign: 'center',
            }}
          >
            Loading...
          </p>
        </div>
      ) : !error ? (
        <AgeChart data={chartData} compareLabel={compareLabel} darkMode={darkMode} />
      ) : null}
    </div>
  );
}

export default ApplicantsDashboard;
