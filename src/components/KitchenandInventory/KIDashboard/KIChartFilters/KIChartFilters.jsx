import { useState } from 'react';
import PropTypes from 'prop-types';
import { FaRegCalendarAlt } from 'react-icons/fa';
// Shared by the Kitchen and Inventory dashboard charts
import styles from '../FoodCategoriesPieChart/FoodCategoriesPieChart.module.css';

export const KITCHENS = ['Kitchen 1', 'Kitchen 2', 'Kitchen 3'];

export const isDateRangeValid = ({ startDate, endDate }) =>
  !startDate || !endDate || startDate <= endDate;

// Filter state for a chart: one value per filter, a setter, Reset and whether
// everything is still at its default
export function useChartFilters(defaults) {
  const [filters, setFilters] = useState(defaults);
  const setFilter = (name, value) => setFilters(current => ({ ...current, [name]: value }));
  const reset = () => setFilters(defaults);
  const isDefault = Object.keys(defaults).every(key => filters[key] === defaults[key]);
  return { filters, setFilter, reset, isDefault };
}

const handleDateClick = e => {
  try {
    e.currentTarget.showPicker?.();
  } catch {
    // Some browsers do not support showPicker; the native input still works
  }
};

function SelectField({ label, value, options, onChange }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <select className={styles.control} value={value} onChange={e => onChange(e.target.value)}>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

const OPTIONS_TYPE = PropTypes.arrayOf(
  PropTypes.shape({ value: PropTypes.string.isRequired, label: PropTypes.string.isRequired }),
);

SelectField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  options: OPTIONS_TYPE.isRequired,
  onChange: PropTypes.func.isRequired,
};

function DateField({ label, value, min, max, onChange }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <div className={styles.dateWrapper}>
        <input
          className={`${styles.control} ${styles.dateInput}`}
          type="date"
          value={value}
          min={min}
          max={max}
          onClick={handleDateClick}
          onChange={e => onChange(e.target.value)}
        />
        <FaRegCalendarAlt className={styles.dateIcon} aria-hidden="true" />
      </div>
    </label>
  );
}

DateField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  min: PropTypes.string.isRequired,
  max: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

const KITCHEN_OPTIONS = ['All', ...KITCHENS].map(k => ({ value: k, label: k }));

// Metric (when the chart has one), Kitchen, From and To dates, Reset Filters,
// and an error when From is after To
export default function KIChartFilters({
  filters,
  onFilterChange,
  onReset,
  isDefault,
  dateMin,
  dateMax,
  metricOptions = null,
}) {
  const { metric, kitchen, startDate, endDate } = filters;

  return (
    <div className={styles.filters}>
      {metricOptions && (
        <SelectField
          label="Metric"
          value={metric}
          options={metricOptions}
          onChange={value => onFilterChange('metric', value)}
        />
      )}
      <SelectField
        label="Kitchen"
        value={kitchen}
        options={KITCHEN_OPTIONS}
        onChange={value => onFilterChange('kitchen', value)}
      />
      <DateField
        label="From"
        value={startDate}
        min={dateMin}
        max={endDate || dateMax}
        onChange={value => onFilterChange('startDate', value)}
      />
      <DateField
        label="To"
        value={endDate}
        min={startDate || dateMin}
        max={dateMax}
        onChange={value => onFilterChange('endDate', value)}
      />

      <div className={styles.buttonCell}>
        <button type="button" className={styles.resetBtn} onClick={onReset} disabled={isDefault}>
          Reset Filters
        </button>
      </div>

      {!isDateRangeValid(filters) && (
        <span className={styles.dateRangeError}>From date must be before or equal to To date.</span>
      )}
    </div>
  );
}

KIChartFilters.propTypes = {
  filters: PropTypes.shape({
    metric: PropTypes.string,
    kitchen: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  isDefault: PropTypes.bool.isRequired,
  dateMin: PropTypes.string.isRequired,
  dateMax: PropTypes.string.isRequired,
  metricOptions: OPTIONS_TYPE,
};

// Tooltip colors that follow the card's light or dark theme
export const CHART_TOOLTIP_STYLES = {
  contentStyle: {
    backgroundColor: 'var(--tooltip-bg)',
    color: 'var(--text-color)',
    border: '1px solid var(--border-color)',
  },
  itemStyle: { color: 'var(--text-color)' },
};

// The last 12 months up to this month, as 'YYYY-MM'
export const getRecentMonths = (today = new Date()) =>
  Array.from({ length: 12 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - 11 + i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

// The first and last day the date pickers allow for a list of 'YYYY-MM' months
export const getDateLimits = months => {
  const [year, month] = months
    .at(-1)
    .split('-')
    .map(Number);
  const lastDay = String(new Date(year, month, 0).getDate()).padStart(2, '0');
  return { dateMin: `${months[0]}-01`, dateMax: `${months.at(-1)}-${lastDay}` };
};
