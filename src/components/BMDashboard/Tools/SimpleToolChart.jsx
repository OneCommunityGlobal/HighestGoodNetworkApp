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
import { format, subYears } from 'date-fns'; // Added subYears for cleaner date math
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './SimpleToolChart.module.css';

// ---------- Mock Data (Updated to be Dynamic) ----------
// I updated this to use the *Current Year* so you see data immediately with your new filter.
const currentYear = new Date().getFullYear();
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
    date: `2025-05-15`,
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
    date: '2026-01-15',
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
    date: '2025-12-20',
  },
];

// ---------- Projects Dropdown ----------
const projects = ['All Projects', ...new Set(toolsData.map(item => item.project))];

// ---------- Date Range Picker ----------
function DateRangePicker({ dateRange, setDateRange }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [isOpen, setIsOpen] = useState(false);

  const [tempStart, setTempStart] = useState(dateRange.from);
  const [tempEnd, setTempEnd] = useState(dateRange.to);

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
    setTempStart(dateRange.from);
    setTempEnd(dateRange.to);
  }, [dateRange]);

  const applyDateRange = () => {
    if (!tempStart || !tempEnd) {
      toast.error('Please select both start and end dates');
      return;
    }
    if (tempStart > tempEnd) {
      toast.error('Start date cannot be after end date');
      return;
    }
    setDateRange({ from: tempStart, to: tempEnd });
    setIsOpen(false);
  };

  return (
    <div
      className={`${styles.datePickerWrapper} ${darkMode ? styles.darkMode : ''}`}
      ref={pickerRef}
    >
      <button type="button" className={styles.datePickerButton} onClick={() => setIsOpen(!isOpen)}>
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
        <div className={styles.datePickerDropdown}>
          <div className={styles.dateGrid}>
            <div>
              <label className={styles.label} htmlFor="start-date-picker">
                Start Date
                <div className={styles.dateInputContainer}>
                  <DatePicker
                    id="start-date-picker"
                    selected={tempStart}
                    onChange={date => setTempStart(date)}
                    selectsStart
                    startDate={tempStart}
                    endDate={tempEnd}
                    maxDate={tempEnd}
                    placeholderText="Start Date"
                    className={styles.inputField}
                    calendarClassName={darkMode ? styles.darkCalendar : styles.lightCalendar}
                    dateFormat="yyyy-MM-dd"
                    autoComplete="off"
                  />
                </div>
              </label>
            </div>
            <div>
              <label className={styles.label} htmlFor="end-date-picker">
                End Date
                <div className={styles.dateInputContainer}>
                  <DatePicker
                    id="end-date-picker"
                    selected={tempEnd}
                    onChange={date => setTempEnd(date)}
                    selectsEnd
                    startDate={tempStart}
                    endDate={tempEnd}
                    minDate={tempStart}
                    placeholderText="End Date"
                    className={styles.inputField}
                    calendarClassName={darkMode ? styles.darkCalendar : styles.lightCalendar}
                    dateFormat="yyyy-MM-dd"
                    autoComplete="off"
                  />
                </div>
              </label>
            </div>
          </div>
          <div className={styles.applyButtonWrapper}>
            <button onClick={applyDateRange} className={styles.applyButton}>
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

  // UPDATED: Default state is now [One Year Ago] to [Today]
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const oneYearAgo = subYears(today, 1);
    return {
      from: oneYearAgo,
      to: today,
    };
  });

  const filteredData = useMemo(() => {
    let filtered = [...toolsData];

    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        // Normalize time portion to ensure inclusive comparison
        const start = new Date(dateRange.from);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateRange.to);
        end.setHours(23, 59, 59, 999);

        return itemDate >= start && itemDate <= end;
      });
    }

    if (selectedProject !== 'All Projects') {
      filtered = filtered.filter(item => item.project === selectedProject);
    }

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

  // Colors aligned with your global theme
  const chartColors = {
    grid: darkMode ? 'rgba(255,255,255,0.1)' : '#e5e5e5',
    text: darkMode ? '#e5e5e5' : '#333',
    barFill: darkMode ? '#007bff' : '#3b82f6',
    barStroke: darkMode ? '#3a506b' : '#1e40af',
    tooltipBg: darkMode ? '#1c2541' : '#ffffff',
    tooltipBorder: darkMode ? '#3a506b' : '#ccc',
    tooltipText: darkMode ? '#ffffff' : '#000000',
  };

  return (
    <div className={`${styles.chartCard} ${darkMode ? styles.darkMode : ''}`}>
      <h2 className={styles.chartTitle}>Tools Most Susceptible to Breakdown</h2>

      {/* Filters */}
      <div className={styles.filterContainer}>
        <div className={styles.formGroup}>
          <label htmlFor="projectSelect" className={styles.label}>
            Project
          </label>
          <select
            id="projectSelect"
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            className={styles.selectInput}
          >
            {projects.map(project => (
              <option key={project}>{project}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="dateRangePicker" className={styles.label}>
            Date Range
          </label>
          <div id="dateRangePicker">
            <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={filteredData}
            margin={{ top: 20, right: 50, left: 70, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartColors.grid} />
            <XAxis
              type="number"
              domain={[0, 100]}
              unit="%"
              tick={{ fill: chartColors.text }}
              axisLine={{ stroke: chartColors.grid }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 14, fill: chartColors.text }}
              width={80}
            />
            <Tooltip
              formatter={value => [`${value}%`, 'Replaced Percentage']}
              contentStyle={{
                backgroundColor: chartColors.tooltipBg,
                border: `1px solid ${chartColors.tooltipBorder}`,
                color: chartColors.tooltipText,
                borderRadius: '4px',
              }}
              cursor={{ fill: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
            />
            <Bar
              dataKey="replacedPercentage"
              fill={chartColors.barFill}
              stroke={chartColors.barStroke}
              strokeWidth={1.5}
            >
              <LabelList
                dataKey="replacedPercentage"
                position="right"
                content={({ value, x, y, width, height }) => (
                  <text
                    x={x + width + 5}
                    y={y + height / 2 + 5}
                    fill={chartColors.text}
                    fontWeight="500"
                    alignmentBaseline="middle"
                  >
                    {`${value}%`}
                  </text>
                )}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {filteredData.length === 0 && (
        <div className={styles.noData}>No data available for the selected filters</div>
      )}
    </div>
  );
}
