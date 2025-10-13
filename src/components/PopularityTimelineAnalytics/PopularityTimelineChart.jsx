// src/components/PopularityTimelineAnalytics/PopularityTimelineChart.jsx
import React, { useState, useEffect, useId, useMemo } from 'react';
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

// Helper: Format date for query (local, not UTC)
const formatForQuery = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const fetchPopularityData = async ({ range, roleValues = [], start, end }) => {
  const { data } = await axios.get(ENDPOINTS.POPULARITY(range, roleValues, start, end));
  return data;
};

const fetchAllRoles = async () => {
  const { data } = await axios.get(ENDPOINTS.POPULARITY_ROLES);
  return data.map(role => ({ value: role, label: role }));
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
  const year = Number.parseInt(parts[1], 10);
  const monthIndex = MONTH_NAMES.findIndex(m =>
    m.toLowerCase().startsWith(monthName.toLowerCase()),
  );

  if (monthIndex === -1 || Number.isNaN(year)) return null;
  return new Date(year, monthIndex);
};

const formatMonth = date => date.toLocaleString('default', { month: 'short', year: 'numeric' });

const getOptionStyles = (darkMode, state) => {
  let backgroundColor;
  let color;

  if (state.isFocused) {
    backgroundColor = darkMode ? '#444' : '#f5f5f5';
  } else {
    backgroundColor = darkMode ? '#2a2a3b' : 'white';
  }

  if (darkMode) {
    color = state.isSelected ? '#fff' : '#E0E0E0';
  } else {
    color = '#000';
  }

  return { backgroundColor, color };
};

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

  const selectedRoleValues = useMemo(() => selectedRoles.map(r => r.value), [selectedRoles]);

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

  const generateEmptyMonths = monthsCount => {
    const output = [];
    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      output.push({
        date: new Date(d.getFullYear(), d.getMonth(), 1),
        month: formatMonth(d),
        hitsCount: 0,
        applicationsCount: 0,
      });
    }
    return output;
  };

  const processChartData = data => {
    if (!data || data.length === 0) {
      if (range && !startDate && !endDate) {
        return generateEmptyMonths(Number.parseInt(range, 10));
      }
      return [];
    }

    const mapped = data.map(item => {
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
    for (const { date, hitsCount, applicationsCount } of mapped) {
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!grouped[key]) {
        grouped[key] = { date, hitsCount: 0, applicationsCount: 0 };
      }
      grouped[key].hitsCount += hitsCount;
      grouped[key].applicationsCount += applicationsCount;
    }

    const arr = Object.values(grouped)
      .sort((a, b) => a.date - b.date)
      .map(v => ({ ...v, month: formatMonth(v.date) }));

    if (range && !startDate && !endDate) {
      const monthsCount = Number.parseInt(range, 10);
      const filled = generateEmptyMonths(monthsCount);
      return filled.map(d => {
        const key = `${d.date.getFullYear()}-${d.date.getMonth()}`;
        return grouped[key] ? { ...grouped[key], month: formatMonth(d.date) } : d;
      });
    }

    return arr;
  };

  const processedData = useMemo(() => processChartData(chartData), [
    chartData,
    range,
    startDate,
    endDate,
  ]);

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

  const renderChart = () => {
    if (isLoading) {
      return <div className={styles['pt-loading']}>Loading data...</div>;
    }
    if (!shouldShowChart && dateRangeOption === 'custom') {
      return <div className={styles['pt-no-data']}>Please select both start and end months</div>;
    }
    if (processedData.length > 0) {
      return (
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
      );
    }
    return <div className={styles['pt-no-data']}>No data available for selected filters</div>;
  };

  return (
    <div className={darkMode ? styles['dark-screen'] : styles['light-screen']}>
      <div className={`${styles['pt-container']} ${darkMode ? styles['dark-theme'] : ''}`}>
        <div className={styles['pt-header']}>
          <h2 className={styles['pt-title']}>Hits and Applications by Time</h2>
        </div>

        {/* Filters */}
        <div className={styles['pt-filters']}>
          {/* Time Range */}
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

          {/* Date Pickers */}
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
              styles={{
                option: (provided, state) => ({
                  ...provided,
                  ...getOptionStyles(darkMode, state),
                }),
              }}
            />
          </div>

          <button onClick={resetFilters} className={styles['pt-reset-btn']}>
            Reset Filters
          </button>
        </div>

        {/* Error Messages */}
        {error && <div className={styles['pt-error']}>{error}</div>}
        {queryError && <div className={styles['pt-error']}>Error: {queryError.message}</div>}

        {/* Chart */}
        {renderChart()}
      </div>
    </div>
  );
};

export default PopularityTimelineChart;
