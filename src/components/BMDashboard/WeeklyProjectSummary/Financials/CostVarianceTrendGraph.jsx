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
import axios from 'axios';
import { ENDPOINTS } from '../../../../utils/URL';
import styles from './CostVarianceTrendGraph.module.css';

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
      // planned stays null until a real (non-null) plannedCost entry is seen, so a
      // date with no real budget data doesn't silently display as "$0 planned".
      groupedByDate[key] = { date: key, planned: null, actual: 0 };
    }
    if (entry.plannedCost !== null && entry.plannedCost !== undefined) {
      groupedByDate[key].planned = (groupedByDate[key].planned || 0) + entry.plannedCost;
    }
    groupedByDate[key].actual += entry.actualCost;
  });

  return Object.values(groupedByDate)
    .map(item => ({
      ...item,
      variance: item.planned === null ? null : item.actual - item.planned,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

const getVarianceText = variance => {
  if (variance === null) return 'Variance: no planned budget data available';
  const sign = variance > 0 ? '+' : '';
  return `Variance: ${sign}$${variance.toLocaleString()}`;
};

const getOptionBackgroundColor = (darkMode, isSelected, isFocused) => {
  if (isSelected && darkMode) return '#e8a71c';
  if (isSelected && !darkMode) return '#0d55b3';
  if (isFocused && darkMode) return '#3a506b';
  if (isFocused && !darkMode) return '#f0f0f0';
  return darkMode ? '#253342' : '#fff';
};

const getOptionColor = (darkMode, isSelected) => {
  if (isSelected) return darkMode ? '#000' : '#fff';
  return darkMode ? '#ffffff' : '#000';
};

const generateSelectStyles = darkMode => {
  const bgMain = darkMode ? '#253342' : '#fff';
  const borderMain = darkMode ? '#2d4059' : '#ccc';
  const textMain = darkMode ? '#ffffff' : '#000';
  const textMuted = darkMode ? '#94a3b8' : '#999';

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
      backgroundColor: getOptionBackgroundColor(darkMode, state.isSelected, state.isFocused),
      color: getOptionColor(darkMode, state.isSelected),
      cursor: 'pointer',
      padding: '8px 12px',
      fontSize: '13px',
      ':active': { backgroundColor: darkMode ? '#3a506b' : '#e0e0e0' },
    }),
  };
};

const CustomTooltip = ({ active, payload, label, darkMode }) => {
  if (!active || !payload?.length) return null;

  const chartData = payload[0].payload;
  const isOverBudget = chartData.variance > 0;

  let varianceClass = '';
  if (isOverBudget) {
    varianceClass = darkMode ? styles.varianceOverDark : styles.varianceOverLight;
  } else {
    varianceClass = darkMode ? styles.varianceUnderDark : styles.varianceUnderLight;
  }

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
        Planned:{' '}
        <strong>
          {chartData.planned === null ? 'N/A' : `$${chartData.planned.toLocaleString()}`}
        </strong>
      </div>
      <div style={{ margin: '0 0 4px 0' }}>
        Actual: <strong>${chartData.actual.toLocaleString()}</strong>
      </div>
      <div className={varianceClass} style={{ margin: '8px 0 0 0', fontWeight: 'bold' }}>
        {getVarianceText(chartData.variance)}
      </div>
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  darkMode: PropTypes.bool,
};

// Was 'MMM DD' with no year at all — the reported bug ("May 02 - May 26" with no
// indication of which year), since this chart now spans real multi-year data.
const formatTickDate = val => moment(val).format('MMM DD, YYYY');
const formatTickValue = value => `$${value}`;

const buildDropdownOptions = (data, key) => {
  const uniqueValues = [...new Set(data.map(item => item[key]))];
  return [{ label: 'ALL', value: 'ALL' }, ...uniqueValues.map(val => ({ label: val, value: val }))];
};

const getSelectedOption = (options, value) => options.find(option => option.value === value);

const getCellColor = (variance, darkMode) => {
  if (variance === null) return darkMode ? '#64748b' : '#94a3b8';
  if (variance > 0) return darkMode ? '#ff4444' : '#e74c3c';
  return darkMode ? '#4ade80' : '#2ecc71';
};

const ChartBody = ({ chartData, darkMode, textColor, tooltipCursorFill }) => {
  if (chartData.length === 0) {
    return <div className={styles.emptyState}>No data available for the selected filters.</div>;
  }
  if (chartData.every(entry => entry.variance === null)) {
    return (
      <div className={styles.emptyState}>
        No planned budget data has been recorded yet, so variance can&apos;t be calculated. Actual
        costs are being tracked — variance will appear once planned costs are added.
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
        <XAxis
          dataKey="date"
          stroke={darkMode ? '#475569' : '#94a3b8'}
          tick={{ fontSize: 11, fill: textColor }}
          tickFormatter={formatTickDate}
        />
        <YAxis
          stroke={darkMode ? '#475569' : '#94a3b8'}
          tick={{ fontSize: 11, fill: textColor }}
          tickFormatter={formatTickValue}
        />
        <Tooltip
          content={<CustomTooltip darkMode={darkMode} />}
          cursor={{ fill: tooltipCursorFill }}
        />
        <ReferenceLine y={0} stroke={darkMode ? '#64748b' : '#94a3b8'} />
        <Bar dataKey="variance" radius={[4, 4, 4, 4]}>
          {chartData.map(entry => (
            <Cell key={`cell-${entry.date}`} fill={getCellColor(entry.variance, darkMode)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

ChartBody.propTypes = {
  chartData: PropTypes.arrayOf(
    PropTypes.shape({ date: PropTypes.string, variance: PropTypes.number }),
  ).isRequired,
  darkMode: PropTypes.bool.isRequired,
  textColor: PropTypes.string.isRequired,
  tooltipCursorFill: PropTypes.string.isRequired,
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
    let cancelled = false;
    axios
      .get(ENDPOINTS.BM_PROJECT_COST_ENTRIES())
      .then(({ data: entries }) => {
        if (!cancelled) setData(entries);
      })
      .catch(() => {
        if (!cancelled) setData([]);
      })
      .finally(() => {
        if (!cancelled) setInitialLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = useMemo(() => aggregateTrendData(data, projectId, categoryFilter, dateRange), [
    data,
    projectId,
    categoryFilter,
    dateRange,
  ]);

  const projectOptions = useMemo(() => buildDropdownOptions(data, 'projectId'), [data]);
  const categoryOptions = useMemo(() => buildDropdownOptions(data, 'category'), [data]);

  const selectStyles = useMemo(() => generateSelectStyles(darkMode), [darkMode]);

  const handleStartDateChange = date => setDateRange(prev => ({ ...prev, startDate: date }));
  const handleEndDateChange = date => setDateRange(prev => ({ ...prev, endDate: date }));

  const handleProjectChange = selected => setProjectId(selected ? selected.value : 'ALL');
  const handleCategoryChange = selected => setCategoryFilter(selected ? selected.value : 'ALL');

  const selectedProject = getSelectedOption(projectOptions, projectId);
  const selectedCategory = getSelectedOption(categoryOptions, categoryFilter);

  const containerClass = `${styles.varianceContainer} ${darkMode ? styles.darkMode : ''}`;
  const dateInputClass = `${styles.dateInput} ${darkMode ? styles.darkDateInput : ''}`;
  const calendarClass = darkMode ? 'paid-labor-cost-dark-calendar' : '';
  const tooltipCursorFill = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  if (initialLoading) {
    return (
      <div className={styles.varianceContainer}>
        <h4 className={styles.varianceTitle}>Cost Variance Trend</h4>
        <div className={styles.varianceLoading}>Loading trend data...</div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <h4 className={styles.varianceTitle}>Cost Variance Trend</h4>

      <div className={styles.filtersGrid}>
        <div className={styles.filterGroup}>
          <div className={styles.filterLabel}>Project</div>
          <Select
            inputId="trend-project-filter"
            options={projectOptions}
            value={selectedProject}
            onChange={handleProjectChange}
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
            value={selectedCategory}
            onChange={handleCategoryChange}
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
                className={dateInputClass}
                calendarClassName={calendarClass}
              />
            </div>
            <span className={styles.dateSeparator}> to </span>
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
                className={dateInputClass}
                calendarClassName={calendarClass}
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
          <span>Over Budget Risk (+ Variance)</span>
        </span>
        <span className={styles.legendItem}>
          <span
            className={styles.legendDot}
            style={{ backgroundColor: darkMode ? '#4ade80' : '#2ecc71' }}
          />
          <span>Budget Savings (- Variance)</span>
        </span>
      </div>

      <div className={styles.chartWrapper}>
        <div className={styles.chartContainer}>
          <ChartBody
            chartData={chartData}
            darkMode={darkMode}
            textColor={textColor}
            tooltipCursorFill={tooltipCursorFill}
          />
        </div>
      </div>
    </div>
  );
}
