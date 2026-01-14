'use client';

import { useState, useEffect, useRef } from 'react';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { useSelector } from 'react-redux'; // Import useSelector to access dark mode state
import styles from './MostWastedMaterials.module.css'; // Import the CSS module

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
  const darkMode = useSelector(state => state.theme.darkMode); // Get dark mode state

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
      <button type="button" onClick={() => setIsOpen(!isOpen)} className={styles.dropdownButton}>
        <span>{selected.name}</span>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          {options.map(option => (
            <button
              type="button"
              key={option.id}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
              className={styles.dropdownItem}
              onMouseEnter={e => {
                e.target.style.backgroundColor = darkMode ? '#5a6578' : '#f3f4f6';
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
  const darkMode = useSelector(state => state.theme.darkMode); // Get dark mode state

  return (
    <text
      x={x + width / 2}
      y={y - 5}
      className={styles.chartLabel}
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
  const darkMode = useSelector(state => state.theme.darkMode); // Get dark mode state

  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: darkMode ? '#2d3748' : '#ffffff',
          border: `1px solid ${darkMode ? '#4a5568' : '#e5e7eb'}`,
          borderRadius: '8px',
          boxShadow: darkMode ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '12px',
        }}
      >
        <p
          style={{
            fontWeight: '500',
            color: darkMode ? '#e2e8f0' : '#111827',
            margin: '0 0 4px 0',
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: '14px',
            color: darkMode ? '#cbd5e0' : '#6b7280',
            margin: '0',
          }}
        >
          Waste: {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
}

export default function MostWastedMaterialsDashboard() {
  const [selectedProject, setSelectedProject] = useState(mockProjects[0]);
  const [dateRange, setDateRange] = useState({
    from: '2024-01-01',
    to: new Date().toISOString().split('T')[0],
  });
  const [chartData, setChartData] = useState([]);
  const darkMode = useSelector(state => state.theme.darkMode); // Get dark mode state

  useEffect(() => {
    const data = mockData[selectedProject.id] || mockData.all;
    const sortedData = [...data].sort((a, b) => b.wastePercentage - a.wastePercentage);
    setChartData(sortedData);
  }, [selectedProject, dateRange]);

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Most Wasted Materials</h1>
      </div>

      <div className={styles.card}>
        <div className={styles.filterGrid}>
          {/* Project Filter */}
          <div>
            <label htmlFor="project-filter" className={styles.filterLabel}>
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
            <label htmlFor="date-filter" className={styles.filterLabel}>
              Date Filter
            </label>
            <div className={styles.dateFilterGrid}>
              <div>
                <label htmlFor="date-from" className={styles.dateLabel}>
                  From
                </label>
                <input
                  id="date-from"
                  type="date"
                  value={dateRange.from}
                  onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  className={styles.dateInput}
                />
              </div>
              <div>
                <label htmlFor="date-to" className={styles.dateLabel}>
                  To
                </label>
                <input
                  id="date-to"
                  type="date"
                  value={dateRange.to}
                  onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  className={styles.dateInput}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className={styles.card}>
        <div className={styles.chartContainer}>
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
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#4a5568' : '#e5e7eb'} />
              <XAxis
                dataKey="material"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
                interval={0}
                tick={{ fill: darkMode ? '#cbd5e0' : '#374151' }}
              />
              <YAxis
                label={{
                  value: 'Percentage of Material Wasted (%)',
                  angle: -90,
                  position: 'insideLeft',
                  style: {
                    textAnchor: 'middle',
                    fill: darkMode ? '#cbd5e0' : '#374151',
                  },
                }}
                fontSize={12}
                tick={{ fill: darkMode ? '#cbd5e0' : '#374151' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="wastePercentage"
                fill={darkMode ? '#4299e1' : '#3b82f6'}
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
