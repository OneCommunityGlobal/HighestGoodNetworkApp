/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import httpService from '../../../../services/httpService';
import { ApiEndpoint } from '../../../../utils/URL';
import styles from './CancellationImpactOnVacancy.module.css';

const CHART_HEIGHT = 350;
const CANCELLATION_COLOR = '#ef4444';
const VACANCY_COLOR = '#3b82f6';

const TIME_UNIT_OPTIONS = [
  { value: 'week', label: 'Week' },
  { value: 'months', label: 'Months' },
  { value: 'last6months', label: 'Last 6 Months' },
  { value: 'year', label: 'Year' },
];

const CATEGORY_OPTIONS = [
  { value: 'village', label: 'By Village' },
  { value: 'property', label: 'By Property' },
];

// Generate X-axis labels based on time unit and date range
function getTimeAxisLabels(timeUnit, startDate, endDate) {
  const start = moment(startDate);
  const end = moment(endDate);
  const labels = [];

  if (timeUnit === 'week') {
    let current = start.clone();
    while (current.isSameOrBefore(end, 'day')) {
      labels.push(current.format('MMM D'));
      current.add(1, 'day');
    }
  } else if (timeUnit === 'months') {
    let current = start.clone().startOf('isoWeek');
    let weekNum = 1;
    while (current.isSameOrBefore(end)) {
      labels.push(`Week ${weekNum}`);
      weekNum += 1;
      current.add(1, 'week');
    }
  } else {
    let current = start.clone().startOf('month');
    while (current.isSameOrBefore(end, 'month')) {
      labels.push(current.format('MMM YYYY'));
      current.add(1, 'month');
    }
  }

  return labels;
}

// Generate mock chart data (WIP - replace with API when backend is ready)
function generateMockData(timeUnit, startDate, endDate) {
  const labels = getTimeAxisLabels(timeUnit, startDate, endDate);
  return labels.map((label, i) => ({
    time: label,
    cancellationRate: Math.round(5 + Math.sin(i * 0.5) * 8 + Math.random() * 5),
    vacancyRate: Math.round(15 + Math.cos(i * 0.3) * 10 + Math.random() * 8),
  }));
}

const customSelectStyles = darkMode => ({
  control: provided => ({
    ...provided,
    backgroundColor: darkMode ? '#1C2541' : '#fff',
    borderColor: darkMode ? '#225163' : '#ccc',
    color: darkMode ? '#fff' : '#333',
    minWidth: 160,
  }),
  menu: provided => ({
    ...provided,
    backgroundColor: darkMode ? '#1C2541' : '#fff',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? (darkMode ? '#3A506B' : '#f0f0f0') : 'transparent',
    color: darkMode ? '#fff' : '#333',
  }),
  multiValue: provided => ({
    ...provided,
    backgroundColor: darkMode ? '#3A506B' : '#e2e3fc',
  }),
  multiValueLabel: provided => ({
    ...provided,
    color: darkMode ? '#fff' : '#333',
  }),
  singleValue: provided => ({
    ...provided,
    color: darkMode ? '#fff' : '#333',
  }),
  input: provided => ({
    ...provided,
    color: darkMode ? '#fff' : '#333',
  }),
});

function CancellationImpactOnVacancy({ darkMode }) {
  const defaultStart = moment().subtract(6, 'months').toDate();
  const defaultEnd = moment().toDate();

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [timeUnit, setTimeUnit] = useState('last6months');
  const [category, setCategory] = useState('village');
  const [selectedVillages, setSelectedVillages] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [villageOptions, setVillageOptions] = useState([]);
  const [propertyOptions, setPropertyOptions] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await httpService.get(`${ApiEndpoint}/villages`);
        if (!mounted) return;
        const list = Array.isArray(res?.data) ? res.data : [];
        const opts = list.map(v => ({
          value: v.name || v.regionId || v._id,
          label: v.name || v.regionId || 'Unknown',
        }));
        setVillageOptions(opts);
      } catch {
        if (!mounted) return;
        setVillageOptions([
          { value: 'Village 1', label: 'Village 1' },
          { value: 'Village 2', label: 'Village 2' },
          { value: 'Village 3', label: 'Village 3' },
        ]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Mock property options (grouped by village for now)
  useEffect(() => {
    const props = [
      { value: 'Property A', label: 'Property A' },
      { value: 'Property B', label: 'Property B' },
      { value: 'Property C', label: 'Property C' },
      { value: 'Property D', label: 'Property D' },
    ];
    setPropertyOptions(props);
  }, []);

  const chartData = useMemo(() => {
    return generateMockData(timeUnit, startDate, endDate);
  }, [timeUnit, startDate, endDate]);

  const xAxisLabel = useMemo(() => {
    if (timeUnit === 'week') return 'Days';
    if (timeUnit === 'months') return 'Weeks';
    return 'Months';
  }, [timeUnit]);

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkContainer : ''}`}>
      <div className={styles.header}>
        <h3 className={`${styles.title} ${darkMode ? styles.darkTitle : ''}`}>
          Vacancy Rate and Cancellation Rate{' '}
          <span className={styles.wipTag}>(WIP Veda Charitha Bellam)</span>
        </h3>
        <p className={`${styles.subtitle} ${darkMode ? styles.darkSubtitle : ''}`}>
          Highlights whether cancellations drive empty nights and seasonal/pattern-based spikes. Guides price improvements.
        </p>
      </div>

      <div className={`${styles.filters} ${darkMode ? styles.darkFilters : ''}`}>
        <div className={styles.filterGroup}>
          <label className={`${styles.filterLabel} ${darkMode ? styles.darkFilterLabel : ''}`}>
            Dates
          </label>
          <div className={styles.dateRange}>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="MM/dd/yyyy"
              className={darkMode ? styles.datePickerDark : styles.datePicker}
            />
            <span className={styles.dateSeparator}>to</span>
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              dateFormat="MM/dd/yyyy"
              className={darkMode ? styles.datePickerDark : styles.datePicker}
            />
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label className={`${styles.filterLabel} ${darkMode ? styles.darkFilterLabel : ''}`}>
            Category
          </label>
          <select
            value={category}
            onChange={e => {
              setCategory(e.target.value);
              setSelectedVillages([]);
              setSelectedProperties([]);
            }}
            className={`${styles.select} ${darkMode ? styles.selectDark : ''}`}
          >
            {CATEGORY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={`${styles.filterLabel} ${darkMode ? styles.darkFilterLabel : ''}`}>
            {category === 'village' ? 'Villages' : 'Properties'}
          </label>
          {category === 'village' ? (
            <Select
              isMulti
              options={villageOptions}
              value={selectedVillages}
              onChange={setSelectedVillages}
              placeholder="Select villages"
              styles={customSelectStyles(darkMode)}
              className={styles.reactSelect}
            />
          ) : (
            <Select
              isMulti
              options={propertyOptions}
              value={selectedProperties}
              onChange={setSelectedProperties}
              placeholder="Select properties"
              styles={customSelectStyles(darkMode)}
              className={styles.reactSelect}
            />
          )}
        </div>

        <div className={styles.filterGroup}>
          <label className={`${styles.filterLabel} ${darkMode ? styles.darkFilterLabel : ''}`}>
            X-axis units
          </label>
          <select
            value={timeUnit}
            onChange={e => setTimeUnit(e.target.value)}
            className={`${styles.select} ${darkMode ? styles.selectDark : ''}`}
          >
            {TIME_UNIT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={`${styles.chartCard} ${darkMode ? styles.darkChartCard : ''}`}>
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#3a506b' : '#e5e7eb'} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12, fill: darkMode ? '#e1e1e1' : '#333' }}
              label={{
                value: xAxisLabel,
                position: 'insideBottom',
                offset: -5,
                fill: darkMode ? '#e1e1e1' : '#333',
              }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: darkMode ? '#e1e1e1' : '#333' }}
              label={{
                value: 'Rate',
                angle: -90,
                position: 'insideLeft',
                fill: darkMode ? '#e1e1e1' : '#333',
              }}
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? '#1c2541' : '#fff',
                border: `1px solid ${darkMode ? '#3a506b' : '#e5e7eb'}`,
                borderRadius: 8,
              }}
              labelStyle={{ color: darkMode ? '#fff' : '#333' }}
              formatter={(value, name) => [value, name]}
            />
            <Legend
              wrapperStyle={{ paddingBottom: 8 }}
              layout="horizontal"
              align="center"
              verticalAlign="top"
              iconType="square"
              iconSize={10}
            />
            <Bar
              dataKey="vacancyRate"
              name="Vacancy Rate"
              fill={VACANCY_COLOR}
              stackId="stack"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="cancellationRate"
              name="Cancellation Rate"
              fill={CANCELLATION_COLOR}
              stackId="stack"
              radius={[0, 0, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

CancellationImpactOnVacancy.propTypes = {
  darkMode: PropTypes.bool,
};

CancellationImpactOnVacancy.defaultProps = {
  darkMode: false,
};

export default CancellationImpactOnVacancy;
