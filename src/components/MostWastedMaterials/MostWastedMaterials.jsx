'use client';

import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

// Mock data for demonstration
const mockProjects = [
  { id: 'all', name: 'All Projects' },
  { id: 'project-1', name: 'Construction Site A' },
  { id: 'project-2', name: 'Office Building B' },
  { id: 'project-3', name: 'Residential Complex C' },
];

const mockData = {
  all: [
    { material: 'Concrete', wastePercentage: 15.8 },
    { material: 'Steel Rebar', wastePercentage: 12.3 },
    { material: 'Lumber', wastePercentage: 11.7 },
    { material: 'Drywall', wastePercentage: 9.4 },
    { material: 'Insulation', wastePercentage: 8.9 },
    { material: 'Tiles', wastePercentage: 7.2 },
    { material: 'Paint', wastePercentage: 6.8 },
    { material: 'Electrical Wire', wastePercentage: 5.1 },
  ],
  'project-1': [
    { material: 'Concrete', wastePercentage: 18.2 },
    { material: 'Steel Rebar', wastePercentage: 14.1 },
    { material: 'Lumber', wastePercentage: 10.3 },
    { material: 'Drywall', wastePercentage: 8.7 },
    { material: 'Insulation', wastePercentage: 7.9 },
  ],
  'project-2': [
    { material: 'Drywall', wastePercentage: 13.5 },
    { material: 'Steel Rebar', wastePercentage: 11.8 },
    { material: 'Concrete', wastePercentage: 10.9 },
    { material: 'Tiles', wastePercentage: 9.2 },
    { material: 'Paint', wastePercentage: 8.4 },
  ],
  'project-3': [
    { material: 'Lumber', wastePercentage: 16.3 },
    { material: 'Insulation', wastePercentage: 12.7 },
    { material: 'Drywall', wastePercentage: 11.1 },
    { material: 'Paint', wastePercentage: 9.8 },
    { material: 'Tiles', wastePercentage: 6.5 },
  ],
};

// Custom Dropdown Component
function CustomDropdown({ options, selected, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '8px 16px',
          textAlign: 'left',
          backgroundColor: '#ffffff',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{selected.name}</span>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            width: '100%',
            marginTop: '4px',
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          {options.map(option => (
            <button
              type="button"
              key={option.id}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: '8px 16px',
                textAlign: 'left',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                e.target.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={e => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Custom Label component for displaying percentages on bars
function CustomLabel(props) {
  const { x, y, width, value } = props;
  return (
    <text
      x={x + width / 2}
      y={y - 5}
      fill="#374151"
      textAnchor="middle"
      fontSize="12"
      fontWeight="500"
    >
      {`${value}%`}
    </text>
  );
}

// Custom Tooltip Component
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '12px',
        }}
      >
        <p style={{ fontWeight: '500', color: '#111827', margin: '0 0 4px 0' }}>{label}</p>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>
          Waste: {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
}

export default function MostWastedMaterialsDashboard() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [selectedProject, setSelectedProject] = useState(mockProjects[0]);
  const [dateRange, setDateRange] = useState({
    from: '2024-01-01',
    to: new Date().toISOString().split('T')[0],
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const data = mockData[selectedProject.id] || mockData.all;
    const sortedData = [...data].sort((a, b) => b.wastePercentage - a.wastePercentage);
    setChartData(sortedData);
  }, [selectedProject, dateRange]);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px',
        backgroundColor: '#f9fafb',
        minHeight: '100vh',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#111827',
            margin: '0',
          }}
        >
          Most Wasted Materials
        </h1>
      </div>

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Project Filter */}
          <div>
            <label
              htmlFor="project-filter"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
              }}
            >
              Project Filter
            </label>
            <CustomDropdown
              options={mockProjects}
              selected={selectedProject}
              onSelect={setSelectedProject}
            />
          </div>

          {/* Date Range Filter */}
          <div>
            <label
              htmlFor="date-filter"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
              }}
            >
              Date Filter
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label htmlFor="date-from" style={{ fontSize: '12px', color: '#6b7280' }}>
                  From
                </label>
                <input
                  id="date-from"
                  type="date"
                  value={dateRange.from}
                  onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label htmlFor="date-to" style={{ fontSize: '12px', color: '#6b7280' }}>
                  To
                </label>
                <input
                  id="date-to"
                  type="date"
                  value={dateRange.to}
                  onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ width: '100%', height: '500px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 30,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="material"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
                interval={0}
                tick={{ fill: darkMode ? '#ffffff' : '#374151' }}
              />
              <YAxis
                label={{
                  value: 'Percentage of Material Wasted (%)',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: darkMode ? '#ffffff' : '#374151' },
                }}
                fontSize={12}
                tick={{ fill: darkMode ? '#ffffff' : '#374151' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="wastePercentage"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                label={<CustomLabel />}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
