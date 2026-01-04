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
import { FaChevronDown } from 'react-icons/fa'; // Import an icon for better UX
import httpService from '../../../services/httpService';
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

  // Redux: Get Dark Mode State
  const darkMode = useSelector(state => state.theme.darkMode);

  // Refs for detecting clicks outside
  const projectRef = useRef(null);
  const dateRef = useRef(null);

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

  // --- Click Outside Logic ---
  useEffect(() => {
    function handleClickOutside(event) {
      // Close Project Dropdown if clicked outside
      if (projectRef.current && !projectRef.current.contains(event.target)) {
        setShowProjectDropdown(false);
      }
      // Close Date Dropdown if clicked outside
      if (dateRef.current && !dateRef.current.contains(event.target)) {
        setShowDateDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredData = data.filter(
    p =>
      (selectedProjects.length === 0 || selectedProjects.includes(p.projectName)) &&
      (selectedDates.length === 0 || (p.dates || []).some(d => selectedDates.includes(d))),
  );

  // Enhanced Label Logic to show "Active" filters visually
  const getSummaryLabel = (selected, all, defaultText) => {
    if (selected.length === all.length) return 'All Selected';
    if (selected.length === 0) return defaultText;
    if (selected.length === 1) return selected[0];
    if (selected.length <= 2) return selected.join(', ');
    return `${selected[0]}, ${selected[1]} +${selected.length - 2}`;
  };

  // Styles variables
  const axisTextColor = darkMode ? '#e2e8f0' : '#444';
  const gridColor = darkMode ? '#4a5568' : '#ccc';
  const legendColor = darkMode ? '#e2e8f0' : '#333';

  const tooltipContentStyle = {
    backgroundColor: darkMode ? '#2a3f5f' : '#fff',
    borderColor: darkMode ? '#3a506b' : '#ccc',
    borderRadius: '8px',
    boxShadow: darkMode ? '0 2px 10px rgba(0,0,0,0.5)' : '0 2px 8px #eee',
  };

  const tooltipItemStyle = { color: darkMode ? '#e0e0e0' : '#333' };
  const tooltipLabelStyle = {
    color: darkMode ? '#fff' : '#000',
    fontWeight: 'bold',
    marginBottom: '5px',
  };

  const customSelectStyles = {
    control: base => ({
      ...base,
      fontSize: 14,
      background: darkMode ? '#2d3748' : '#fff',
      borderColor: darkMode ? '#4a5568' : '#e2e8f0',
      color: darkMode ? '#e0e0e0' : '#333',
    }),
    menu: base => ({
      ...base,
      zIndex: 9999,
      backgroundColor: darkMode ? '#2d3748' : '#fff',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? (darkMode ? '#4a5568' : '#deebff') : 'transparent',
      color: darkMode ? '#e0e0e0' : '#333',
      cursor: 'pointer',
    }),
    multiValue: base => ({
      ...base,
      backgroundColor: darkMode ? '#4a5568' : '#e6f7ff',
    }),
    multiValueLabel: base => ({
      ...base,
      color: darkMode ? '#e0e0e0' : '#333',
    }),
    input: base => ({ ...base, color: darkMode ? '#e0e0e0' : '#333' }),
  };

  if (loading) return <div style={{ color: axisTextColor }}>Loading project risk profiles...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Project Risk Profile Overview</h2>

      <div className={styles.controlsContainer}>
        {/* Project Filter */}
        <div className={styles.filterWrapper} ref={projectRef}>
          <div className={styles.filterLabel}>Project</div>
          <div
            className={styles.filterTrigger}
            onClick={() => setShowProjectDropdown(!showProjectDropdown)}
            role="button"
            tabIndex={0}
            onKeyPress={e => e.key === 'Enter' && setShowProjectDropdown(!showProjectDropdown)}
          >
            <span>{getSummaryLabel(selectedProjects, allProjects, 'Select Projects')}</span>
            <FaChevronDown className={styles.triggerIcon} />
          </div>

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
                components={{ IndicatorSeparator: () => null }}
                styles={customSelectStyles}
                placeholder="Search projects..."
              />
            </div>
          )}
        </div>

        {/* Date Filter */}
        <div className={styles.filterWrapper} ref={dateRef}>
          <div className={styles.filterLabel}>Dates</div>
          <div
            className={styles.filterTrigger}
            onClick={() => setShowDateDropdown(!showDateDropdown)}
            role="button"
            tabIndex={0}
            onKeyPress={e => e.key === 'Enter' && setShowDateDropdown(!showDateDropdown)}
          >
            <span>{getSummaryLabel(selectedDates, allDates, 'Select Dates')}</span>
            <FaChevronDown className={styles.triggerIcon} />
          </div>

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
                components={{ IndicatorSeparator: () => null }}
                styles={customSelectStyles}
                placeholder="Search dates..."
              />
            </div>
          )}
        </div>
      </div>

      <div className={styles.chartArea}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={filteredData.map(item => ({
              ...item,
              predictedCostOverrun:
                item.predictedCostOverrun != null
                  ? -1 * item.predictedCostOverrun
                  : item.predictedCostOverrun,
            }))}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            barGap={8}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="projectName"
              tick={{ fill: axisTextColor }}
              axisLine={{ stroke: gridColor }}
              tickLine={{ stroke: gridColor }}
            />
            <YAxis
              tick={{ fill: axisTextColor }}
              axisLine={{ stroke: gridColor }}
              tickLine={{ stroke: gridColor }}
            />
            <Tooltip
              contentStyle={tooltipContentStyle}
              itemStyle={tooltipItemStyle}
              labelStyle={tooltipLabelStyle}
              cursor={{ fill: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }}
            />
            <Legend wrapperStyle={{ color: legendColor }} />
            <Bar dataKey="predictedCostOverrun" name="Predicted Cost Overrun (%)" fill="#4285F4" />
            <Bar dataKey="totalOpenIssues" name="Issues" fill="#EA4335" />
            <Bar dataKey="predictedTimeDelay" name="Predicted Time Delay (%)" fill="#FBBC05" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
