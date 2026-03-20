import { useMemo, useState } from 'react';
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
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './ReviewVolumeOverTimeChart.module.css';

const POSITIVE_COLOR = '#22c55e';
const NEUTRAL_COLOR = '#9ca3af';
const NEGATIVE_COLOR = '#ef4444';

const DATE_OPTIONS = [
  { value: 'all', label: 'All dates' },
  { value: 'last6', label: 'Last 6 months' },
  { value: 'custom', label: 'Custom range' },
];

const CATEGORY_OPTIONS = [
  { value: 'village', label: 'By Village' },
  { value: 'property', label: 'By Property' },
];

const VILLAGE_OPTIONS = [
  { value: 'Eco Village', label: 'Eco Village' },
  { value: 'Forest Retreat', label: 'Forest Retreat' },
  { value: 'Desert Oasis', label: 'Desert Oasis' },
  { value: 'River Valley', label: 'River Valley' },
  { value: 'City Sanctuary', label: 'City Sanctuary' },
];

const PROPERTY_OPTIONS = [
  { value: 'Mountain View', label: 'Mountain View' },
  { value: 'Solar Haven', label: 'Solar Haven' },
  { value: 'Lakeside Cottage', label: 'Lakeside Cottage' },
  { value: 'Woodland Cabin', label: 'Woodland Cabin' },
  { value: 'Tiny Home', label: 'Tiny Home' },
  { value: 'Earth Ship', label: 'Earth Ship' },
  { value: 'Riverside Cabin', label: 'Riverside Cabin' },
  { value: 'Floating House', label: 'Floating House' },
  { value: 'Urban Garden Apartment', label: 'Urban Garden Apartment' },
  { value: 'Eco Loft', label: 'Eco Loft' },
];

const RAW_REVIEWS = [
  {
    monthKey: '2023-04',
    monthLabel: 'Apr 2023',
    category: 'village',
    village: 'Eco Village',
    property: null,
    positive: 28,
    neutral: 10,
    negative: 6,
  },
  {
    monthKey: '2023-04',
    monthLabel: 'Apr 2023',
    category: 'village',
    village: 'Forest Retreat',
    property: null,
    positive: 18,
    neutral: 9,
    negative: 4,
  },
  {
    monthKey: '2023-06',
    monthLabel: 'Jun 2023',
    category: 'village',
    village: 'Eco Village',
    property: null,
    positive: 32,
    neutral: 11,
    negative: 7,
  },
  {
    monthKey: '2023-06',
    monthLabel: 'Jun 2023',
    category: 'village',
    village: 'Desert Oasis',
    property: null,
    positive: 24,
    neutral: 8,
    negative: 5,
  },
  {
    monthKey: '2023-09',
    monthLabel: 'Sep 2023',
    category: 'village',
    village: 'River Valley',
    property: null,
    positive: 30,
    neutral: 15,
    negative: 8,
  },
  {
    monthKey: '2023-10',
    monthLabel: 'Oct 2023',
    category: 'village',
    village: 'City Sanctuary',
    property: null,
    positive: 34,
    neutral: 17,
    negative: 6,
  },
  {
    monthKey: '2023-11',
    monthLabel: 'Nov 2023',
    category: 'village',
    village: 'Eco Village',
    property: null,
    positive: 36,
    neutral: 14,
    negative: 7,
  },
  {
    monthKey: '2023-12',
    monthLabel: 'Dec 2023',
    category: 'village',
    village: 'Forest Retreat',
    property: null,
    positive: 33,
    neutral: 16,
    negative: 6,
  },
  {
    monthKey: '2024-01',
    monthLabel: 'Jan 2024',
    category: 'village',
    village: 'Desert Oasis',
    property: null,
    positive: 29,
    neutral: 13,
    negative: 6,
  },
  {
    monthKey: '2024-02',
    monthLabel: 'Feb 2024',
    category: 'village',
    village: 'River Valley',
    property: null,
    positive: 26,
    neutral: 12,
    negative: 7,
  },
  // Property-level entries
  {
    monthKey: '2023-10',
    monthLabel: 'Oct 2023',
    category: 'property',
    village: 'Eco Village',
    property: 'Mountain View',
    positive: 20,
    neutral: 8,
    negative: 4,
  },
  {
    monthKey: '2023-10',
    monthLabel: 'Oct 2023',
    category: 'property',
    village: 'Eco Village',
    property: 'Solar Haven',
    positive: 16,
    neutral: 6,
    negative: 3,
  },
  {
    monthKey: '2023-12',
    monthLabel: 'Dec 2023',
    category: 'property',
    village: 'Forest Retreat',
    property: 'Lakeside Cottage',
    positive: 18,
    neutral: 7,
    negative: 3,
  },
  {
    monthKey: '2023-12',
    monthLabel: 'Dec 2023',
    category: 'property',
    village: 'Forest Retreat',
    property: 'Woodland Cabin',
    positive: 14,
    neutral: 5,
    negative: 3,
  },
  {
    monthKey: '2024-01',
    monthLabel: 'Jan 2024',
    category: 'property',
    village: 'Desert Oasis',
    property: 'Tiny Home',
    positive: 19,
    neutral: 6,
    negative: 4,
  },
  {
    monthKey: '2024-01',
    monthLabel: 'Jan 2024',
    category: 'property',
    village: 'Desert Oasis',
    property: 'Earth Ship',
    positive: 15,
    neutral: 7,
    negative: 3,
  },
  {
    monthKey: '2024-02',
    monthLabel: 'Feb 2024',
    category: 'property',
    village: 'City Sanctuary',
    property: 'Urban Garden Apartment',
    positive: 21,
    neutral: 8,
    negative: 4,
  },
  {
    monthKey: '2024-02',
    monthLabel: 'Feb 2024',
    category: 'property',
    village: 'City Sanctuary',
    property: 'Eco Loft',
    positive: 14,
    neutral: 6,
    negative: 3,
  },
];

const ALL_MONTH_KEYS = Array.from(new Set(RAW_REVIEWS.map(r => r.monthKey))).sort((a, b) =>
  a.localeCompare(b),
);

function toMonthKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function filterByDateRange(records, dateFilter, fromDate, toDate) {
  if (dateFilter === 'custom' && fromDate && toDate && fromDate > toDate) {
    return [];
  }

  if (dateFilter === 'last6') {
    const last6 = ALL_MONTH_KEYS.slice(-6);
    const allowed = new Set(last6);
    return records.filter(r => allowed.has(r.monthKey));
  }

  if (dateFilter === 'custom' && (fromDate || toDate)) {
    const fromMonthKey = fromDate ? toMonthKey(fromDate) : null;
    const toMonthKeyValue = toDate ? toMonthKey(toDate) : null;

    return records.filter(r => {
      if (fromMonthKey && r.monthKey < fromMonthKey) {
        return false;
      }

      if (toMonthKeyValue && r.monthKey > toMonthKeyValue) {
        return false;
      }

      return true;
    });
  }

  return records;
}

function aggregateData({ category, dateFilter, fromDate, toDate, villages, properties }) {
  let filtered = RAW_REVIEWS.filter(r => r.category === category);

  if (villages.length && category === 'village') {
    const allowed = new Set(villages.map(v => v.value));
    filtered = filtered.filter(r => allowed.has(r.village));
  }

  if (properties.length && category === 'property') {
    const allowed = new Set(properties.map(p => p.value));
    filtered = filtered.filter(r => allowed.has(r.property));
  }

  filtered = filterByDateRange(filtered, dateFilter, fromDate, toDate);

  const byMonth = new Map();
  filtered.forEach(r => {
    const existing = byMonth.get(r.monthKey) || {
      monthKey: r.monthKey,
      monthLabel: r.monthLabel,
      positive: 0,
      neutral: 0,
      negative: 0,
    };
    existing.positive += r.positive;
    existing.neutral += r.neutral;
    existing.negative += r.negative;
    byMonth.set(r.monthKey, existing);
  });

  const result = Array.from(byMonth.values()).sort((a, b) => (a.monthKey < b.monthKey ? -1 : 1));
  return result;
}

function ReviewVolumeOverTimeChart({ darkMode }) {
  const [dateFilter, setDateFilter] = useState('all');
  const [customFrom, setCustomFrom] = useState(null); // Date | null
  const [customTo, setCustomTo] = useState(null); // Date | null
  const [category, setCategory] = useState('village');
  const [selectedVillages, setSelectedVillages] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]);

  const chartData = useMemo(
    () =>
      aggregateData({
        category,
        dateFilter,
        fromDate: customFrom,
        toDate: customTo,
        villages: selectedVillages,
        properties: selectedProperties,
      }),
    [category, dateFilter, customFrom, customTo, selectedVillages, selectedProperties],
  );

  const handleCategoryChange = option => {
    setCategory(option.value);
    setSelectedVillages([]);
    setSelectedProperties([]);
  };

  const handleDateFilterChange = e => {
    const value = e.target.value;
    setDateFilter(value);
    if (value !== 'custom') {
      setCustomFrom(null);
      setCustomTo(null);
    }
  };

  const handleFromMonthChange = date => {
    setCustomFrom(date);
    if (date && customTo && date > customTo) {
      setCustomTo(date);
    }
  };

  const handleToMonthChange = date => {
    setCustomTo(date);
    if (date && customFrom && date < customFrom) {
      setCustomFrom(date);
    }
  };

  const containerClass = `${styles.chartContainer} ${darkMode ? styles.dark : ''}`;
  const filtersClass = `${styles.filters} ${darkMode ? styles.darkFilters : ''}`;
  const dateSelectClass = `${styles.dateSelect} ${darkMode ? styles.darkDateSelect : ''}`;

  const selectStyles = useMemo(
    () => ({
      control: (provided, state) => {
        const isDark = darkMode;
        const baseStyles = {
          ...provided,
          backgroundColor: isDark ? '#020617' : '#ffffff',
          borderColor: isDark ? '#374151' : '#d1d5db',
          color: isDark ? '#e5e7eb' : '#111827',
          minHeight: 36,
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            borderColor: isDark ? '#6b7280' : '#9ca3af',
          },
        };

        if (!state.isFocused) {
          return baseStyles;
        }

        return {
          ...baseStyles,
          borderColor: isDark ? '#3b82f6' : '#2563eb',
          boxShadow: '0 0 0 1px rgba(37,99,235,0.6)',
        };
      },
      menu: provided => {
        const isDark = darkMode;
        const backgroundColor = isDark ? '#020617' : '#ffffff';
        const borderColor = isDark ? '#374151' : '#e5e7eb';

        return {
          ...provided,
          backgroundColor,
          borderColor,
        };
      },
      container: provided => ({
        ...provided,
        width: '100%',
        backgroundColor: 'transparent',
      }),
      option: (provided, state) => {
        const isFocused = state.isFocused;
        const isDark = darkMode;
        const backgroundColor = isFocused
          ? isDark
            ? '#111827'
            : '#e5e7eb'
          : isDark
          ? '#020617'
          : '#ffffff';

        return {
          ...provided,
          backgroundColor,
          color: isDark ? '#e5e7eb' : '#111827',
        };
      },
      singleValue: provided => ({
        ...provided,
        color: darkMode ? '#e5e7eb' : '#111827',
      }),
      multiValue: provided => ({
        ...provided,
        backgroundColor: darkMode ? '#111827' : '#e5e7eb',
      }),
      multiValueLabel: provided => ({
        ...provided,
        color: darkMode ? '#e5e7eb' : '#111827',
      }),
      input: provided => ({
        ...provided,
        color: darkMode ? '#e5e7eb' : '#111827',
      }),
      placeholder: provided => ({
        ...provided,
        color: darkMode ? '#6b7280' : '#9ca3af',
      }),
    }),
    [darkMode],
  );

  return (
    <div className={containerClass}>
      <div className={styles.header}>
        <h2 className={styles.title}>Review Volume Over Time</h2>
        <div className={styles.legendDots}>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.legendPositive}`} />
            <span>Positive</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.legendNeutral}`} />
            <span>Neutral</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.legendNegative}`} />
            <span>Negative</span>
          </div>
        </div>
      </div>

      <div className={filtersClass}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="dateFilter">
            Dates
          </label>
          <select
            id="dateFilter"
            className={dateSelectClass}
            value={dateFilter}
            onChange={handleDateFilterChange}
          >
            {DATE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {dateFilter === 'custom' && (
          <>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel} htmlFor="fromMonth">
                From
              </label>
              <DatePicker
                id="fromMonth"
                selected={customFrom}
                onChange={handleFromMonthChange}
                dateFormat="MMM yyyy"
                showMonthYearPicker
                className={dateSelectClass}
                calendarClassName={darkMode ? styles.darkMonthCalendar : styles.monthCalendar}
                popperClassName={styles.datePickerPopper}
                placeholderText="Select month"
                maxDate={customTo || undefined}
              />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel} htmlFor="toMonth">
                To
              </label>
              <DatePicker
                id="toMonth"
                selected={customTo}
                onChange={handleToMonthChange}
                dateFormat="MMM yyyy"
                showMonthYearPicker
                className={dateSelectClass}
                calendarClassName={darkMode ? styles.darkMonthCalendar : styles.monthCalendar}
                popperClassName={styles.datePickerPopper}
                placeholderText="Select month"
                minDate={customFrom || undefined}
              />
            </div>
          </>
        )}

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="categorySelect">
            Category
          </label>
          <Select
            inputId="categorySelect"
            value={CATEGORY_OPTIONS.find(opt => opt.value === category)}
            onChange={handleCategoryChange}
            options={CATEGORY_OPTIONS}
            className={styles.select}
            styles={selectStyles}
            isSearchable={false}
          />
        </div>

        {category === 'village' && (
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="villageSelect">
              Villages
            </label>
            <Select
              inputId="villageSelect"
              isMulti
              options={VILLAGE_OPTIONS}
              value={selectedVillages}
              onChange={setSelectedVillages}
              className={styles.select}
              styles={selectStyles}
              placeholder="All villages"
            />
          </div>
        )}

        {category === 'property' && (
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="propertySelect">
              Properties
            </label>
            <Select
              inputId="propertySelect"
              isMulti
              options={PROPERTY_OPTIONS}
              value={selectedProperties}
              onChange={setSelectedProperties}
              className={styles.select}
              styles={selectStyles}
              placeholder="All properties"
            />
          </div>
        )}
      </div>

      {chartData.length === 0 ? (
        <div className={styles.emptyState}>No review activity for the selected filters.</div>
      ) : (
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              style={{ backgroundColor: darkMode ? '#020617' : '#ffffff' }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="monthLabel" />
              <YAxis allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#020617' : '#ffffff',
                  borderColor: darkMode ? '#4b5563' : '#e5e7eb',
                  color: darkMode ? '#e5e7eb' : '#111827',
                }}
                itemStyle={{
                  color: darkMode ? '#e5e7eb' : '#111827',
                }}
                cursor={{ fill: darkMode ? 'rgba(148,163,184,0.25)' : 'rgba(148,163,184,0.15)' }}
              />
              <Legend />
              <Bar dataKey="negative" stackId="volume" fill={NEGATIVE_COLOR} name="Negative" />
              <Bar dataKey="neutral" stackId="volume" fill={NEUTRAL_COLOR} name="Neutral" />
              <Bar dataKey="positive" stackId="volume" fill={POSITIVE_COLOR} name="Positive" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

ReviewVolumeOverTimeChart.propTypes = {
  darkMode: PropTypes.bool,
};

ReviewVolumeOverTimeChart.defaultProps = {
  darkMode: false,
};

export default ReviewVolumeOverTimeChart;
