// src/components/PopularityTimelineAnalytics/PopularityTimelineChart.jsx
import React, { useState, useEffect, useId } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';
import { useSelector } from 'react-redux';
import styles from './PopularityTimelineChart.module.css';

// ✅ format helper (local, not UTC)
const formatForQuery = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`; // e.g., 2024-09
};

const fetchPopularityData = async ({ range, roleValues = [], start, end }) => {
  return axios.get(ENDPOINTS.POPULARITY(range, roleValues, start, end)).then(res => res.data);
};

const fetchAllRoles = async () => {
  const response = await axios.get(ENDPOINTS.POPULARITY_ROLES);
  return response.data.map(role => ({ value: role, label: role }));
};

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const parseMonthString = monthStr => {
  if (!monthStr) return null;
  const parts = monthStr.split(' ');
  if (parts.length < 2) return null;
  const monthName = parts[0];
  const year = parseInt(parts[1], 10);
  const monthIndex = MONTH_NAMES.findIndex(m =>
    m.toLowerCase().startsWith(monthName.toLowerCase()),
  );
  if (monthIndex === -1 || isNaN(year)) return null;
  return new Date(year, monthIndex);
};

const formatMonth = date => date.toLocaleString('default', { month: 'short', year: 'numeric' });

const PopularityTimelineChart = () => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const timeRangeId = useId();
  const roleFilterId = useId();
  const startDateId = useId();
  const endDateId = useId();

  const [range, setRange] = useState('12');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateRangeOption, setDateRangeOption] = useState('12months');
  const [error, setError] = useState('');

  const { data: rolesData } = useQuery({
    queryKey: ['allRoles'],
    queryFn: fetchAllRoles,
  });

  useEffect(() => {
    if (rolesData) setAllRoles(rolesData);
  }, [rolesData]);

  const selectedRoleValues = React.useMemo(() => selectedRoles.map(r => r.value), [selectedRoles]);

  const { data: chartData, isLoading, error: queryError } = useQuery({
    queryKey: [
      'popularityData',
      range,
      selectedRoleValues.join(','),
      startDate ? formatForQuery(startDate) : null,
      endDate ? formatForQuery(endDate) : null,
    ],
    queryFn: () =>
      fetchPopularityData({
        range,
        roleValues: selectedRoleValues,
        start: startDate ? formatForQuery(startDate) : null,
        end: endDate ? formatForQuery(endDate) : null,
      }),
    keepPreviousData: false,
  });

  const processedData = React.useMemo(() => {
    if (!chartData || chartData.length === 0) {
      if (range && !startDate && !endDate) {
        const monthsCount = parseInt(range, 10);
        const out = [];
        for (let i = monthsCount - 1; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          out.push({
            date: new Date(d.getFullYear(), d.getMonth(), 1),
            month: formatMonth(d),
            hitsCount: 0,
            applicationsCount: 0,
          });
        }
        return out;
      }
      return [];
    }

    const mapped = chartData.map(item => {
      const dateFromTs = item.timestamp ? new Date(item.timestamp) : null;
      const dateFromMonth = item.month ? parseMonthString(item.month) : null;
      const date = dateFromTs || dateFromMonth || new Date();
      return {
        date: new Date(date.getFullYear(), date.getMonth(), 1),
        hitsCount: Number(item.hitsCount) || 0,
        applicationsCount: Number(item.applicationsCount) || 0,
      };
    });

    const grouped = {};
    mapped.forEach(({ date, hitsCount, applicationsCount }) => {
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!grouped[key]) grouped[key] = { date, hitsCount: 0, applicationsCount: 0 };
      grouped[key].hitsCount += hitsCount;
      grouped[key].applicationsCount += applicationsCount;
    });

    let arr = Object.values(grouped)
      .sort((a, b) => a.date - b.date)
      .map(v => ({
        ...v,
        month: formatMonth(v.date),
      }));

    if (range && !startDate && !endDate) {
      const monthsCount = parseInt(range, 10);
      const out = [];
      for (let i = monthsCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const entry = grouped[key];
        if (entry) {
          out.push({
            ...entry,
            month: formatMonth(new Date(d.getFullYear(), d.getMonth(), 1)),
            date: new Date(d.getFullYear(), d.getMonth(), 1),
          });
        } else {
          out.push({
            date: new Date(d.getFullYear(), d.getMonth(), 1),
            month: formatMonth(new Date(d.getFullYear(), d.getMonth(), 1)),
            hitsCount: 0,
            applicationsCount: 0,
          });
        }
      }
      return out;
    }

    return arr;
  }, [chartData, range, startDate, endDate]);

  const handleStartDateChange = date => {
    setError('');
    if (endDate && date && date > endDate) {
      setError('Start month cannot be later than end month.');
    } else {
      setStartDate(date);
    }
  };

  const handleEndDateChange = date => {
    setError('');
    if (startDate && date && date < startDate) {
      setError('End month cannot be earlier than start month.');
    } else {
      setEndDate(date);
    }
  };

  const shouldShowChart = dateRangeOption !== 'custom' || (startDate && endDate);

  const resetFilters = () => {
    setRange('12');
    setSelectedRoles([]);
    setStartDate(null);
    setEndDate(null);
    setDateRangeOption('12months');
    setError('');
  };

  return (
    <div className={darkMode ? styles['dark-screen'] : styles['light-screen']}>
      <div className={`${styles['pt-container']} ${darkMode ? styles['dark-theme'] : ''}`}>
        <div className={styles['pt-header']}>
          <h2 className={styles['pt-title']}>Hits and Applications by Time</h2>
        </div>

        {/* Filters */}
        <div className={styles['pt-filters']}>
          <div className={styles['pt-filter-group']}>
            <label className={styles['pt-label']} htmlFor={timeRangeId}>
              Time Range
            </label>
            <select
              id={timeRangeId}
              value={dateRangeOption}
              onChange={e => {
                const value = e.target.value;
                setDateRangeOption(value);

                if (value !== 'custom') {
                  setStartDate(null);
                  setEndDate(null);
                  setRange(value.replace('months', ''));
                  setError('');
                }
              }}
              className={styles['pt-select']}
            >
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="12months">Last 12 Months</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateRangeOption === 'custom' && (
            <div className={styles['pt-filter-group']}>
              <div className={styles['pt-label']}>Date Range</div>
              <div className={styles['pt-date-pickers']}>
                <div>
                  <label className={styles['pt-sublabel']} htmlFor={startDateId}>
                    Start Month
                  </label>
                  <DatePicker
                    id={startDateId}
                    selected={startDate}
                    onChange={handleStartDateChange}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    placeholderText="Select start"
                    dateFormat="MMM yyyy"
                    showMonthYearPicker
                    isClearable
                    className={styles['pt-date-picker']}
                    popperClassName={`${styles['pt-datepicker-popper']} ${
                      darkMode ? 'react-datepicker-dark' : ''
                    }`}
                    calendarClassName={styles['pt-datepicker-calendar']}
                  />
                </div>
                <div>
                  <label className={styles['pt-sublabel']} htmlFor={endDateId}>
                    End Month
                  </label>
                  <DatePicker
                    id={endDateId}
                    selected={endDate}
                    onChange={handleEndDateChange}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    placeholderText="Select end"
                    dateFormat="MMM yyyy"
                    showMonthYearPicker
                    isClearable
                    className={styles['pt-date-picker']}
                    popperClassName={`${styles['pt-datepicker-popper']} ${
                      darkMode ? 'react-datepicker-dark' : ''
                    }`}
                    calendarClassName={styles['pt-datepicker-calendar']}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Role Filter */}
          <div className={`${styles['pt-filter-group']} ${styles['pt-role-filter']}`}>
            <label className={styles['pt-label']} htmlFor={roleFilterId}>
              Filter by Role
            </label>
            <Select
              inputId={roleFilterId}
              isMulti
              options={allRoles}
              value={selectedRoles}
              onChange={setSelectedRoles}
              placeholder="All Roles"
              classNamePrefix="months-pledged-chart__select"
              styles={{
                control: provided => ({
                  ...provided,
                  backgroundColor: darkMode ? '#3A506B' : 'white',
                  borderColor: darkMode ? '#444' : '#ccc',
                  color: darkMode ? '#E0E0E0' : '#000',
                  minHeight: '38px',
                  boxShadow: 'none',
                  '&:hover': { borderColor: darkMode ? '#666' : '#999' },
                }),
                input: provided => ({ ...provided, color: darkMode ? '#E0E0E0' : '#000' }),
                placeholder: provided => ({
                  ...provided,
                  color: darkMode ? '#B0B0B0' : '#666',
                  opacity: 0.8,
                }),
                singleValue: provided => ({ ...provided, color: darkMode ? '#E0E0E0' : '#000' }),
                multiValue: provided => ({
                  ...provided,
                  backgroundColor: darkMode ? '#444' : '#e0e0e0',
                  color: darkMode ? '#E0E0E0' : '#000',
                  borderRadius: '4px',
                  padding: '2px 4px',
                }),
                multiValueLabel: provided => ({
                  ...provided,
                  color: darkMode ? '#E0E0E0' : '#000',
                  fontWeight: 500,
                }),
                multiValueRemove: provided => ({
                  ...provided,
                  color: darkMode ? '#E0E0E0' : '#000',
                  ':hover': {
                    backgroundColor: darkMode ? '#555' : '#ccc',
                    color: darkMode ? '#fff' : '#000',
                  },
                }),
                menu: provided => ({
                  ...provided,
                  backgroundColor: darkMode ? '#2a2a3b' : 'white',
                  color: darkMode ? '#E0E0E0' : '#000',
                  zIndex: 100,
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isFocused
                    ? darkMode
                      ? '#444'
                      : '#f5f5f5'
                    : darkMode
                    ? '#2a2a3b'
                    : 'white',
                  color: darkMode
                    ? state.isSelected
                      ? '#fff'
                      : '#E0E0E0'
                    : state.isSelected
                    ? '#000'
                    : '#000',
                  cursor: 'pointer',
                }),
              }}
            />
          </div>

          <button onClick={resetFilters} className={styles['pt-reset-btn']}>
            Reset Filters
          </button>
        </div>

        {/* Error Message */}
        {error && <div className={styles['pt-error']}>{error}</div>}
        {queryError && <div className={styles['pt-error']}>Error: {queryError.message}</div>}

        {/* Chart */}
        {isLoading ? (
          <div className={styles['pt-loading']}>Loading data...</div>
        ) : !shouldShowChart && dateRangeOption === 'custom' ? (
          <div className={styles['pt-no-data']}>Please select both start and end months</div>
        ) : processedData.length > 0 ? (
          <div className={styles['pt-chart-wrapper']}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#f0f0f0'} />
                <XAxis
                  dataKey="month"
                  label={{ value: 'Month', position: 'insideBottom', offset: -10 }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 12, fill: darkMode ? '#ccc' : '#333' }}
                  stroke={darkMode ? '#ccc' : '#333'}
                />
                <YAxis
                  label={{
                    value: 'Activity Count',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' },
                    offset: -10,
                    fill: darkMode ? '#ccc' : '#333',
                  }}
                  tick={{ fontSize: 12, fill: darkMode ? '#ccc' : '#333' }}
                  stroke={darkMode ? '#ccc' : '#333'}
                />
                <Tooltip />
                <Legend verticalAlign="top" height={36} iconType="circle" iconSize={10} />
                <Line dataKey="hitsCount" name="Hits" stroke="#3366cc" strokeWidth={2}>
                  <LabelList dataKey="hitsCount" position="top" />
                </Line>
                <Line
                  dataKey="applicationsCount"
                  name="Applications"
                  stroke="#109618"
                  strokeWidth={2}
                >
                  <LabelList dataKey="applicationsCount" position="top" />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className={styles['pt-no-data']}>No data available for selected filters</div>
        )}
      </div>
    </div>
  );
};

export default PopularityTimelineChart;
