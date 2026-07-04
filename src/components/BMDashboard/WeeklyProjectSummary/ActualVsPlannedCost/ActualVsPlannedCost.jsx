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
} from 'recharts';
import { Spinner } from 'reactstrap';
import { fetchBMProjects } from '../../../../actions/bmdashboard/projectActions';
import { ENDPOINTS } from '../../../../utils/URL';
import styles from './ActualVsPlannedCost.module.css';

function getBudgetStatus(variance) {
  if (variance > 0) return 'Over Budget';
  if (variance < 0) return 'Under Budget';
  return 'On Budget';
}

// Dynamic bar color: flash red when actual exceeds planned
function getActualBarColor(entry, darkMode) {
  if (entry.plannedCost > 0 && entry.actualCost > entry.plannedCost) {
    return '#dc2626'; // bright red for over-budget
  }
  return darkMode ? '#c0392b' : '#e74a3b';
}

function getVarianceCardClass(variance, cardStyles) {
  if (variance > 0) return cardStyles.varianceOverrun;
  if (variance < 0) return cardStyles.varianceUnder;
  return cardStyles.varianceNeutral;
}

function VarianceCard({ item, cardStyles }) {
  const isOverrun = item.variance > 0;
  const cardClass = getVarianceCardClass(item.variance, cardStyles);
  return (
    <div className={`${cardStyles.varianceCard} ${cardClass}`}>
      <div className={cardStyles.varianceCardCategory}>{item.category}</div>
      <div className={cardStyles.varianceCardRow}>
        <span>Planned:</span>
        <span>{item.plannedCost.toLocaleString()}</span>
      </div>
      <div className={cardStyles.varianceCardRow}>
        <span>Actual:</span>
        <span>{item.actualCost.toLocaleString()}</span>
      </div>
      <div className={cardStyles.varianceCardRow}>
        <span>Variance:</span>
        <span>
          {isOverrun ? '+' : ''}
          {item.variance.toLocaleString()}
        </span>
      </div>
      {item.variancePct !== null && (
        <div className={cardStyles.varianceCardPct}>
          {isOverrun ? '+' : ''}
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
    varianceCardPct: PropTypes.string,
    varianceCardStatus: PropTypes.string,
  }).isRequired,
};

function buildChartContent({ loading, isFiltering, hasData, chartDataWithVariance, darkMode }) {
  if (loading || isFiltering) {
    return (
      <div
        style={{
          display: 'flex',
          height: 200,
          justifyContent: 'center',
          alignItems: 'center',
          color: 'var(--text-color)',
        }}
      >
        <Spinner color="primary" size="sm" />
        <span style={{ marginLeft: '10px' }}>Updating chart...</span>
      </div>
    );
  }
  if (hasData) {
    return (
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartDataWithVariance}
            margin={{ top: 20, right: 5, left: 5, bottom: 0 }}
            barGap={20}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#e5e7eb' : '#e0e0e0'} />
            <XAxis
              dataKey="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-color)' }}
            />
            <YAxis tick={{ fill: 'var(--text-color)', fontSize: '12px' }} />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              allowEscapeViewBox={{ x: true, y: true }}
              contentStyle={{
                backgroundColor: darkMode ? '#1f242b' : 'var(--card-bg)',
                borderColor: darkMode ? '#45505e' : 'var(--button-hover)',
                borderRadius: '6px',
                color: 'var(--text-color)',
              }}
              labelStyle={{ color: 'var(--text-color)', fontSize: '12px' }}
              itemStyle={{ color: 'var(--text-color)', fontSize: '12px' }}
              wrapperStyle={{ pointerEvents: 'none', zIndex: 12 }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconSize={8}
              wrapperStyle={{ color: 'var(--text-color)' }}
            />
            <Bar
              dataKey="actualCost"
              name="Actual"
              fill={darkMode ? '#c0392b' : '#e74a3b'}
              barSize={40}
            >
              {chartDataWithVariance.map(entry => (
                <Cell
                  key={`actual-cell-${entry.category}`}
                  fill={getActualBarColor(entry, darkMode)}
                />
              ))}
              <LabelList dataKey="actualCost" position="top" fill="var(--text-color)" />
            </Bar>
            <Bar
              dataKey="plannedCost"
              name="Planned"
              fill={!darkMode ? '#17a272' : '#1cc88a'}
              barSize={40}
            >
              <LabelList dataKey="plannedCost" position="top" fill="var(--text-color)" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
  return (
    <div
      style={{
        display: 'flex',
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        color: 'var(--text-color)',
        fontStyle: 'italic',
      }}
    >
      No data available for the selected filters.
    </div>
  );
}

function ActualVsPlannedCost() {
  const dispatch = useDispatch();
  const projects = useSelector(state => state.bmProjects) || [];
  const darkMode = useSelector(state => state.theme.darkMode);

  // Persisted filters
  const [selectedProject, setSelectedProject] = useState(
    () => localStorage.getItem('bm_avsp_project') || '',
  );
  const [selectedCategory, setSelectedCategory] = useState(
    () => localStorage.getItem('bm_avsp_category') || 'Overall',
  );

  // Component state
  const [breakdown, setBreakdown] = useState([]);
  const [totals, setTotals] = useState({ actual: 0, planned: 0 });
  const [loading, setLoading] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  const selectedProjectName = useMemo(
    () => projects.find(p => p._id === selectedProject)?.name ?? '',
    [projects, selectedProject],
  );

  // Sync filters to local storage
  useEffect(() => {
    if (selectedProject) {
      localStorage.setItem('bm_avsp_project', selectedProject);
    }
    localStorage.setItem('bm_avsp_category', selectedCategory);
  }, [selectedProject, selectedCategory]);

  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  // Default to first project if none selected
  useEffect(() => {
    if (!selectedProject && projects.length > 0) {
      setSelectedProject(projects[0]._id);
    }
  }, [projects, selectedProject]);

  // Filter transition effect
  useEffect(() => {
    setIsFiltering(true);
    const timeout = setTimeout(() => {
      setIsFiltering(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [selectedProject, selectedCategory]);

  // Fetch project expenses
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

  // Derived chart data
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

  const totalVariance = totals.actual - totals.planned;
  const totalVariancePct = totals.planned > 0 ? (totalVariance / totals.planned) * 100 : null;
  const isTotalOverrun = totalVariance > 0;

  const chartContent = buildChartContent({
    loading,
    isFiltering,
    hasData,
    chartDataWithVariance,
    darkMode,
  });

  return (
    <div style={{ padding: 10 }} className={darkMode ? styles.darkMode : ''}>
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h2 style={{ fontSize: 'large', margin: '0 0 5px 0' }} className={styles.title}>
          Actual vs Planned Costs
        </h2>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-color)', fontWeight: 'bold' }}>
          Viewing: {filterSummary}
        </div>
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
            <h3 className={styles.varianceSummaryTitle}>Variance and Budget Indicators</h3>
            <div className={isTotalOverrun ? styles.totalOverrunBadge : styles.totalOnTrackBadge}>
              Total Variance: {isTotalOverrun ? '+' : ''}
              {totalVariance.toLocaleString()}
              {totalVariancePct !== null &&
                ` (${isTotalOverrun ? '+' : ''}${totalVariancePct.toFixed(1)}%)`}
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
