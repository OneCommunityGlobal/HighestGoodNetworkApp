import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import axios from 'axios';
import styles from './ProjectStatusDonutChart.module.css';

const COLORS = ['#B39DDB', '#80DEEA', '#FFABAB']; // Active, Completed, Delayed

export default function ProjectStatusDonutChart() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusData, setStatusData] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query string
      const query = [];
      if (startDate) query.push(`startDate=${startDate}`);
      if (endDate) query.push(`endDate=${endDate}`);
      const queryString = query.length ? `?${query.join('&')}` : '';

      // Get token from localStorage (Dev Admin session)
      const token = localStorage.getItem('token');

      const res = await axios.get(`http://localhost:4500/api/projects/status${queryString}`, {
        headers: { Authorization: token },
      });

      // TEMPORARY MOCK DATA - for testing purposes
      /*setStatusData({
        totalProjects: 50,
        activeProjects: 20,
        completedProjects: 20,
        delayedProjects: 10,
      });
      return;*/

      setStatusData(res.data);
    } catch (err) {
      // console.error(err);
      setError('Unable to load project status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading) return <p>Loading project status...</p>;
  if (error) return <p>{error}</p>;
  if (!statusData) return <p>No data available.</p>;

  const pieData = [
    { name: 'Active Projects', value: statusData.activeProjects },
    { name: 'Completed Projects', value: statusData.completedProjects },
    { name: 'Delayed Projects', value: statusData.delayedProjects },
  ];

  // SHOW MESSAGE WHEN THERE IS NO DATA
  if (pieData.every(item => item.value === 0)) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>PROJECT STATUS</h2>
        <p>No project status data available.</p>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const allZero =
    !statusData.activeProjects && !statusData.completedProjects && !statusData.delayedProjects;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>PROJECT STATUS</h2>

      <div className={styles.filterRow}>
        <input
          type="date"
          value={startDate}
          max={endDate || undefined}
          onChange={e => setStartDate(e.target.value)}
        />

        <input
          type="date"
          value={endDate}
          min={startDate || undefined}
          onChange={e => setEndDate(e.target.value)}
        />

        <button type="button" onClick={fetchStatus} className={styles.applyBtn}>
          Apply
        </button>
      </div>

      <div className={styles.chartWrapper}>
        {/* Only draw the ring if at least one status has data */}
        {!allZero && (
          <ResponsiveContainer width="100%" aspect={1}>
            <PieChart margin={{ top: 10, right: 10, bottom: 40, left: 10 }}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="85%"
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
                <Label
                  position="center"
                  content={({ viewBox }) => {
                    const { cx, cy } = viewBox;
                    return (
                      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
                        <tspan x={cx} dy="-10" className={styles.centerLabel}>
                          Total Projects
                        </tspan>
                        <tspan x={cx} dy="24" className={styles.centerValue}>
                          {statusData.totalProjects}
                        </tspan>
                      </text>
                    );
                  }}
                />
              </Pie>

              <Tooltip />
              <Legend verticalAlign="bottom" align="center" />
            </PieChart>
          </ResponsiveContainer>
        )}

        <div className={styles.summaryBox}>
          <h3>{today}</h3>

          <p className={styles.label}>ACTIVE PROJECTS</p>
          <span className={styles.value}>{statusData.activeProjects}</span>

          <p className={styles.label}>COMPLETED PROJECTS</p>
          <span className={styles.value}>{statusData.completedProjects}</span>

          <p className={styles.label}>DELAYED PROJECTS</p>
          <span className={styles.value}>{statusData.delayedProjects}</span>
        </div>
      </div>
    </div>
  );
}
