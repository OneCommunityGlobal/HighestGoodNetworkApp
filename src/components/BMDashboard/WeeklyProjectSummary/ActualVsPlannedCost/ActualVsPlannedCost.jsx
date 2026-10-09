import { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LabelList,
  Cell,
  Label,
} from 'recharts';
import { Spinner } from 'reactstrap';
import { fetchBMProjects } from '../../../../actions/bmdashboard/projectActions';
import { ENDPOINTS } from '../../../../utils/URL';
import styles from './ActualVsPlannedCost.module.css';

const PLANNED_BAR_COLOR = '#3b82f6';
const OVER_BUDGET_COLOR = '#ef4444';
const UNDER_BUDGET_COLOR = '#22c55e';

function formatCurrency(value) {
  const numericValue = Number(value) || 0;
  return `$${numericValue.toLocaleString()}`;
}

function getBudgetStatus(variance) {
  if (variance > 0) return 'Over Budget';
  if (variance < 0) return 'Under Budget';
  return 'On Budget';
}

function getActualBarColor(entry) {
  return entry.actualCost > entry.plannedCost ? OVER_BUDGET_COLOR : UNDER_BUDGET_COLOR;
}

function getVarianceCardClass(variance, cardStyles) {
  if (variance > 0) return cardStyles.varianceOverrun;
  if (variance < 0) return cardStyles.varianceUnder;
  return cardStyles.varianceNeutral;
}

function getVariancePrefix(variance) {
  if (variance > 0) return '+';
  if (variance < 0) return '-';
  return '';
}

function getVarianceValueClass(variance, cardStyles) {
  if (variance > 0) return cardStyles.varianceValueOverrun;
  if (variance < 0) return cardStyles.varianceValueUnder;
  return cardStyles.varianceValueNeutral;
}

function getVarianceLabelColor(variance, darkMode) {
  if (variance > 0) return darkMode ? '#fca5a5' : OVER_BUDGET_COLOR;
  if (variance < 0) return darkMode ? '#86efac' : '#15803d';
  return darkMode ? '#e2e8f0' : '#334155';
}

function VarianceCard({ item, cardStyles }) {
  const variancePrefix = getVariancePrefix(item.variance);
  const absoluteVariance = Math.abs(item.variance);

  return (
    <div
      className={`${cardStyles.varianceCard} ${getVarianceCardClass(item.variance, cardStyles)}`}
    >
      <div className={cardStyles.varianceCardCategory}>{item.category}</div>

      <div className={cardStyles.varianceCardRow}>
        <span>Planned:</span>
        <span>{formatCurrency(item.plannedCost)}</span>
      </div>

      <div className={cardStyles.varianceCardRow}>
        <span>Actual:</span>
        <span>{formatCurrency(item.actualCost)}</span>
      </div>

      <div className={cardStyles.varianceCardHighlight}>
        <span className={cardStyles.varianceCardHighlightLabel}>Variance</span>
        <span className={getVarianceValueClass(item.variance, cardStyles)}>
          {variancePrefix}
          {formatCurrency(absoluteVariance)}
        </span>
      </div>

      {item.variancePct !== null && (
        <div className={cardStyles.varianceCardPct}>
          {item.variancePct > 0 ? '+' : ''}
          {item.variancePct.toFixed(1)}%
        </div>
      )}

      <div className={cardStyles.varianceCardStatus}>{item.budgetStatus}</div>
    </div>
  );
}

VarianceCard.propTypes = {
  item: PropTypes.shape({
    category: PropTypes.string.isRequired,
    plannedCost: PropTypes.number.isRequired,
    actualCost: PropTypes.number.isRequired,
    variance: PropTypes.number.isRequired,
    variancePct: PropTypes.number,
    budgetStatus: PropTypes.string.isRequired,
  }).isRequired,
  cardStyles: PropTypes.shape({
    varianceCard: PropTypes.string,
    varianceOverrun: PropTypes.string,
    varianceUnder: PropTypes.string,
    varianceNeutral: PropTypes.string,
    varianceCardCategory: PropTypes.string,
    varianceCardRow: PropTypes.string,
    varianceCardHighlight: PropTypes.string,
    varianceCardHighlightLabel: PropTypes.string,
    varianceValueOverrun: PropTypes.string,
    varianceValueUnder: PropTypes.string,
    varianceValueNeutral: PropTypes.string,
    varianceCardPct: PropTypes.string,
    varianceCardStatus: PropTypes.string,
  }).isRequired,
};

function VarianceTooltip({ active, payload, darkMode }) {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload;
  if (!item) return null;

  const variancePrefix = getVariancePrefix(item.variance);
  const absoluteVariance = Math.abs(item.variance);
  const variancePctPrefix = item.variancePct > 0 ? '+' : '';

  return (
    <div className={`${styles.customTooltip} ${darkMode ? styles.customTooltipDark : ''}`}>
      <div className={styles.tooltipTitle}>{item.category}</div>

      <div className={styles.tooltipRow}>
        <span>Planned:</span>
        <strong>{formatCurrency(item.plannedCost)}</strong>
      </div>

      <div className={styles.tooltipRow}>
        <span>Actual:</span>
        <strong>{formatCurrency(item.actualCost)}</strong>
      </div>

      <div className={styles.tooltipDivider} />

      <div className={styles.tooltipRow}>
        <span>Variance:</span>
        <strong>
          {variancePrefix}
          {formatCurrency(absoluteVariance)}
        </strong>
      </div>

      {item.variancePct !== null && (
        <div className={styles.tooltipRow}>
          <span>Variance %:</span>
          <strong>
            {variancePctPrefix}
            {item.variancePct.toFixed(1)}%
          </strong>
        </div>
      )}

      <div className={styles.tooltipStatus}>{item.budgetStatus}</div>
    </div>
  );
}

VarianceTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.shape({})),
  darkMode: PropTypes.bool.isRequired,
};

VarianceTooltip.defaultProps = {
  active: false,
  payload: [],
};

function PlannedValueLabel({ x, y, width, value, darkMode }) {
  if (value === undefined || value === null) return null;

  return (
    <text
      x={x + width / 2}
      y={y - 8}
      textAnchor="middle"
      fill={darkMode ? '#e2e8f0' : '#334155'}
      fontSize="11"
      fontWeight="600"
    >
      {formatCurrency(value)}
    </text>
  );
}

PlannedValueLabel.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  value: PropTypes.number,
  darkMode: PropTypes.bool.isRequired,
};

PlannedValueLabel.defaultProps = {
  x: 0,
  y: 0,
  width: 0,
  value: null,
};

function ActualVarianceLabel({ x, y, width, item, darkMode }) {
  if (!item) return null;

  const variance = Number(item.variance) || 0;
  const variancePct = item.variancePct;
  const prefix = getVariancePrefix(variance);
  const pctPrefix = variancePct > 0 ? '+' : '';
  const labelColor = getVarianceLabelColor(variance, darkMode);

  return (
    <g>
      <text
        x={x + width / 2}
        y={y - 20}
        textAnchor="middle"
        fill={labelColor}
        fontSize="11"
        fontWeight="700"
      >
        {prefix}
        {formatCurrency(Math.abs(variance))}
      </text>

      {variancePct !== null && (
        <text
          x={x + width / 2}
          y={y - 7}
          textAnchor="middle"
          fill={labelColor}
          fontSize="10"
          fontWeight="600"
        >
          {pctPrefix}
          {variancePct.toFixed(1)}%
        </text>
      )}
    </g>
  );
}

ActualVarianceLabel.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  width: PropTypes.number,
  item: PropTypes.shape({
    variance: PropTypes.number,
    variancePct: PropTypes.number,
  }),
  darkMode: PropTypes.bool.isRequired,
};

ActualVarianceLabel.defaultProps = {
  x: 0,
  y: 0,
  width: 0,
  item: null,
};

function buildChartContent({ loading, isFiltering, hasData, chartDataWithVariance, darkMode }) {
  if (loading || isFiltering) {
    return (
      <div className={styles.chartState}>
        <Spinner color="primary" size="sm" />
        <span>Updating chart...</span>
      </div>
    );
  }

  if (hasData) {
    return (
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartDataWithVariance}
            margin={{ top: 46, right: 16, left: 40, bottom: 8 }}
            barGap={32}
            barCategoryGap="32%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#aab4c2' : '#e0e0e0'} />

            <XAxis
              dataKey="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: darkMode ? '#e2e8f0' : '#334155', fontSize: 12 }}
            />

            <YAxis
              tick={{ fill: darkMode ? '#e2e8f0' : '#334155', fontSize: 12 }}
              tickFormatter={formatCurrency}
              width={100}
            >
              <Label
                value="Cost ($)"
                angle={-90}
                position="insideLeft"
                offset={10}
                style={{
                  fill: darkMode ? '#f8fafc' : '#334155',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              />
            </YAxis>

            <Tooltip
              cursor={{ fill: 'transparent' }}
              allowEscapeViewBox={{ x: true, y: true }}
              content={<VarianceTooltip darkMode={darkMode} />}
              wrapperStyle={{ pointerEvents: 'none', zIndex: 12 }}
            />

            <Legend
              verticalAlign="top"
              height={36}
              iconSize={8}
              formatter={value => (
                <span style={{ color: darkMode ? '#f8fafc' : '#334155', fontWeight: 600 }}>
                  {value}
                </span>
              )}
            />

            <Bar dataKey="plannedCost" name="Planned" fill={PLANNED_BAR_COLOR} maxBarSize={30}>
              <LabelList
                dataKey="plannedCost"
                content={<PlannedValueLabel darkMode={darkMode} />}
              />
            </Bar>

            <Bar dataKey="actualCost" name="Actual" fill={UNDER_BUDGET_COLOR} maxBarSize={30}>
              {chartDataWithVariance.map(entry => (
                <Cell key={`actual-cell-${entry.category}`} fill={getActualBarColor(entry)} />
              ))}
              <LabelList
                dataKey="actualCost"
                content={labelProps => (
                  <ActualVarianceLabel
                    {...labelProps}
                    item={chartDataWithVariance[labelProps.index]}
                    darkMode={darkMode}
                  />
                )}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return <div className={styles.chartState}>No data available for the selected filters.</div>;
}

function ActualVsPlannedCost() {
  const dispatch = useDispatch();
  const projects = useSelector(state => state.bmProjects) || [];
  const darkMode = useSelector(state => state.theme.darkMode);

  const [selectedProject, setSelectedProject] = useState(
    () => localStorage.getItem('bm_avsp_project') || '',
  );
  const [selectedCategory, setSelectedCategory] = useState(
    () => localStorage.getItem('bm_avsp_category') || 'Overall',
  );

  const [breakdown, setBreakdown] = useState([]);
  const [totals, setTotals] = useState({ actual: 0, planned: 0 });
  const [loading, setLoading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  const selectedProjectName = useMemo(
    () => projects.find(p => p._id === selectedProject)?.name ?? '',
    [projects, selectedProject],
  );

  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem('bm_avsp_project', selectedProject);
    }
    localStorage.setItem('bm_avsp_category', selectedCategory);
  }, [selectedProject, selectedCategory]);

  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  useEffect(() => {
    if (!selectedProject && projects.length > 0) {
      setSelectedProject(projects[0]._id);
    }
  }, [projects, selectedProject]);

  useEffect(() => {
    setIsFiltering(true);
    const timeout = setTimeout(() => {
      setIsFiltering(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, [selectedProject, selectedCategory]);

  useEffect(() => {
    if (selectedProject) {
      setLoading(true);

      axios
        .get(ENDPOINTS.BM_PROJECT_EXPENSE_BY_ID(selectedProject))
        .then(({ data }) => {
          setTotals({
            actual: Math.round(data.totalActualCost),
            planned: Math.round(data.totalPlannedCost),
          });

          setBreakdown(
            data.breakdown.map(item => ({
              category: item.category,
              actualCost: Math.round(item.actualCost),
              plannedCost: Math.round(item.plannedCost),
            })),
          );
        })
        .catch(() => {
          setTotals({ actual: 0, planned: 0 });
          setBreakdown([]);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedProject]);

  const categories = ['Overall', ...new Set(breakdown.map(d => d.category))];

  const chartData =
    selectedCategory === 'Overall'
      ? [{ category: 'Overall', actualCost: totals.actual, plannedCost: totals.planned }]
      : breakdown.filter(d => d.category === selectedCategory);

  const filterSummary = `${selectedProjectName || 'Loading...'} - ${selectedCategory}`;

  const chartDataWithVariance = chartData.map(item => {
    const variance = item.actualCost - item.plannedCost;

    return {
      ...item,
      variance,
      variancePct: item.plannedCost > 0 ? (variance / item.plannedCost) * 100 : null,
      budgetStatus: getBudgetStatus(variance),
    };
  });

  const hasData =
    chartDataWithVariance.length > 0 &&
    !(
      chartDataWithVariance.length === 1 &&
      chartDataWithVariance[0].actualCost === 0 &&
      chartDataWithVariance[0].plannedCost === 0
    );

  const displayedPlanned = chartDataWithVariance.reduce((sum, d) => sum + d.plannedCost, 0);
  const displayedActual = chartDataWithVariance.reduce((sum, d) => sum + d.actualCost, 0);
  const totalVariance = displayedActual - displayedPlanned;
  const totalVariancePct = displayedPlanned > 0 ? (totalVariance / displayedPlanned) * 100 : null;
  const isTotalOverrun = totalVariance > 0;
  const totalVariancePrefix = getVariancePrefix(totalVariance);

  const chartContent = buildChartContent({
    loading,
    isFiltering,
    hasData,
    chartDataWithVariance,
    darkMode,
  });

  return (
    <div className={`${styles.componentContainer} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Planned vs Actual Cost</h2>
        <p className={styles.subtitle}>
          Compare planned project expenditure with actual spending and identify cost variance.
        </p>
        <div className={styles.filterSummary}>Viewing: {filterSummary}</div>
      </div>

      <div className={styles.selectorsContainer}>
        <div className={styles.selectorGroup}>
          <label htmlFor="ActualVsPlannedCost-project-select">Project:</label>
          <select
            id="ActualVsPlannedCost-project-select"
            value={selectedProject}
            onChange={e => {
              setSelectedProject(e.target.value);
              setSelectedCategory('Overall');
            }}
          >
            {projects.map(p => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.selectorGroup}>
          <label htmlFor="ActualVsPlannedCost-category-select">Category:</label>
          <select
            id="ActualVsPlannedCost-category-select"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {chartContent}

      {!loading && !isFiltering && hasData && (
        <div className={styles.varianceSummaryContainer}>
          <div className={styles.varianceSummaryHeader}>
            <h3 className={styles.varianceSummaryTitle}>Cost Variance Summary</h3>

            <div className={isTotalOverrun ? styles.totalOverrunBadge : styles.totalOnTrackBadge}>
              {selectedCategory === 'Overall' ? 'Total Variance' : `${selectedCategory} Variance`}:{' '}
              {totalVariancePrefix}
              {formatCurrency(Math.abs(totalVariance))}
              {totalVariancePct !== null &&
                ` (${totalVariancePct > 0 ? '+' : ''}${totalVariancePct.toFixed(1)}%)`}
            </div>
          </div>

          <div className={styles.varianceCardsRow}>
            {chartDataWithVariance.map(item => (
              <VarianceCard key={item.category} item={item} cardStyles={styles} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ActualVsPlannedCost;
