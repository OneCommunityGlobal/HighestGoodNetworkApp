import { useState, useEffect, useRef } from 'react';
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
import Select from 'react-select';
import httpService from '../../../services/httpService';
import styles from './ProjectRiskProfileOverview.module.css';
import PropTypes from 'prop-types';

// Fetch project risk profile data from backend

function ProjectRiskProfileOverview({ selectStyles }) {
  const darkMode = useSelector(state => state.theme?.darkMode || false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [allDates, setAllDates] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  // Refs for focusing dropdowns
  const projectWrapperRef = useRef(null);
  const dateWrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (projectWrapperRef.current && !projectWrapperRef.current.contains(event.target)) {
        setShowProjectDropdown(false);
      }
      if (dateWrapperRef.current && !dateWrapperRef.current.contains(event.target)) {
        setShowDateDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const tooltipBg = darkMode ? '#3a506b' : '#fff';
  const textColor = darkMode ? '#ffffff' : '#000000ff';

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await httpService.get(
          `${process.env.REACT_APP_APIENDPOINT}/projects/risk-profile`,
        );
        let result = res.data;
        if (!Array.isArray(result)) result = [result];
        setData(result);
        setAllProjects(result.map(p => p.projectName));
        setSelectedProjects(result.map(p => p.projectName));
        // Extract all unique dates from all projects
        const dates = Array.from(new Set(result.flatMap(p => p.dates || [])));
        setAllDates(dates);
        setSelectedDates(dates);
      } catch (err) {
        setError('Failed to fetch project risk profile data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter projects that are ongoing on ALL selected dates and in selectedProjects
  const filteredData = data.filter(
    p =>
      (selectedProjects.length === 0 || selectedProjects.includes(p.projectName)) &&
      (selectedDates.length === 0 || (p.dates || []).some(d => selectedDates.includes(d))),
  );

  // Project label function
  const getProjectLabel = () => {
    if (selectedProjects.length === allProjects.length) return 'ALL';
    if (selectedProjects.length === 0) return 'Select projects';
    return `${selectedProjects.length} selected`;
  };

  // Dates label function
  const getDateLabel = () => {
    if (selectedDates.length === allDates.length) return 'ALL';
    if (selectedDates.length === 0) return 'Select dates';
    return `${selectedDates.length} selected`;
  };

  const getOptionBackgroundColor = isFocused => {
    if (isFocused) {
      return darkMode ? '#3a506b' : '#f0f0f0';
    }
    return darkMode ? '#1c2541' : '#ffffff';
  };

  const customSelectStyles = {
    control: base => ({
      ...base,
      fontSize: 14,
      minHeight: 22,
      width: 120,
      background: 'none',
      border: 'none',
      boxShadow: 'none',
      textAlign: 'center',
      alignItems: 'center',
      padding: 0,
    }),
    valueContainer: base => ({
      ...base,
      padding: '0 2px',
      justifyContent: 'center',
    }),
    multiValue: base => ({
      ...base,
      background: darkMode ? '#3a506b' : '#e6f7ff',
      fontSize: 12,
      margin: '0 2px',
    }),
    multiValueLabel: base => ({
      ...base,
      color: darkMode ? '#ffffff' : '#000000',
    }),
    multiValueRemove: base => ({
      ...base,
      color: darkMode ? '#ffffff' : '#000000',
      ':hover': {
        backgroundColor: darkMode ? '#2f4157' : '#bae7ff',
        color: darkMode ? '#ffffff' : '#000000',
      },
    }),
    input: base => ({
      ...base,
      margin: 0,
      padding: 0,
      textAlign: 'center',
      color: darkMode ? '#ffffff' : '#000000',
    }),
    placeholder: base => ({
      ...base,
      color: '#aaa',
      textAlign: 'center',
    }),
    dropdownIndicator: base => ({
      ...base,
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    menu: base => ({
      ...base,
      zIndex: 9999,
      fontSize: 14,
      background: darkMode ? '#1c2541' : '#ffffff',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: getOptionBackgroundColor(state.isFocused),
      color: darkMode ? '#ffffff' : '#000000',
      fontWeight: state.isFocused ? 'bold' : 'normal',
      '&:active': {
        backgroundColor: darkMode ? '#2f4157' : '#e6f7ff',
      },
    }),
  };

  // Colors aligned with your global theme
  const chartColors = {
    grid: darkMode ? 'rgba(255,255,255,0.1)' : '#e5e5e5',
    text: darkMode ? '#e5e5e5' : '#333',
    tooltipBg: darkMode ? '#1c2541' : '#ffffff',
    tooltipBorder: darkMode ? '#3a506b' : '#ccc',
    tooltipText: darkMode ? '#ffffff' : '#000000',
  };

  if (loading) return <div>Loading project risk profiles...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className={`${styles.chartCard} ${darkMode ? styles.darkMode : ''}`}>
      <h2 className={styles.chartTitle}>Project Risk Profile Overview</h2>
      <div className={styles.filterContainer}>
        {/* Project Dropdown */}
        <div ref={projectWrapperRef} className={styles.formGroup}>
          <span className={styles.label}>Project</span>
          <button
            type="button"
            className={styles.dropdownButton}
            onClick={() => setShowProjectDropdown(true)}
            aria-label="Show project dropdown"
          >
            {getProjectLabel()}
            {showProjectDropdown && (
              <div className={styles.dropdownMenu}>
                <Select
                  menuIsOpen
                  isMulti
                  classNamePrefix="custom-select"
                  options={allProjects.map(p => ({ label: p, value: p }))}
                  value={selectedProjects.map(p => ({ label: p, value: p }))}
                  onChange={opts => {
                    const values = opts && opts.length ? opts.map(o => o.value) : [];
                    setSelectedProjects(values);
                  }}
                  onBlur={() => setShowProjectDropdown(false)}
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  components={{ IndicatorSeparator: () => null, ClearIndicator: () => null }}
                  styles={customSelectStyles}
                />
              </div>
            )}
          </button>
        </div>
        {/* Date Dropdown */}
        <div ref={dateWrapperRef} className={styles.formGroup}>
          <span className={styles.label}>Dates</span>
          <button
            type="button"
            className={styles.dropdownButton}
            onClick={() => setShowDateDropdown(true)}
            aria-label="Show date dropdown"
          >
            {getDateLabel && getDateLabel()}
            {showDateDropdown && (
              <div className={styles.dropdownMenu}>
                <Select
                  menuIsOpen
                  isMulti
                  classNamePrefix="custom-select"
                  options={allDates.map(d => ({ label: d, value: d }))}
                  value={selectedDates.map(d => ({ label: d, value: d }))}
                  onChange={opts => {
                    const values = opts && opts.length ? opts.map(o => o.value) : [];
                    setSelectedDates(values);
                  }}
                  onBlur={() => setShowDateDropdown(false)}
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  components={{ IndicatorSeparator: () => null, ClearIndicator: () => null }}
                  styles={customSelectStyles}
                />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={filteredData.map(item => {
              return {
                ...item,
                predictedCostOverrun: item.predictedCostOverrun,
              };
            })}
            margin={{ top: 20, right: 40, left: 60, bottom: 80 }}
            barCategoryGap="20%"
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartColors.grid} />
            <XAxis
              dataKey="projectName"
              tick={{ fontSize: 12, fill: chartColors.text }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              label={{
                value: 'Percentage (%)',
                angle: -90,
                position: 'insideLeft',
                offset: 15,
                style: {
                  textAnchor: 'middle',
                  fontSize: 14,
                  fill: chartColors.text,
                  fontWeight: '500',
                },
              }}
              tickFormatter={value => (Number.isInteger(value) ? value : value.toFixed(0))}
              tick={{ fontSize: 12, fill: chartColors.text }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: chartColors.tooltipBg,
                border: `1px solid ${chartColors.tooltipBorder}`,
                color: chartColors.tooltipText,
                borderRadius: '4px',
              }}
              cursor={{ fill: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
              itemStyle={{ color: chartColors.tooltipText }}
              formatter={(value, name) => {
                if (typeof value === 'number') {
                  // Format Time Delay specifically to 2 decimal places
                  if (name === 'Predicted Time Delay (%)') {
                    return value.toFixed(2);
                  }
                  // For other values, use 2 decimal places if not integer
                  return Number.isInteger(value) ? value.toString() : value.toFixed(2);
                }
                return value;
              }}
            />
            <Legend wrapperStyle={{ marginTop: 20, color: chartColors.text }} />
            <Bar
              dataKey="predictedCostOverrun"
              name="Predicted Cost Overrun (%)"
              fill="#4285F4"
              barSize={35}
            />
            <Bar dataKey="totalOpenIssues" name="Issues" fill="#EA4335" barSize={35} />
            <Bar
              dataKey="predictedTimeDelay"
              name="Predicted Time Delay (%)"
              fill="#FBBC05"
              barSize={35}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

ProjectRiskProfileOverview.propTypes = {
  selectStyles: PropTypes.object.isRequired,
};

export default ProjectRiskProfileOverview;
