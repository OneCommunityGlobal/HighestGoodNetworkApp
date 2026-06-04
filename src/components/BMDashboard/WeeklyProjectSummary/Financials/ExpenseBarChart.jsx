import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const categories = ['Plumbing', 'Electrical', 'Structural', 'Mechanical'];
const projects = ['Project A', 'Project B', 'Project C'];

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

const getFilteredAndAggregatedData = (startDate, endDate, projectId, categoryFilter) => {
  const filtered = rawData.filter(entry => {
    const dateMatch =
      (!startDate || entry.date >= startDate) && (!endDate || entry.date <= endDate);
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

  return Object.values(aggregated).map(item => {
    item.variance = item.actual - item.planned;
    const percent = item.planned === 0 ? 0 : ((item.variance / item.planned) * 100).toFixed(1);
    item.variancePercent = percent > 0 ? `+${percent}%` : `${percent}%`;
    item.varianceLabel = item.variance > 0 ? `+$${item.variance}` : `-$${Math.abs(item.variance)}`;
    return item;
  });
};

const renderVarianceLabel = props => {
  const { x, y, width, value } = props;
  const isOver = value?.toString().startsWith('+');

  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill={isOver ? '#EA4335' : '#34A853'}
      fontSize="11"
      fontWeight="bold"
      textAnchor="middle"
    >
      {value}
    </text>
  );
};

renderVarianceLabel.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const CustomTooltip = ({ active, payload, label, darkMode }) => {
  if (!active || !payload?.length) return null;

  const chartData = payload[0].payload;
  const isOverBudget = chartData.variance > 0;

  return (
    <div
      style={{
        backgroundColor: darkMode ? '#222' : '#fff',
        border: darkMode ? '1px solid #555' : '1px solid #ccc',
        color: darkMode ? '#eee' : '#333',
        padding: '12px',
        fontSize: '12px',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      <p
        style={{
          fontWeight: 'bold',
          margin: '0 0 8px 0',
          borderBottom: darkMode ? '1px solid #444' : '1px solid #eee',
          paddingBottom: '6px',
          color: darkMode ? '#adb5bd' : '#666',
        }}
      >
        {label}
      </p>
      <p style={{ margin: '0 0 4px 0' }}>
        Planned: <strong>${chartData.planned}</strong>
      </p>
      <p style={{ margin: '0 0 4px 0' }}>
        Actual: <strong>${chartData.actual}</strong>
      </p>
      <p
        style={{
          margin: '8px 0 0 0',
          color: isOverBudget ? '#EA4335' : '#34A853',
          fontWeight: 'bold',
        }}
      >
        Variance: {chartData.variance > 0 ? '+' : ''}${chartData.variance} (
        {chartData.variancePercent})
      </p>
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      payload: PropTypes.shape({
        planned: PropTypes.number,
        actual: PropTypes.number,
        variance: PropTypes.number,
        variancePercent: PropTypes.string,
      }),
    }),
  ),
  label: PropTypes.string,
  darkMode: PropTypes.bool,
};

export default function ExpenseBarChart({ darkMode }) {
  const [projectId, setProjectId] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const inputStyle = {
    marginLeft: '0.3rem',
    width: '100%',
    padding: '4px',
    borderRadius: '4px',
    backgroundColor: darkMode ? '#333' : '#fff',
    color: darkMode ? '#eee' : '#000',
    border: darkMode ? '1px solid #555' : '1px solid #ccc',
    outline: 'none',
  };

  const labelStyle = {
    minWidth: '150px',
    color: darkMode ? '#bbb' : '#555',
  };

  useEffect(() => {
    try {
      const processedData = getFilteredAndAggregatedData(
        startDate,
        endDate,
        projectId,
        categoryFilter,
      );
      setData(processedData);
    } catch (error) {
      setErrorMessage('Something went wrong while loading chart data.');
    }
  }, [projectId, categoryFilter, startDate, endDate]);

  return (
    <div style={{ width: '100%', padding: '0.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
        <h4 style={{ margin: 0, color: darkMode ? '#ddd' : '#555', fontSize: '1.2rem' }}>
          Planned vs Actual Cost
        </h4>
        {errorMessage && (
          <div style={{ color: '#ff4444', fontSize: '0.9rem', marginTop: '0.5rem' }}>
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
        <label style={labelStyle}>
          Project:
          <select value={projectId} onChange={e => setProjectId(e.target.value)} style={inputStyle}>
            <option value="">All</option>
            {projects.map(p => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label style={labelStyle}>
          Category:
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={inputStyle}
          >
            <option value="ALL">All</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>
        <label style={labelStyle}>
          Start Date:
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={labelStyle}>
          End Date:
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            style={inputStyle}
          />
        </label>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1.5rem',
          fontSize: '0.75rem',
          marginBottom: '1rem',
          color: darkMode ? '#ccc' : '#333',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span
            style={{
              width: 12,
              height: 12,
              backgroundColor: '#4285F4',
              display: 'inline-block',
              borderRadius: '2px',
            }}
          />{' '}
          Planned
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span
            style={{
              width: 12,
              height: 12,
              backgroundColor: '#EA4335',
              display: 'inline-block',
              borderRadius: '2px',
            }}
          />{' '}
          Actual (Over Budget)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <span
            style={{
              width: 12,
              height: 12,
              backgroundColor: '#34A853',
              display: 'inline-block',
              borderRadius: '2px',
            }}
          />{' '}
          Actual (Under Budget)
        </span>
      </div>

      <div style={{ width: '100%', height: '280px' }}>
        {data.length === 0 && !errorMessage ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              color: darkMode ? '#bbb' : '#555',
              fontStyle: 'italic',
            }}
          >
            No data available for the selected filters.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 25, right: 10, left: 35, bottom: 40 }}>
              <XAxis
                dataKey="project"
                stroke={darkMode ? '#888' : '#333'}
                tick={{ fontSize: 11, fill: darkMode ? '#aaa' : '#333' }}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis
                tick={{ fontSize: 11, fill: darkMode ? '#aaa' : '#333' }}
                axisLine
                tickLine
                tickFormatter={value => `$${value}`}
              />
              <Tooltip
                content={<CustomTooltip darkMode={darkMode} />}
                cursor={{ fill: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
                wrapperStyle={{ backgroundColor: 'transparent', outline: 'none' }}
                contentStyle={{ backgroundColor: 'transparent', border: 'none' }}
              />
              <Bar dataKey="planned" fill="#4285F4" name="Planned" radius={[2, 2, 0, 0]}>
                <LabelList
                  dataKey="planned"
                  position="top"
                  style={{ fontSize: 10, fill: '#8ab4f8' }}
                  formatter={val => `$${val}`}
                />
              </Bar>
              <Bar dataKey="actual" name="Actual" radius={[2, 2, 0, 0]}>
                <LabelList dataKey="varianceLabel" content={renderVarianceLabel} />
                {data.map(entry => (
                  <Cell
                    key={`cell-${entry.project}`}
                    fill={entry.variance > 0 ? '#EA4335' : '#34A853'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

ExpenseBarChart.propTypes = {
  darkMode: PropTypes.bool,
};
