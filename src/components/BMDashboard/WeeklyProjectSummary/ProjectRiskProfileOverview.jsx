import { useState, useEffect, useRef } from 'react';
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
import { useSelector } from 'react-redux';
import styles from './ProjectRiskProfileOverview.module.css';

export default function ProjectRiskProfileOverview() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [allDates, setAllDates] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);

  const projectWrapperRef = useRef(null);
  const dateWrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = event => {
      if (projectWrapperRef.current && !projectWrapperRef.current.contains(event.target)) {
        setShowProjectDropdown(false);
      }
      if (dateWrapperRef.current && !dateWrapperRef.current.contains(event.target)) {
        setShowDateDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const filteredData = data.filter(
    p =>
      (selectedProjects.length === 0 || selectedProjects.includes(p.projectName)) &&
      (selectedDates.length === 0 || (p.dates || []).some(d => selectedDates.includes(d))),
  );

  const getProjectLabel = () => {
    if (selectedProjects.length === allProjects.length) return 'ALL';
    if (selectedProjects.length === 0) return 'Select projects';
    return `${selectedProjects.length} selected`;
  };

  const getDateLabel = () => {
    if (selectedDates.length === allDates.length) return 'ALL';
    if (selectedDates.length === 0) return 'Select dates';
    return `${selectedDates.length} selected`;
  };

  const chartTheme = {
    grid: darkMode ? '#3f4652' : '#e8e8e8',
    axisText: darkMode ? '#d7dbe2' : '#666',
    axisLine: darkMode ? '#6b7280' : '#d5d5d5',
    tooltipBg: darkMode ? '#1f2937' : '#fff',
    tooltipBorder: darkMode ? '#4b5563' : '#e0e0e0',
    tooltipText: darkMode ? '#f3f4f6' : '#333',
    hover: darkMode ? 'rgba(66, 133, 244, 0.16)' : 'rgba(66, 133, 244, 0.08)',
  };

  const customSelectStyles = {
    control: base => ({
      ...base,
      fontSize: 12,
      minHeight: 34,
      backgroundColor: darkMode ? '#2c2c2c' : '#fff',
      borderColor: darkMode ? '#555' : '#d5d5d5',
      boxShadow: 'none',
    }),
    valueContainer: base => ({
      ...base,
      padding: '2px 6px',
    }),
    multiValue: base => ({
      ...base,
      background: darkMode ? '#444' : '#e8f0fe',
      fontSize: 11,
    }),
    multiValueLabel: base => ({
      ...base,
      color: darkMode ? '#eee' : '#333',
    }),
    multiValueRemove: base => ({
      ...base,
      color: darkMode ? '#eee' : '#333',
      ':hover': {
        backgroundColor: darkMode ? '#555' : '#dbe7ff',
        color: darkMode ? '#fff' : '#111',
      },
    }),
    input: base => ({
      ...base,
      color: darkMode ? '#eee' : '#333',
    }),
    placeholder: base => ({
      ...base,
      color: darkMode ? '#c7c7c7' : '#666',
    }),
    menu: base => ({
      ...base,
      zIndex: 9999,
      backgroundColor: darkMode ? '#2c2c2c' : '#fff',
      border: darkMode ? '1px solid #555' : '1px solid #e2e2e2',
      boxShadow: darkMode ? '0 4px 16px rgba(0, 0, 0, 0.45)' : '0 4px 16px rgba(0,0,0,0.12)',
    }),
    option: (base, state) => ({
      ...base,
      color: darkMode ? '#eee' : '#333',
      backgroundColor: state.isSelected
        ? darkMode
          ? '#4a4a4a'
          : '#dbe7ff'
        : state.isFocused
        ? darkMode
          ? '#3a3a3a'
          : '#f5f5f5'
        : darkMode
        ? '#2c2c2c'
        : '#fff',
    }),
  };

  if (loading)
    return (
      <div className={`${styles.statusCard} ${darkMode ? styles.darkMode : ''}`}>
        <div className={`${styles.loading}`}>Loading project risk profiles...</div>
      </div>
    );
  if (error)
    return (
      <div className={`${styles.statusCard} ${darkMode ? styles.darkMode : ''}`}>
        <div className={`${styles.error}`}>{error}</div>
      </div>
    );

  return (
    <div className={`${styles.wrapper} ${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.container}`}>
        <div className={`${styles.headerRow}`}>
          <h2 className={`${styles.heading}`}>Overall Risk Profile</h2>

          <div className={`${styles.filterRow}`}>
            {/* Project Dropdown */}
            <div ref={projectWrapperRef} className={`${styles.dropdownWrapper}`}>
              <span className={`${styles.dropdownLabel}`}>Project</span>
              <button
                type="button"
                className={`${styles.dropdownButton}`}
                onClick={() => setShowProjectDropdown(prev => !prev)}
                aria-label="Show project dropdown"
              >
                {getProjectLabel()}
              </button>
              {showProjectDropdown && (
                <div className={`${styles.dropdownMenu}`}>
                  <Select
                    isMulti
                    classNamePrefix="customSelect"
                    options={allProjects.map(p => ({ label: p, value: p }))}
                    value={selectedProjects.map(p => ({ label: p, value: p }))}
                    onChange={opts => setSelectedProjects(opts ? opts.map(o => o.value) : [])}
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    components={{ IndicatorSeparator: () => null, ClearIndicator: () => null }}
                    styles={customSelectStyles}
                    placeholder="Select projects"
                  />
                </div>
              )}
            </div>

            {/* Date Dropdown */}
            <div ref={dateWrapperRef} className={`${styles.dropdownWrapper}`}>
              <span className={`${styles.dropdownLabel}`}>Dates</span>
              <button
                type="button"
                className={`${styles.dropdownButton}`}
                onClick={() => setShowDateDropdown(prev => !prev)}
                aria-label="Show date dropdown"
              >
                {getDateLabel()}
              </button>
              {showDateDropdown && (
                <div className={`${styles.dropdownMenu}`}>
                  <Select
                    isMulti
                    classNamePrefix="customSelect"
                    options={allDates.map(d => ({ label: d, value: d }))}
                    value={selectedDates.map(d => ({ label: d, value: d }))}
                    onChange={opts => setSelectedDates(opts ? opts.map(o => o.value) : [])}
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    components={{ IndicatorSeparator: () => null, ClearIndicator: () => null }}
                    styles={customSelectStyles}
                    placeholder="Select dates"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={`${styles.chartWrapper}`}>
          <div className={`${styles.legendWrapper}`}>
            <div className={`${styles.legendItem}`}>
              <span
                className={`${styles.legendSquare}`}
                style={{ backgroundColor: '#4285F4' }}
              ></span>
              <span>Predicted Cost Overrun Percentage</span>
            </div>
            <div className={`${styles.legendItem}`}>
              <span
                className={`${styles.legendSquare}`}
                style={{ backgroundColor: '#EA4335' }}
              ></span>
              <span>Issues</span>
            </div>
            <div className={`${styles.legendItem}`}>
              <span
                className={`${styles.legendSquare}`}
                style={{ backgroundColor: '#FBBC05' }}
              ></span>
              <span>Predicted Time Delay Percentage</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{ top: 20, right: 40, left: 50, bottom: 100 }}
              barGap="5%"
              barCategoryGap="28%"
            >
              <CartesianGrid
                strokeDasharray="5 5"
                stroke={chartTheme.grid}
                horizontal={true}
                vertical={false}
              />
              <XAxis
                dataKey="projectName"
                angle={-45}
                textAnchor="end"
                height={110}
                tick={{ fontSize: 13, fill: chartTheme.axisText, fontWeight: 500 }}
                axisLine={{ stroke: chartTheme.axisLine, strokeWidth: 1.5 }}
                tickLine={{ stroke: chartTheme.axisLine }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: chartTheme.axisText, fontWeight: 500 }}
                axisLine={{ stroke: chartTheme.axisLine, strokeWidth: 1.5 }}
                tickLine={{ stroke: chartTheme.axisLine }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartTheme.tooltipBg,
                  border: `2px solid ${chartTheme.tooltipBorder}`,
                  borderRadius: '8px',
                  padding: '14px',
                  color: chartTheme.tooltipText,
                  fontSize: '13px',
                  fontWeight: 500,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
                labelStyle={{ color: chartTheme.tooltipText }}
                itemStyle={{ color: chartTheme.tooltipText }}
                cursor={{ fill: chartTheme.hover }}
              />
              <Bar
                dataKey="predictedCostOverrun"
                name="Predicted Cost Overrun Percentage"
                fill="#4285F4"
                radius={[3, 3, 0, 0]}
              />
              <Bar dataKey="totalOpenIssues" name="Issues" fill="#EA4335" radius={[3, 3, 0, 0]} />
              <Bar
                dataKey="predictedTimeDelay"
                name="Predicted Time Delay Percentage"
                fill="#FBBC05"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>

          {filteredData.length === 0 && (
            <div className={styles.emptyState}>No risk profile data for selected filters.</div>
          )}
        </div>
      </div>
    </div>
  );
}
