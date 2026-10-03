import React, { useState, useEffect, useMemo } from 'react';
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

// Constants and Static Helpers
const TWELVE_WEEKS_IN_MS = 12 * 7 * 24 * 60 * 60 * 1000;
const today = new Date();
const formattedDate = date => date.toISOString().split('T')[0];
const maxEndDate = formattedDate(today);
const minStartDate = formattedDate(new Date(today.getTime() - TWELVE_WEEKS_IN_MS));

const ERROR_STYLE = { color: 'red', margin: '10px 0', fontWeight: '500' };
const NO_DATA_STYLE = { color: 'red' };
const CHART_MARGIN = { top: 20, right: 20, left: 0, bottom: 30 };

// Isolated Validation Helper to reduce Cognitive Complexity below 15
const getDatesValidationError = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return 'Please select both a Start Date and an End Date.';
  }
  if (startDate === endDate) {
    return 'Start date and End date cannot be the same day. Please select a range.';
  }
  if (new Date(startDate) > new Date(endDate)) {
    return 'Start date must be before the End date.';
  }
  return '';
};

function IssueGraph() {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const { loading, issueSummary, issueTrend, error } = useSelector(state => state.issueGraph);

  const [weeks, setWeeks] = useState(8);
  const [graphData, setGraphData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [validationError, setValidationError] = useState('');

  const maxStartDate = endDate || maxEndDate;
  const minEndDate = startDate || minStartDate;

  const chartTheme = useMemo(
    () => ({
      gridStroke: darkMode ? '#3a4a5a' : '#e0e0e0',
      tickColor: darkMode ? '#ffffff' : '#666',
      cursorFill: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)',
      tooltipContent: {
        backgroundColor: darkMode ? '#253342' : '#fff',
        border: '1px solid #555',
        color: darkMode ? '#fff' : '#000',
      },
      tooltipText: { color: darkMode ? '#fff' : '#000' },
      createdBarFill: darkMode ? '#4fc3f7' : '#007bff',
      resolvedBarFill: darkMode ? '#81c784' : '#28a745',
      labelFill: darkMode ? '#ffffff' : '#000000',
    }),
    [darkMode],
  );

  useEffect(() => {
    if (weeks) {
      dispatch(fetchIssueSummary({ weeks }));
      dispatch(fetchIssueTrend({ weeks }));
    }
  }, [dispatch, weeks]);

  useEffect(() => {
    if (Array.isArray(issueTrend)) {
      const sortedData = [...issueTrend].sort(
        (a, b) => new Date(a.week).getTime() - new Date(b.week).getTime(),
      );
      setGraphData(sortedData);
    }
  }, [issueTrend]);

  const handleWeeksChange = e => {
    const val = Number.parseInt(e.target.value, 10);
    setWeeks(Number.isNaN(val) ? '' : val);
    setStartDate('');
    setEndDate('');
    setValidationError('');
  };

  const handleStartDateChange = e => {
    setStartDate(e.target.value);
    setValidationError('');
  };

  const handleEndDateChange = e => {
    setEndDate(e.target.value);
    setValidationError('');
  };

  const handleGoClick = () => {
    const errorMsg = getDatesValidationError(startDate, endDate);
    if (errorMsg) {
      setValidationError(errorMsg);
      return;
    }

    setValidationError('');
    setWeeks('');
    dispatch(fetchIssueTrend({ start: startDate, end: endDate }));
    dispatch(fetchIssueSummary({ start: startDate, end: endDate }));
  };

  return (
    <div className={`${styles.issueGraphPage} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.issueGraphEventContainer}>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label htmlFor="start-date">Start Date:</label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
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
                onChange={handleEndDateChange}
                min={minEndDate}
                max={maxEndDate}
              />
              <button type="button" className={styles.goButton} onClick={handleGoClick}>
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

        {validationError && <p style={ERROR_STYLE}>{validationError}</p>}

        {issueSummary && (
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
        )}

        <div className={styles.graphWrapper}>
          <h2>Issues Created vs. Resolved</h2>
          {loading && <p>Loading...</p>}
          {error && <p style={NO_DATA_STYLE}>{error}</p>}
          {graphData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graphData} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
                <XAxis dataKey="week" tick={{ fill: chartTheme.tickColor }} />
                <YAxis tick={{ fill: chartTheme.tickColor }} />
                <Tooltip
                  cursor={{ fill: chartTheme.cursorFill }}
                  contentStyle={chartTheme.tooltipContent}
                  labelStyle={chartTheme.tooltipText}
                  itemStyle={chartTheme.tooltipText}
                />
                <Legend verticalAlign="bottom" height={36} />
                <Bar dataKey="created" fill={chartTheme.createdBarFill} name="Created Issues">
                  <LabelList dataKey="created" position="top" fill={chartTheme.labelFill} />
                </Bar>
                <Bar dataKey="resolved" fill={chartTheme.resolvedBarFill} name="Resolved Issues">
                  <LabelList dataKey="resolved" position="top" fill={chartTheme.labelFill} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            !loading &&
            !error && (
              <p className={styles.noDataMessage} style={NO_DATA_STYLE}>
                No issue data found for the selected timeframe.
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default IssueGraph;
