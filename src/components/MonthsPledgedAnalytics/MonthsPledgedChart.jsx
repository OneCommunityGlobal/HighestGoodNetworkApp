import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './MonthsPledgedChart.module.css';
import { ENDPOINTS } from '../../utils/URL';
import httpService from '../../services/httpService';
import { useSelector } from 'react-redux';

const MonthsPledgedChart = () => {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allRoles, setAllRoles] = useState([]);
  const [error, setError] = useState('');
  const [hoveredRole, setHoveredRole] = useState(null);

  const fetchData = async () => {
    setError('');
    if ((startDate && !endDate) || (!startDate && endDate)) {
      setData([]);
      setError('Please select both start and end dates.');
      return;
    }

    setLoading(true);
    try {
      const url = ENDPOINTS.MONTHS_PLEDGED(
        startDate?.toISOString().split('T')[0],
        endDate?.toISOString().split('T')[0],
        selectedRoles.map(r => r.value),
      );

      const response = await httpService.get(url);

      if (response.status === 401) {
        setData([]);
        setError('Unauthorized access. Please log in again.');
        return;
      }

      const result = response.data;

      if (Array.isArray(result)) {
        const sortedData = [...result].sort((a, b) => b.avgMonthsPledged - a.avgMonthsPledged);
        setData(sortedData);

        if (allRoles.length === 0) {
          const roles = [...new Set(result.map(item => item.role))];
          setAllRoles(roles.map(role => ({ value: role, label: role })));
        }
      } else {
        setData([]);
      }
    } catch (err) {
      setData([]);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, selectedRoles]);

  const resetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedRoles([]);
    setError('');
  };

  const maxValue = Math.max(...data.map(item => item.avgMonthsPledged), 10);

  // Theme-based colors
  const textColor = darkMode ? '#E0E0E0' : '#000';
  const gridColor = darkMode ? '#444' : '#e0e0e0';
  const tooltipBg = darkMode ? '#1C2541' : 'white';
  const tooltipText = darkMode ? '#E0E0E0' : 'black';
  const barColor = '#FFD700';

  const handleStartDateChange = date => {
    if (endDate && date && date > endDate) {
      setError('Start date cannot be later than end date.');
      return;
    }
    setError('');
    setStartDate(date);
  };

  const handleEndDateChange = date => {
    if (startDate && date && date < startDate) {
      setError('End date cannot be earlier than start date.');
      return;
    }
    setError('');
    setEndDate(date);
  };

  return (
    <div
      className={`${darkMode ? styles['full-screen-dark'] : ''}`}
      style={{ minHeight: '100vh', padding: '20px' }}
    >
      <div className={`${styles['months-pledged-chart']} ${darkMode ? styles.dark : ''}`}>
        <h2 className={styles['months-pledged-chart__title']}>
          Average Number of Months Pledged by Role
        </h2>

        {/* Filters */}
        <div className={styles['months-pledged-chart__filters']}>
          <div className={styles['months-pledged-chart__date-filter']}>
            <label htmlFor="startDate" className={styles['months-pledged-chart__filter-label']}>
              Date Range:
            </label>
            <DatePicker
              id="startDate"
              selected={startDate}
              onChange={handleStartDateChange}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Start Date"
              dateFormat="yyyy-MM-dd"
              isClearable
              className={styles['months-pledged-chart__date-picker']}
            />
            <DatePicker
              id="endDate"
              selected={endDate}
              onChange={handleEndDateChange}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="End Date"
              dateFormat="yyyy-MM-dd"
              isClearable
              className={styles['months-pledged-chart__date-picker']}
            />
          </div>

          <div className={styles['months-pledged-chart__role-filter']}>
            <label htmlFor="filterRoles" className={styles['months-pledged-chart__filter-label']}>
              Filter Roles:
            </label>
            <Select
              inputId="filterRoles"
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
                  borderColor: darkMode ? '#444' : '#DAA520',
                  color: darkMode ? '#E0E0E0' : '#000',
                }),
                input: provided => ({
                  ...provided,
                  color: darkMode ? '#E0E0E0' : '#000',
                }),
                placeholder: provided => ({
                  ...provided,
                  color: darkMode ? '#E0E0E0' : '#8B7500',
                  opacity: 0.7,
                }),
                singleValue: provided => ({
                  ...provided,
                  color: darkMode ? '#E0E0E0' : '#000',
                }),
                multiValue: provided => ({
                  ...provided,
                  backgroundColor: darkMode ? '#444' : '#DAA520',
                  color: darkMode ? '#E0E0E0' : '#fff',
                }),
                multiValueLabel: provided => ({
                  ...provided,
                  color: darkMode ? '#E0E0E0' : '#fff',
                }),
                multiValueRemove: provided => ({
                  ...provided,
                  color: darkMode ? '#E0E0E0' : '#fff',
                  ':hover': {
                    backgroundColor: darkMode ? '#555' : '#FFD700',
                    color: darkMode ? '#fff' : '#000',
                  },
                }),
                menu: provided => ({
                  ...provided,
                  backgroundColor: darkMode ? '#2a2a3b' : 'white',
                  color: darkMode ? '#E0E0E0' : '#000',
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isFocused
                    ? darkMode
                      ? '#444'
                      : '#f0f0f0'
                    : darkMode
                    ? '#2a2a3b'
                    : 'white',
                  color: darkMode
                    ? state.isSelected
                      ? '#000'
                      : '#E0E0E0'
                    : state.isSelected
                    ? '#000'
                    : '#000',
                }),
              }}
            />
          </div>

          <button onClick={resetFilters} className={styles['months-pledged-chart__reset-btn']}>
            Reset Filters
          </button>
        </div>

        {/* Error Message */}
        {error && <div className={styles['months-pledged-chart__error']}>{error}</div>}

        {/* Chart */}
        {loading ? (
          <div className={styles['months-pledged-chart__loading']}>Loading data...</div>
        ) : data.length > 0 ? (
          <div className={styles['months-pledged-chart__container']}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={data}
                margin={{ top: 20, right: 30, left: 150, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  type="number"
                  domain={[0, maxValue * 1.1]}
                  stroke={textColor}
                  tick={{ fill: textColor, fontSize: 12, fontWeight: 500 }}
                  label={{
                    value: 'Average Months Pledged',
                    position: 'bottom',
                    fill: textColor,
                    fontSize: 14,
                    fontWeight: '500',
                  }}
                />
                <YAxis
                  dataKey="role"
                  type="category"
                  stroke={textColor}
                  width={150}
                  tick={{ fill: textColor, fontSize: 12, fontWeight: 500 }}
                  label={{
                    value: 'Roles',
                    angle: -90,
                    position: 'left',
                    fill: textColor,
                    fontSize: 14,
                    fontWeight: '500',
                  }}
                />
                <Tooltip
                  content={({ payload, label, active }) => {
                    if (active && payload && payload.length) {
                      // This line ensures highlight state stays active
                      // even when hovering the empty grey extension
                      setHoveredRole(label);

                      return (
                        <div
                          style={{
                            backgroundColor: tooltipBg,
                            border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
                            padding: '8px 12px',
                            borderRadius: '4px',
                            color: tooltipText,
                          }}
                        >
                          <div style={{ fontWeight: '600' }}>Role: {label}</div>
                          <div>Average: {payload[0].value} months</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Bar
                  dataKey="avgMonthsPledged"
                  fill={barColor}
                  barSize={30}
                  radius={[0, 4, 4, 0]}
                  onMouseEnter={data => setHoveredRole(data.role)}
                  onMouseLeave={() => setHoveredRole(null)}
                >
                  <LabelList
                    dataKey="avgMonthsPledged"
                    position="right"
                    content={props => {
                      const { x, y, value, index, viewBox } = props;

                      // Real bar width from Recharts
                      const barLeft = viewBox?.x ?? x;
                      const barWidth = viewBox?.width ?? 0;

                      // Compute right edge of the bar
                      const labelX = barLeft + barWidth + 6;
                      const labelY = y + 15; // vertical centering

                      const role = data[index].role;
                      const isHovered = hoveredRole === role;

                      const labelColor = darkMode
                        ? isHovered
                          ? '#000000' // hovered bar in dark mode → black
                          : '#E0E0E0' // normal dark mode
                        : '#000000'; // light mode always black

                      return (
                        <text
                          x={labelX}
                          y={labelY}
                          fill={labelColor}
                          fontSize={12}
                          fontWeight={600}
                          dominantBaseline="middle"
                          textAnchor="start"
                          style={{ pointerEvents: 'none' }} // ensures tooltip hover doesn’t break
                        >
                          {value.toFixed(1)}
                        </text>
                      );
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : !error ? (
          <div className={styles['months-pledged-chart__empty']}>
            No data available for selected filters
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MonthsPledgedChart;
