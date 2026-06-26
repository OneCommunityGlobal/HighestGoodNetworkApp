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

function IssueGraph() {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const { loading, issueSummary, issueTrend, error } = useSelector(state => state.issueGraph);

  const [weeks, setWeeks] = useState(8);
  const [graphData, setGraphData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [validationError, setValidationError] = useState('');

  const today = new Date();
  const formattedDate = date => date.toISOString().split('T')[0];
  const maxEndDate = formattedDate(today);
  const minStartDate = formattedDate(new Date(today.getTime() - 12 * 7 * 24 * 60 * 60 * 1000));
  const maxStartDate = endDate ? endDate : maxEndDate;
  const minEndDate = startDate ? startDate : minStartDate;

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
    const val = Number(e.target.value);
    setWeeks(val);
    setStartDate('');
    setEndDate('');
    setValidationError('');
  };

  const handleGoClick = () => {
    if (!startDate || !endDate) {
      setValidationError('Please select both a Start Date and an End Date.');
      return;
    }

    // 2. Check if they are the exact same day
    if (startDate === endDate) {
      setValidationError('Start date and End date cannot be the same day. Please select a range.');
      return;
    }

    // 3. Check if start date is after end date
    if (new Date(startDate) > new Date(endDate)) {
      setValidationError('Start date must be before the End date.');
      return;
    }

    // Clear any existing errors if checks pass
    setValidationError('');
    setWeeks(''); // Clears the dropdown preset selection to match custom timeline
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
              onChange={e => {
                setStartDate(e.target.value);
                setValidationError(''); // Clear error when user alters input
              }}
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
                onChange={e => {
                  setEndDate(e.target.value);
                  setValidationError(''); // Clears error when user starts changing custom dates
                }}
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

        {/* issue tiles */}
        {validationError && (
          <p style={{ color: 'red', margin: '10px 0', fontWeight: '500' }}>{validationError}</p>
        )}

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
        {/* charts */}

        {/* charts */}
        <div className={styles.graphWrapper}>
          <h2>Issues Created vs. Resolved</h2>
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {graphData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graphData} margin={{ top: 20, right: 20, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#3a4a5a' : '#e0e0e0'} />

                <XAxis dataKey="week" tick={{ fill: darkMode ? '#ffffff' : '#666' }} />

                <YAxis tick={{ fill: darkMode ? '#ffffff' : '#666' }} />

                <Tooltip
                  cursor={{
                    fill: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)',
                  }}
                  contentStyle={{
                    backgroundColor: darkMode ? '#253342' : '#fff',
                    border: '1px solid #555',
                    color: darkMode ? '#fff' : '#000',
                  }}
                  labelStyle={{
                    color: darkMode ? '#fff' : '#000',
                  }}
                  itemStyle={{
                    color: darkMode ? '#fff' : '#000',
                  }}
                />

                <Legend verticalAlign="bottom" height={36} />

                <Bar
                  dataKey="created"
                  fill={darkMode ? '#4fc3f7' : '#007bff'}
                  name="Created Issues"
                >
                  <LabelList
                    dataKey="created"
                    position="top"
                    fill={darkMode ? '#ffffff' : '#000000'}
                  />
                </Bar>

                <Bar
                  dataKey="resolved"
                  fill={darkMode ? '#81c784' : '#28a745'}
                  name="Resolved Issues"
                >
                  <LabelList
                    dataKey="resolved"
                    position="top"
                    fill={darkMode ? '#ffffff' : '#000000'}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            !loading &&
            !error && (
              <p className={styles.noDataMessage} style={{ color: 'red' }}>
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
