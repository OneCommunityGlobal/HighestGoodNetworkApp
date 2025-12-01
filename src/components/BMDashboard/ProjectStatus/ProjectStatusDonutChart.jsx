import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
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
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />

        <button type="button" onClick={fetchStatus} className={styles.applyBtn}>
          Apply
        </button>
      </div>

      <div className={styles.chartWrapper}>
        {/* Only draw the ring if at least one status has data */}
        {!allZero && (
          <PieChart width={400} height={400}>
            <Pie
              data={pieData}
              cx={200}
              cy={200}
              innerRadius={90}
              outerRadius={140}
              paddingAngle={3}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )}

        <div className={styles.centerText}>
          <div>Total Projects</div>
          <strong>{statusData.totalProjects}</strong>
        </div>

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
