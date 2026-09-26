import React, { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';
import { useSelector } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import moment from 'moment';
import styles from './DistributionLaborHours.module.css';
import config from '../../../../config.json';
import { ENDPOINTS } from '../../../../utils/URL';
import logger from '../../../../services/logService';

const COLORS = ['#2a647c', '#2e8ea3', '#ffab91', '#ffccbb', '#bbbbbb', '#f9f3e3'];

const MOCK_DATA = [
  { name: 'Stud Wall Construction', value: 25.9 },
  { name: 'Foundation Concreting', value: 18.5 },
  { name: 'Task A', value: 22.2 },
  { name: 'Task B', value: 18.5 },
  { name: 'Task C', value: 14.8 },
  { name: 'Electrical', value: 12 },
  { name: 'Plumbing', value: 8 },
  { name: 'Welding', value: 6 },
];

const isDevelopmentEnvironment = () => {
  if (globalThis.window === undefined) {
    return process.env.NODE_ENV === 'development';
  }
  const { hostname } = globalThis.window.location;
  return (
    hostname.includes('dev') ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    process.env.NODE_ENV === 'development'
  );
};

const topFiveWithOthers = data => {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const top5 = sorted.slice(0, 5);
  const othersTotal = sorted.slice(5).reduce((sum, item) => sum + item.value, 0);
  if (othersTotal > 0) {
    top5.push({ name: 'Others', value: othersTotal });
  }
  return top5;
};

const CustomTooltip = ({ active, payload, total, darkMode }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    const percent = ((value / total) * 100).toFixed(1);
    return (
      <div
        className={styles.tooltip}
        style={{
          backgroundColor: darkMode ? '#2E3E5A' : '#fff',
          color: darkMode ? '#fff' : '#000',
          border: darkMode ? '1px solid #555' : '1px solid #ccc',
        }}
      >
        <p>{name}</p>
        <p>{`Hours: ${value} hrs`}</p>
        <p>{`Percentage: ${percent}%`}</p>
      </div>
    );
  }
  return null;
};

export default function DistributionLaborHours() {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [filteredData, setFilteredData] = useState(topFiveWithOthers(MOCK_DATA));
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [projectFilter, setProjectFilter] = useState('');
  const [memberFilter, setMemberFilter] = useState('');

  const fetchDistribution = useCallback(async ({ from, to, category }) => {
    try {
      const token = localStorage.getItem(config.tokenKey);
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: token }),
      };

      const startDate =
        from ||
        moment()
          .subtract(30, 'days')
          .format('YYYY-MM-DD');
      const endDate = to || moment().format('YYYY-MM-DD');
      const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
      if (category) params.set('category', category);

      const response = await fetch(
        `${ENDPOINTS.APIEndpoint()}/labor-hours/distribution?${params.toString()}`,
        { method: 'GET', headers, cache: 'no-store' },
      );

      if (!response.ok) throw new Error(`Status ${response.status}`);
      const body = await response.json();
      const distribution = (body.distribution || []).map(item => ({
        name: item.category,
        value: item.hours,
      }));

      setFilteredData(topFiveWithOthers(distribution.length > 0 ? distribution : MOCK_DATA));
    } catch (error) {
      logger.logError(error);
      if (isDevelopmentEnvironment()) {
        setFilteredData(topFiveWithOthers(MOCK_DATA));
      } else {
        setFilteredData([]);
      }
    }
  }, []);

  useEffect(() => {
    fetchDistribution({ from: dateRange.from, to: dateRange.to, category: projectFilter });
    // Initial load only; subsequent updates happen on Submit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => {
    fetchDistribution({ from: dateRange.from, to: dateRange.to, category: projectFilter });
  };

  const totalHours = filteredData.reduce((sum, item) => sum + item.value, 0);

  const projectOptions = [
    { value: '', label: 'ALL' },
    { value: 'Project A', label: 'Project A' },
    { value: 'Project B', label: 'Project B' },
  ];

  const memberOptions = [
    { value: '', label: 'ALL' },
    { value: 'Member 1', label: 'Member 1' },
    { value: 'Member 2', label: 'Member 2' },
  ];

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Distribution of Labor Hours</h3>

      {/* Filters */}
      <div className={styles.filters}>
        <label>
          From:
          <input
            type="date"
            value={dateRange.from}
            onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
          />
        </label>
        <label>
          To:
          <input
            type="date"
            value={dateRange.to}
            onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
          />
        </label>
        <label htmlFor="project-filter">
          Project:
          <Select
            options={projectOptions}
            value={projectOptions.find(opt => opt.value === projectFilter)}
            onChange={opt => setProjectFilter(opt.value)}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </label>
        <label htmlFor="member-filter">
          Member:
          <Select
            options={memberOptions}
            value={memberOptions.find(opt => opt.value === memberFilter)}
            onChange={opt => setMemberFilter(opt.value)}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </label>

        <div className={styles.buttonContainer}>
          <button className={styles.button} type="button" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>

      {/* Chart + Legend */}
      <div className={styles.chartWrapper}>
        <div className={styles.legend}>
          {filteredData.map(entry => (
            <div key={entry.name} className={styles.legendItem}>
              <span
                className={styles.colorBox}
                style={{ backgroundColor: COLORS[filteredData.indexOf(entry) % COLORS.length] }}
              />
              <span style={{ color: darkMode ? '#f5f5f5' : '#000' }}>
                {entry.name}: {entry.value} hrs
              </span>
            </div>
          ))}
        </div>

        <div className={styles.pieChartContainer}>
          {filteredData.length === 0 ? (
            <div className={styles.tooltip}>No data available for the selected filters.</div>
          ) : (
            <ResponsiveContainer width={300} height={300}>
              <PieChart>
                <Pie
                  data={filteredData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  labelLine={false}
                  label={({ x, y, value }) => (
                    <text
                      x={x}
                      y={y}
                      fill={darkMode ? '#ffffff' : '#1f2937'}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={12}
                      fontWeight="600"
                    >
                      {`${((value / totalHours) * 100).toFixed(1)}%`}
                    </text>
                  )}
                >
                  {filteredData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip total={totalHours} darkMode={darkMode} />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
