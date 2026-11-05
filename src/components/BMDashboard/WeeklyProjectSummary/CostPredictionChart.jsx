import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import styles from './CostPredictionChart.module.css';
import { getProjectCosts } from '../../../services/projectCostTrackingService';

const THEME = {
  light: {
    pageBg: '#ffffff',
    cardBg: '#f9fafb',
    itemBg: '#f3f4f6',
    border: '#d1d5db',
    text: '#111827',
    mutedText: '#374151',
    axisText: '#9ca3af',
    accent: '#2563eb',
  },
  dark: {
    pageBg: '#1B2A41', // Oxford blue
    cardBg: '#1C2541', // space cadet
    itemBg: '#3A506B', // yinmn blue
    border: '#3A506B',
    text: '#f3f4f6',
    mutedText: '#d1d5db',
    axisText: '#c7ccd6',
    accent: '#6FFFE9',
  },
};

function getTheme(darkMode) {
  return darkMode ? THEME.dark : THEME.light;
}

const SERIES_COLORS = {
  actual: '#8884d8',
  predicted: '#ff7300',
};

const DEFAULT_WINDOW_MONTHS = 6;
const TODAY_STR = new Date().toISOString().slice(0, 10);

function toMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleString('default', {
    month: 'short',
    year: '2-digit',
  });
}

function renderDotTopOrBottom(lineKey, color, dataLength) {
  return function CustomDot(props) {
    const { cx, cy, value, payload, index } = props;
    if (value == null) return null;

    const isFirst = index === 0;
    const isLast = dataLength != null && index === dataLength - 1;
    if (!isFirst && !isLast) return null;

    const actual = payload.actualCost;
    const predicted = payload.predictedCost;
    const values = [actual, predicted].filter(v => v != null);
    if (values.length === 0) return null;

    const max = Math.max(...values);
    const dx = isFirst ? 32 : -18;
    const textAnchor = isLast ? 'end' : 'middle';

    const y = value === max ? cy - 20 : cy + 18;

    return (
      <text
        x={cx + dx}
        y={y}
        fill={color}
        fontSize={14}
        fontWeight="bold"
        textAnchor={textAnchor}
        alignmentBaseline="middle"
      >
        {value}
      </text>
    );
  };
}

// Custom label for the "Current Month" reference line. Rendered near the bottom
// of the line and right-aligned to its left, so it stays in the empty lower area
// and never overlaps the data value labels (which sit near the top on the right).
function CurrentMonthLabel({ viewBox }) {
  if (!viewBox) return null;
  const { x, y, height } = viewBox;
  return (
    <text
      x={x - 6}
      y={y + height - 8}
      fill="#fc07cf"
      fontSize={12}
      fontWeight="bold"
      textAnchor="end"
    >
      Current Month
    </text>
  );
}

CurrentMonthLabel.propTypes = {
  viewBox: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    height: PropTypes.number,
  }),
};

CurrentMonthLabel.defaultProps = {
  viewBox: null,
};

// custom tooltip
function TooltipSwatch({ color }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: color,
        marginRight: 6,
      }}
    />
  );
}

TooltipSwatch.propTypes = {
  color: PropTypes.string.isRequired,
};

function CustomTooltip({ active, payload, label, theme }) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload;
  const variance =
    point.actualCost != null && point.predictedCost != null
      ? point.actualCost - point.predictedCost
      : null;

  return (
    <div
      style={{
        background: theme.cardBg,
        border: `1px solid ${theme.border}`,
        borderRadius: 6,
        padding: '10px 14px',
        fontSize: 13,
        color: theme.text,
      }}
    >
      <p style={{ margin: 0, fontWeight: 'bold', marginBottom: 6 }}>{label}</p>
      <p
        style={{
          margin: '2px 0',
          color: SERIES_COLORS.actual,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <TooltipSwatch color={SERIES_COLORS.actual} />
        Actual: <strong style={{ marginLeft: 4 }}>{point.actualCost ?? 'N/A'}</strong>
      </p>
      <p
        style={{
          margin: '2px 0',
          color: SERIES_COLORS.predicted,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <TooltipSwatch color={SERIES_COLORS.predicted} />
        Predicted: <strong style={{ marginLeft: 4 }}>{point.predictedCost ?? 'N/A'}</strong>
      </p>
      {variance != null && (
        <p
          style={{
            margin: '6px 0 0',
            borderTop: `1px solid ${theme.border}`,
            paddingTop: 4,
            color: theme.text,
          }}
        >
          Variance (Actual - Predicted): <strong>{variance.toFixed(0)}</strong>
        </p>
      )}
    </div>
  );
}

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  label: PropTypes.string,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      payload: PropTypes.shape({
        actualCost: PropTypes.number,
        predictedCost: PropTypes.number,
      }),
    }),
  ),
  theme: PropTypes.shape({
    cardBg: PropTypes.string.isRequired,
    border: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
  }).isRequired,
};

CustomTooltip.defaultProps = {
  active: false,
  label: '',
  payload: [],
};

function CostPredictionChart({ projectId, category }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const darkMode = useSelector(state => state.theme.darkMode);
  const theme = getTheme(darkMode);

  const [dateRange, setDateRange] = useState({ start: '', end: '' }); // 'YYYY-MM-DD'

  const legendItems = [
    { label: 'Actual Cost', color: SERIES_COLORS.actual, type: 'circle' },
    { label: 'Predicted Cost', color: SERIES_COLORS.predicted, type: 'dash' },
  ];

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const costData = await getProjectCosts(projectId);
        if (!costData?.actual || typeof costData.actual !== 'object') {
          throw new Error('Cost tracking data is unavailable for this project.');
        }

        const selectedCategories =
          category === 'Overall' ? null : [category === 'Labour' ? 'Labor' : category];
        const months = new Set();
        const dataCategories = Object.keys(costData.actual);
        const predictedDataCategories = Object.keys(costData.predicted || {});
        const matchesSelectedCategory = key =>
          !selectedCategories ||
          selectedCategories.some(selected => selected.toLowerCase() === key.toLowerCase());
        const actualCategories = dataCategories.filter(matchesSelectedCategory);
        const predictedCategories = predictedDataCategories.filter(matchesSelectedCategory);

        [
          ...actualCategories.map(key => costData.actual[key]),
          ...predictedCategories.map(key => costData.predicted[key]),
        ].forEach(items => {
          items.forEach(item => {
            const date = new Date(item.date);
            if (!Number.isNaN(date.getTime())) {
              months.add(toMonthKey(date));
            }
          });
        });

        const sortedMonths = [...months].sort();
        const monthKeys = [];
        if (sortedMonths.length > 0) {
          const [firstYear, firstMonth] = sortedMonths[0].split('-').map(Number);
          const [lastYear, lastMonth] = sortedMonths[sortedMonths.length - 1]
            .split('-')
            .map(Number);
          const currentMonth = new Date(firstYear, firstMonth - 1, 1);
          const lastMonthDate = new Date(lastYear, lastMonth - 1, 1);

          while (currentMonth <= lastMonthDate) {
            monthKeys.push(toMonthKey(currentMonth));
            currentMonth.setMonth(currentMonth.getMonth() + 1);
          }
        }

        const getMonthlyTotal = (categoryData, categories, year, month) => {
          let hasRecords = false;
          const total = categories.reduce(
            (sum, categoryName) =>
              sum +
              (categoryData[categoryName] || []).reduce((categoryTotal, item) => {
                const date = new Date(item.date);
                if (date.getFullYear() !== year || date.getMonth() !== month) {
                  return categoryTotal;
                }
                hasRecords = true;
                return categoryTotal + (Number(item.cost) || 0);
              }, 0),
            0,
          );
          return hasRecords ? total : null;
        };

        const combinedData = monthKeys.map(monthKey => {
          const [year, month] = monthKey.split('-').map(Number);
          return {
            month: monthKey,
            actualCost: getMonthlyTotal(costData.actual, actualCategories, year, month - 1),
            predictedCost: costData.predicted
              ? getMonthlyTotal(costData.predicted, predictedCategories, year, month - 1)
              : null,
          };
        });

        if (!cancelled) setChartData(combinedData);
      } catch (fetchError) {
        if (!cancelled) {
          setChartData([]);
          setError(
            fetchError?.response?.data?.message ||
              fetchError.message ||
              'Failed to load cost tracking data.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (projectId) fetchData();

    return () => {
      cancelled = true;
    };
  }, [projectId, category]);

  const filteredData = useMemo(() => {
    if (!dateRange.start && !dateRange.end) {
      return chartData.slice(-DEFAULT_WINDOW_MONTHS);
    }
    return chartData.filter(d => {
      const [year, month] = d.month.split('-').map(Number);
      const pointDate = new Date(year, month - 1, 1);

      if (dateRange.start) {
        const s = new Date(dateRange.start);
        const startMonth = new Date(s.getFullYear(), s.getMonth(), 1);
        if (pointDate < startMonth) return false;
      }
      if (dateRange.end) {
        const e = new Date(dateRange.end);
        const endMonth = new Date(e.getFullYear(), e.getMonth(), 1);
        if (pointDate > endMonth) return false;
      }
      return true;
    });
  }, [chartData, dateRange]);

  // Reset handler
  const handleReset = () => {
    setDateRange({ start: '', end: '' });
  };

  const hasActiveFilters = dateRange.start !== '' || dateRange.end !== '';

  const filterStyles = {
    bar: {
      background: theme.cardBg,
      border: `1px solid ${theme.border}`,
    },
    label: {
      color: theme.mutedText,
    },
    control: {
      background: theme.itemBg,
      border: `1px solid ${theme.border}`,
      color: theme.text,
    },
    resetButton: {
      background: theme.itemBg,
      border: `1px solid ${theme.border}`,
      color: theme.text,
      opacity: hasActiveFilters ? 1 : 0.5,
      cursor: hasActiveFilters ? 'pointer' : 'not-allowed',
    },
  };

  if (loading) {
    return (
      <div
        className={styles.titleContainer}
        style={{ background: theme.pageBg, color: theme.text }}
      >
        Loading chart data...
      </div>
    );
  }
  if (error) {
    return (
      <div
        className={styles.titleContainer}
        style={{ background: theme.pageBg, color: theme.text }}
      >
        Error: {error}
      </div>
    );
  }

  const currentMonthKey = toMonthKey(new Date());

  return (
    <div className={styles.titleContainer} style={{ background: theme.pageBg, color: theme.text }}>
      <h2 className={styles.title} style={{ color: theme.text }}>
        {category} Actual vs Predicted Costs Tracking
      </h2>
      <p style={{ color: theme.mutedText, textAlign: 'center' }}>
        Monthly actual and predicted costs for this project and category. The chart at left shows
        project expense totals, so its values are not directly comparable to an individual month.
      </p>

      <div className={styles.filterBar} style={filterStyles.bar}>
        <div className={styles.filterGroup}>
          <label htmlFor="start-date" style={filterStyles.label}>
            Start Date
          </label>
          <input
            id="start-date"
            type="date"
            className={`${styles.control} ${styles.dateInput} ${
              darkMode ? styles.dateInputDark : ''
            }`}
            style={filterStyles.control}
            value={dateRange.start}
            min="2011-01-01"
            max={dateRange.end || TODAY_STR}
            onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="end-date" style={filterStyles.label}>
            End Date
          </label>
          <input
            id="end-date"
            type="date"
            className={`${styles.control} ${styles.dateInput} ${
              darkMode ? styles.dateInputDark : ''
            }`}
            style={filterStyles.control}
            value={dateRange.end}
            min={dateRange.start || undefined}
            max={TODAY_STR}
            onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
          />
        </div>

        {/* Flows inline with the other filters; only wraps to a new line
            naturally (like the others) when the row runs out of space. */}
        <div className={styles.filterGroup}>
          <span aria-hidden="true" className={styles.filterGroupSpacerLabel} />
          <button
            type="button"
            className={styles.resetButton}
            style={filterStyles.resetButton}
            onClick={handleReset}
            disabled={!hasActiveFilters}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <p role="status" style={{ color: theme.mutedText, textAlign: 'center' }}>
          No cost tracking data is available for the selected project and date range.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={filteredData} margin={{ top: 40, right: 50, left: 20, bottom: 40 }}>
            {/* Grid */}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.border}
              vertical
              horizontal
              verticalFill={[]}
              horizontalFill={[]}
            />
            {/* Axes: tick text, tick marks, baseline lines */}
            <XAxis
              dataKey="month"
              interval={0}
              minTickGap={0}
              angle={-35}
              height={60}
              textAnchor="end"
              tick={{ fill: theme.axisText, fontSize: 11 }}
              tickFormatter={formatMonthLabel}
              tickMargin={8}
            />
            <YAxis
              domain={[0, dataMax => Math.ceil(dataMax * 1.15)]}
              tick={({ x, y, payload }) => (
                <text x={x} y={y} textAnchor="end" fill={theme.axisText} fontSize={13}>
                  {payload.value}
                </text>
              )}
            />
            {/* Tooltip & Legend */}
            <Tooltip
              content={<CustomTooltip theme={theme} />}
              labelFormatter={formatMonthLabel}
              cursor={{ stroke: theme.accent }}
            />
            <Legend
              verticalAlign="bottom"
              height={48}
              wrapperStyle={{ paddingTop: 10 }}
              content={() => (
                <ul
                  className={styles.legendList}
                  style={{ background: theme.itemBg, borderRadius: 6 }}
                >
                  {legendItems.map(item => (
                    <li key={item.label} className={styles.legendListItem}>
                      {/* icon */}
                      {item.type === 'circle' ? (
                        <span
                          className={styles.legendItem}
                          style={{ backgroundColor: item.color }}
                        />
                      ) : (
                        <svg width="18" height="12">
                          <line
                            x1="0"
                            y1="6"
                            x2="18"
                            y2="6"
                            stroke={item.color}
                            strokeWidth="3"
                            strokeDasharray="4 4"
                          />
                        </svg>
                      )}
                      {/* label */}
                      <span style={{ color: theme.text }}>{item.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            />
            {/* Reference line marking the current month. Label sits near the bottom
              of the line so it never overlaps the data value labels.*/}
            <ReferenceLine
              x={currentMonthKey}
              stroke="#ff0000"
              strokeDasharray="3 3"
              label={<CurrentMonthLabel />}
            />
            {/* Series (kept fixed colors) */}
            <Line
              type="monotone"
              dataKey="actualCost"
              stroke={SERIES_COLORS.actual}
              strokeWidth={2}
              name="Actual Cost"
              dot={renderDotTopOrBottom('actualCost', SERIES_COLORS.actual, filteredData.length)}
            />
            <Line
              type="monotone"
              dataKey="predictedCost"
              stroke={SERIES_COLORS.predicted}
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Predicted Cost"
              dot={renderDotTopOrBottom(
                'predictedCost',
                SERIES_COLORS.predicted,
                filteredData.length,
              )}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

CostPredictionChart.propTypes = {
  projectId: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
};

export default CostPredictionChart;
