import { useState, useEffect, useRef, useMemo } from 'react';
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

  const allSpanRef = useRef(null);
  const dateSpanRef = useRef(null);

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

  const selectStyles = useMemo(
    () => ({
      control: base => ({
        ...base,
        backgroundColor: darkMode ? '#2b3344' : '#fff',
        borderColor: darkMode ? '#3a506b' : '#ccc',
        color: darkMode ? '#fff' : '#000',
        minHeight: 34,
        boxShadow: 'none',
        borderRadius: 4,
        '&:hover': {
          borderColor: darkMode ? '#4a6072' : '#999',
        },
      }),
      menu: base => ({
        ...base,
        backgroundColor: darkMode ? '#2b3344' : '#fff',
        borderColor: darkMode ? '#3a506b' : '#ccc',
        zIndex: 9999,
      }),
      menuList: base => ({
        ...base,
        backgroundColor: darkMode ? '#2b3344' : '#fff',
        color: darkMode ? '#fff' : '#000',
        padding: 0,
      }),
      option: (base, state) => {
        let backgroundColor;
        if (state.isSelected) {
          backgroundColor = darkMode ? '#4a6072' : '#0d55b3';
        } else if (state.isFocused) {
          backgroundColor = darkMode ? '#3a506b' : '#deebff';
        } else {
          backgroundColor = darkMode ? '#2b3344' : '#fff';
        }

        const textColor = state.isSelected || darkMode ? '#fff' : '#000';

        return {
          ...base,
          backgroundColor,
          color: textColor,
          cursor: 'pointer',
          '&:active': {
            backgroundColor: darkMode ? '#4a6072' : '#0d55b3',
          },
        };
      },
      multiValue: base => ({
        ...base,
        backgroundColor: darkMode ? '#3a506b' : '#e2e7ee',
        borderRadius: 4,
      }),
      multiValueLabel: base => ({
        ...base,
        color: darkMode ? '#fff' : '#333',
        fontSize: 12,
        padding: '2px 6px',
      }),
      multiValueRemove: base => ({
        ...base,
        color: darkMode ? '#fff' : '#333',
        '&:hover': {
          backgroundColor: darkMode ? '#5a7082' : '#ffbdad',
          color: '#fff',
        },
        borderRadius: 4,
        padding: 2,
      }),
      singleValue: base => ({
        ...base,
        color: darkMode ? '#fff' : base.color,
      }),
      input: base => ({
        ...base,
        color: darkMode ? '#fff' : base.color,
      }),
      placeholder: base => ({
        ...base,
        color: darkMode ? '#cbd5e0' : '#999',
      }),
      indicatorSeparator: base => ({
        ...base,
        backgroundColor: darkMode ? '#3a506b' : '#ccc',
      }),
      dropdownIndicator: base => ({
        ...base,
        color: darkMode ? '#fff' : '#666',
        '&:hover': {
          color: darkMode ? '#fff' : '#333',
        },
      }),
      clearIndicator: base => ({
        ...base,
        color: darkMode ? '#fff' : '#666',
        '&:hover': {
          color: darkMode ? '#fff' : '#333',
        },
      }),
    }),
    [darkMode],
  );

  if (loading) return <div className={`${styles.loading}`}>Loading project risk profiles...</div>;
  if (error) return <div className={`${styles.error}`}>{error}</div>;

  return (
    <div className={`${styles.wrapper} ${darkMode ? styles.darkMode : ''}`}>
      <div className={`${styles.container}`}>
        <h2 className={`${styles.heading}`}>Project Risk Profile Overview</h2>

        <div className={`${styles.filterRow}`}>
          {/* Project Dropdown */}
          <div className={`${styles.dropdownWrapper}`}>
            <span className={`${styles.dropdownLabel}`}>Project</span>
            <button
              ref={allSpanRef}
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
                  styles={selectStyles}
                />
              </div>
            )}
          </div>

          {/* Date Dropdown */}
          <div className={`${styles.dropdownWrapper}`}>
            <span className={`${styles.dropdownLabel}`}>Dates</span>
            <button
              ref={dateSpanRef}
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
                  styles={selectStyles}
                />
              </div>
            )}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={350}>
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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="projectName"
              tick={{ fill: darkMode ? '#fff' : '#000' }}
              axisLine={{ stroke: darkMode ? '#888' : '#000' }}
              tickLine={{ stroke: darkMode ? '#888' : '#000' }}
            />
            <YAxis
              tick={{ fill: darkMode ? '#fff' : '#000' }}
              axisLine={{ stroke: darkMode ? '#888' : '#000' }}
              tickLine={{ stroke: darkMode ? '#888' : '#000' }}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="predictedCostOverrun" name="Predicted Cost Overrun (%)" fill="#4285F4" />
            <Bar dataKey="totalOpenIssues" name="Issues" fill="#EA4335" />
            <Bar dataKey="predictedTimeDelay" name="Predicted Time Delay (%)" fill="#FBBC05" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
