import { BarChart, Bar, XAxis, YAxis, LabelList, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import styles from './ExpenseBarChart.module.css';

const categories = ['Plumbing', 'Electrical', 'Structural', 'Mechanical'];
const projects = ['Project A', 'Project B', 'Project C'];

export default function ExpenseBarChart() {
  const [projectId, setProjectId] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        // ... your sample data + filtering (unchanged) ...
      } catch (error) {
        setErrorMessage('Something went wrong while loading chart data.');
      }
    }
    fetchData();
  }, [projectId, categoryFilter, startDate, endDate]);

  return (
    <div className={styles.expenseChart}>
      <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
        <h4 className={styles.title}>Planned vs Actual Cost</h4>
        {errorMessage && <div className={styles.error}>{errorMessage}</div>}
      </div>

      <div className={styles.controlsRow}>
        {/* Project: (white in dark mode) */}
        <label className={styles.projectLabel}>
          Project:
          <select
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            className={styles.select}
          >
            <option value="">All</option>
            {projects.map(p => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        {/* Category: (kept muted) */}
        <label className={styles.label}>
          Category:
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className={styles.select}
          >
            <option value="ALL">All</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.label}>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className={styles.input}
          />
        </label>

        <label className={styles.label}>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className={styles.input}
          />
        </label>
      </div>

      <div className={styles.legendRow}>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ backgroundColor: '#4285F4' }} />
          Planned
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ backgroundColor: '#EA4335' }} />
          Actual
        </span>
      </div>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 35, bottom: 35 }}>
            <XAxis
              dataKey="project"
              tick={{ fontSize: 10 }}
              interval={0}
              angle={-15}
              textAnchor="end"
              label={{ value: 'Project Name', position: 'insideBottom', dy: 25, fontSize: 10 }}
            />
            <YAxis tick={{ fontSize: 10 }} axisLine tickLine />
            <Bar dataKey="planned" fill="#4285F4" name="Planned">
              <LabelList dataKey="planned" position="top" style={{ fontSize: 8 }} />
            </Bar>
            <Bar dataKey="actual" fill="#EA4335" name="Actual">
              <LabelList dataKey="actual" position="top" style={{ fontSize: 8 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
