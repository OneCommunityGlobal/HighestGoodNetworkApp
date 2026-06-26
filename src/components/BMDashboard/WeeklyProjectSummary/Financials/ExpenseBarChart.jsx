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
    date: '2026-05-01',
  },
  {
    projectId: 'Project A',
    category: 'Electrical',
    plannedCost: 1500,
    actualCost: 1300,
    date: '2026-05-02',
  },
  {
    projectId: 'Project B',
    category: 'Plumbing',
    plannedCost: 1100,
    actualCost: 1050,
    date: '2026-05-03',
  },
  {
    projectId: 'Project B',
    category: 'Structural',
    plannedCost: 2200,
    actualCost: 2150,
    date: '2026-05-04',
  },
  {
    projectId: 'Project C',
    category: 'Mechanical',
    plannedCost: 1300,
    actualCost: 1800,
    date: '2026-05-05',
  },
  {
    projectId: 'Project A',
    category: 'Structural',
    plannedCost: 900,
    actualCost: 1400,
    date: '2026-05-08',
  },
  {
    projectId: 'Project B',
    category: 'Electrical',
    plannedCost: 2000,
    actualCost: 1600,
    date: '2026-05-09',
  },
  {
    projectId: 'Project C',
    category: 'Plumbing',
    plannedCost: 800,
    actualCost: 750,
    date: '2026-05-10',
  },
  {
    projectId: 'Project A',
    category: 'Mechanical',
    plannedCost: 2500,
    actualCost: 2400,
    date: '2026-05-11',
  },
  {
    projectId: 'Project C',
    category: 'Electrical',
    plannedCost: 1800,
    actualCost: 2100,
    date: '2026-05-12',
  },
  {
    projectId: 'Project B',
    category: 'Structural',
    plannedCost: 3000,
    actualCost: 3500,
    date: '2026-05-15',
  },
  {
    projectId: 'Project B',
    category: 'Mechanical',
    plannedCost: 1500,
    actualCost: 1400,
    date: '2026-05-16',
  },
  {
    projectId: 'Project A',
    category: 'Plumbing',
    plannedCost: 1200,
    actualCost: 1100,
    date: '2026-05-17',
  },
  {
    projectId: 'Project C',
    category: 'Structural',
    plannedCost: 4000,
    actualCost: 4200,
    date: '2026-05-18',
  },
  {
    projectId: 'Project A',
    category: 'Electrical',
    plannedCost: 1700,
    actualCost: 1650,
    date: '2026-05-19',
  },
  {
    projectId: 'Project B',
    category: 'Plumbing',
    plannedCost: 1300,
    actualCost: 1100,
    date: '2026-05-22',
  },
  {
    projectId: 'Project C',
    category: 'Mechanical',
    plannedCost: 2100,
    actualCost: 2500,
    date: '2026-05-23',
  },
  {
    projectId: 'Project A',
    category: 'Structural',
    plannedCost: 2800,
    actualCost: 2800,
    date: '2026-05-24',
  },
  {
    projectId: 'Project B',
    category: 'Electrical',
    plannedCost: 1900,
    actualCost: 1750,
    date: '2026-05-25',
  },
  {
    projectId: 'Project C',
    category: 'Plumbing',
    plannedCost: 1500,
    actualCost: 1600,
    date: '2026-05-26',
  },
];

const isDateMatch = (entryDate, startDate, endDate) => {
  if (startDate && entryDate < startDate) return false;
  if (endDate && entryDate > endDate) return false;
  return true;
};

const isProjectMatch = (entryProject, projectId) => projectId === '' || entryProject === projectId;
const isCategoryMatch = (entryCategory, categoryFilter) =>
  categoryFilter === 'ALL' || entryCategory === categoryFilter;

const getFilteredAndAggregatedData = (startDate, endDate, projectId, categoryFilter) => {
  const filtered = rawData.filter(
    entry =>
      isDateMatch(entry.date, startDate, endDate) &&
      isProjectMatch(entry.projectId, projectId) &&
      isCategoryMatch(entry.category, categoryFilter),
  );

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

const getTheme = darkMode => {
  const mode = darkMode ? 'dark' : 'light';
  return {
    inputBg: { dark: '#2d3748', light: '#fff' }[mode],
    inputText: { dark: '#f8fafc', light: '#0f172a' }[mode],
    inputBorder: { dark: '1px solid #475569', light: '1px solid #cbd5e1' }[mode],
    labelColor: { dark: '#e2e8f0', light: '#334155' }[mode],
    titleColor: { dark: '#f8fafc', light: '#1e293b' }[mode],
    legendColor: { dark: '#cbd5e1', light: '#334155' }[mode],
    emptyTextColor: { dark: '#94a3b8', light: '#64748b' }[mode],
    axisStroke: { dark: '#64748b', light: '#94a3b8' }[mode],
    axisTick: { dark: '#cbd5e1', light: '#475569' }[mode],
    cursorFill: { dark: 'rgba(255, 255, 255, 0.05)', light: 'rgba(0, 0, 0, 0.05)' }[mode],
    tooltipBg: { dark: '#1e293b', light: '#ffffff' }[mode],
    tooltipBorder: { dark: '1px solid #334155', light: '1px solid #e2e8f0' }[mode],
    tooltipText: { dark: '#f8fafc', light: '#0f172a' }[mode],
    tooltipHeaderBorder: { dark: '1px solid #475569', light: '1px solid #f1f5f9' }[mode],
    tooltipHeaderColor: { dark: '#94a3b8', light: '#64748b' }[mode],
    overBudget: { dark: '#ff4444', light: '#e74c3c' }[mode],
    underBudget: { dark: '#4ade80', light: '#2ecc71' }[mode],
  };
};

const VarianceLabel = props => {
  const { x, y, width, value, darkMode } = props;
  const isOver = value?.toString().startsWith('+');
  const theme = getTheme(darkMode);

  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill={isOver ? theme.overBudget : theme.underBudget}
      fontSize="11"
      fontWeight="bold"
      textAnchor="middle"
    >
      {value}
    </text>
  );
};

VarianceLabel.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  darkMode: PropTypes.bool,
};

const CustomTooltip = ({ active, payload, label, darkMode }) => {
  if (!active || !payload?.length) return null;

  const chartData = payload[0].payload;
  const isOverBudget = chartData.variance > 0;
  const theme = getTheme(darkMode);

  const varianceColor = isOverBudget ? theme.overBudget : theme.underBudget;

  return (
    <div
      style={{
        backgroundColor: theme.tooltipBg,
        border: theme.tooltipBorder,
        color: theme.tooltipText,
        padding: '12px',
        fontSize: '12px',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      <style>{`
        .recharts-tooltip-variance-expense {
          color: ${varianceColor} !important;
          margin: 8px 0 0 0 !important;
          font-weight: bold !important;
        }
      `}</style>
      <div
        style={{
          fontWeight: 'bold',
          margin: '0 0 8px 0',
          borderBottom: theme.tooltipHeaderBorder,
          paddingBottom: '6px',
          color: theme.tooltipHeaderColor,
        }}
      >
        {label}
      </div>
      <div style={{ margin: '0 0 4px 0' }}>
        Planned: <strong>${chartData.planned.toLocaleString()}</strong>
      </div>
      <div style={{ margin: '0 0 4px 0' }}>
        Actual: <strong>${chartData.actual.toLocaleString()}</strong>
      </div>
      <div className="recharts-tooltip-variance-expense">
        Variance: {chartData.variance > 0 ? '+' : ''}${chartData.variance.toLocaleString()} (
        {chartData.variancePercent})
      </div>
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

  const theme = getTheme(darkMode);

  const today = new Date();
  const localTodayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(today.getDate()).padStart(2, '0')}`;

  const labelGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.4rem',
    color: theme.labelColor,
    fontWeight: '600',
    fontSize: '0.85rem',
    width: '100%',
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '4px',
    backgroundColor: theme.inputBg,
    color: theme.inputText,
    border: theme.inputBorder,
    outline: 'none',
    boxSizing: 'border-box',
    colorScheme: darkMode ? 'dark' : 'light',
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
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <h4 style={{ margin: 0, color: theme.titleColor, fontSize: '1.3rem', fontWeight: 'bold' }}>
          Planned vs Actual Cost
        </h4>
        {errorMessage && (
          <div style={{ color: '#ff5252', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            {errorMessage}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          columnGap: '1.5rem',
          rowGap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={labelGroupStyle}>
          Project:
          <select value={projectId} onChange={e => setProjectId(e.target.value)} style={inputStyle}>
            <option value="">All</option>
            {projects.map(p => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div style={labelGroupStyle}>
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
        </div>
        <div style={labelGroupStyle}>
          Start Date:
          <input
            type="date"
            value={startDate}
            max={endDate || localTodayString}
            onChange={e => setStartDate(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={labelGroupStyle}>
          End Date:
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            max={localTodayString}
            onChange={e => setEndDate(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1.5rem',
          fontSize: '0.85rem',
          fontWeight: '500',
          marginBottom: '1.5rem',
          color: theme.legendColor,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span
            style={{
              width: 14,
              height: 14,
              backgroundColor: '#4285F4',
              display: 'inline-block',
              borderRadius: '2px',
            }}
          />{' '}
          Planned
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span
            style={{
              width: 14,
              height: 14,
              backgroundColor: theme.overBudget,
              display: 'inline-block',
              borderRadius: '2px',
            }}
          />{' '}
          Actual (Over Budget)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span
            style={{
              width: 14,
              height: 14,
              backgroundColor: theme.underBudget,
              display: 'inline-block',
              borderRadius: '2px',
            }}
          />{' '}
          Actual (Under Budget)
        </span>
      </div>

      <div style={{ width: '100%', height: '300px' }}>
        {data.length === 0 && !errorMessage ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              color: theme.emptyTextColor,
              fontStyle: 'italic',
            }}
          >
            No data available for the selected filters.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 25, right: 10, left: 20, bottom: 0 }}>
              <XAxis
                dataKey="project"
                stroke={theme.axisStroke}
                tick={{ fontSize: 12, fill: theme.axisTick, fontWeight: 500 }}
                interval={0}
                tickMargin={8}
              />
              <YAxis
                stroke={theme.axisStroke}
                tick={{ fontSize: 12, fill: theme.axisTick }}
                axisLine
                tickLine
                tickFormatter={value => `$${value.toLocaleString()}`}
              />
              <Tooltip
                content={<CustomTooltip darkMode={darkMode} />}
                cursor={{ fill: theme.cursorFill }}
                wrapperStyle={{ backgroundColor: 'transparent', outline: 'none' }}
                contentStyle={{ backgroundColor: 'transparent', border: 'none' }}
              />
              <Bar dataKey="planned" fill="#4285F4" name="Planned" radius={[3, 3, 0, 0]}>
                <LabelList
                  dataKey="planned"
                  position="top"
                  style={{ fontSize: 11, fill: '#8ab4f8', fontWeight: 'bold' }}
                  formatter={val => `$${val.toLocaleString()}`}
                />
              </Bar>
              <Bar dataKey="actual" name="Actual" radius={[3, 3, 0, 0]}>
                <LabelList
                  dataKey="varianceLabel"
                  content={<VarianceLabel darkMode={darkMode} />}
                />
                {data.map(entry => (
                  <Cell
                    key={`cell-${entry.project}`}
                    fill={entry.variance > 0 ? theme.overBudget : theme.underBudget}
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
