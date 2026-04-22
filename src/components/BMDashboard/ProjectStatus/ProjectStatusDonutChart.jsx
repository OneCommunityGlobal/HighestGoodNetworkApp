import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import axios from 'axios';
import styles from './ProjectStatusDonutChart.module.css';

const COLORS = ['#B39DDB', '#80DEEA', '#FFABAB'];

export default function ProjectStatusDonutChart() {
  const darkMode = useSelector(state => state.theme?.darkMode || false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusData, setStatusData] = useState(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const query = [];
      if (startDate) query.push(`startDate=${startDate}`);
      if (endDate) query.push(`endDate=${endDate}`);
      const queryString = query.length ? `?${query.join('&')}` : '';

      const token = localStorage.getItem('token');

      const res = await axios.get(`http://localhost:4500/api/projects/status${queryString}`, {
        headers: { Authorization: token },
      });

      setStatusData(res.data);
    } catch (err) {
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

  if (pieData.every(item => item.value === 0)) {
    return (
      <div className={`${styles.container} ${darkMode ? styles.darkContainer : ''}`}>
        <h2 className={styles.title}>PROJECT STATUS</h2>
        <p className={styles.noDataMessage}>No project status data available.</p>
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
    <div className={`${styles.container} ${darkMode ? styles.darkContainer : ''}`}>
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
        {!allZero && (
          <ResponsiveContainer width="100%" height={350}>
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

              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#2a3f5f' : '#ffffff',
                  borderRadius: '8px',
                  border: darkMode ? '1px solid #3a506b' : '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                  color: darkMode ? '#ffffff' : '#111827',
                }}
                itemStyle={{
                  color: darkMode ? '#ffffff' : '#111827',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                }}
              />
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
