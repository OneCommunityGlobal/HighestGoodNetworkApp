'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
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

// ---------- Sample Data ----------
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

// ---------- Date Range Picker ----------
function DateRangePicker({ dateRange, setDateRange }) {
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

  const handleStartDateChange = e => {
    setTempRange({ ...tempRange, from: new Date(e.target.value) });
  };

  const handleEndDateChange = e => {
    setTempRange({ ...tempRange, to: new Date(e.target.value) });
  };

  const applyDateRange = () => {
    setDateRange(tempRange);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }} ref={pickerRef}>
      <button
        type="button"
        style={{
          width: '100%',
          padding: '8px 16px',
          textAlign: 'left',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'white',
          cursor: 'pointer',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>
          {dateRange.from && dateRange.to
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
          style={{
            position: 'absolute',
            zIndex: 10,
            marginTop: '4px',
            width: '100%',
            backgroundColor: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '16px',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label htmlFor="startDate">Start Date</label>
              <input
                id="startDate"
                type="date"
                value={tempRange.from ? format(tempRange.from, 'yyyy-MM-dd') : ''}
                onChange={handleStartDateChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                }}
              />
            </div>
            <div>
              <label htmlFor="endDate">End Date</label>
              <input
                id="endDate"
                type="date"
                value={tempRange.to ? format(tempRange.to, 'yyyy-MM-dd') : ''}
                onChange={handleEndDateChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
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
                borderRadius: '6px',
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
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [dateRange, setDateRange] = useState({
    from: new Date(2023, 0, 1),
    to: new Date(2023, 11, 31),
  });

  const filteredData = useMemo(() => {
    let filtered = [...toolsData];

    // Date filtering
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= dateRange.from && itemDate <= dateRange.to;
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

    return Object.keys(toolMap)
      .map(name => ({
        name,
        replacedPercentage: Math.round(toolMap[name].total / toolMap[name].count),
      }))
      .sort((a, b) => b.replacedPercentage - a.replacedPercentage);
  }, [selectedProject, dateRange]);

  return (
    <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '8px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }}>
        Tools Most Susceptible to Breakdown
      </h2>

      {/* Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '16px 0' }}>
        <div>
          <label htmlFor="projectSelect">Project</label>
          <select
            id="projectSelect"
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
            }}
          >
            {projects.map(project => (
              <option key={project}>{project}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dateRangePicker">Date Range</label>
          <div id="dateRangePicker">
            <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: '400px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={filteredData}
            margin={{ top: 20, right: 50, left: 70, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} unit="%" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 14 }} />
            <Tooltip formatter={value => [`${value}%`, 'Replaced Percentage']} />
            <Bar dataKey="replacedPercentage" fill="#3b82f6" radius={[0, 4, 4, 0]}>
              <LabelList
                dataKey="replacedPercentage"
                position="right"
                content={({ value }) => <text fill="#374151" fontWeight="500">{`${value}%`}</text>}
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
