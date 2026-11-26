import { useEffect, useMemo, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import PropTypes from 'prop-types';
import {
  fetchCostDetail,
  clearCostDetail,
} from '../../../../../actions/bmdashboard/costBreakdownActions';
import styles from './CostBreakDown.module.css';

const CATEGORY_CONFIG = {
  'Total Cost of Labor': { label: 'Labor', color: '#9333EA' },
  'Total Cost of Materials': { label: 'Materials', color: '#22C55E' },
  'Total Cost of Equipment': { label: 'Equipment', color: '#EAB308' },
};

const METRIC_CATEGORIES = [
  { metricKey: 'totalLaborCost', name: 'Total Cost of Labor' },
  { metricKey: 'totalMaterialCost', name: 'Total Cost of Materials' },
  { metricKey: 'totalEquipmentCost', name: 'Total Cost of Equipment' },
];

const CHAR_WIDTH_RATIO = 0.55;
const MAX_LABEL_LINES = 2;

function fitLabelInDonut(text, availableWidth, maxFontSize, minFontSize) {
  const words = text.split(/\s+/);

  const buildLines = charsPerLine => {
    const lines = [];
    let currentLine = '';
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (testLine.length <= charsPerLine) {
        currentLine = testLine;
      } else if (currentLine === '') {
        currentLine = word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  for (let size = maxFontSize; size >= minFontSize; size -= 0.5) {
    const charsPerLine = Math.floor(availableWidth / (size * CHAR_WIDTH_RATIO));
    if (charsPerLine < 1) continue;
    const lines = buildLines(charsPerLine);
    if (lines.length <= MAX_LABEL_LINES) {
      return { fontSize: size, lines };
    }
  }

  const charsPerLine = Math.max(1, Math.floor(availableWidth / (minFontSize * CHAR_WIDTH_RATIO)));
  const lines = buildLines(charsPerLine);
  const truncated = lines.slice(0, MAX_LABEL_LINES);
  if (lines.length > MAX_LABEL_LINES) {
    const last = truncated[MAX_LABEL_LINES - 1];
    truncated[MAX_LABEL_LINES - 1] =
      last.length > charsPerLine - 1 ? `${last.slice(0, charsPerLine - 1)}\u2026` : `${last}\u2026`;
  }
  return { fontSize: minFontSize, lines: truncated };
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return '$0';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(Number(amount));
  } catch {
    return `$${Number(amount).toFixed(0)}`;
  }
}

function CustomTooltip({ active, payload, totalCost, darkMode }) {
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload;
  const config = CATEGORY_CONFIG[entry.name] || {};
  const percentage = totalCost > 0 ? ((entry.value / totalCost) * 100).toFixed(1) : '0.0';

  return (
    <div className={`${styles.tooltip} ${darkMode ? styles.tooltipDark : ''}`} role="tooltip">
      <div className={styles.tooltipTitle}>{config.label || entry.name}</div>
      <div className={styles.tooltipRow}>
        Amount: <strong>{formatCurrency(entry.value)}</strong>
      </div>
      <div className={styles.tooltipRow}>
        Share: <strong>{percentage}%</strong>
      </div>
    </div>
  );
}

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      payload: PropTypes.shape({
        name: PropTypes.string,
        value: PropTypes.number,
      }),
    }),
  ),
  totalCost: PropTypes.number,
  darkMode: PropTypes.bool,
};

CustomTooltip.defaultProps = {
  active: false,
  payload: [],
  totalCost: 0,
  darkMode: false,
};

function getMetricValue(metric) {
  if (!metric || metric.comparisonType === 'UNAVAILABLE' || metric.value === null) return null;
  return typeof metric.value === 'number' && Number.isFinite(metric.value) ? metric.value : null;
}

export function buildCostBreakdownChartData(financialMetrics) {
  return METRIC_CATEGORIES.flatMap(({ metricKey, name }) => {
    const value = getMetricValue(financialMetrics?.[metricKey]);
    if (value === null || value <= 0) return [];

    return [
      {
        name,
        shortName: CATEGORY_CONFIG[name]?.label || name,
        value,
        color: CATEGORY_CONFIG[name]?.color || '#999',
      },
    ];
  });
}

export default function CostBreakDown({ requestParams, financialMetrics, requestState }) {
  const dispatch = useDispatch();

  const { detailLoading, detailData, detailError } = useSelector(state => state.costBreakdown);
  const darkMode = useSelector(state => state.theme.darkMode);

  const [activeIndex, setActiveIndex] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Window resize listener
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chartData = useMemo(() => buildCostBreakdownChartData(financialMetrics), [
    financialMetrics,
  ]);

  const totalCost = chartData.reduce((sum, item) => sum + item.value, 0);
  const projectLabel = requestParams?.projectId ? 'Selected Project' : 'All Projects';
  const requestStatus = requestState?.status || 'idle';
  const requestError = requestState?.error;
  const detailParams = useMemo(
    () => ({
      projectId: requestParams?.projectId || '',
      startDate: requestParams?.startDate || '',
      endDate: requestParams?.endDate || '',
    }),
    [requestParams],
  );

  const isXS = windowWidth <= 480;
  let innerRadius;
  let outerRadius;
  let chartHeight;
  if (isXS) {
    innerRadius = 50;
    outerRadius = 75;
    chartHeight = 250;
  } else if (windowWidth <= 768) {
    innerRadius = 60;
    outerRadius = 90;
    chartHeight = 280;
  } else {
    innerRadius = 70;
    outerRadius = 110;
    chartHeight = 320;
  }

  const { fontSize: labelFontSize, lines: labelLines } = useMemo(() => {
    const maxSize = isXS ? 12 : 14;
    const availableWidth = innerRadius * 2 * 0.75;
    return fitLabelInDonut(projectLabel, availableWidth, maxSize, 7);
  }, [projectLabel, innerRadius, isXS]);

  const handleSliceClick = useCallback(
    entry => {
      const category = entry.name;
      if (selectedCategory === category) {
        setSelectedCategory(null);
        dispatch(clearCostDetail());
        return;
      }
      setSelectedCategory(category);
      dispatch(fetchCostDetail(detailParams));
    },
    [dispatch, detailParams, selectedCategory],
  );

  const handleScopeChange = useCallback(() => {
    setSelectedCategory(null);
    dispatch(clearCostDetail());
  }, [dispatch]);

  useEffect(() => {
    handleScopeChange();
  }, [handleScopeChange, requestParams]);

  const renderProjectBreakdown = () => {
    const categoryData = detailData?.breakdown?.find(b => b.category === selectedCategory);
    if (!categoryData?.projectBreakdown?.length) {
      return <div className={styles.noDetail}>No project breakdown available</div>;
    }
    return (
      <div className={styles.projectList}>
        {categoryData.projectBreakdown.map(proj => (
          <div key={proj.projectId} className={styles.projectRow}>
            <span className={styles.projectName}>{proj.projectName}</span>
            <span className={styles.projectAmount}>{formatCurrency(proj.amount)}</span>
            <span className={styles.projectPct}>{proj.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    );
  };

  const wrapperClass = `${styles.wrapper} ${darkMode ? styles.wrapperDark : ''}`;

  return (
    <div className={wrapperClass} role="img" aria-label="Cost breakdown by category donut chart">
      <h3 className={styles.title}>Cost Breakdown by Category</h3>

      {/* The page header owns these filters; the scope is shown here to make the chart context explicit. */}
      <div className={styles.filters} aria-label="Cost breakdown scope">
        <span className={styles.filterLabel}>{projectLabel}</span>
        {requestParams?.startDate && requestParams?.endDate && (
          <span className={styles.filterLabel}>
            {requestParams.startDate} – {requestParams.endDate}
          </span>
        )}
      </div>

      {/* Loading */}
      {requestStatus === 'loading' && (
        <div className={styles.loading} role="status" aria-live="polite" aria-busy="true">
          <span>Loading cost data...</span>
        </div>
      )}

      {/* Error */}
      {requestStatus === 'error' && (
        <div className={styles.error} role="alert">
          <p className={styles.errorMessage}>
            {requestError || 'Unable to load cost data for the selected filters.'}
          </p>
        </div>
      )}

      {/* Empty state */}
      {requestStatus === 'success' && chartData.length === 0 && (
        <output className={styles.loading} aria-live="polite" aria-busy="true">
          <p>No cost data available</p>
          <p className={styles.emptySubtext}>No cost records found for the selected scope</p>
        </output>
      )}

      {/* Chart */}
      {requestStatus === 'success' && chartData.length > 0 && (
        <>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  dataKey="value"
                  stroke={darkMode ? '#253342' : '#fff'}
                  strokeWidth={2}
                  onMouseEnter={(_, i) => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onClick={(_, i) => handleSliceClick(chartData[i])}
                  isAnimationActive={false}
                >
                  {chartData.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      opacity={activeIndex == null || activeIndex === i ? 1 : 0.45}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Pie>

                {/* Center label: project name */}
                <text
                  x="50%"
                  y={labelLines.length > 1 ? '40%' : '46%'}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={darkMode ? '#f8fafc' : '#0f172a'}
                  fontSize={labelFontSize}
                  fontWeight="600"
                >
                  {labelLines.map((line, idx) => (
                    <tspan key={line} x="50%" dy={idx === 0 ? 0 : labelFontSize * 1.3}>
                      {line}
                    </tspan>
                  ))}
                </text>

                {/* Center label: total cost */}
                <text
                  x="50%"
                  y={labelLines.length > 1 ? '57%' : '55%'}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={darkMode ? '#f8fafc' : '#0f172a'}
                  fontSize={isXS ? 16 : 20}
                  fontWeight="800"
                >
                  {formatCurrency(totalCost)}
                </text>

                <Tooltip
                  content={<CustomTooltip totalCost={totalCost} darkMode={darkMode} />}
                  cursor={false}
                  allowEscapeViewBox={{ x: false, y: false }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <ul className={styles.legend} aria-label="Chart legend">
            {chartData.map(entry => (
              <button
                key={entry.name}
                type="button"
                className={`${styles.legendItem} ${
                  selectedCategory === entry.name ? styles.legendItemActive : ''
                }`}
                style={{ backgroundColor: entry.color }}
                onClick={() => handleSliceClick(entry)}
                aria-label={`${entry.shortName}: ${formatCurrency(entry.value)}`}
              >
                {entry.shortName}
              </button>
            ))}
          </ul>

          {/* Detail panel */}
          {selectedCategory && (
            <section
              className={styles.detailPanel}
              aria-label={`${CATEGORY_CONFIG[selectedCategory]?.label ||
                selectedCategory} breakdown by project`}
            >
              <div className={styles.detailHeader}>
                <h4 className={styles.detailTitle}>
                  {CATEGORY_CONFIG[selectedCategory]?.label || selectedCategory} by Project
                </h4>
                <button
                  type="button"
                  className={styles.detailClose}
                  onClick={() => {
                    setSelectedCategory(null);
                    dispatch(clearCostDetail());
                  }}
                  aria-label="Close breakdown details"
                >
                  &times;
                </button>
              </div>

              {detailLoading && <div className={styles.detailLoading}>Loading details...</div>}
              {!detailLoading && detailError && (
                <div className={styles.detailError}>{detailError}</div>
              )}
              {!detailLoading && !detailError && detailData && renderProjectBreakdown()}
            </section>
          )}
        </>
      )}
    </div>
  );
}

CostBreakDown.propTypes = {
  requestParams: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    projectId: PropTypes.string,
  }),
  financialMetrics: PropTypes.objectOf(PropTypes.object),
  requestState: PropTypes.shape({
    status: PropTypes.oneOf(['idle', 'loading', 'success', 'error']),
    error: PropTypes.string,
  }),
};

CostBreakDown.defaultProps = {
  requestParams: null,
  financialMetrics: null,
  requestState: null,
};
