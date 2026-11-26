import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ENDPOINTS } from '../../../../utils/URL';
import styles from './ExpenditureChart.module.css';
import PropTypes from 'prop-types';

// Category → colour mapping (Labour=blue, Equipment=green, Materials=yellow)
const COLORS = ['#6777EF', '#A0CD61', '#F5CD4B'];
const CATEGORY_NAMES = ['Labor', 'Equipment', 'Materials'];

function normalizeData(data) {
  return CATEGORY_NAMES.map(cat => {
    const found = Array.isArray(data) ? data.find(d => d.category === cat) : undefined;
    return found || { category: cat, amount: 0 };
  });
}

/**
 * PieChartPanel — renders one pie (Actual or Planned).
 * Works as a standalone stacked card and as one half of the comparison layout.
 */
function PieChartPanel({ data, title, darkMode, compact }) {
  const normalizedData = normalizeData(data);
  const hasData = normalizedData.some(d => d.amount > 0);

  /**
   * Renders the slice percentage inside each pie slice. Category names are shown in the
   * legend, so the short label always fits inside the slice instead of touching its edges.
   */
  const labelRenderer = useCallback(
    ({ cx, cy, midAngle, outerRadius, percent }) => {
      // Very thin slices have no room for text; the tooltip still shows their value
      if (percent < 0.05) return null;

      const RADIAN = Math.PI / 180;
      const labelRadius = outerRadius * 0.6;
      const x = cx + labelRadius * Math.cos(-midAngle * RADIAN);
      const y = cy + labelRadius * Math.sin(-midAngle * RADIAN);

      return (
        <text
          x={x}
          y={y}
          fill={darkMode ? '#ffffff' : '#000000'}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fontWeight="600"
        >
          {`${(percent * 100).toFixed(1)}%`}
        </text>
      );
    },
    [darkMode],
  );

  // Inline styles for recharts elements that can't be controlled via CSS vars
  const legendStyle = {
    color: darkMode ? '#ffffff' : '#000000',
    fontSize: '12px',
    paddingTop: '8px',
  };

  const tooltipContentStyle = {
    backgroundColor: darkMode ? '#2b3e59' : '#ffffff',
    borderColor: darkMode ? '#4a5a77' : '#cccccc',
    borderRadius: '6px',
    fontSize: '12px',
  };

  const tooltipItemStyle = { color: darkMode ? '#ffffff' : '#333333' };
  const tooltipLabelStyle = { color: darkMode ? '#ffffff' : '#333333', fontWeight: 600 };

  return (
    <div className={`${styles['chart-pane']} ${compact ? styles['chart-pane--compact'] : ''}`}>
      <h4 className={styles['chart-pane__title']}>{title}</h4>

      {hasData ? (
        <div className={styles['chart-pane__container']}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={normalizedData}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius="72%"
                label={labelRenderer}
                labelLine={false}
                stroke="none"
              >
                {normalizedData.map((entry, index) => (
                  <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipContentStyle}
                itemStyle={tooltipItemStyle}
                labelStyle={tooltipLabelStyle}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={legendStyle}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        // <output> is the semantic element for role="status"; aria-live="polite" is implicit
        <output className={styles['chart-pane__empty']}>
          No expenditure data for this project
        </output>
      )}
    </div>
  );
}

PieChartPanel.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      category: PropTypes.string,
      amount: PropTypes.number,
    }),
  ),
  title: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
  compact: PropTypes.bool,
};

/**
 * ExpenditureChart — fetches /bm/expenditure/:projectId/pie once,
 * then renders:
 *   • pieType set  — single PieChartPanel (actual OR planned), no card wrapper
 *   • stacked      — two separate cards, each with one pie
 *   • comparison   — side-by-side on desktop, tab-switched on mobile (≤640 px)
 *
 * Props:
 *   projectId  (string)                       — selected project ObjectId
 *   viewMode   ('stacked'|'comparison')       — ignored when pieType is set
 *   pieType    ('actual'|'planned'|undefined) — when set, renders one pie only
 */
function ComparisonView({ actual, planned, darkMode, activeTab, setActiveTab }) {
  return (
    <div className={styles['expenditure-chart-comparison']}>
      <div
        className={styles['expenditure-chart-tab-bar']}
        role="tablist"
        aria-label="Select expenditure chart"
      >
        <button
          type="button"
          role="tab"
          id="expenditure-tab-actual"
          aria-selected={activeTab === 'actual'}
          aria-controls="expenditure-panel-actual"
          className={`${styles['expenditure-chart-tab']} ${
            activeTab === 'actual' ? styles['expenditure-chart-tab--active'] : ''
          }`}
          onClick={() => setActiveTab('actual')}
        >
          Actual
        </button>
        <button
          type="button"
          role="tab"
          id="expenditure-tab-planned"
          aria-selected={activeTab === 'planned'}
          aria-controls="expenditure-panel-planned"
          className={`${styles['expenditure-chart-tab']} ${
            activeTab === 'planned' ? styles['expenditure-chart-tab--active'] : ''
          }`}
          onClick={() => setActiveTab('planned')}
        >
          Planned
        </button>
      </div>
      <div className={styles['expenditure-chart-panes']}>
        <div
          id="expenditure-panel-actual"
          role="tabpanel"
          aria-labelledby="expenditure-tab-actual"
          className={`${styles['expenditure-chart-panel']} ${
            activeTab === 'actual' ? '' : styles['expenditure-chart-panel--hidden-mobile']
          }`}
        >
          <PieChartPanel data={actual} title="Actual Expenditure" darkMode={darkMode} compact />
        </div>
        <div
          id="expenditure-panel-planned"
          role="tabpanel"
          aria-labelledby="expenditure-tab-planned"
          className={`${styles['expenditure-chart-panel']} ${
            activeTab === 'planned' ? '' : styles['expenditure-chart-panel--hidden-mobile']
          }`}
        >
          <PieChartPanel data={planned} title="Planned Expenditure" darkMode={darkMode} compact />
        </div>
      </div>
    </div>
  );
}

ComparisonView.propTypes = {
  actual: PropTypes.array,
  planned: PropTypes.array,
  darkMode: PropTypes.bool,
  activeTab: PropTypes.string,
  setActiveTab: PropTypes.func,
};

function ExpenditureChart({ projectId, viewMode, pieType }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [actual, setActual] = useState([]);
  const [planned, setPlanned] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // activeTab controls which panel is shown on mobile in comparison mode
  const [activeTab, setActiveTab] = useState('actual');

  useEffect(() => {
    if (!projectId) return undefined;

    let cancelled = false;
    setLoading(true);
    setError(null);

    axios
      .get(ENDPOINTS.BM_EXPENDITURE_PIE(projectId))
      .then(({ data }) => {
        if (!cancelled) {
          setActual(Array.isArray(data.actual) ? data.actual : []);
          setPlanned(Array.isArray(data.planned) ? data.planned : []);
        }
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load expenditure data');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // ── Guard states ─────────────────────────────────────────────

  if (!projectId) {
    return (
      <div className={styles['expenditure-chart-empty']}>
        Select a project to view expenditure data
      </div>
    );
  }

  if (loading) {
    // <output> is the semantic element for role="status" (aria-live="polite" is implicit)
    return (
      <output className={styles['expenditure-chart-loading']}>
        <span className={styles['expenditure-chart-spinner']} aria-hidden="true" /> Loading
        expenditure data…
      </output>
    );
  }

  if (error) {
    return (
      <div className={styles['expenditure-chart-error']} role="alert">
        {error}
      </div>
    );
  }

  // ── Single-pie mode (used by SingleExpenditureCard) ──────────
  if (pieType) {
    const panelData = pieType === 'actual' ? actual : planned;
    const panelTitle = pieType === 'actual' ? 'Actual Expenditure' : 'Planned Expenditure';
    return <PieChartPanel data={panelData} title={panelTitle} darkMode={darkMode} />;
  }

  // ── Comparison mode ──────────────────────────────────────────
  if (viewMode === 'comparison') {
    return (
      <ComparisonView
        actual={actual}
        planned={planned}
        darkMode={darkMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    );
  }

  // ── Stacked mode (default) ───────────────────────────────────
  return (
    <div className={styles['expenditure-chart-wrapper']}>
      <div className={styles['expenditure-chart-card']}>
        <PieChartPanel data={actual} title="Actual Expenditure" darkMode={darkMode} />
      </div>
      <div className={styles['expenditure-chart-card']}>
        <PieChartPanel data={planned} title="Planned Expenditure" darkMode={darkMode} />
      </div>
    </div>
  );
}

ExpenditureChart.propTypes = {
  projectId: PropTypes.string.isRequired,
  viewMode: PropTypes.string,
  pieType: PropTypes.string,
};

export default ExpenditureChart;
