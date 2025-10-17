import React, { useState, useMemo } from 'react';
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
  const [summary] = useState({
    total: 120,
    newThisWeek: 45,
    resolved: 25,
    avgResolution: 20,
  });
  const [weeks, setWeeks] = useState(8);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  //mock data for chart
  const graphData = useMemo(() => {
    const data = [];
    for (let i = 1; i <= weeks; i++) {
      data.push({
        week: `Week ${i}`,
        created: Math.floor(Math.random() * 50) + 10,
        resolved: Math.floor(Math.random() * 40) + 5,
      });
    }
    return data;
  }, [weeks]);

  return (
    <div className={styles.issueGraphEventContainer}>
      {/* Filter */}
      <div className={styles.filterRow}>
        <div>
          <label htmlFor="start-date">Start Date:</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>

        <div>
          <label htmlFor="end-date">End Date:</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>

        <div>
          <label htmlFor="weeks-select">Weeks:</label>
          <select value={weeks} onChange={e => setWeeks(Number(e.target.value))}>
            <option value={4}>Last 4 Weeks</option>
            <option value={8}>Last 8 Weeks</option>
            <option value={12}>Last 12 Weeks</option>
          </select>
        </div>
      </div>

      {/* tiless section */}
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

      {/* charts sections */}
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
