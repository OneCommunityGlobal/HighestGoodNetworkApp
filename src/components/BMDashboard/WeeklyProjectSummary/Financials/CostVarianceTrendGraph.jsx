import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { useSelector } from 'react-redux';
import styles from './CostVarianceTrendGraph.module.css';

const MOCK_RAW_DATA = [
  ['Project A', 'Plumbing', 1000, 1200, '2026-05-01'],
  ['Project A', 'Electrical', 1500, 1300, '2026-05-02'],
  ['Project B', 'Plumbing', 1100, 1050, '2026-05-03'],
  ['Project B', 'Structural', 2200, 2150, '2026-05-04'],
  ['Project C', 'Mechanical', 1300, 1800, '2026-05-05'],
  ['Project A', 'Structural', 900, 1400, '2026-05-08'],
  ['Project B', 'Electrical', 2000, 1600, '2026-05-09'],
  ['Project C', 'Plumbing', 800, 750, '2026-05-10'],
  ['Project A', 'Mechanical', 2500, 2400, '2026-05-11'],
  ['Project C', 'Electrical', 1800, 2100, '2026-05-12'],
  ['Project B', 'Structural', 3000, 3500, '2026-05-15'],
  ['Project B', 'Mechanical', 1500, 1400, '2026-05-16'],
  ['Project A', 'Plumbing', 1200, 1100, '2026-05-17'],
  ['Project C', 'Structural', 4000, 4200, '2026-05-18'],
  ['Project A', 'Electrical', 1700, 1650, '2026-05-19'],
  ['Project B', 'Plumbing', 1300, 1100, '2026-05-22'],
  ['Project C', 'Mechanical', 2100, 2500, '2026-05-23'],
  ['Project A', 'Structural', 2800, 2800, '2026-05-24'],
  ['Project B', 'Electrical', 1900, 1750, '2026-05-25'],
  ['Project C', 'Plumbing', 1500, 1600, '2026-05-26'],
];

const MOCK_DB = MOCK_RAW_DATA.map(([projectId, category, plannedCost, actualCost, date]) => ({
  projectId,
  category,
  plannedCost,
  actualCost,
  date,
}));

const aggregateTrendData = (data, projectFilter, categoryFilter, dateRange) => {
  if (!Array.isArray(data)) return [];

  const filtered = data.filter(entry => {
    const entryDate = moment(entry.date);
    if (dateRange.startDate && entryDate.isBefore(moment(dateRange.startDate).startOf('day')))
      return false;
    if (dateRange.endDate && entryDate.isAfter(moment(dateRange.endDate).endOf('day')))
      return false;
    if (projectFilter !== 'ALL' && entry.projectId !== projectFilter) return false;
    if (categoryFilter !== 'ALL' && entry.category !== categoryFilter) return false;
    return true;
  });

  const groupedByDate = {};
  filtered.forEach(entry => {
    const key = entry.date;
    if (!groupedByDate[key]) {
      groupedByDate[key] = { date: key, planned: 0, actual: 0 };
    }
    groupedByDate[key].planned += entry.plannedCost;
    groupedByDate[key].actual += entry.actualCost;
  });

  return Object.values(groupedByDate)
    .map(item => ({ ...item, variance: item.actual - item.planned }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

const generateSelectStyles = darkMode => {
  const bgMain = darkMode ? '#253342' : '#fff';
  const borderMain = darkMode ? '#2d4059' : '#ccc';
  const textMain = darkMode ? '#ffffff' : '#000';
  const textMuted = darkMode ? '#94a3b8' : '#999';
  const bgHover = darkMode ? '#3a506b' : '#f0f0f0';
  const bgSelected = darkMode ? '#e8a71c' : '#0d55b3';

  return {
    control: base => ({
      ...base,
      minHeight: '38px',
      width: '100%',
      fontSize: '13px',
      backgroundColor: bgMain,
      borderColor: borderMain,
      color: textMain,
      boxShadow: 'none',
      borderRadius: '6px',
      '&:hover': { borderColor: borderMain },
    }),
    valueContainer: base => ({ ...base, padding: '2px 8px', color: textMain }),
    input: base => ({ ...base, margin: '0px', padding: '0px', color: textMain }),
    indicatorSeparator: base => ({ ...base, backgroundColor: borderMain }),
    dropdownIndicator: base => ({
      ...base,
      color: textMuted,
      padding: '4px',
      ':hover': { color: textMain },
    }),
    singleValue: base => ({ ...base, color: textMain, fontSize: '13px' }),
    menu: base => ({
      ...base,
      backgroundColor: bgMain,
      border: `1px solid ${borderMain}`,
      borderRadius: '6px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 9999,
    }),
    menuList: base => ({ ...base, backgroundColor: bgMain, borderRadius: '6px' }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? bgSelected : state.isFocused ? bgHover : bgMain,
      color: state.isSelected ? (darkMode ? '#000' : '#fff') : textMain,
      cursor: 'pointer',
      padding: '8px 12px',
      fontSize: '13px',
      ':active': { backgroundColor: darkMode ? '#3a506b' : '#e0e0e0' },
    }),
  };
};

const CustomTooltip = ({ active, payload, label, darkMode }) => {
  if (active && payload && payload.length) {
    const chartData = payload[0].payload;
    const isOverBudget = chartData.variance > 0;

    const varianceClass = isOverBudget
      ? darkMode
        ? styles.varianceOverDark
        : styles.varianceOverLight
      : darkMode
      ? styles.varianceUnderDark
      : styles.varianceUnderLight;

    return (
      <div
        style={{
          backgroundColor: darkMode ? '#1e293b' : '#ffffff',
          border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
          color: darkMode ? '#f8fafc' : '#0f172a',
          padding: '12px',
          fontSize: '12px',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            fontWeight: 'bold',
            margin: '0 0 8px 0',
            paddingBottom: '6px',
            borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            color: darkMode ? '#94a3b8' : '#64748b',
          }}
        >
          Date: {moment(label).format('MMM DD, YYYY')}
        </div>
        <div style={{ margin: '0 0 4px 0' }}>
          Planned: <strong>${chartData.planned.toLocaleString()}</strong>
        </div>
        <div style={{ margin: '0 0 4px 0' }}>
          Actual: <strong>${chartData.actual.toLocaleString()}</strong>
        </div>
        <div className={varianceClass} style={{ margin: '8px 0 0 0', fontWeight: 'bold' }}>
          Variance: {chartData.variance > 0 ? '+' : ''}${chartData.variance.toLocaleString()}
        </div>
      </div>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  darkMode: PropTypes.bool,
};

export default function CostVarianceTrendGraph() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [data, setData] = useState([]);

  const darkMode = useSelector(state => state.theme.darkMode);
  const textColor = darkMode ? '#ffffff' : '#666';

  const [projectId, setProjectId] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(MOCK_DB);
      setInitialLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const allAvailableProjects = useMemo(() => [...new Set(data.map(d => d.projectId))], [data]);
  const allAvailableCategories = useMemo(() => [...new Set(data.map(d => d.category))], [data]);

  const chartData = useMemo(() => aggregateTrendData(data, projectId, categoryFilter, dateRange), [
    data,
    projectId,
    categoryFilter,
    dateRange,
  ]);

  const projectOptions = useMemo(
    () => [
      { label: 'ALL', value: 'ALL' },
      ...allAvailableProjects.map(proj => ({ label: proj, value: proj })),
    ],
    [allAvailableProjects],
  );

  const categoryOptions = useMemo(
    () => [
      { label: 'ALL', value: 'ALL' },
      ...allAvailableCategories.map(cat => ({ label: cat, value: cat })),
    ],
    [allAvailableCategories],
  );

  const selectStyles = useMemo(() => generateSelectStyles(darkMode), [darkMode]);

  const handleStartDateChange = date => setDateRange(prev => ({ ...prev, startDate: date }));
  const handleEndDateChange = date => setDateRange(prev => ({ ...prev, endDate: date }));

  if (initialLoading) {
    return (
      <div className={styles.varianceContainer}>
        <h4 className={styles.varianceTitle}>Cost Variance Trend</h4>
        <div className={styles.varianceLoading}>Loading trend data...</div>
      </div>
    );
  }

  return (
    <div className={`${styles.varianceContainer} ${darkMode ? styles.darkMode : ''}`}>
      <h4 className={styles.varianceTitle}>Cost Variance Trend</h4>

      <div className={styles.filtersGrid}>
        <div className={styles.filterGroup}>
          <div className={styles.filterLabel}>Project</div>
          <Select
            inputId="trend-project-filter"
            options={projectOptions}
            value={projectOptions.find(option => option.value === projectId)}
            onChange={selected => setProjectId(selected ? selected.value : 'ALL')}
            isClearable={false}
            classNamePrefix="select"
            styles={selectStyles}
          />
        </div>
        <div className={styles.filterGroup}>
          <div className={styles.filterLabel}>Category</div>
          <Select
            inputId="trend-category-filter"
            options={categoryOptions}
            value={categoryOptions.find(option => option.value === categoryFilter)}
            onChange={selected => setCategoryFilter(selected ? selected.value : 'ALL')}
            isClearable={false}
            classNamePrefix="select"
            styles={selectStyles}
          />
        </div>
        <div className={styles.filterGroup}>
          <div className={styles.filterLabel}>Date Range</div>
          <div className={styles.dateRangeFlex}>
            <div className={styles.datePickerWrapper}>
              <DatePicker
                selected={dateRange.startDate}
                onChange={handleStartDateChange}
                selectsStart
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                maxDate={dateRange.endDate || new Date()}
                placeholderText="Start Date"
                isClearable
                dateFormat="MM/dd/yyyy"
                aria-label="Start Date"
                className={`${styles.dateInput} ${darkMode ? styles.darkDateInput : ''}`}
                calendarClassName={darkMode ? 'paid-labor-cost-dark-calendar' : ''}
              />
            </div>
            <span className={styles.dateSeparator}>to</span>
            <div className={styles.datePickerWrapper}>
              <DatePicker
                selected={dateRange.endDate}
                onChange={handleEndDateChange}
                selectsEnd
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                minDate={dateRange.startDate}
                maxDate={new Date()}
                placeholderText="End Date"
                isClearable
                dateFormat="MM/dd/yyyy"
                aria-label="End Date"
                className={`${styles.dateInput} ${darkMode ? styles.darkDateInput : ''}`}
                calendarClassName={darkMode ? 'paid-labor-cost-dark-calendar' : ''}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.legendContainer}>
        <span className={styles.legendItem}>
          <span
            className={styles.legendDot}
            style={{ backgroundColor: darkMode ? '#ff4444' : '#e74c3c' }}
          />
          Over Budget Risk (+ Variance)
        </span>
        <span className={styles.legendItem}>
          <span
            className={styles.legendDot}
            style={{ backgroundColor: darkMode ? '#4ade80' : '#2ecc71' }}
          />
          Budget Savings (- Variance)
        </span>
      </div>

      <div className={styles.chartWrapper}>
        <div className={styles.chartContainer}>
          {chartData.length === 0 ? (
            <div className={styles.emptyState}>No data available for the selected filters.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                <XAxis
                  dataKey="date"
                  stroke={darkMode ? '#475569' : '#94a3b8'}
                  tick={{ fontSize: 11, fill: textColor }}
                  tickFormatter={val => moment(val).format('MMM DD')}
                />
                <YAxis
                  stroke={darkMode ? '#475569' : '#94a3b8'}
                  tick={{ fontSize: 11, fill: textColor }}
                  tickFormatter={value => `$${value}`}
                />
                <Tooltip
                  content={<CustomTooltip darkMode={darkMode} />}
                  cursor={{ fill: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                />
                <ReferenceLine y={0} stroke={darkMode ? '#64748b' : '#94a3b8'} />
                <Bar dataKey="variance" radius={[4, 4, 4, 4]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.variance > 0
                          ? darkMode
                            ? '#ff4444'
                            : '#e74c3c'
                          : darkMode
                          ? '#4ade80'
                          : '#2ecc71'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
