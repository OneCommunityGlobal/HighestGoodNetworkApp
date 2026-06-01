import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';
import { useState, useEffect } from 'react';

const categories = ['Plumbing', 'Electrical', 'Structural', 'Mechanical'];
const projects = ['Project A', 'Project B', 'Project C'];

export default function CostVarianceTrendGraph() {
  const [projectId, setProjectId] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState([]);

  useEffect(() => {
    // 1. Basic Mock Data
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
        projectId: 'Project A',
        category: 'Structural',
        plannedCost: 900,
        actualCost: 1400,
        date: '2025-04-04',
      },
      {
        projectId: 'Project B',
        category: 'Electrical',
        plannedCost: 2000,
        actualCost: 1600,
        date: '2025-04-05',
      },
      {
        projectId: 'Project C',
        category: 'Plumbing',
        plannedCost: 800,
        actualCost: 750,
        date: '2025-04-06',
      },
    ];

    // 2. Filter Data
    const filtered = rawData.filter(entry => {
      const dateMatch =
        (!startDate || entry.date >= startDate) && (!endDate || entry.date <= endDate);
      const projectMatch = projectId === '' || entry.projectId === projectId;
      const categoryMatch = categoryFilter === 'ALL' || entry.category === categoryFilter;
      return dateMatch && projectMatch && categoryMatch;
    });

    // 3. Aggregate Data by Date
    const aggregated = {};
    filtered.forEach(entry => {
      const key = entry.date;
      if (!aggregated[key]) {
        aggregated[key] = { date: key, planned: 0, actual: 0 };
      }
      aggregated[key].planned += entry.plannedCost;
      aggregated[key].actual += entry.actualCost;
    });

    // 4. Calculate Variance and Sort
    const chartData = Object.values(aggregated)
      .map(item => {
        item.variance = item.actual - item.planned;
        return item;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    setData(chartData);
  }, [projectId, categoryFilter, startDate, endDate]);

  return (
    <div style={{ width: '100%', padding: '0.5rem' }}>
      <h4 style={{ textAlign: 'center', margin: '0 0 1rem 0' }}>Cost Variance Trend</h4>

      {/* Basic Filters */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '1rem',
          fontSize: '12px',
        }}
      >
        <label>
          Project:
          <select
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            style={{ marginLeft: '4px' }}
          >
            <option value="">All</option>
            {projects.map(p => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <label>
          Category:
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{ marginLeft: '4px' }}
          >
            <option value="ALL">All</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <label>
          Start:{' '}
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </label>

        <label>
          End: <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </label>
      </div>

      {/* Basic Chart */}
      <div style={{ width: '100%', height: '280px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <ReferenceLine y={0} stroke="#666" />

            <Bar dataKey="variance">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.variance > 0 ? '#EA4335' : '#34A853'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
