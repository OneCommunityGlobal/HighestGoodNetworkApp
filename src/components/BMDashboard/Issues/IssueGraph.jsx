import React, { useState, useEffect } from 'react';
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

function IssueGraph() {
  const [summary, setSummary] = useState({
    total: 120,
    newThisWeek: 45,
    resolved: 25,
    avgResolution: 20,
  });

  const [weeks, setWeeks] = useState(8);
  const [graphData, setGraphData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [useManualDate, setUseManualDate] = useState(false);

  const formatDate = date => date.toISOString().split('T')[0];

  // Today and 12 weeks ago
  const today = new Date();
  const maxEndDate = formatDate(today);
  const minStartDate = formatDate(new Date(today.getTime() - 12 * 7 * 24 * 60 * 60 * 1000));
  const maxStartDate = endDate ? endDate : maxEndDate;
  const minEndDate = startDate || minStartDate;

  // mock data temp
  const fetchData = ({ weeks, startDate, endDate }) => {
    console.log('Fetching data with:', { weeks, startDate, endDate });

    if (weeks && !startDate && !endDate) {
      //week ffilter
      const data = Array.from({ length: weeks }, (_, i) => ({
        week: `Week ${i + 1}`,
        created: Math.floor(Math.random() * 50) + 10,
        resolved: Math.floor(Math.random() * 40) + 5,
      }));
      setGraphData(data);
    } else if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Calculate number of weeks between start and end
      const diffInTime = end.getTime() - start.getTime();
      const diffInWeeks = Math.max(1, Math.ceil(diffInTime / (7 * 24 * 60 * 60 * 1000)));

      const data = Array.from({ length: diffInWeeks }, (_, i) => ({
        week: `Week ${i + 1}`,
        created: Math.floor(Math.random() * 50) + 10,
        resolved: Math.floor(Math.random() * 40) + 5,
      }));

      setGraphData(data);
    }
  };

  useEffect(() => {
    fetchData({ weeks });
  }, []);

  const handleWeeksChange = value => {
    setWeeks(value);
    setUseManualDate(false);
    setStartDate('');
    setEndDate('');
    fetchData({ weeks: value });
  };

  const handleGoClick = () => {
    if (startDate && endDate && new Date(startDate) <= new Date(endDate)) {
      setUseManualDate(true);
      fetchData({ startDate, endDate });
    }
  };

  return (
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
          <select
            id="weeks-select"
            value={weeks}
            onChange={e => handleWeeksChange(Number(e.target.value))}
          >
            <option value={4}>Last 4 Weeks</option>
            <option value={8}>Last 8 Weeks</option>
            <option value={12}>Last 12 Weeks</option>
          </select>
        </div>
      </div>

      {startDate && endDate && new Date(startDate) > new Date(endDate) && (
        <p style={{ color: 'red' }}>Start date cannot be after end date.</p>
      )}

      <div className={styles.tileRow}>
        <div className={styles.tile}>
          <h3>Total Issues</h3>
          <p>{summary.total}</p>
        </div>
        <div className={styles.tile}>
          <h3>New Issues This Week</h3>
          <p>{summary.newThisWeek}</p>
        </div>
        <div className={styles.tile}>
          <h3>Resolved Issues</h3>
          <p>{summary.resolved}</p>
        </div>
        <div className={styles.tile}>
          <h3>Avg. Resolution Time</h3>
          <p>{summary.avgResolution} days</p>
        </div>
      </div>
      {/* charts */}
      <div className={styles.graphWrapper}>
        <h2>Issues Created vs. Resolved</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={graphData} margin={{ top: 20, right: 20, left: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
            <Bar dataKey="created" fill="#007bff" name="Created Issues">
              <LabelList dataKey="created" position="top" />
            </Bar>
            <Bar dataKey="resolved" fill="#28a745" name="Resolved Issues">
              <LabelList dataKey="resolved" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default IssueGraph;
