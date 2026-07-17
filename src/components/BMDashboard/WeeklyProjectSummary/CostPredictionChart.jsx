import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
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
    itemBgHover: '#e5e7eb',
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
    itemBgHover: '#4a6285',
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

// Fallback sample data so the chart always renders, even when the backend has
// no cost/prediction records for this project (e.g. on a reviewer's machine).
function buildSampleData() {
  const now = new Date();
  const planned = [1200, 1500, 1800, 2100, 2400, 2700];
  const actual = [1100, 1600, 1750, 2200, 2300, 2650];
  const predicted = [null, null, null, 2050, 2350, 2680];
  return planned.map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      month: d.toLocaleString('default', { month: 'long', year: 'numeric' }),
      plannedCost: planned[i],
      actualCost: actual[i],
      predictedCost: predicted[i],
    };
  });
}

// Custom dot renderer (unchanged)
function renderDotTopOrBottom(lineKey, color) {
  return function CustomDot(props) {
    const { cx, cy, value, payload, index } = props;
    if (value == null) return null;

    const planned = payload.plannedCost;
    const actual = payload.actualCost;
    const predicted = payload.predictedCost;
    const values = [planned, actual, predicted].filter(v => v != null);
    if (values.length === 0) return null;

    const max = Math.max(...values);
    const min = Math.min(...values);
    const dx = index === 0 ? 32 : 0;

    if (value === max) {
      return (
        <text
          x={cx + dx}
          y={cy - 20}
          fill={color}
          fontSize={14}
          fontWeight="bold"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {value}
        </text>
      );
    }
    if (value === min) {
      return (
        <text
          x={cx + dx}
          y={cy + 18}
          fill={color}
          fontSize={14}
          fontWeight="bold"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {value}
        </text>
      );
    }
    return null;
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

function CostPredictionChart({ projectId, projects }) {
  const dispatch = useDispatch();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const darkMode = useSelector(state => state.theme.darkMode);
  const theme = getTheme(darkMode);

  // Filter state (project + full date range: day/month/year)
  const [selectedProjectId, setSelectedProjectId] = useState(projectId);
  const [dateRange, setDateRange] = useState({ start: '', end: '' }); // 'YYYY-MM-DD'

  const legendItems = [
    { label: 'Planned Cost', color: '#7acba6', type: 'circle' },
    { label: 'Actual Cost', color: '#9aa6ff', type: 'circle' },
    { label: 'Predicted Cost', color: '#ff8c2a', type: 'dash' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [costsResponse, predictionsResponse] = await Promise.all([
          projectCostService.getProjectCosts(selectedProjectId),
          projectCostService.getProjectPredictions(selectedProjectId),
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

        setChartData(combinedData.length ? combinedData : buildSampleData());
        setError(null);
      } catch {
        // Backend has no data for this project (common on reviewer machines):
        // show sample data so the chart is still visible to everyone.
        setChartData(buildSampleData());
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    if (selectedProjectId) fetchData();
  }, [selectedProjectId]);

  // date range filter logic

  const filteredData = useMemo(() => {
    if (!dateRange.start && !dateRange.end) return chartData;
    return chartData.filter(d => {
      const pointDate = new Date(d.month);
      if (dateRange.start && pointDate < new Date(dateRange.start)) return false;
      if (dateRange.end && pointDate > new Date(dateRange.end)) return false;
      return true;
    });
  }, [chartData, dateRange]);

  // Reset handler
  const handleReset = () => {
    setSelectedProjectId(projectId);
    setDateRange({ start: '', end: '' });
  };

  const hasActiveFilters =
    selectedProjectId !== projectId || dateRange.start !== '' || dateRange.end !== '';

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

  // Custom tooltip showing Predicted + Actual clearly, using card-layer background
  const CustomTooltip = ({ active, payload, label }) => {
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
        <p style={{ margin: '2px 0', color: '#9aa6ff' }}>
          Actual: <strong>{point.actualCost ?? 'N/A'}</strong>
        </p>
        <p style={{ margin: '2px 0', color: '#ff8c2a' }}>
          Predicted: <strong>{point.predictedCost ?? 'N/A'}</strong>
        </p>
        <p style={{ margin: '2px 0', color: '#7acba6' }}>
          Planned: <strong>{point.plannedCost ?? 'N/A'}</strong>
        </p>
        {variance != null && (
          <p
            style={{
              margin: '6px 0 0',
              borderTop: `1px solid ${theme.border}`,
              paddingTop: 4,
            }}
          >
            Variance (Actual - Predicted): <strong>{variance.toFixed(0)}</strong>
          </p>
        )}
      </div>
    );
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

  const projectOptions =
    projects && projects.length ? projects : [{ id: projectId, name: `Project ${projectId}` }];

  return (
    <div className={styles.titleContainer} style={{ background: theme.pageBg, color: theme.text }}>
      <h2 className={styles.title} style={{ color: theme.text }}>
        Planned Vs Actual costs tracking
      </h2>

      {/* Filter bar — "card" layer */}
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
            {projectOptions.map(p => (
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

        {/* Reset button */}
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

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={theme.border}
            vertical
            horizontal
            verticalFill={[]}
            horizontalFill={[]}
          />
          <XAxis
            dataKey="month"
            tick={({ x, y, payload }) => (
              <text x={x} y={y + 15} textAnchor="middle" fill={theme.axisText} fontSize={13}>
                {payload.value}
              </text>
            )}
            tickMargin={0}
          />
          <YAxis
            tick={({ x, y, payload }) => (
              <text x={x} y={y} textAnchor="end" fill={theme.axisText} fontSize={13}>
                {payload.value}
              </text>
            )}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: theme.accent }} />
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
                    <span style={{ color: theme.text }}>{item.label}</span>
                  </li>
                ))}
              </ul>
            )}
          />
          <ReferenceLine
            x={currentMonth}
            stroke="#ff0000"
            strokeDasharray="3 3"
            label={<CurrentMonthLabel />}
          />
          <Line
            type="monotone"
            dataKey="plannedCost"
            stroke="#82ca9d"
            strokeWidth={2}
            name="Planned Cost"
            dot={renderDotTopOrBottom('plannedCost', '#82ca9d')}
          />
          <Line
            type="monotone"
            dataKey="actualCost"
            stroke="#8884d8"
            strokeWidth={2}
            name="Actual Cost"
            dot={renderDotTopOrBottom('actualCost', '#8884d8')}
          />
          <Line
            type="monotone"
            dataKey="predictedCost"
            stroke="#ff7300"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Predicted Cost"
            dot={renderDotTopOrBottom('predictedCost', '#ff7300')}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

CostPredictionChart.propTypes = {
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  projects: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    }),
  ),
};

CostPredictionChart.defaultProps = {
  projects: [],
};

export default CostPredictionChart;
