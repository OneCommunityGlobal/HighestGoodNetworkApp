import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import styles from './WorkforceSkillGap.module.css';

// Mock Data
const MOCK_DATA = [
  { project: 'Project A', department: 'Electricians', required: 450, available: 350 },
  { project: 'Project A', department: 'Masons', required: 200, available: 180 },
  { project: 'Project A', department: 'Welders', required: 150, available: 120 },
  { project: 'Project A', department: 'Plumbers', required: 250, available: 200 },
  { project: 'Project B', department: 'Electricians', required: 100, available: 120 },
  { project: 'Project B', department: 'Masons', required: 300, available: 250 },
  { project: 'Project B', department: 'Welders', required: 200, available: 150 },
  { project: 'Project B', department: 'Plumbers', required: 150, available: 120 },
  { project: 'Project C', department: 'Carpenters', required: 400, available: 380 },
  { project: 'Project C', department: 'Roofers', required: 300, available: 280 },
];

const DEPARTMENTS = ['Electricians', 'Masons', 'Welders', 'Plumbers', 'Carpenters', 'Roofers'];
const PROJECTS = ['Project A', 'Project B', 'Project C'];

const FilterDropdown = ({ label, options, selected, onChange, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownRef]);

  const toggleOption = option => {
    let newSelected;
    if (option === 'All') {
      if (selected.length === options.length) {
        newSelected = [];
      } else {
        newSelected = [...options];
      }
    } else {
      if (selected.includes(option)) {
        newSelected = selected.filter(item => item !== option);
      } else {
        newSelected = [...selected, option];
      }
    }
    onChange(newSelected);
  };

  const isAllSelected = selected.length === options.length;
  const displayText =
    selected.length === 0 ? 'Select...' : isAllSelected ? 'ALL' : `${selected.length} selected`;

  const handleKeyDown = (e, option) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleOption(option);
    }
  };

  return (
    <div
      className={
        align === 'left' ? styles.departmentFilterContainer : styles.projectFilterContainer
      }
      ref={dropdownRef}
    >
      <label className={styles.filterLabel}>{label}</label>
      <button className={styles.filterButton} onClick={() => setIsOpen(!isOpen)} type="button">
        {displayText}
      </button>
      {isOpen && (
        <div className={styles.dropdownContent}>
          <div
            className={styles.dropdownItem}
            onClick={() => toggleOption('All')}
            onKeyDown={e => handleKeyDown(e, 'All')}
            role="button"
            tabIndex={0}
          >
            <input type="checkbox" checked={isAllSelected} readOnly tabIndex={-1} />
            <span>All</span>
          </div>
          {options.map(option => (
            <div
              key={option}
              className={styles.dropdownItem}
              onClick={() => toggleOption(option)}
              onKeyDown={e => handleKeyDown(e, option)}
              role="button"
              tabIndex={0}
            >
              <input type="checkbox" checked={selected.includes(option)} readOnly tabIndex={-1} />
              <span>{option}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CustomLegend = ({ payload }) => {
  return (
    <div className={styles.customLegend}>
      {payload.map((entry, index) => (
        <div key={`item-${index}`} className={styles.legendItem}>
          <div className={styles.legendColorBox} style={{ backgroundColor: entry.color }} />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const WorkforceSkillGap = () => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [selectedProjects, setSelectedProjects] = useState([...PROJECTS]);
  const [selectedDepartments, setSelectedDepartments] = useState([...DEPARTMENTS]);

  const chartData = useMemo(() => {
    const projectFiltered = MOCK_DATA.filter(item => selectedProjects.includes(item.project));

    const depFiltered = projectFiltered.filter(item =>
      selectedDepartments.includes(item.department),
    );

    const aggregated = depFiltered.reduce((acc, curr) => {
      if (!acc[curr.department]) {
        acc[curr.department] = { name: curr.department, required: 0, available: 0 };
      }
      acc[curr.department].required += curr.required;
      acc[curr.department].available += curr.available;
      return acc;
    }, {});

    return Object.values(aggregated).sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedProjects, selectedDepartments]);

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      {/* Filters positioned absolute in corners */}
      <FilterDropdown
        label="Department"
        options={DEPARTMENTS}
        selected={selectedDepartments}
        onChange={setSelectedDepartments}
        align="left"
      />
      <FilterDropdown
        label="Project"
        options={PROJECTS}
        selected={selectedProjects}
        onChange={setSelectedProjects}
        align="right"
      />

      <div className={styles.headerContainer}>
        <h3 className={styles.title}>Workforce Skill Gap</h3>
      </div>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 30,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              label={{
                value: 'Trade',
                position: 'insideBottom',
                offset: -10,
                style: { fontWeight: 'bold' },
              }}
              tick={{ fill: darkMode ? 'white' : 'black' }}
            />
            <YAxis
              label={{
                value: 'Skill Hours',
                angle: -90,
                position: 'insideLeft',
                style: { fontWeight: 'bold' },
              }}
              tick={{ fill: darkMode ? 'white' : 'black' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? '#2E3E5A' : '#fff',
                borderColor: darkMode ? '#555' : '#ccc',
                color: darkMode ? '#fff' : '#000',
              }}
            />
            <Legend content={<CustomLegend />} verticalAlign="top" wrapperStyle={{ top: -10 }} />
            <Bar dataKey="required" name="Required" fill="#4285F4" />
            <Bar dataKey="available" name="Available" fill="#DB4437" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WorkforceSkillGap;
