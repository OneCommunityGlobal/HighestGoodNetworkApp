import PropTypes from 'prop-types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
// The Food Categories and Food Sources charts share this card, its filters and its legend
import styles from '../FoodCategoriesPieChart/FoodCategoriesPieChart.module.css';

export const KITCHENS = ['Kitchen 1', 'Kitchen 2', 'Kitchen 3'];

const RADIAN = Math.PI / 180;

// Shows the slice's whole percentage from the data, so the labels match the legend;
// slices under 3% are too small for a label
const renderSliceLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, payload }) => {
  if (payload.percent < 3) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill={payload.labelColor}
      textAnchor="middle"
      dominantBaseline="central"
      fontWeight={700}
      fontSize={16}
    >
      {`${payload.percent}%`}
    </text>
  );
};

// 'YYYY-MM' to a short label like 'Nov 2026'
export const formatMonth = month => {
  const [year, m] = month.split('-').map(Number);
  return new Date(year, m - 1, 1).toLocaleString('en-US', { month: 'short', year: 'numeric' });
};

// The chart data is monthly, so the range is picked by whole months
function MonthField({ label, value, months, onChange }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <select className={styles.control} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">All</option>
        {months.map(month => (
          <option key={month} value={month}>
            {formatMonth(month)}
          </option>
        ))}
      </select>
    </label>
  );
}

MonthField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  months: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default function KIPieChartCard({
  title,
  darkMode = false,
  chartData,
  formatTooltip,
  extraFilters = null,
  kitchen,
  onKitchenChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  months,
  onReset,
  isDefaultFilters,
}) {
  const isDateRangeValid = !startDate || !endDate || startDate <= endDate;

  return (
    <div className={[styles.container, darkMode ? styles.darkMode : ''].join(' ')}>
      <div className={styles.filters}>
        {extraFilters}

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Kitchen</span>
          <select
            className={styles.control}
            value={kitchen}
            onChange={e => onKitchenChange(e.target.value)}
          >
            <option value="All">All</option>
            {KITCHENS.map(k => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>

        <MonthField label="From" value={startDate} months={months} onChange={onStartDateChange} />
        <MonthField label="To" value={endDate} months={months} onChange={onEndDateChange} />

        <div className={styles.buttonCell}>
          <button
            type="button"
            className={styles.resetBtn}
            onClick={onReset}
            disabled={isDefaultFilters}
          >
            Reset Filters
          </button>
        </div>

        {!isDateRangeValid && (
          <span className={styles.dateRangeError}>
            From month must be before or equal to To month.
          </span>
        )}
      </div>

      <h2 className={styles.chartTitle}>{title}</h2>

      <div className={styles.chartWrapper}>
        {!isDateRangeValid || chartData.length === 0 ? (
          <div className={styles.noDataMessage}>No data available for the selected filters.</div>
        ) : (
          <>
            <div className={styles.pieBox}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="90%"
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={1}
                    stroke={darkMode ? '#0f1522' : '#ffffff'}
                    strokeWidth={3}
                    label={renderSliceLabel}
                    labelLine={false}
                    isAnimationActive={false}
                  >
                    {chartData.map(entry => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, item) => [formatTooltip(value, item.payload), name]}
                    contentStyle={{
                      backgroundColor: 'var(--tooltip-bg)',
                      color: 'var(--text-color)',
                      border: '1px solid var(--border-color)',
                    }}
                    itemStyle={{ color: 'var(--text-color)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.legend}>
              {chartData.map(item => (
                <span key={item.name} className={styles.legendItem}>
                  <span
                    className={styles.legendSwatch}
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span>{`${item.name} (${item.percent}%)`}</span>
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

KIPieChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
  chartData: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      percent: PropTypes.number.isRequired,
      color: PropTypes.string.isRequired,
      labelColor: PropTypes.string.isRequired,
    }),
  ).isRequired,
  formatTooltip: PropTypes.func.isRequired,
  extraFilters: PropTypes.node,
  kitchen: PropTypes.string.isRequired,
  onKitchenChange: PropTypes.func.isRequired,
  startDate: PropTypes.string.isRequired,
  onStartDateChange: PropTypes.func.isRequired,
  endDate: PropTypes.string.isRequired,
  onEndDateChange: PropTypes.func.isRequired,
  months: PropTypes.arrayOf(PropTypes.string).isRequired,
  onReset: PropTypes.func.isRequired,
  isDefaultFilters: PropTypes.bool.isRequired,
};
