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
import { ENDPOINTS } from '../../../../utils/URL';
import dashboardStyles from '../../LBDashboard.module.css';
import styles from './CancellationImpactOnVacancy.module.css';

const CHART_HEIGHT = 400;
const CANCELLATION_COLOR = '#ef4444';
const VACANCY_COLOR = '#eab308';

const TIME_UNIT_OPTIONS = [
  { value: 'week', label: 'Week', unit: 'day', axis: 'Days', format: 'MMM D' },
  { value: 'months', label: 'Months', unit: 'isoWeek', axis: 'Weeks', format: 'MMM D' },
  {
    value: 'last6months',
    label: 'Last 6 Months',
    unit: 'month',
    axis: 'Months',
    format: 'MMM YYYY',
  },
  { value: 'year', label: 'Year', unit: 'month', axis: 'Months', format: 'MMM YYYY' },
];

const CATEGORY_OPTIONS = [
  { value: 'village', label: 'By Village' },
  { value: 'property', label: 'By Property' },
];

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

// Deterministic values keep sample rates stable when the date range changes.
function unitNoise(seed, salt) {
  const n = hashString(`${salt}\0${seed}`);
  return (Math.imul(n, 2654435761) >>> 0) / 2 ** 32;
}

function getPresetStart(timeUnit, endDate) {
  const end = moment(endDate);
  if (timeUnit === 'week') return end.subtract(6, 'days').toDate();
  if (timeUnit === 'months')
    return end
      .subtract(1, 'month')
      .add(1, 'day')
      .toDate();
  return end
    .startOf('month')
    .subtract(timeUnit === 'year' ? 11 : 5, 'months')
    .toDate();
}

function generateSampleData({ unit, format }, startDate, endDate, category, selectedOptions) {
  const start = moment(startDate);
  const end = moment(endDate);
  if (!start.isValid() || !end.isValid() || end.isBefore(start, 'day')) return [];

  const groups = selectedOptions.length ? selectedOptions.map(option => option.value) : ['all'];
  const step = unit === 'isoWeek' ? 'week' : unit;
  const rows = [];
  const bucket = start.clone().startOf(unit);

  while (bucket.isSameOrBefore(end, 'day')) {
    const dateKey = bucket.format('YYYY-MM-DD');
    const rates = groups.reduce(
      (totals, group) => {
        const seed = `${category}|${group}|${unit}|${dateKey}`;
        return {
          cancellation: totals.cancellation + 5 + unitNoise(seed, 'c') * 20,
          vacancy: totals.vacancy + 12 + unitNoise(seed, 'v') * 30,
        };
      },
      { cancellation: 0, vacancy: 0 },
    );
    rows.push({
      time: moment.max(start, bucket).format(format),
      cancellationRate: Math.round(rates.cancellation / groups.length),
      vacancyRate: Math.round(rates.vacancy / groups.length),
    });
    bucket.add(1, step);
  }

  return rows;
}

async function fetchFilterOptions(category, signal) {
  const config = { signal, skipGlobalErrorToast: true };

  if (category === 'village') {
    const { data } = await httpService.get(ENDPOINTS.LB_VILLAGES, config);
    return data.map(village => ({ value: village._id, label: village.name }));
  }

  const options = [];
  let page = 1;
  let totalPages;
  do {
    // The listings endpoint uses page and size headers.
    // eslint-disable-next-line no-await-in-loop
    const { data } = await httpService.get(`${ENDPOINTS.LB_LISTINGS_BASE}/listings`, {
      ...config,
      headers: { page: String(page), size: '100' },
    });
    const { items, pagination } = data.data;
    options.push(...items.map(listing => ({ value: listing._id, label: listing.title })));
    totalPages = pagination.totalPages;
    page += 1;
  } while (page <= totalPages);
  return options;
}

const formatRate = value => `${value}%`;

const customSelectStyles = darkMode => ({
  control: provided => ({
    ...provided,
    backgroundColor: darkMode ? '#1C2541' : '#fff',
    borderColor: darkMode ? '#225163' : '#ccc',
    color: darkMode ? '#fff' : '#333',
  }),
  menu: provided => ({
    ...provided,
    backgroundColor: darkMode ? '#1C2541' : '#fff',
    zIndex: 2,
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
  placeholder: provided => ({
    ...provided,
    color: darkMode ? '#fff' : '#333',
  }),
  input: provided => ({
    ...provided,
    color: darkMode ? '#fff' : '#333',
  }),
});

function CancellationImpactOnVacancy({ darkMode = false }) {
  const [endDate, setEndDate] = useState(() => new Date());
  const [startDate, setStartDate] = useState(() => getPresetStart('last6months', endDate));
  const [timeUnit, setTimeUnit] = useState(TIME_UNIT_OPTIONS[2]);
  const [category, setCategory] = useState('village');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [filter, setFilter] = useState({ status: 'loading', options: [] });

  useEffect(() => {
    const controller = new AbortController();
    fetchFilterOptions(category, controller.signal).then(
      options => {
        if (!controller.signal.aborted) setFilter({ status: 'ready', options });
      },
      () => {
        if (!controller.signal.aborted) setFilter({ status: 'error', options: [] });
      },
    );
    return () => controller.abort();
  }, [category]);

  const chartData = useMemo(
    () => generateSampleData(timeUnit, startDate, endDate, category, selectedOptions),
    [timeUnit, startDate, endDate, category, selectedOptions],
  );
  const filterName = category === 'village' ? 'villages' : 'properties';
  const textColor = darkMode ? '#e1e1e1' : '#333';

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkContainer : ''}`}>
      <p className={styles.sampleNotice}>
        <strong>Sample data only.</strong> Live cancellation and vacancy rates are unavailable.
      </p>

      <div className={`${styles.filters} ${darkMode ? styles.darkFilters : ''}`}>
        <fieldset className={`${styles.filterGroup} ${styles.filterGroupFieldset}`}>
          <legend
            className={`${styles.filterLegend} ${styles.filterLabel} ${
              darkMode ? styles.darkFilterLabel : ''
            }`}
          >
            Dates
          </legend>
          <div className={styles.dateRange}>
            <label className="sr-only" htmlFor="cancellation-impact-start-date">
              Start date
            </label>
            <DatePicker
              id="cancellation-impact-start-date"
              selected={startDate}
              onChange={setStartDate}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={endDate}
              placeholderText="Start date"
              dateFormat="MM/dd/yyyy"
              className={darkMode ? styles.datePickerDark : styles.datePicker}
              calendarClassName={darkMode ? dashboardStyles.datePickerCalendarDark : undefined}
            />
            <span className={styles.dateSeparator}>to</span>
            <label className="sr-only" htmlFor="cancellation-impact-end-date">
              End date
            </label>
            <DatePicker
              id="cancellation-impact-end-date"
              selected={endDate}
              onChange={setEndDate}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="End date"
              dateFormat="MM/dd/yyyy"
              className={darkMode ? styles.datePickerDark : styles.datePicker}
              calendarClassName={darkMode ? dashboardStyles.datePickerCalendarDark : undefined}
            />
          </div>
        </fieldset>

        <div className={styles.filterGroup}>
          <label
            className={`${styles.filterLabel} ${darkMode ? styles.darkFilterLabel : ''}`}
            htmlFor="cancellation-impact-category"
          >
            Category
          </label>
          <select
            id="cancellation-impact-category"
            value={category}
            onChange={e => {
              setCategory(e.target.value);
              setSelectedOptions([]);
              setFilter({ status: 'loading', options: [] });
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
          <label
            className={`${styles.filterLabel} ${darkMode ? styles.darkFilterLabel : ''}`}
            htmlFor="cancellation-impact-entities"
          >
            {category === 'village' ? 'Villages' : 'Properties'}
          </label>
          <Select
            inputId="cancellation-impact-entities"
            isMulti
            isLoading={filter.status === 'loading'}
            isDisabled={filter.status !== 'ready' || !filter.options.length}
            options={filter.options}
            value={selectedOptions}
            onChange={setSelectedOptions}
            placeholder={`Select ${filterName}`}
            styles={customSelectStyles(darkMode)}
            className={styles.reactSelect}
          />
          {filter.status === 'loading' && <span role="status">Loading {filterName}…</span>}
          {filter.status === 'error' && <span role="alert">Could not load {filterName}.</span>}
          {filter.status === 'ready' && !filter.options.length && (
            <span role="status">No {filterName} found.</span>
          )}
        </div>

        <div className={styles.filterGroup}>
          <label
            className={`${styles.filterLabel} ${darkMode ? styles.darkFilterLabel : ''}`}
            htmlFor="cancellation-impact-time-unit"
          >
            Time range
          </label>
          <select
            id="cancellation-impact-time-unit"
            value={timeUnit.value}
            onChange={e => {
              const next = TIME_UNIT_OPTIONS.find(option => option.value === e.target.value);
              const end = endDate || new Date();
              setTimeUnit(next);
              setEndDate(end);
              setStartDate(getPresetStart(next.value, end));
            }}
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
        {chartData.length === 0 ? (
          <div className={styles.emptyChart} style={{ height: CHART_HEIGHT }} role="status">
            Choose a valid start and end date to view sample rates.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#3a506b' : '#e5e7eb'} />
              <XAxis
                dataKey="time"
                height={42}
                minTickGap={16}
                tick={{ fontSize: 12, fill: textColor }}
                label={{
                  value: timeUnit.axis,
                  position: 'insideBottom',
                  offset: 0,
                  fill: textColor,
                }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: textColor }}
                tickFormatter={formatRate}
                label={{
                  value: 'Rate (%)',
                  angle: -90,
                  position: 'insideLeft',
                  fill: textColor,
                }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1c2541' : '#fff',
                  border: `1px solid ${darkMode ? '#3a506b' : '#e5e7eb'}`,
                  borderRadius: 8,
                }}
                labelStyle={{ color: textColor }}
                itemStyle={{ color: textColor }}
                formatter={formatRate}
              />
              <Legend
                wrapperStyle={{ paddingBottom: 8 }}
                layout="horizontal"
                align="center"
                verticalAlign="top"
                iconType="square"
                iconSize={10}
                formatter={value => <span style={{ color: textColor }}>{value}</span>}
              />
              <Bar dataKey="vacancyRate" name="Vacancy Rate" fill={VACANCY_COLOR} maxBarSize={36} />
              <Bar
                dataKey="cancellationRate"
                name="Cancellation Rate"
                fill={CANCELLATION_COLOR}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

CancellationImpactOnVacancy.propTypes = {
  darkMode: PropTypes.bool,
};

export default CancellationImpactOnVacancy;
