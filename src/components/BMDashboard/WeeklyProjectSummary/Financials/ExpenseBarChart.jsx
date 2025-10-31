import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useState, useEffect } from 'react';
import styles from './ExpectedVsActualBarChart.module.css';

const categories = ['Plumbing', 'Electrical', 'Structural', 'Mechanical'];
const projects = ['Project A', 'Project B', 'Project C'];

export default function ExpenseBarChart() {
  const [projectId, setProjectId] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth); // for responsiveness of labels

  // Reset all the filters
  const resetFilters = () => {
    setProjectId('');
    setCategoryFilter('ALL');
    setStartDate('');
    setEndDate('');
    setErrorMessage('');
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth); // windowWidth updates every time the user resizes the browser
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        <h4 style={{ margin: 0, color: '#000000ff', fontSize: '1.4rem' }}>
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
          flexWrap: 'nowrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '5rem',
          fontSize: '0.85rem',
          marginBottom: '0.2rem',
        }}
      >
        <label style={{ minWidth: '150px' }}>
          Project:
          <select
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            style={{ marginLeft: '0.3rem', width: '100%' }}
          >
            <option value="">All</option>
            {projects.map(p => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label style={{ minWidth: '150px' }}>
          Category:
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{ marginLeft: '0.3rem', width: '100%' }}
          >
            <option value="ALL">All</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>
        <label style={{ minWidth: '150px' }}>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            style={{ marginLeft: '0.3rem', width: '100%' }}
          />
        </label>
        <label style={{ minWidth: '150px' }}>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            style={{ marginLeft: '0.3rem', width: '100%' }}
          />
        </label>

        {/* Reset Filters button */}
        <div style={{ minWidth: '120px' }}>
          <button
            type="button"
            onClick={resetFilters}
            style={{
              padding: '0.5rem 1.2em',
              borderRadius: '6px',
              border: '1px solid #d9d2d2ff',
              background: '#dededeff',
              cursor: 'pointer',
              fontSize: '0.95rem',
            }}
            aria-label="Reset filters"
            title="Reset filters"
          >
            Reset
          </button>
        </div>
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
      ></div>

      <div className={styles.chartContainer}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 35, bottom: 35 }}>
            <XAxis
              dataKey="project"
              tick={{ fontSize: windowWidth < 480 ? 8 : 15 }} // smaller font on small screens
              interval={0}
              angle={windowWidth < 480 ? -35 : 0} // rotate more on mobile
              textAnchor="end"
              label={{
                value: 'Project Name',
                position: 'insideBottom',
                dy: windowWidth < 480 ? 40 : 25,
                fontSize: 15,
              }}
            />
            <YAxis tick={{ fontSize: 15 }} axisLine tickLine />
            <Legend verticalAlign="top" height={36} />
            <Tooltip
              labelFormatter={label => `Project: ${label}`}
              formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name]}
            />
            <Bar dataKey="planned" fill="#4285F4" name="Planned">
              <LabelList dataKey="planned" position="top" style={{ fontSize: 12 }} />
            </Bar>
            <Bar dataKey="actual" fill="#EA4335" name="Actual">
              <LabelList dataKey="actual" position="top" style={{ fontSize: 12 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
