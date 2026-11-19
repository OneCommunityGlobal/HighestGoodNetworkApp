import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from 'recharts';
import KIChartFilters, {
  KITCHENS,
  CHART_TOOLTIP_STYLES,
  getRecentMonths,
  getDateLimits,
  isDateRangeValid,
  useChartFilters,
} from '../KIChartFilters/KIChartFilters';
import { CATEGORIES } from '../FoodCategoriesPieChart/FoodCategoriesPieChart';
import cardStyles from '../FoodCategoriesPieChart/FoodCategoriesPieChart.module.css';
import styles from './SeasonalTrendsLineChart.module.css';

export const METRICS = {
  harvest: { label: 'Harvest Yield', title: 'Seasonal Trends: Harvest Yield' },
  inventory: { label: 'Current Inventory', title: 'Seasonal Trends: Current Inventory' },
  wastage: { label: 'Wastage', title: 'Seasonal Trends: Wastage' },
};

const METRIC_OPTIONS = Object.entries(METRICS).map(([value, m]) => ({ value, label: m.label }));

const DEFAULTS = { metric: 'harvest', kitchen: 'All', startDate: '', endDate: '' };

// Same categories and colors as the Food Categories chart; Dairy's line is a shade darker
// so its line and labels stay readable on the light card
const LINE_COLORS = { dairy: '#b8a48c' };
const MARKERS = { produce: 'circle', grains: 'square', proteins: 'triangle', dairy: 'diamond' };
export const SERIES = CATEGORIES.map(cat => ({
  key: cat.key,
  name: cat.name,
  color: LINE_COLORS[cat.key] || cat.color,
  marker: MARKERS[cat.key],
}));

// Mock data: kg harvested in each calendar month (Jan to Dec) for one kitchen,
// following the doc's mockup, plus how big each kitchen is
const HARVEST_BY_MONTH = {
  produce: [15, 12, 18, 35, 55, 75, 90, 95, 80, 60, 35, 20],
  grains: [10, 10, 12, 15, 20, 25, 45, 70, 85, 65, 30, 15],
  proteins: [25, 25, 28, 30, 32, 35, 38, 40, 42, 38, 30, 25],
  dairy: [40, 38, 42, 50, 55, 60, 58, 55, 52, 48, 42, 40],
};
const KITCHEN_SIZE = { 'Kitchen 1': 1, 'Kitchen 2': 0.8, 'Kitchen 3': 1.2 };

export const buildMockRecords = months =>
  KITCHENS.flatMap(kitchen =>
    months.flatMap(month =>
      SERIES.map(({ key }) => {
        const harvest = Math.round(
          HARVEST_BY_MONTH[key][Number(month.slice(5)) - 1] * KITCHEN_SIZE[kitchen],
        );
        return {
          kitchen,
          month,
          category: key,
          harvest,
          inventory: Math.round(harvest * 0.6 + 20),
          wastage: Math.round(harvest * 0.12 + 2),
        };
      }),
    ),
  );

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// '2026-01' -> "Jan '26"
export const formatMonth = month =>
  `${MONTH_NAMES[Number(month.slice(5)) - 1]} '${month.slice(2, 4)}`;

// One point per month inside the dates, with the chosen metric added up over the
// chosen kitchen(s) for each category; [] when the dates are reversed or nothing matches
export const buildTrendData = (records, { metric, kitchen, startDate, endDate }) => {
  if (!isDateRangeValid({ startDate, endDate })) return [];
  const from = startDate.substring(0, 7);
  const to = endDate.substring(0, 7);

  const byMonth = new Map();
  records
    .filter(r => kitchen === 'All' || r.kitchen === kitchen)
    .filter(r => (!from || r.month >= from) && (!to || r.month <= to))
    .forEach(r => {
      if (!byMonth.has(r.month))
        byMonth.set(r.month, { month: r.month, label: formatMonth(r.month) });
      const point = byMonth.get(r.month);
      point[r.category] = (point[r.category] || 0) + r[metric];
    });

  return [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month));
};

// Marker drawn at each point and in the legend, so the lines differ by shape as well as color
export function Marker({ shape, cx, cy, color, size = 5 }) {
  if (cx == null || cy == null) return null;
  const testId = `marker-${shape}`;
  if (shape === 'square') {
    return (
      <rect
        data-testid={testId}
        x={cx - size}
        y={cy - size}
        width={size * 2}
        height={size * 2}
        fill={color}
      />
    );
  }
  if (shape === 'triangle') {
    const points = `${cx},${cy - size - 1} ${cx - size - 1},${cy + size} ${cx + size + 1},${cy +
      size}`;
    return <polygon data-testid={testId} points={points} fill={color} />;
  }
  if (shape === 'diamond') {
    const points = `${cx},${cy - size - 1} ${cx + size + 1},${cy} ${cx},${cy + size + 1} ${cx -
      size -
      1},${cy}`;
    return <polygon data-testid={testId} points={points} fill={color} />;
  }
  return <circle data-testid={testId} cx={cx} cy={cy} r={size} fill={color} />;
}

Marker.propTypes = {
  shape: PropTypes.oneOf(['circle', 'square', 'triangle', 'diamond']).isRequired,
  cx: PropTypes.number,
  cy: PropTypes.number,
  color: PropTypes.string.isRequired,
  size: PropTypes.number,
};

// The dot renderer for each line, made once so the chart does not define components inside itself
const DOT_RENDERERS = Object.fromEntries(
  SERIES.map(({ key, marker, color }) => {
    const renderDot = ({ cx, cy, index }) => (
      <Marker key={`${key}-${index}`} shape={marker} color={color} cx={cx} cy={cy} />
    );
    return [key, renderDot];
  }),
);

export default function SeasonalTrendsLineChart() {
  const darkMode = useSelector(state => state.theme.darkMode);

  const months = useMemo(() => getRecentMonths(), []);
  const records = useMemo(() => buildMockRecords(months), [months]);
  const { filters, setFilter, reset, isDefault } = useChartFilters(DEFAULTS);
  const chartData = useMemo(() => buildTrendData(records, filters), [records, filters]);

  // SVG text and lines cannot read the card's CSS variables, so the axis colors are set here
  const axisColor = darkMode ? '#c9ced8' : '#555555';
  const gridColor = darkMode ? '#2c3648' : '#e3e6ec';

  return (
    <div className={[cardStyles.container, darkMode ? cardStyles.darkMode : ''].join(' ')}>
      <KIChartFilters
        filters={filters}
        onFilterChange={setFilter}
        onReset={reset}
        isDefault={isDefault}
        metricOptions={METRIC_OPTIONS}
        {...getDateLimits(months)}
      />

      <h2 className={cardStyles.chartTitle}>{METRICS[filters.metric].title}</h2>

      <div className={cardStyles.chartWrapper}>
        {chartData.length === 0 ? (
          <div className={cardStyles.noDataMessage}>
            No data available for the selected filters.
          </div>
        ) : (
          <>
            <div className={styles.trendsPlot}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 24, right: 24, bottom: 24, left: 8 }}>
                  <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    padding={{ left: 24, right: 24 }}
                    stroke={axisColor}
                    tick={{ fill: axisColor }}
                    label={{ value: 'Month', position: 'bottom', fill: axisColor, offset: 4 }}
                  />
                  <YAxis
                    stroke={axisColor}
                    tick={{ fill: axisColor }}
                    label={{
                      value: `${METRICS[filters.metric].label} (kg)`,
                      angle: -90,
                      position: 'insideLeft',
                      fill: axisColor,
                      style: { textAnchor: 'middle' },
                    }}
                  />
                  <Tooltip
                    formatter={value => `${value.toLocaleString()} kg`}
                    {...CHART_TOOLTIP_STYLES}
                  />
                  {SERIES.map(s => (
                    <Line
                      key={s.key}
                      type="linear"
                      dataKey={s.key}
                      name={s.name}
                      stroke={s.color}
                      strokeWidth={3}
                      dot={DOT_RENDERERS[s.key]}
                      isAnimationActive={false}
                    >
                      <LabelList
                        dataKey={s.key}
                        position="top"
                        offset={9}
                        fill={s.color}
                        fontSize={11}
                        fontWeight={600}
                      />
                    </Line>
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className={cardStyles.legend}>
              {SERIES.map(s => (
                <span key={s.key} className={cardStyles.legendItem}>
                  <svg width="28" height="14" aria-hidden="true">
                    <line x1="0" y1="7" x2="28" y2="7" stroke={s.color} strokeWidth="3" />
                    <Marker shape={s.marker} cx={14} cy={7} color={s.color} size={4} />
                  </svg>
                  <span>{s.name}</span>
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
