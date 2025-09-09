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
import styles from './PopularityTimelineChart.module.css'; // ✅ module import

const fetchPopularityData = async ({ range, selectedRoles, startDate, endDate }) => {
  const roles = selectedRoles.map(role => role.value);

  const start = startDate
    ? `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`
    : null;

  const end = endDate
    ? `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`
    : null;

  return axios.get(ENDPOINTS.POPULARITY(range, roles, start, end)).then(res => res.data);
};

const fetchAllRoles = async () => {
  const response = await axios.get(ENDPOINTS.POPULARITY_ROLES);
  return response.data.map(role => ({ value: role, label: role }));
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

  const { data: rolesData } = useQuery({
    queryKey: ['allRoles'],
    queryFn: fetchAllRoles,
  });

  useEffect(() => {
    if (rolesData) setAllRoles(rolesData);
  }, [rolesData]);

  const { data: chartData, isLoading, error } = useQuery({
    queryKey: ['popularityData', range, selectedRoles, startDate, endDate],
    queryFn: () => fetchPopularityData({ range, selectedRoles, startDate, endDate }),
    keepPreviousData: true,
  });

  const parseMonthString = monthStr => {
    const [monthName, year] = monthStr.split(' ');
    const monthIndex = [
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
    ].indexOf(monthName);
    return new Date(year, monthIndex);
  };

  const processedData = React.useMemo(() => {
    if (!chartData || chartData.length === 0) return [];
    return chartData
      .map(item => ({
        ...item,
        date: item.timestamp ? new Date(item.timestamp) : parseMonthString(item.month),
      }))
      .sort((a, b) => a.date - b.date);
  }, [chartData]);

  const resetFilters = () => {
    setRange('12');
    setSelectedRoles([]);
    setStartDate(null);
    setEndDate(null);
    setDateRangeOption('12months');
  };

  return (
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
              setDateRangeOption(e.target.value);
              if (e.target.value !== 'custom') {
                setRange(e.target.value.replace('months', ''));
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
                  popperClassName={styles['pt-datepicker-popper']}
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
                  popperClassName={styles['pt-datepicker-popper']}
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
                contentStyle={{
                  borderRadius: '6px',
                  border: '1px solid #e0e0e0',
                  backgroundColor: darkMode ? '#333' : '#fff',
                  color: darkMode ? '#fff' : '#333',
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={10} />
              <Line dataKey="hitsCount" name="Hits" stroke="#3366cc" strokeWidth={2} />
              <Line
                dataKey="applicationsCount"
                name="Applications"
                stroke="#109618"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className={styles['pt-no-data']}>No data available for selected filters</div>
      )}
    </div>
  );
};

export default PopularityTimelineChart;
