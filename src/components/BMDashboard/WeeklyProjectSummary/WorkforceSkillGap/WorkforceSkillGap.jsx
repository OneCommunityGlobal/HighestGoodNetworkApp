import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
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
import { ENDPOINTS } from '~/utils/URL';

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
  const [data, setData] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch aggregated data for All projects to initialize
    const fetchData = async () => {
      try {
        const response = await axios.get(ENDPOINTS.BM_WORKFORCE_SKILL_GAP('All'));
        setData(response.data);

        // Extract unique projects and departments
        const uniqueProjects = [...new Set(response.data.map(item => item.project))];
        const uniqueDepartments = [...new Set(response.data.map(item => item.department))];

        setProjectsList(uniqueProjects);
        setDepartmentsList(uniqueDepartments);

        // Default to select all
        setSelectedProjects(uniqueProjects);
        setSelectedDepartments(uniqueDepartments);
      } catch (error) {
        console.error('Error fetching workforce skill gap data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = useMemo(() => {
    if (!data.length) return [];

    const projectFiltered = data.filter(item => selectedProjects.includes(item.project));

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
  }, [data, selectedProjects, selectedDepartments]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      {/* Filters positioned absolute in corners */}
      <FilterDropdown
        label="Department"
        options={departmentsList}
        selected={selectedDepartments}
        onChange={setSelectedDepartments}
        align="left"
      />
      <FilterDropdown
        label="Project"
        options={projectsList}
        selected={selectedProjects}
        onChange={setSelectedProjects}
        align="right"
      />

      <div className={styles.headerContainer}>
        <h3 className={styles.title}>Workforce Skill-Gap</h3>
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
                value: 'Trade / Role',
                position: 'insideBottom',
                offset: -10,
                style: { fontWeight: 'bold' },
              }}
              tick={{ fill: darkMode ? 'white' : 'black' }}
            />
            <YAxis
              label={{
                value: 'Hours',
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
            <Legend verticalAlign="top" wrapperStyle={{ top: -10 }} />
            <Bar dataKey="required" name="Required Skill Hours" fill="#4285F4" />
            <Bar dataKey="available" name="Available Hours" fill="#DB4437" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WorkforceSkillGap;
