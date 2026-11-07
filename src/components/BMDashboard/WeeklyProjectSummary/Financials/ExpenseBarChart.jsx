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
import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { ENDPOINTS } from '../../../../utils/URL';

const isDateMatch = (entryDate, startDate, endDate) => {
  if (startDate && entryDate < startDate) return false;
  if (endDate && entryDate > endDate) return false;
  return true;
};

const isProjectMatch = (entryProject, projectId) => projectId === '' || entryProject === projectId;
const isCategoryMatch = (entryCategory, categoryFilter) =>
  categoryFilter === 'ALL' || entryCategory === categoryFilter;

const getFilteredAndAggregatedData = (rawData, startDate, endDate, projectId, categoryFilter) => {
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
      // planned stays null until a real (non-null) plannedCost entry is seen, so a
      // project with no real budget data doesn't silently display as "$0 planned".
      aggregated[key] = { project: key, planned: null, actual: 0 };
    }
    if (entry.plannedCost !== null && entry.plannedCost !== undefined) {
      aggregated[key].planned = (aggregated[key].planned || 0) + entry.plannedCost;
    }
    aggregated[key].actual += entry.actualCost;
  });

  return Object.values(aggregated).map(item => {
    const hasPlanned = item.planned !== null;
    item.variance = hasPlanned ? item.actual - item.planned : null;
    if (!hasPlanned) {
      item.variancePercent = null;
      item.varianceLabel = 'Planned: N/A';
    } else {
      const percent = item.planned === 0 ? 0 : ((item.variance / item.planned) * 100).toFixed(1);
      item.variancePercent = percent > 0 ? `+${percent}%` : `${percent}%`;
      item.varianceLabel =
        item.variance > 0 ? `+$${item.variance}` : `-$${Math.abs(item.variance)}`;
    }
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
    buttonBg: { dark: '#374151', light: '#dededeff' }[mode],
    buttonText: { dark: '#f8fafc', light: '#0f172a' }[mode],
    buttonBorder: { dark: '1px solid #4b5563', light: '1px solid #d9d2d2ff' }[mode],
    buttonHoverBg: { dark: '#4b5563', light: '#d1d5db' }[mode],
  };
};

const VarianceLabel = props => {
  const { x, y, width, value, darkMode } = props;
  const theme = getTheme(darkMode);

  let fill;
  if (value === 'Planned: N/A') {
    fill = theme.emptyTextColor;
  } else {
    fill = value?.toString().startsWith('+') ? theme.overBudget : theme.underBudget;
  }

  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill={fill}
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
        Planned:{' '}
        <strong>
          {chartData.planned === null ? 'N/A' : `$${chartData.planned.toLocaleString()}`}
        </strong>
      </div>
      <div style={{ margin: '0 0 4px 0' }}>
        Actual: <strong>${chartData.actual.toLocaleString()}</strong>
      </div>
      <div className="recharts-tooltip-variance-expense">
        {chartData.variance === null
          ? 'Variance: no planned budget data available'
          : `Variance: ${
              chartData.variance > 0 ? '+' : ''
            }$${chartData.variance.toLocaleString()} (${chartData.variancePercent})`}
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

  const [rawEntries, setRawEntries] = useState([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingEntries(true);
    axios
      .get(ENDPOINTS.BM_PROJECT_COST_ENTRIES())
      .then(({ data: entries }) => {
        if (!cancelled) setRawEntries(entries);
      })
      .catch(() => {
        if (!cancelled) setErrorMessage('Unable to load cost data from the server.');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingEntries(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const projects = useMemo(() => [...new Set(rawEntries.map(entry => entry.projectId))].sort(), [
    rawEntries,
  ]);
  const categories = useMemo(() => [...new Set(rawEntries.map(entry => entry.category))].sort(), [
    rawEntries,
  ]);

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
  // Reset all the filters
  const resetFilters = () => {
    setProjectId('');
    setCategoryFilter('ALL');
    setStartDate('');
    setEndDate('');
    setErrorMessage('');
  };

  useEffect(() => {
    if (isLoadingEntries) return;
    try {
      const processedData = getFilteredAndAggregatedData(
        rawEntries,
        startDate,
        endDate,
        projectId,
        categoryFilter,
      );
      setData(processedData);
    } catch (error) {
      setErrorMessage('Something went wrong while loading chart data.');
    }
  }, [rawEntries, isLoadingEntries, projectId, categoryFilter, startDate, endDate]);

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
        {/* Reset Filters button */}
        <div
          style={{
            gridColumn: '1 / -1',
            display: 'flex',
            justifyContent: 'center',
            marginTop: '0.5rem',
          }}
        >
          <button
            type="button"
            onClick={resetFilters}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: '6px',
              border: darkMode ? '1px solid #475569' : '1px solid #cbd5e1',
              backgroundColor: darkMode ? '#334155' : '#f1f5f9',
              color: darkMode ? '#f8fafc' : '#0f172a',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = darkMode ? '#475569' : '#e2e8f0';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = darkMode ? '#334155' : '#f1f5f9';
            }}
            aria-label="Reset filters"
            title="Reset filters"
          >
            Reset Filter
          </button>
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
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span
            style={{
              width: 14,
              height: 14,
              backgroundColor: theme.emptyTextColor,
              display: 'inline-block',
              borderRadius: '2px',
            }}
          />{' '}
          Actual (No Planned Data Yet)
        </span>
      </div>

      <div style={{ width: '100%', height: '300px' }}>
        {isLoadingEntries ? (
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
            Loading cost data...
          </div>
        ) : data.length === 0 && !errorMessage ? (
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
            <BarChart data={data} margin={{ top: 25, right: 10, left: 20, bottom: 40 }}>
              <XAxis
                dataKey="project"
                stroke={theme.axisStroke}
                tick={{ fontSize: 12, fill: theme.axisTick, fontWeight: 500 }}
                interval={0}
                tickMargin={8}
                angle={-20}
                textAnchor="end"
                height={70}
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
                  formatter={val =>
                    val === null || val === undefined ? 'N/A' : `$${val.toLocaleString()}`
                  }
                />
              </Bar>
              <Bar dataKey="actual" name="Actual" radius={[3, 3, 0, 0]}>
                <LabelList
                  dataKey="varianceLabel"
                  content={<VarianceLabel darkMode={darkMode} />}
                />
                <LabelList
                  dataKey="actual"
                  position="insideTop"
                  style={{ fontSize: 12, fontWeight: 'bold', fill: '#fff' }}
                  formatter={val => `Actual: $${val.toLocaleString()}`}
                />
                {data.map(entry => {
                  let fill;
                  if (entry.variance === null) {
                    fill = theme.emptyTextColor;
                  } else {
                    fill = entry.variance > 0 ? theme.overBudget : theme.underBudget;
                  }
                  return <Cell key={`cell-${entry.project}`} fill={fill} />;
                })}
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
