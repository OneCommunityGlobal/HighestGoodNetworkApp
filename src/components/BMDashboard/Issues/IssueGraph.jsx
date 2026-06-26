import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './IssueGraph.module.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { fetchIssueSummary, fetchIssueTrend } from '../../../actions/bmdashboard/issueGraphActions';

const formatDate = date => date.toISOString().split('T')[0];

const getDateBounds = (startDate, endDate) => {
  const today = new Date();
  const twelveWeeksAgo = new Date(today.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);

  const maxEndDate = formatDate(today);
  const minStartDate = formatDate(twelveWeeksAgo);

  return {
    maxEndDate,
    minStartDate,
    maxStartDate: endDate || maxEndDate,
    minEndDate: startDate || minStartDate,
  };
};

function FilterBar({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  weeks,
  handleWeeksChange,
  handleGoClick,
  minStartDate,
  maxStartDate,
  minEndDate,
  maxEndDate,
}) {
  return (
    <div className={styles.filterRow}>
      <div className={styles.filterGroup}>
        <label htmlFor="start-date">Start Date:</label>
        <input
          id="start-date"
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          min={minStartDate}
          max={maxStartDate}
        />
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="end-date">End Date:</label>
        <div className={styles.inputWithButton}>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            min={minEndDate}
            max={maxEndDate}
          />
          <button className={styles.goButton} onClick={handleGoClick}>
            Go
          </button>
        </div>
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="weeks-select">Weeks:</label>
        <select id="weeks-select" value={weeks} onChange={handleWeeksChange}>
          <option value="" disabled hidden>
            Select Range
          </option>
          <option value={4}>Last 4 Weeks</option>
          <option value={8}>Last 8 Weeks</option>
          <option value={12}>Last 12 Weeks</option>
        </select>
      </div>
    </div>
  );
}

function SummaryTiles({ issueSummary }) {
  if (!issueSummary) return null;
  return (
    <div className={styles.tileRow}>
      <div className={styles.tile}>
        <h3>Total Issues</h3>
        <p>{issueSummary.total}</p>
      </div>
      <div className={styles.tile}>
        <h3>New Issues This Week</h3>
        <p>{issueSummary.newThisWeek}</p>
      </div>
      <div className={styles.tile}>
        <h3>Resolved Issues</h3>
        <p>{issueSummary.resolved}</p>
      </div>
      <div className={styles.tile}>
        <h3>Avg. Resolution Time</h3>
        <p>{issueSummary.avgResolution} days</p>
      </div>
    </div>
  );
}

function ChartContent({ graphData, darkMode }) {
  if (graphData.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={graphData} margin={{ top: 20, right: 20, left: 0, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#3a4a5a' : '#e0e0e0'} />
        <XAxis dataKey="week" tick={{ fill: darkMode ? '#ffffff' : '#666' }} />
        <YAxis tick={{ fill: darkMode ? '#ffffff' : '#666' }} />
        <Tooltip
          cursor={{ fill: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)' }}
          contentStyle={{
            backgroundColor: darkMode ? '#253342' : '#fff',
            border: '1px solid #555',
            color: darkMode ? '#fff' : '#000',
          }}
          labelStyle={{ color: darkMode ? '#fff' : '#000' }}
          itemStyle={{ color: darkMode ? '#fff' : '#000' }}
        />
        <Legend verticalAlign="bottom" height={36} />
        <Bar dataKey="created" fill={darkMode ? '#4fc3f7' : '#007bff'} name="Created Issues">
          <LabelList dataKey="created" position="top" fill={darkMode ? '#ffffff' : '#000000'} />
        </Bar>
        <Bar dataKey="resolved" fill={darkMode ? '#81c784' : '#28a745'} name="Resolved Issues">
          <LabelList dataKey="resolved" position="top" fill={darkMode ? '#ffffff' : '#000000'} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function IssueGraph() {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const { loading, issueSummary, issueTrend, error } = useSelector(state => state.issueGraph);

  const [weeks, setWeeks] = useState(8);
  const [graphData, setGraphData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [validationError, setValidationError] = useState('');

  const { minStartDate, maxStartDate, minEndDate, maxEndDate } = getDateBounds(startDate, endDate);

  useEffect(() => {
    dispatch(fetchIssueSummary({ weeks }));
    dispatch(fetchIssueTrend({ weeks }));
  }, [dispatch, weeks]);

  useEffect(() => {
    if (issueTrend && Array.isArray(issueTrend)) {
      const sortedData = [...issueTrend].sort((a, b) => new Date(a.week) - new Date(b.week));
      setGraphData(sortedData);
    }
  }, [issueTrend]);

  const handleWeeksChange = e => {
    setWeeks(Number(e.target.value));
    setStartDate('');
    setEndDate('');
    setValidationError('');
  };

  const validateDates = () => {
    if (!startDate || !endDate) return 'Please select both a Start Date and an End Date.';
    if (startDate === endDate)
      return 'Start date and End date cannot be the same day. Please select a range.';
    if (new Date(startDate) > new Date(endDate)) return 'Start date must be before the End date.';
    return '';
  };

  const handleGoClick = () => {
    const err = validateDates();
    if (err) {
      setValidationError(err);
      return;
    }

    setValidationError('');
    setWeeks('');
    dispatch(fetchIssueTrend({ start: startDate, end: endDate }));
    dispatch(fetchIssueSummary({ start: startDate, end: endDate }));
  };

  const handleStartDateChange = val => {
    setStartDate(val);
    setValidationError('');
  };

  const handleEndDateChange = val => {
    setEndDate(val);
    setValidationError('');
  };

  const showNoDataMessage = !loading && !error && graphData.length === 0;

  return (
    <div className={`${styles.issueGraphPage} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.issueGraphEventContainer}>
        <FilterBar
          startDate={startDate}
          setStartDate={handleStartDateChange}
          endDate={endDate}
          setEndDate={handleEndDateChange}
          weeks={weeks}
          handleWeeksChange={handleWeeksChange}
          handleGoClick={handleGoClick}
          minStartDate={minStartDate}
          maxStartDate={maxStartDate}
          minEndDate={minEndDate}
          maxEndDate={maxEndDate}
        />

        {validationError && (
          <p style={{ color: 'red', margin: '10px 0', fontWeight: '500' }}>{validationError}</p>
        )}

        <SummaryTiles issueSummary={issueSummary} />

        <div className={styles.graphWrapper}>
          <h2>Issues Created vs. Resolved</h2>
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          <ChartContent graphData={graphData} darkMode={darkMode} />

          {showNoDataMessage && (
            <p className={styles.noDataMessage} style={{ color: 'red' }}>
              No issue data found for the selected timeframe.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default IssueGraph;
