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

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = ENDPOINTS.MONTHS_PLEDGED(
        startDate?.toISOString().split('T')[0],
        endDate?.toISOString().split('T')[0],
        selectedRoles.map(r => r.value),
      );

      const response = await httpService.get(url);
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
    } catch (error) {
      setData([]);
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
  };

  const maxValue = Math.max(...data.map(item => item.avgMonthsPledged), 10);

  // Colors based on theme
  const textColor = darkMode ? 'white' : 'black';
  const gridColor = darkMode ? '#444' : '#e0e0e0';
  const tooltipBg = darkMode ? '#2a2a3b' : 'white';
  const tooltipText = darkMode ? 'white' : 'black';
  const barColor = '#FFD700';

  return (
    <div className={`${styles['months-pledged-chart']} ${darkMode ? styles.dark : ''}`}>
      <h2 className={styles['months-pledged-chart__title']}>
        Average Number of Months Pledged by Role
      </h2>

      {/* Filters */}
      <div className={styles['months-pledged-chart__filters']}>
        {/* Date range */}
        <div className={styles['months-pledged-chart__date-filter']}>
          <label htmlFor="startDate" className={styles['months-pledged-chart__filter-label']}>
            Date Range:
          </label>
          <DatePicker
            id="startDate"
            selected={startDate}
            onChange={date => setStartDate(date)}
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
            onChange={date => setEndDate(date)}
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

        {/* Roles */}
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
            className={styles['months-pledged-chart__role-select']}
            classNamePrefix="months-pledged-chart__select"
          />
        </div>

        <button onClick={resetFilters} className={styles['months-pledged-chart__reset-btn']}>
          Reset Filters
        </button>
      </div>

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
              <Bar dataKey="avgMonthsPledged" fill={barColor} barSize={30} radius={[0, 4, 4, 0]}>
                <LabelList
                  dataKey="avgMonthsPledged"
                  position="right"
                  formatter={value => `${value.toFixed(1)}`}
                  className={styles['months-pledged-chart__bar-label']}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className={styles['months-pledged-chart__empty']}>
          No data available for selected filters
        </div>
      )}
    </div>
  );
};

export default MonthsPledgedChart;
