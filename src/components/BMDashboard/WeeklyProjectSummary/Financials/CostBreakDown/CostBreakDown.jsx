import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import {
  fetchCostBreakdown,
  fetchCostDetail,
  clearCostDetail,
} from '../../../../../actions/bmdashboard/costBreakdownActions';
import styles from './CostBreakDown.module.css';

const CATEGORY_CONFIG = {
  'Total Cost of Labor': { label: 'Labor', color: '#9333EA' },
  'Total Cost of Materials': { label: 'Materials', color: '#22C55E' },
  'Total Cost of Equipment': { label: 'Equipment', color: '#EAB308' },
};

const DEBOUNCE_MS = 500;
const CHAR_WIDTH_RATIO = 0.55;
const MAX_LABEL_LINES = 2;

function fitLabelInDonut(text, availableWidth, maxFontSize, minFontSize) {
  const words = text.split(/\s+/);

  for (let size = maxFontSize; size >= minFontSize; size -= 0.5) {
    const charsPerLine = Math.floor(availableWidth / (size * CHAR_WIDTH_RATIO));
    if (charsPerLine < 1) continue;

    const lines = [];
    let currentLine = '';
    for (let w = 0; w < words.length; w += 1) {
      const testLine = currentLine ? `${currentLine} ${words[w]}` : words[w];
      if (testLine.length <= charsPerLine) {
        currentLine = testLine;
      } else if (!currentLine) {
        currentLine = words[w];
      } else {
        lines.push(currentLine);
        currentLine = words[w];
      }
    }
    if (currentLine) lines.push(currentLine);

    if (lines.length <= MAX_LABEL_LINES) {
      return { fontSize: size, lines };
    }
  }

  // At min size, wrap and truncate to MAX_LABEL_LINES
  const charsPerLine = Math.max(1, Math.floor(availableWidth / (minFontSize * CHAR_WIDTH_RATIO)));
  const lines = [];
  let currentLine = '';
  for (let w = 0; w < words.length; w += 1) {
    const testLine = currentLine ? `${currentLine} ${words[w]}` : words[w];
    if (testLine.length <= charsPerLine) {
      currentLine = testLine;
    } else if (!currentLine) {
      currentLine = words[w];
    } else {
      lines.push(currentLine);
      currentLine = words[w];
    }
  }
  if (currentLine) lines.push(currentLine);

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
  } catch (e) {
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

export default function CostBreakDown() {
  const dispatch = useDispatch();

  const { loading, data, error, detailLoading, detailData, detailError } = useSelector(
    state => state.costBreakdown,
  );
  const darkMode = useSelector(state => state.theme.darkMode);

  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeIndex, setActiveIndex] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const debounceRef = useRef(null);

  // Load project list for dropdown
  useEffect(() => {
    let cancelled = false;
    const apiBase = (process.env.REACT_APP_APIENDPOINT || '').replace(/\/$/, '');
    axios
      .get(`${apiBase}/bm/projectsNames`)
      .then(res => {
        if (cancelled) return;
        if (Array.isArray(res.data)) {
          const list = res.data
            .filter(p => p?.projectId)
            .map(p => ({ id: p.projectId, name: p.projectName || p.projectId }));
          setProjects(list);
        }
      })
      .catch(() => {
        // Silently fail — dropdown shows only "All Projects"
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch cost breakdown with debouncing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      dispatch(fetchCostBreakdown({ projectId, startDate, endDate }));
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [dispatch, projectId, startDate, endDate]);

  // Window resize listener
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chartData = useMemo(() => {
    if (!data?.breakdown?.length) return [];
    return data.breakdown.map(item => ({
      name: item.category,
      shortName: (CATEGORY_CONFIG[item.category] || {}).label || item.category,
      value: item.amount,
      color: (CATEGORY_CONFIG[item.category] || {}).color || '#999',
    }));
  }, [data]);

  const totalCost = data?.totalCost || 0;
  const projectLabel = data?.project || 'All Projects';

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
      dispatch(fetchCostDetail({ projectId, startDate, endDate }));
    },
    [dispatch, projectId, startDate, endDate, selectedCategory],
  );

  const handleFilterChange = useCallback(
    (setter, value) => {
      setter(value);
      setSelectedCategory(null);
      dispatch(clearCostDetail());
    },
    [dispatch],
  );

  const hasActiveFilters = projectId || startDate || endDate;

  const handleClearFilters = useCallback(() => {
    setProjectId('');
    setStartDate('');
    setEndDate('');
    setSelectedCategory(null);
    dispatch(clearCostDetail());
  }, [dispatch]);

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

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterItem}>
          <label htmlFor="cost-project-select" className={styles.filterLabel}>
            Project
          </label>
          <select
            id="cost-project-select"
            value={projectId}
            onChange={e => handleFilterChange(setProjectId, e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterItem}>
          <label htmlFor="cost-start-date" className={styles.filterLabel}>
            From
          </label>
          <input
            id="cost-start-date"
            type="date"
            value={startDate}
            onChange={e => handleFilterChange(setStartDate, e.target.value)}
            className={styles.filterInput}
          />
        </div>

        <div className={styles.filterItem}>
          <label htmlFor="cost-end-date" className={styles.filterLabel}>
            To
          </label>
          <input
            id="cost-end-date"
            type="date"
            value={endDate}
            onChange={e => handleFilterChange(setEndDate, e.target.value)}
            className={styles.filterInput}
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className={styles.clearFiltersButton}
            onClick={handleClearFilters}
            aria-label="Clear all filters"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className={styles.loading} role="status" aria-live="polite" aria-busy="true">
          <div className={styles.spinner} />
          <span>Loading cost data...</span>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className={styles.error} role="alert">
          <p className={styles.errorMessage}>{error}</p>
          <button
            type="button"
            className={styles.retryButton}
            onClick={() => dispatch(fetchCostBreakdown({ projectId, startDate, endDate }))}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && data && chartData.length === 0 && (
        <div className={styles.empty} role="status">
          <p>No cost data available</p>
          <p className={styles.emptySubtext}>
            {projectId
              ? 'Try selecting a different project or date range'
              : 'No cost records found'}
          </p>
        </div>
      )}

      {/* Chart */}
      {!loading && !error && chartData.length > 0 && (
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
          <div className={styles.legend} role="list" aria-label="Chart legend">
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
          </div>

          {/* Detail panel */}
          {selectedCategory && (
            <div
              className={styles.detailPanel}
              role="region"
              aria-label={`${(CATEGORY_CONFIG[selectedCategory] || {}).label ||
                selectedCategory} breakdown by project`}
            >
              <div className={styles.detailHeader}>
                <h4 className={styles.detailTitle}>
                  {(CATEGORY_CONFIG[selectedCategory] || {}).label || selectedCategory} by Project
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
            </div>
          )}
        </>
      )}
    </div>
  );
}
