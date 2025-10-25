import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './issueGraph.module.css';
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
  };

  const handleGoClick = () => {
    if (!startDate || !endDate) return;
    if (new Date(startDate) > new Date(endDate)) {
      alert('Start date must be before end date');
      return;
    }
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
              <option value={4}>Last 4 Weeks</option>
              <option value={8}>Last 8 Weeks</option>
              <option value={12}>Last 12 Weeks</option>
            </select>
          </div>
        </div>

        {startDate && endDate && new Date(startDate) > new Date(endDate) && (
          <p style={{ color: 'red' }}>Start date cannot be after end date.</p>
        )}
        {/* issue tiles */}
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
        <div className={styles.graphWrapper}>
          <h2>Issues Created vs. Resolved</h2>
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {graphData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graphData} margin={{ top: 20, right: 20, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
                <Bar
                  dataKey="created"
                  fill={darkMode ? '#4fc3f7' : '#007bff'}
                  name="Created Issues"
                >
                  <LabelList dataKey="created" position="top" />
                </Bar>
                <Bar
                  dataKey="resolved"
                  fill={darkMode ? '#81c784' : '#28a745'}
                  name="Resolved Issues"
                >
                  <LabelList dataKey="resolved" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default IssueGraph;
