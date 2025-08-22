import { BarChart, Bar, XAxis, YAxis, LabelList, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
  const darkMode = useSelector(state => state.theme.darkMode);

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

  // Apply dark mode styles to document body when in dark mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode-body');
    } else {
      document.body.classList.remove('dark-mode-body');
    }

    // Add dark mode CSS for chart
    if (!document.getElementById('dark-mode-styles-expense-chart')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'dark-mode-styles-expense-chart';
      styleElement.innerHTML = `
        .dark-mode-body .recharts-wrapper,
        .dark-mode-body .recharts-surface {
          background-color: #1e2736 !important;
        }
        .dark-mode-body .recharts-cartesian-grid-horizontal line,
        .dark-mode-body .recharts-cartesian-grid-vertical line {
          stroke: #364156 !important;
        }
        .dark-mode-body .recharts-text {
          fill: #e0e0e0 !important;
        }
        .dark-mode-body .expense-bar-chart-container {
          background-color: #1e2736 !important;
          color: #e0e0e0 !important;
        }
      `;
      document.head.appendChild(styleElement);
    }

    return () => {
      // Cleanup
      document.body.classList.remove('dark-mode-body');
    };
  }, [darkMode]);

  return (
    <div className={`${styles.chartContainer} ${darkMode ? 'dark-mode' : ''}`}>
      <div className={styles.titleContainer}>
        <h4 className={styles.chartTitle}>Planned vs Actual Cost</h4>
        {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
      </div>

      <div className={styles.filtersContainer}>
        <label className={styles.filterLabel}>
          Project:
          <select
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All</option>
            {projects.map(p => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.filterLabel}>
          Category:
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="ALL">All</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.filterLabel}>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className={styles.filterInput}
          />
        </label>
        <label className={styles.filterLabel}>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className={styles.filterInput}
          />
        </label>
      </div>

      <div className={styles.legendContainer}>
        <span className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: '#4285F4' }} />
          Planned
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendColor} style={{ backgroundColor: '#EA4335' }} />
          Actual
        </span>
      </div>

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 10, left: 35, bottom: 35 }}>
            <XAxis
              dataKey="project"
              tick={{
                fontSize: 10,
                fill: darkMode ? '#e0e0e0' : '#333',
              }}
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
            <YAxis
              tick={{
                fontSize: 10,
                fill: darkMode ? '#e0e0e0' : '#333',
              }}
              axisLine
              tickLine
            />
            <Bar dataKey="planned" fill="#4285F4" name="Planned">
              <LabelList
                dataKey="planned"
                position="top"
                style={{
                  fontSize: 8,
                  fill: darkMode ? '#e0e0e0' : '#333',
                }}
              />
            </Bar>
            <Bar dataKey="actual" fill="#EA4335" name="Actual">
              <LabelList
                dataKey="actual"
                position="top"
                style={{
                  fontSize: 8,
                  fill: darkMode ? '#e0e0e0' : '#333',
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
