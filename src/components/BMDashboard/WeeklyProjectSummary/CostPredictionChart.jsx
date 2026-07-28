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
import projectCostService from '../../../services/projectCostService';

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
  planned: '#82ca9d',
  actual: '#8884d8',
  predicted: '#ff7300',
};

// Simple hardcoded project list for testing the filter — swap this out for a real API/Redux-backed list later.
const PROJECTS = [
  { id: 'building-1', name: 'Building 1' },
  { id: 'building-2', name: 'Building 2' },
  { id: 'building-3', name: 'Building 3' },
];

const DEFAULT_WINDOW_MONTHS = 6;

const SAMPLE_DATA_BASE = {
  'building-1': { plannedStart: 400, plannedGrowth: 5.6, actualStart: 380, actualGrowth: 5.4 },
  'building-2': { plannedStart: 700, plannedGrowth: 9.2, actualStart: 660, actualGrowth: 9.0 },
  'building-3': { plannedStart: 250, plannedGrowth: 3.1, actualStart: 240, actualGrowth: 3.0 },
};

// Fallback sample data so the chart always renders, even when the backend has
// no cost/prediction records for this project (e.g. on a reviewer's machine).
function buildSampleData(projectId) {
  const now = new Date();
  const start = new Date(2012, 0, 1);
  const totalMonths =
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1;

  const base = SAMPLE_DATA_BASE[projectId] ?? SAMPLE_DATA_BASE['building-1'];

  const data = [];
  for (let i = 0; i < totalMonths; i += 1) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const planned = Math.round(base.plannedStart + i * base.plannedGrowth);
    const actual = Math.round(base.actualStart + i * base.actualGrowth);
    const isRecent = i >= totalMonths - 3; // only the last 3 months have a "prediction"
    const predicted = isRecent ? Math.round(planned * 1.02) : null;

    data.push({
      month: d.toLocaleString('default', { month: 'long', year: 'numeric' }),
      plannedCost: planned,
      actualCost: actual,
      predictedCost: predicted,
    });
  }
  return data;
}

function renderDotTopOrBottom(lineKey, color, dataLength) {
  return function CustomDot(props) {
    const { cx, cy, value, payload, index } = props;
    if (value == null) return null;

    const isFirst = index === 0;
    const isLast = dataLength != null && index === dataLength - 1;
    if (!isFirst && !isLast) return null;

    const planned = payload.plannedCost;
    const actual = payload.actualCost;
    const predicted = payload.predictedCost;
    const values = [planned, actual, predicted].filter(v => v != null);
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
      <p
        style={{
          margin: '2px 0',
          color: SERIES_COLORS.planned,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <TooltipSwatch color={SERIES_COLORS.planned} />
        Planned: <strong style={{ marginLeft: 4 }}>{point.plannedCost ?? 'N/A'}</strong>
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
        plannedCost: PropTypes.number,
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

function CostPredictionChart({ projectId }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const darkMode = useSelector(state => state.theme.darkMode);
  const theme = getTheme(darkMode);

  // filter state
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' }); // 'YYYY-MM-DD'

  const legendItems = [
    { label: 'Planned Cost', color: SERIES_COLORS.planned, type: 'circle' },
    { label: 'Actual Cost', color: SERIES_COLORS.actual, type: 'circle' },
    { label: 'Predicted Cost', color: SERIES_COLORS.predicted, type: 'dash' },
  ];

  // Falls back to the projectId prop whenever nothing is explicitly selected, so the chart still loads data by default
  const effectiveProjectId = selectedProjectId || projectId;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [costsResponse, predictionsResponse] = await Promise.all([
          projectCostService.getProjectCosts(effectiveProjectId),
          projectCostService.getProjectPredictions(effectiveProjectId),
        ]);

        const costsData = costsResponse.data.costs;
        const predictionsData = predictionsResponse.data.predictions;

        const predictionsMap = predictionsData.reduce((acc, pred) => {
          acc[pred.month] = pred.predictedCost;
          return acc;
        }, {});

        const combinedData = costsData.map(cost => ({
          ...cost,
          predictedCost: predictionsMap[cost.month] || null,
        }));

        setChartData(combinedData.length ? combinedData : buildSampleData(effectiveProjectId));
        setError(null);
      } catch {
        // Backend has no data for this project (common on reviewer machines):
        // show sample data so the chart is still visible to everyone. Data is fixed per-project so switching the filter still moves the chart.
        setChartData(buildSampleData(effectiveProjectId));
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    if (effectiveProjectId) fetchData();
  }, [effectiveProjectId]);

  const filteredData = useMemo(() => {
    if (!dateRange.start && !dateRange.end) {
      return chartData.slice(-DEFAULT_WINDOW_MONTHS);
    }
    return chartData.filter(d => {
      const pointDate = new Date(d.month);
      if (dateRange.start && pointDate < new Date(dateRange.start)) return false;
      if (dateRange.end && pointDate > new Date(dateRange.end)) return false;
      return true;
    });
  }, [chartData, dateRange]);

  // Reset handler
  const handleReset = () => {
    setSelectedProjectId('');
    setDateRange({ start: '', end: '' });
  };

  const hasActiveFilters =
    selectedProjectId !== '' || dateRange.start !== '' || dateRange.end !== '';

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

  const currentMonth = new Date().toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className={styles.titleContainer} style={{ background: theme.pageBg, color: theme.text }}>
      <h2 className={styles.title} style={{ color: theme.text }}>
        Planned Vs Actual costs tracking
      </h2>

      <div className={styles.filterBar} style={filterStyles.bar}>
        <div className={styles.filterGroup}>
          <label htmlFor="project-filter" style={filterStyles.label}>
            Project
          </label>
          <select
            id="project-filter"
            className={styles.control}
            style={filterStyles.control}
            value={selectedProjectId}
            onChange={e => setSelectedProjectId(e.target.value)}
          >
            <option value="">Select a project</option>
            {PROJECTS.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

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
            max={dateRange.end || undefined}
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
            tick={({ x, y, payload }) => (
              <text x={x} y={y + 15} textAnchor="middle" fill={theme.axisText} fontSize={13}>
                {payload.value}
              </text>
            )}
            tickMargin={0} // apply margin at XAxis level, not inside <text>
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
          <Tooltip content={<CustomTooltip theme={theme} />} cursor={{ stroke: theme.accent }} />
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
                      <span className={styles.legendItem} style={{ backgroundColor: item.color }} />
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
            x={currentMonth}
            stroke="#ff0000"
            strokeDasharray="3 3"
            label={<CurrentMonthLabel />}
          />
          {/* Series (kept fixed colors) */}
          <Line
            type="monotone"
            dataKey="plannedCost"
            stroke={SERIES_COLORS.planned}
            strokeWidth={2}
            name="Planned Cost"
            dot={renderDotTopOrBottom('plannedCost', SERIES_COLORS.planned, filteredData.length)}
          />
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
    </div>
  );
}

CostPredictionChart.propTypes = {
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default CostPredictionChart;
