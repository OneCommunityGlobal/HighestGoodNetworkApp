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

const fetchPopularityData = async ({ range, roleValues = [], start, end }) => {
  // `roleValues` is an array of strings (role names)
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
  // Accepts "January 2024" or "Jan 2024"
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

const formatMonth = date => date.toLocaleString('default', { month: 'short', year: 'numeric' }); // e.g. "Oct 2025"

const PopularityTimelineChart = () => {
  const darkMode = useSelector(state => state.theme.darkMode);

  const timeRangeId = useId();
  const roleFilterId = useId();
  const startDateId = useId();
  const endDateId = useId();

  const [range, setRange] = useState('12'); // number of months when using presets
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateRangeOption, setDateRangeOption] = useState('12months');

  // get roles
  const { data: rolesData } = useQuery({
    queryKey: ['allRoles'],
    queryFn: fetchAllRoles,
  });

  useEffect(() => {
    if (rolesData) setAllRoles(rolesData);
  }, [rolesData]);

  // stable array of role strings for query key & request
  const selectedRoleValues = React.useMemo(() => selectedRoles.map(r => r.value), [selectedRoles]);

  const startISO = startDate ? startDate.toISOString() : null;
  const endISO = endDate ? endDate.toISOString() : null;

  const { data: chartData, isLoading, error } = useQuery({
    queryKey: ['popularityData', range, selectedRoleValues.join(','), startISO, endISO],
    queryFn: () =>
      fetchPopularityData({
        range,
        roleValues: selectedRoleValues,
        start: startDate
          ? `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`
          : null,
        end: endDate
          ? `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`
          : null,
      }),
    keepPreviousData: false,
  });

  // build processedData:
  // - parse date/timestamp (front-end parsing if backend returns month strings),
  // - aggregate by month (sum hits & applications),
  // - for preset ranges fill in missing months with zero counts so X-axis is stable.
  const processedData = React.useMemo(() => {
    if (!chartData || chartData.length === 0) {
      // if preset range, still produce last N months with zeros
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

    // Map incoming rows -> { date, hitsCount, applicationsCount }
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

    // Aggregate by month key
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

    // If user selected a preset range (3/6/12) and no custom dates, ensure we show exactly last N months
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

  const resetFilters = () => {
    setRange('12');
    setSelectedRoles([]);
    setStartDate(null);
    setEndDate(null);
    setDateRangeOption('12months');
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
                  // Clear custom dates when switching away — this was the root cause
                  setStartDate(null);
                  setEndDate(null);
                  setRange(value.replace('months', ''));
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
                    onChange={date => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    placeholderText="Select start"
                    dateFormat="MMM yyyy"
                    showMonthYearPicker
                    isClearable
                    className={styles['pt-date-picker']}
                    // apply module popper class and when in dark mode also add global class used by our CSS
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
                    onChange={date => setEndDate(date)}
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
              placeholder="Select roles..."
              className={styles['pt-multiselect']}
              classNamePrefix="pt-select"
              styles={{
                control: base => ({
                  ...base,
                  minHeight: '38px',
                  borderRadius: '4px',
                  borderColor: darkMode ? '#555' : '#ddd',
                  backgroundColor: darkMode ? '#333' : 'white',
                  color: darkMode ? '#fff' : '#2c3e50',
                }),
                menu: base => ({
                  ...base,
                  backgroundColor: darkMode ? '#2d3748' : 'white',
                  color: darkMode ? '#e2e8f0' : '#2c3e50',
                }),
              }}
            />
          </div>

          <button onClick={resetFilters} className={styles['pt-reset-btn']}>
            Reset Filters
          </button>
        </div>

        {/* Chart */}
        {isLoading ? (
          <div className={styles['pt-loading']}>Loading data...</div>
        ) : error ? (
          <div className={styles['pt-error']}>Error: {error.message}</div>
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
                <Tooltip
                  formatter={value => [value, 'Count']}
                  labelFormatter={label => `${label}`}
                  contentStyle={{
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0',
                    backgroundColor: darkMode ? '#333' : '#fff',
                    color: darkMode ? '#fff' : '#333',
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" iconSize={10} />
                <Line
                  dataKey="hitsCount"
                  name="Hits"
                  stroke="#3366cc"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                >
                  <LabelList
                    dataKey="hitsCount"
                    position="top"
                    style={{ fill: darkMode ? '#e2e8f0' : '#333', fontSize: 11 }}
                  />
                </Line>
                <Line
                  dataKey="applicationsCount"
                  name="Applications"
                  stroke="#109618"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                >
                  <LabelList
                    dataKey="applicationsCount"
                    position="top"
                    style={{ fill: darkMode ? '#e2e8f0' : '#333', fontSize: 11 }}
                  />
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
