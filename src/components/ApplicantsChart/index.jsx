import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AgeChart from './AgeChart';
import fetchApplicantsData from './api';
import styles from './ApplicantsChart.module.css';

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

  // Extract validation logic
  const validateCustomDates = (start, end) => {
    if (!start || !end) {
      return { valid: false, error: null };
    }
    if (start > end) {
      return { valid: false, error: '🚨 Start date cannot be after end date.' };
    }
    return { valid: true, error: null };
  };

  // Extract data fetching logic
  const fetchData = async (option, start, end) => {
    try {
      const filter = { selectedOption: option, startDate: start, endDate: end };
      const data = await fetchApplicantsData(filter);

      if (!data || data.length === 0) {
        setError('⚠️ No data available for the selected filter.');
        setChartData([]);
        return;
      }

      setChartData(data);
      const label = option === 'custom' ? null : `last ${option.slice(0, -2)}`;
      setCompareLabel(label);
      setError(null);
    } catch (err) {
      // Handle exception properly
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      // eslint-disable-next-line no-console
      console.error('Failed to fetch applicants data:', errorMessage);
      setError('❌ Failed to load data. Please try again.');
      setChartData([]);
    }
  };

  const handleFilterChange = async (option, start, end) => {
    setLoading(true);
    setError(null);

    // validation for custom dates
    if (option === 'custom') {
      const validation = validateCustomDates(start, end);
      if (!validation.valid) {
        if (validation.error) {
          setError(validation.error);
          setChartData([]);
        }
        setLoading(false);
        return;
      }
    }

    await fetchData(option, start, end);
    setLoading(false);
  };

  // Extract chart content rendering
  const renderChartContent = () => {
    if (loading) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 'calc(100vh - 150px)',
            minHeight: '600px',
            width: '100%',
            backgroundColor: darkMode ? '#1b2a41' : '#fff',
          }}
        >
          <p
            style={{
              fontSize: 'clamp(18px, 2.5vw, 24px)',
              fontWeight: 'bold',
              color: darkMode ? '#e5e7eb' : '#000',
              textAlign: 'center',
            }}
          >
            Loading...
          </p>
        </div>
      );
    }

    const hasData = !error && chartData.length > 0;
    if (hasData) {
      return <AgeChart data={chartData} compareLabel={compareLabel} darkMode={darkMode} />;
    }

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 150px)',
          minHeight: '600px',
          width: '100%',
          backgroundColor: darkMode ? '#1b2a41' : '#fff',
        }}
      >
        <p
          style={{
            fontSize: 'clamp(16px, 2.5vw, 18px)',
            fontWeight: '600',
            color: darkMode ? '#9ca3af' : '#6b7280',
            textAlign: 'center',
          }}
        >
          {error ? 'Unable to load chart data.' : 'No data available to display.'}
        </p>
      </div>
    );
  };

  // Extract date picker styles
  const getDatePickerStyles = () => ({
    backgroundColor: darkMode ? '#1f2937' : '#fff',
    color: darkMode ? '#e5e7eb' : '#000',
    border: `1px solid ${darkMode ? '#374151' : '#ccc'}`,
    borderRadius: darkMode ? '0' : '4px',
    padding: '6px 12px',
    fontSize: '14px',
    cursor: 'pointer',
  });

  // initial load
  useEffect(() => {
    handleFilterChange('weekly', null, null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={darkMode ? 'bg-oxford-blue text-light' : 'bg-white text-black'}
      style={{
        padding: 'clamp(10px, 2vw, 20px)',
        paddingBottom: 'clamp(10px, 1.5vw, 15px)',
        borderRadius: darkMode ? '0' : '8px',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Time Filter */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 'clamp(8px, 2vw, 16px)',
          margin: 'clamp(10px, 2vw, 20px) auto',
          flexWrap: 'wrap',
          width: '100%',
          maxWidth: '100%',
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
            borderRadius: darkMode ? '0' : '4px',
            border: `1px solid ${darkMode ? '#374151' : '#ccc'}`,
            backgroundColor: darkMode ? '#1f2937' : '#fff',
            color: darkMode ? '#e5e7eb' : '#000',
            fontSize: '14px',
            cursor: 'pointer',
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
              className={darkMode ? 'hgn-datepicker-dark' : ''}
              calendarClassName={darkMode ? 'hgn-datepicker-dark-calendar' : ''}
              wrapperClassName={darkMode ? styles.datePickerWrapper : ''}
              style={getDatePickerStyles()}
            />
            <span style={{ color: darkMode ? '#e5e7eb' : '#000' }}>to</span>
            <DatePicker
              selected={endDate}
              onChange={date => {
                setEndDate(date);
                handleFilterChange('custom', startDate, date);
              }}
              placeholderText="End Date"
              dateFormat="yyyy/MM/dd"
              className={darkMode ? 'hgn-datepicker-dark' : ''}
              calendarClassName={darkMode ? 'hgn-datepicker-dark-calendar' : ''}
              wrapperClassName={darkMode ? styles.datePickerWrapper : ''}
              style={getDatePickerStyles()}
            />
          </>
        )}
      </div>

      {/* Chart Title - Always visible */}
      <h2
        style={{
          color: darkMode ? '#fff' : '#000',
          textAlign: 'center',
          width: '100%',
          marginTop: '20px',
          marginBottom: '20px',
          fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
        }}
      >
        Applicants Grouped by Age
      </h2>

      {/* Chart */}
      <div
        style={{
          width: '100%',
          minHeight: 'calc(100vh - 150px)',
          backgroundColor: darkMode ? '#1b2a41' : '#fff',
        }}
      >
        {renderChartContent()}
      </div>

      {/* Error/Validation message below chart */}
      {error && !loading && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 'clamp(10px, 2vw, 20px)',
            marginBottom: '0',
            width: '100%',
            padding: '10px 10px 0 10px',
            backgroundColor: darkMode ? '#1b2a41' : '#fff',
          }}
        >
          <p
            style={{
              fontSize: 'clamp(14px, 2vw, 16px)',
              fontWeight: '600',
              color: darkMode ? '#ef4444' : '#dc2626',
              textAlign: 'center',
            }}
          >
            {error}
          </p>
        </div>
      )}
    </div>
  );
}

export default ApplicantsDashboard;
