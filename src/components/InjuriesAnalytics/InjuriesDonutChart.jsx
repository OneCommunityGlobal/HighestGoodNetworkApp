// src/components/InjuriesAnalytics/InjuriesDonutChart.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Label } from 'recharts';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './InjuriesDonutChart.module.css';
import { ENDPOINTS } from '../../utils/URL';
import httpService from '../../services/httpService';
import { useSelector } from 'react-redux';

// Light tone colors
const SEVERITY_COLORS = {
  Minor: '#7BC8F6', // Light Blue
  Moderate: '#FFD166', // Light Gold
  Severe: '#06D6A0', // Light Green
  Critical: '#FF6B6B', // Light Red
};

const TYPE_COLORS = {
  Cut: '#8884d8', // Light Purple
  Fracture: '#82ca9d', // Light Green
  Burn: '#8dd1e1', // Light Blue
  Bruise: '#a4de6c', // Light Green
  Sprain: '#d0ed57', // Light Yellow
  Other: '#ffc658', // Light Orange
};

const FALLBACK_COLORS = ['#8884d8', '#82ca9d', '#8dd1e1', '#a4de6c', '#d0ed57', '#ffc658'];

const InjuriesDonutChart = () => {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [groupBy, setGroupBy] = useState('severity');

  // Generate unique IDs for form controls
  const projectSelectId = 'project-select';
  const startDateId = 'start-date';
  const endDateId = 'end-date';
  const dateRangeGroupId = 'date-range-group'; // Add this for the date range group

  // Fetch projects dropdown list
  const fetchProjects = useCallback(async () => {
    try {
      const res = await httpService.get(ENDPOINTS.PROJECTS());
      const projectsArray = res?.data || [];

      const options = projectsArray.map(p => ({
        value: String(p._id || p.id || p.value || ''),
        label: p.projectName || p.name || p.label || 'Unnamed Project',
      }));

      setProjects(options);
    } catch (err) {
      setProjects([]);
    }
  }, []);

  // Compute percent (client-side)
  const computeClientPercent = (items, totalCount) =>
    items.map(it => ({
      ...it,
      percent: totalCount > 0 ? Number(((Number(it.count) / totalCount) * 100).toFixed(1)) : 0,
    }));

  // Fetch data from API
  const fetchData = useCallback(async () => {
    setError('');

    if ((startDate && !endDate) || (!startDate && endDate)) {
      setError('Please select both start and end dates.');
      setData([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    try {
      const url = ENDPOINTS.INJURIES_DISTRIBUTION(
        selectedProject?.value || 'all',
        startDate?.toISOString().split('T')[0],
        endDate?.toISOString().split('T')[0],
        groupBy,
      );

      const res = await httpService.get(url);
      const apiDistribution = res?.data?.distribution || [];
      const apiTotal = Number(res?.data?.total ?? 0);

      const normalized = apiDistribution.map(d => ({
        category: d.category,
        count: Number(d.count ?? 0),
        percent: d.percent !== undefined ? Number(d.percent) : undefined,
      }));

      const finalTotal = apiTotal || normalized.reduce((s, r) => s + r.count, 0);
      const finalData = computeClientPercent(normalized, finalTotal);

      setData(finalData);
      setTotal(finalTotal);
    } catch (err) {
      setError('Failed to fetch data. Click Retry.');
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedProject, groupBy]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, selectedProject, groupBy]);

  const resetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedProject(null);
    setError('');
  };

  const getColorForCategory = (category, index) => {
    if (groupBy === 'severity') {
      return SEVERITY_COLORS[category] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
    }
    return TYPE_COLORS[category] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
  };

  const tooltipBg = darkMode ? '#1C2541' : '#ffffff';
  const tooltipText = darkMode ? '#E0E0E0' : '#000000';
  const legendColor = darkMode ? '#E0E0E0' : '#000000';

  // Custom label renderer with better visibility
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight="bold"
        style={{
          textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
          pointerEvents: 'none',
        }}
      >
        {percent}%
      </text>
    );
  };

  return (
    <div className={darkMode ? styles['full-screen-dark'] : ''}>
      <div className={`${styles['injuries-donut-chart']} ${darkMode ? styles.dark : ''}`}>
        <h2 className={styles.title}>Injuries by {groupBy === 'severity' ? 'Severity' : 'Type'}</h2>

        {/* Filter Section */}
        <div className={styles.filters}>
          <div className={styles['filter-item']}>
            <label htmlFor={projectSelectId}>Project:</label>
            <Select
              id={projectSelectId}
              options={projects}
              value={selectedProject}
              onChange={setSelectedProject}
              placeholder="All Projects"
              isClearable
              classNamePrefix="injuries-chart__select"
              styles={{
                control: base => ({
                  ...base,
                  minHeight: '40px',
                }),
              }}
            />
          </div>

          <div className={styles['filter-item']}>
            {/* FIX: Use span instead of label for group labels */}
            <span className={styles['label-text']}>Date Range:</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div>
                <label htmlFor={startDateId} className={styles.srOnly}>
                  Start Date
                </label>
                <DatePicker
                  id={startDateId}
                  selected={startDate}
                  onChange={setStartDate}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="Start Date"
                  dateFormat="yyyy-MM-dd"
                  isClearable
                  className={styles.datePicker}
                />
              </div>
              <div>
                <label htmlFor={endDateId} className={styles.srOnly}>
                  End Date
                </label>
                <DatePicker
                  id={endDateId}
                  selected={endDate}
                  onChange={setEndDate}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  placeholderText="End Date"
                  dateFormat="yyyy-MM-dd"
                  isClearable
                  className={styles.datePicker}
                />
              </div>
            </div>
          </div>

          <div className={styles['filter-item']}>
            <span className={styles['label-text']}>Group By:</span>
            <div className={styles['toggle-buttons']} role="group" aria-label="Group by">
              <button
                onClick={() => setGroupBy('severity')}
                className={`${styles['toggle-btn']} ${groupBy === 'severity' ? styles.active : ''}`}
                type="button"
                aria-pressed={groupBy === 'severity'}
              >
                Severity
              </button>
              <button
                onClick={() => setGroupBy('injuryType')}
                className={`${styles['toggle-btn']} ${
                  groupBy === 'injuryType' ? styles.active : ''
                }`}
                type="button"
                aria-pressed={groupBy === 'injuryType'}
              >
                Type
              </button>
            </div>
          </div>

          <button onClick={resetFilters} className={styles['reset-btn']}>
            Reset Filters
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className={styles.error}>
            {error}
            <button onClick={fetchData} className={styles['retry-btn']} type="button">
              Retry
            </button>
          </div>
        )}

        {/* Chart */}
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            Loading data...
          </div>
        ) : data && data.length > 0 ? (
          <div className={styles['chart-container']}>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="category"
                  innerRadius="50%" // Smaller inner radius = thicker ring
                  outerRadius="75%" // Adjusted for thicker ring
                  paddingAngle={1}
                  label={renderCustomizedLabel}
                  labelLine={false}
                  isAnimationActive={true}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColorForCategory(entry.category, index)} />
                  ))}
                  {/* Center Label */}
                  <Label
                    value={`${total}\nInjuries`}
                    position="center"
                    style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      fill: darkMode ? '#E0E0E0' : '#000000',
                    }}
                    textAnchor="middle"
                    verticalAnchor="middle"
                  />
                </Pie>

                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const item = payload[0].payload;
                    return (
                      <div
                        style={{
                          backgroundColor: tooltipBg,
                          padding: '12px',
                          borderRadius: '6px',
                          color: tooltipText,
                          border: `1px solid ${darkMode ? '#444' : '#ddd'}`,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                      >
                        <div style={{ fontWeight: 700, marginBottom: '4px' }}>{item.category}</div>
                        <div>
                          {item.count} injuries - {item.percent}%
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{
                    color: legendColor,
                    paddingLeft: '20px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : !error && !loading ? (
          <div className={styles.empty}>No data available for selected filters</div>
        ) : null}
      </div>
    </div>
  );
};

export default InjuriesDonutChart;
