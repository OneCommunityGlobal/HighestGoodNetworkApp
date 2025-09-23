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

// Sample data
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

// Get unique projects
const projects = ['All Projects', ...new Set(toolsData.map(item => item.project))];

// Custom date picker component
function DateRangePicker({ dateRange, setDateRange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState(dateRange);
  const pickerRef = useRef(null);

  // Close the date picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
              <label
                htmlFor="start-date"
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '4px',
                }}
              >
                Start Date
              </label>
              <input
                type="date"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                }}
                value={tempRange.from ? format(tempRange.from, 'yyyy-MM-dd') : ''}
                onChange={handleStartDateChange}
              />
            </div>
            <div>
              <label
                htmlFor="end-date"
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '4px',
                }}
              >
                End Date
              </label>
              <input
                type="date"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                }}
                value={tempRange.to ? format(tempRange.to, 'yyyy-MM-dd') : ''}
                onChange={handleEndDateChange}
              />
            </div>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              style={{
                padding: '8px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={applyDateRange}
              onMouseOver={e => {
                e.target.style.backgroundColor = '#2563eb';
              }}
              onMouseOut={e => {
                e.target.style.backgroundColor = '#3b82f6';
              }}
              onFocus={e => {
                e.target.style.backgroundColor = '#2563eb';
              }}
              onBlur={e => {
                e.target.style.backgroundColor = '#3b82f6';
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

export default function SimpleToolChart() {
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [dateRange, setDateRange] = useState({
    from: new Date(2023, 0, 1),
    to: new Date(2023, 11, 31),
  });

  // Filter and process data based on selected project and date range
  const filteredData = useMemo(() => {
    let filtered = [...toolsData];

    // Filter by date
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= dateRange.from && itemDate <= dateRange.to;
      });
    }

    // Filter by project
    if (selectedProject !== 'All Projects') {
      filtered = filtered.filter(item => item.project === selectedProject);
    }

    // Combine and average tool data across filtered projects
    const toolMap = {};

    filtered.forEach(project => {
      project.tools.forEach(tool => {
        if (!toolMap[tool.name]) {
          toolMap[tool.name] = {
            count: 1,
            total: tool.replacedPercentage,
          };
        } else {
          toolMap[tool.name].count += 1;
          toolMap[tool.name].total += tool.replacedPercentage;
        }
      });
    });

    // Calculate averages and format for chart
    const result = Object.keys(toolMap).map(toolName => ({
      name: toolName,
      replacedPercentage: Math.round(toolMap[toolName].total / toolMap[toolName].count),
    }));

    // Sort by replaced percentage (highest first)
    return result.sort((a, b) => b.replacedPercentage - a.replacedPercentage);
  }, [selectedProject, dateRange]);

  return (
    <div
      style={{
        width: '100%',
        padding: '24px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }}
    >
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '24px',
        }}
      >
        Tools Most Susceptible to Breakdown
      </h2>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          justifyContent: 'space-between',
          marginBottom: '24px',
        }}
      >
        {/* Project Filter */}
        <div style={{ width: '100%' }}>
          <label
            htmlFor="project-filter"
            style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}
          >
            Project
          </label>
          <select
            style={{
              width: '100%',
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
            }}
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
          >
            {projects.map(project => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div style={{ width: '100%' }}>
          <label
            htmlFor="date-filter"
            style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}
          >
            Date Range
          </label>
          <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
        </div>
      </div>

      {/* Chart */}
      <div
        style={{
          height: '400px',
          marginTop: '24px',
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={filteredData}
            margin={{ top: 20, right: 50, left: 70, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tickCount={6} unit="%" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 14 }} />
            <Tooltip
              formatter={value => [`${value}%`, 'Replaced Percentage']}
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            />
            <Bar dataKey="replacedPercentage" fill="#3b82f6" radius={[0, 4, 4, 0]}>
              <LabelList
                dataKey="replacedPercentage"
                position="right"
                formatter={value => `${value}%`}
                style={{ fill: '#374151', fontWeight: 500 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {filteredData.length === 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            color: '#6b7280',
          }}
        >
          No data available for the selected filters
        </div>
      )}
    </div>
  );
}
