import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useState, useEffect } from 'react';

const categories = ['Plumbing', 'Electrical', 'Structural', 'Mechanical'];
const projects = ['Project A', 'Project B', 'Project C'];

import styles from './ExpectedVsActualBarChart.module.css';

export default function ExpenseBarChart({ darkMode }) {
  const [projectId, setProjectId] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const rawData = [
          {
            projectId: 'Project A',
            category: 'Plumbing',
            plannedCost: 1000,
            actualCost: 1200,
            date: '2025-04-01',
          },
          {
            projectId: 'Project A',
            category: 'Electrical',
            plannedCost: 1500,
            actualCost: 1300,
            date: '2025-04-01',
          },
          {
            projectId: 'Project B',
            category: 'Plumbing',
            plannedCost: 1100,
            actualCost: 1050,
            date: '2025-04-02',
          },
          {
            projectId: 'Project B',
            category: 'Structural',
            plannedCost: 2200,
            actualCost: 2150,
            date: '2025-04-02',
          },
          {
            projectId: 'Project C',
            category: 'Mechanical',
            plannedCost: 1300,
            actualCost: 1350,
            date: '2025-04-03',
          },
          {
            projectId: 'Project C',
            category: 'Electrical',
            plannedCost: 1400,
            actualCost: 1600,
            date: '2025-04-03',
          },
        ];

        const filtered = rawData.filter(entry => {
          const entryDate = new Date(entry.date);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;
          const dateMatch = (!start || entryDate >= start) && (!end || entryDate <= end);
          const projectMatch = projectId === '' || entry.projectId === projectId;
          const categoryMatch = categoryFilter === 'ALL' || entry.category === categoryFilter;
          return dateMatch && projectMatch && categoryMatch;
        });

        const aggregated = {};
        filtered.forEach(entry => {
          const key = entry.projectId;
          if (!aggregated[key]) {
            aggregated[key] = { project: key, planned: 0, actual: 0 };
          }
          aggregated[key].planned += entry.plannedCost;
          aggregated[key].actual += entry.actualCost;
        });

        setData(Object.values(aggregated));
      } catch (error) {
        setErrorMessage('Something went wrong while loading chart data.');
      }
    }

    fetchData();
  }, [projectId, categoryFilter, startDate, endDate]);

  return (
    <div style={{ width: '100%', padding: '0.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
        <h4
          style={{ margin: 0, color: '#555', fontSize: '1.2rem' }}
          className={darkMode ? 'text-light' : ''}
        >
          Planned vs Actual Cost
        </h4>
        {errorMessage && (
          <div style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            {errorMessage}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '0.75rem',
          marginBottom: '0.5rem',
        }}
      >
        <label style={{ minWidth: '150px' }} className={darkMode ? 'text-light' : ''}>
          Project:
          <select
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            style={{ marginLeft: '0.3rem', width: '100%' }}
            className={darkMode ? styles.selectDarkMode : styles.selectLightMode}
          >
            <option value="">All</option>
            {projects.map(p => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label style={{ minWidth: '150px' }} className={darkMode ? 'text-light' : ''}>
          Category:
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{ marginLeft: '0.3rem', width: '100%' }}
            className={darkMode ? styles.selectDarkMode : styles.selectLightMode}
          >
            <option value="ALL">All</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>
        <label style={{ minWidth: '150px' }} className={darkMode ? 'text-light' : ''}>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            style={{ marginLeft: '0.3rem', width: '100%' }}
            className={`${styles.toolsHorizontalBarChartDatePicker} ${
              darkMode ? styles.darkDate : ''
            }`}
          />
        </label>
        <label style={{ minWidth: '150px' }} className={darkMode ? 'text-light' : ''}>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            style={{ marginLeft: '0.3rem', width: '100%' }}
            className={`${styles.toolsHorizontalBarChartDatePicker} ${
              darkMode ? styles.darkDate : ''
            }`}
          />
        </label>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          fontSize: '0.75rem',
          marginBottom: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span
            style={{ width: 10, height: 10, backgroundColor: '#4285F4', display: 'inline-block' }}
          />{' '}
          Planned
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span
            style={{ width: 10, height: 10, backgroundColor: '#EA4335', display: 'inline-block' }}
          />{' '}
          Actual
        </span>
      </div>

      <div style={{ width: '100%', height: '240px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 35, bottom: 35 }}>
            <XAxis
              dataKey="project"
              tick={{ fontSize: 10, fill: darkMode ? '#e0e0e0' : '#333' }}
              interval={0}
              angle={-15}
              textAnchor="end"
              label={{
                value: 'Project Name',
                position: 'insideBottom',
                dy: 25,
                fontSize: 10,
                fill: darkMode ? '#e0e0e0' : '#333',
              }}
            />
            <YAxis tick={{ fontSize: 10, fill: darkMode ? '#e0e0e0' : '#333' }} axisLine tickLine />
            <Bar dataKey="planned" fill="#4285F4" name="Planned">
              <LabelList
                dataKey="planned"
                position="top"
                style={{ fontSize: 8, fill: darkMode ? '#e0e0e0' : '#333' }}
              />
            </Bar>
            <Bar dataKey="actual" fill="#EA4335" name="Actual">
              <LabelList
                dataKey="actual"
                position="top"
                style={{ fontSize: 8, fill: darkMode ? '#e0e0e0' : '#333' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
