'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const toolsData = [
  {
    project: 'Project A',
    tools: [
      { name: 'Drill', replacedPercentage: 78 },
      { name: 'Hammer', replacedPercentage: 65 },
      { name: 'Saw', replacedPercentage: 52 },
      { name: 'Screwdriver', replacedPercentage: 45 },
      { name: 'Wrench', replacedPercentage: 38 },
      { name: 'Pliers', replacedPercentage: 25 },
    ],
    date: '2023-01-15',
  },
  {
    project: 'Project B',
    tools: [
      { name: 'Saw', replacedPercentage: 82 },
      { name: 'Drill', replacedPercentage: 70 },
      { name: 'Pliers', replacedPercentage: 58 },
      { name: 'Hammer', replacedPercentage: 42 },
      { name: 'Wrench', replacedPercentage: 35 },
      { name: 'Screwdriver', replacedPercentage: 20 },
    ],
    date: '2023-02-20',
  },
  {
    project: 'Project C',
    tools: [
      { name: 'Wrench', replacedPercentage: 85 },
      { name: 'Pliers', replacedPercentage: 72 },
      { name: 'Hammer', replacedPercentage: 60 },
      { name: 'Drill', replacedPercentage: 48 },
      { name: 'Screwdriver', replacedPercentage: 32 },
      { name: 'Saw', replacedPercentage: 22 },
    ],
    date: '2023-03-10',
  },
];

// ---------- Projects Dropdown ----------
const projects = ['All Projects', ...new Set(toolsData.map(item => item.project))];
const topNOptions = [3, 5, 10, 'All'];
const sortOptions = [
  { value: 'highest', label: 'Highest Risk First' },
  { value: 'lowest', label: 'Lowest Risk First' },
  { value: 'alpha', label: 'Tool Name (A-Z)' },
];

const getControlStyle = darkMode => ({
  width: '100%',
  minHeight: '42px',
  padding: '0 12px',
  border: '1px solid',
  borderColor: darkMode ? '#444' : '#d1d5db',
  color: darkMode ? '#e5e5e5' : '#111',
  backgroundColor: darkMode ? '#1C2541' : '#ffffff',
  borderRadius: '8px',
  fontSize: '0.95rem',
  boxSizing: 'border-box',
  outlineColor: darkMode ? '#93c5fd' : '#2563eb',
});

function ToolChartTooltip({ active, payload, darkMode }) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        backgroundColor: darkMode ? '#0f172a' : 'rgba(255, 255, 255, 0.95)',
        border: darkMode ? '1px solid #93c5fd' : '1px solid #d1d5db',
        color: darkMode ? '#f8fafc' : '#111827',
        borderRadius: '8px',
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.35)',
        padding: '10px 12px',
        minWidth: '180px',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: '4px' }}>{point.name}</div>
      <div style={{ fontSize: '13px', lineHeight: 1.4 }}>
        Exact replacement rate: <strong>{point.replacedPercentage.toFixed(1)}%</strong>
      </div>
      <div style={{ fontSize: '12px', opacity: 0.95, marginTop: '3px' }}>
        Higher percentages indicate more frequent replacement needs.
      </div>
    </div>
  );
}

// ---------- Date Range Picker ----------
function DateRangePicker({ dateRange, setDateRange }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState(dateRange);
  const pickerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (
      dateRange.from instanceof Date &&
      !isNaN(dateRange.from) &&
      dateRange.to instanceof Date &&
      !isNaN(dateRange.to)
    ) {
      setTempRange({
        from: format(dateRange.from, 'yyyy-MM-dd'),
        to: format(dateRange.to, 'yyyy-MM-dd'),
      });
    }
  }, [dateRange]);

  const isValidCalendarDate = value => {
    // Accept valid Date objects
    if (value instanceof Date && !isNaN(value.getTime())) {
      return true;
    }

    // Accept valid YYYY-MM-DD strings
    if (typeof value !== 'string') return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

    const [y, m, d] = value.split('-').map(Number);
    const date = new Date(y, m - 1, d);

    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  };

  const handleStartDateChange = e => {
    const val = e.target.value;
    setTempRange(prev => ({ ...prev, from: val }));
  };

  const handleEndDateChange = e => {
    const val = e.target.value;
    setTempRange(prev => ({ ...prev, to: val }));
  };

  const applyDateRange = () => {
    if (!isValidCalendarDate(tempRange.from) || !isValidCalendarDate(tempRange.to)) {
      toast.error('Enter a valid date');
      return;
    }

    const fromDate = new Date(`${tempRange.from}T00:00:00`);
    const toDate = new Date(`${tempRange.to}T23:59:59`);

    if (fromDate > toDate) {
      toast.error('Enter a valid date');
      return;
    }

    setDateRange({ from: fromDate, to: toDate });

    // sync tempRange so selected dates render in the button label
    setTempRange({
      from: format(fromDate, 'yyyy-MM-dd'),
      to: format(toDate, 'yyyy-MM-dd'),
    });

    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }} ref={pickerRef}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="tool-date-range-dialog"
        aria-label="Open date range picker"
        style={{
          ...getControlStyle(darkMode),
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>
          {dateRange.from instanceof Date &&
          !isNaN(dateRange.from) &&
          dateRange.to instanceof Date &&
          !isNaN(dateRange.to)
            ? `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(dateRange.to, 'MMM dd, yyyy')}`
            : 'Select date range'}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {isOpen && (
        <div
          id="tool-date-range-dialog"
          style={{
            position: 'absolute',
            zIndex: 10,
            marginTop: '4px',
            width: '100%',
            backgroundColor: darkMode ? '#1C2541' : 'white',
            border: '1px solid',
            borderColor: darkMode ? '#444' : '#d1d5db',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '16px',
            color: darkMode ? '#e5e5e5' : '#111',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label htmlFor="startDate" style={{ color: darkMode ? '#e5e5e5' : '#111' }}>
                Start Date
              </label>
              <input
                id="startDate"
                type="text"
                placeholder="YYYY-MM-DD"
                maxLength="10"
                pattern="\d{4}-\d{2}-\d{2}"
                value={
                  typeof tempRange.from === 'string'
                    ? tempRange.from
                    : tempRange.from
                    ? format(tempRange.from, 'yyyy-MM-dd')
                    : ''
                }
                onChange={handleStartDateChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid',
                  borderColor: darkMode ? '#444' : '#d1d5db',
                  backgroundColor: darkMode ? '#3A506B' : '#fff',
                  color: darkMode ? '#e5e5e5' : '#111',
                }}
              />
            </div>
            <div>
              <label htmlFor="endDate" style={{ color: darkMode ? '#e5e5e5' : '#111' }}>
                End Date
              </label>
              <input
                id="endDate"
                type="text"
                placeholder="YYYY-MM-DD"
                maxLength="10"
                pattern="\d{4}-\d{2}-\d{2}"
                value={
                  typeof tempRange.to === 'string'
                    ? tempRange.to
                    : tempRange.to
                    ? format(tempRange.to, 'yyyy-MM-dd')
                    : ''
                }
                onChange={handleEndDateChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid',
                  borderColor: darkMode ? '#444' : '#d1d5db',
                  backgroundColor: darkMode ? '#3A506B' : '#fff',
                  color: darkMode ? '#e5e5e5' : '#111',
                }}
              />
            </div>
          </div>
          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <button
              onClick={applyDateRange}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Main Chart Component ----------
export default function SimpleToolChart() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [sortBy, setSortBy] = useState('highest');
  const [topN, setTopN] = useState('All');
  const [showInfo, setShowInfo] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(2023, 0, 1),
    to: new Date(2023, 11, 31),
  });

  const filteredData = useMemo(() => {
    let filtered = [...toolsData];

    // Date filtering
    if (dateRange.from && dateRange.to) {
      const fromDate =
        typeof dateRange.from === 'string'
          ? new Date(dateRange.from + 'T00:00:00')
          : dateRange.from;
      const toDate =
        typeof dateRange.to === 'string' ? new Date(dateRange.to + 'T23:59:59') : dateRange.to;

      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        return (
          !isNaN(fromDate.getTime()) &&
          !isNaN(toDate.getTime()) &&
          itemDate >= fromDate &&
          itemDate <= toDate
        );
      });
    }

    // Project filtering
    if (selectedProject !== 'All Projects') {
      filtered = filtered.filter(item => item.project === selectedProject);
    }

    // Combine and average data
    const toolMap = {};
    filtered.forEach(project => {
      project.tools.forEach(tool => {
        if (!toolMap[tool.name]) {
          toolMap[tool.name] = { count: 1, total: tool.replacedPercentage };
        } else {
          toolMap[tool.name].count += 1;
          toolMap[tool.name].total += tool.replacedPercentage;
        }
      });
    });

    const aggregated = Object.keys(toolMap).map(name => ({
      name,
      replacedPercentage: Number((toolMap[name].total / toolMap[name].count).toFixed(1)),
    }));

    let sorted = [...aggregated];
    if (sortBy === 'highest') sorted.sort((a, b) => b.replacedPercentage - a.replacedPercentage);
    if (sortBy === 'lowest') sorted.sort((a, b) => a.replacedPercentage - b.replacedPercentage);
    if (sortBy === 'alpha') sorted.sort((a, b) => a.name.localeCompare(b.name));

    if (topN !== 'All') {
      return sorted.slice(0, Number(topN));
    }
    return sorted;
  }, [selectedProject, dateRange, sortBy, topN]);

  const leadingTool = filteredData[0];
  const insightText = leadingTool
    ? `${
        leadingTool.name
      } is currently the highest-risk tool at ${leadingTool.replacedPercentage.toFixed(1)}%.`
    : 'No replacement trend is available for the selected filters.';

  return (
    <div
      className={darkMode ? 'dark-mode' : ''}
      style={{
        width: '100%',
        maxWidth: '100%',
        minWidth: '100%',
        padding: '24px',
        backgroundColor: darkMode ? '#1B2A41' : '#ffffff',
        color: darkMode ? '#e5e5e5' : '#111',
        boxSizing: 'border-box',
      }}
    >
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          color: darkMode ? '#e5e5e5' : '#111',
          letterSpacing: darkMode ? '0.2px' : 'normal',
        }}
      >
        Tools Most Susceptible to Breakdown
      </h2>
      <div
        style={{
          marginTop: '8px',
          marginBottom: '6px',
          textAlign: 'center',
          color: darkMode ? '#cbd5e1' : '#374151',
          fontSize: '0.95rem',
          lineHeight: 1.45,
        }}
      >
        {insightText}
      </div>

      {/* Filters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          margin: '16px auto',
          maxWidth: '980px',
          alignItems: 'end',
        }}
      >
        <div>
          <label htmlFor="projectSelect" style={{ color: darkMode ? '#e5e5e5' : '#111' }}>
            Project
          </label>
          <select
            id="projectSelect"
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            aria-label="Filter chart by project"
            style={getControlStyle(darkMode)}
          >
            {projects.map(project => (
              <option key={project}>{project}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dateRangePicker" style={{ color: darkMode ? '#e5e5e5' : '#111' }}>
            Date Range
          </label>
          <div id="dateRangePicker">
            <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
          </div>
        </div>

        <div>
          <label htmlFor="sortBySelect" style={{ color: darkMode ? '#e5e5e5' : '#111' }}>
            Quick Sort
          </label>
          <select
            id="sortBySelect"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            aria-label="Sort tools by replacement trend"
            style={getControlStyle(darkMode)}
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="topNSelect" style={{ color: darkMode ? '#e5e5e5' : '#111' }}>
            Focus (Top N)
          </label>
          <select
            id="topNSelect"
            value={topN}
            onChange={e => setTopN(e.target.value)}
            aria-label="Limit results to top N tools"
            style={getControlStyle(darkMode)}
          >
            {topNOptions.map(option => (
              <option key={option} value={option}>
                {option === 'All' ? 'All Tools' : `Top ${option}`}
              </option>
            ))}
          </select>
        </div>

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            aria-describedby="tool-chart-info"
            aria-label="Show chart data meaning"
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
            onFocus={() => setShowInfo(true)}
            onBlur={() => setShowInfo(false)}
            style={{
              border: '1px solid',
              borderColor: darkMode ? '#64748b' : '#9ca3af',
              background: darkMode ? '#0f172a' : '#f8fafc',
              color: darkMode ? '#e2e8f0' : '#1f2937',
              borderRadius: '999px',
              padding: '6px 12px',
              fontSize: darkMode ? '0.95rem' : '0.9rem',
              cursor: 'help',
              outlineColor: darkMode ? '#93c5fd' : '#2563eb',
            }}
          >
            What this means
          </button>
          {showInfo && (
            <div
              id="tool-chart-info"
              role="tooltip"
              style={{
                position: 'absolute',
                top: '38px',
                left: 0,
                zIndex: 4,
                width: 'min(92vw, 460px)',
                backgroundColor: darkMode ? '#0f172a' : 'rgba(255, 255, 255, 0.95)',
                color: darkMode ? '#f8fafc' : '#111827',
                border: darkMode ? '1px solid #93c5fd' : '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '10px 12px',
                boxShadow: '0 8px 18px rgba(0, 0, 0, 0.35)',
                lineHeight: 1.45,
                fontSize: darkMode ? '0.95rem' : '0.9rem',
              }}
            >
              This chart shows average replacement percentage by tool for the selected filters.
              Higher values mean more frequent replacements and higher maintenance risk.
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div
        style={{
          height: '400px',
          width: '100%',
          backgroundColor: darkMode ? '#3A506B' : '#ffffff',
          padding: '16px',
          boxSizing: 'border-box',
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={filteredData}
            margin={{ top: 20, right: 50, left: 70, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke={darkMode ? '#333' : '#e5e5e5'}
            />
            <XAxis
              type="number"
              domain={[0, 100]}
              unit="%"
              tick={{ fill: darkMode ? '#e5e5e5' : '#111' }}
              axisLine={{ stroke: darkMode ? '#555' : '#111' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 14, fill: darkMode ? '#e5e5e5' : '#111' }}
            />
            <Tooltip
              content={<ToolChartTooltip darkMode={darkMode} />}
              cursor={{ fill: darkMode ? 'rgba(147, 197, 253, 0.18)' : 'rgba(30, 64, 175, 0.10)' }}
            />
            <Bar
              dataKey="replacedPercentage"
              fill={darkMode ? '#4f9bff' : '#3b82f6'}
              stroke={darkMode ? '#a8c8ff' : '#1e40af'}
              strokeWidth={1.5}
            >
              <LabelList
                dataKey="replacedPercentage"
                position="right"
                content={({ value }) => (
                  <text fill={darkMode ? '#e5e5e5' : '#374151'} fontWeight="600">
                    {`${value}%`}
                  </text>
                )}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {filteredData.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '32px', color: '#6b7280' }}>
          No data available for the selected filters
        </div>
      )}
    </div>
  );
}
