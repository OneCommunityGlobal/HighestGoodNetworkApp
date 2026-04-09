import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ENDPOINTS } from '../../../../utils/URL';
import { getProjectExpenditure } from './mockExpenditureData';
import PropTypes from 'prop-types';
import styles from './ExpenditureChart.module.css';
import { getTooltipStyles } from '../../../../utils/bmChartStyles';

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
   * Renders a label inside each pie slice.
   * - Color: white in dark mode, black in light mode.
   * - Single line when the chord width allows ≥ 8 px font.
   * - Two lines (name / percentage) otherwise, each independently sized to
   *   fit within the chord so text never overflows the slice.
   */
  const labelRenderer = useCallback(
    ({ cx, cy, midAngle, outerRadius, percent, name }) => {
      if (percent === 0) return null;

      const RADIAN = Math.PI / 180;
      const labelRadius = outerRadius * 0.65;
      const x = cx + labelRadius * Math.cos(-midAngle * RADIAN);
      const y = cy + labelRadius * Math.sin(-midAngle * RADIAN);

      const fill = darkMode ? '#ffffff' : '#000000';
      const percentLabel = `${(percent * 100).toFixed(1)}%`;
      const fullLabel = `${name}: ${percentLabel}`;

      // ── Available horizontal width at the label position ──────────────
      //
      // Constraint 1 — circle boundary:
      //   The pie circle limits how far text can extend left/right at the
      //   label's y-position. For a label near the left/right edge of the
      //   pie (e.g. large slices whose mid-angle points sideways), this is
      //   the binding constraint that the simple arc-chord formula misses.
      const dy = y - cy;
      const pieHalfWidth = Math.sqrt(Math.max(0, outerRadius * outerRadius - dy * dy));
      const circleAvailableWidth = Math.max(0, 2 * (pieHalfWidth - Math.abs(x - cx)));

      // Constraint 2 — angular chord:
      //   Prevents text from bleeding into adjacent slices. The chord at
      //   labelRadius is a conservative approximation; it over-constrains
      //   left/right-oriented slices but that only makes the font slightly
      //   smaller, which is a safe trade-off.
      const sliceAngle = percent * 2 * Math.PI;
      const angularChord = 2 * labelRadius * Math.sin(sliceAngle / 2);

      // The tighter of the two constraints is the actual available width.
      const availableWidth = Math.min(circleAvailableWidth, angularChord);

      // ── Choose single-line or two-line rendering ──────────────────────
      // Avg character width ≈ 0.58× font-size for mixed alphanumeric text.
      const AVG_CHAR_RATIO = 0.58;
      const singleLineFontSize = availableWidth / (fullLabel.length * AVG_CHAR_RATIO);

      if (singleLineFontSize >= 8) {
        return (
          <text
            x={x}
            y={y}
            fill={fill}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={Math.min(11, singleLineFontSize)}
            fontWeight="600"
          >
            {fullLabel}
          </text>
        );
      }

      // Two-line fallback: name on top, percentage on bottom.
      // Size to the longer string so both lines stay within availableWidth.
      const longerLen = Math.max(name.length, percentLabel.length);
      const twoLineFontSize = Math.max(
        7,
        Math.min(11, availableWidth / (longerLen * AVG_CHAR_RATIO)),
      );
      const lineSpacing = twoLineFontSize * 1.3;

      // If the minimum legible font (7 px) still can't fit the longer line,
      // suppress the label entirely rather than rendering unreadable overflow.
      if (availableWidth < longerLen * AVG_CHAR_RATIO * 7) return null;

      return (
        <text
          x={x}
          y={y}
          fill={fill}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={twoLineFontSize}
          fontWeight="600"
        >
          <tspan x={x} dy={-lineSpacing / 2}>
            {name}
          </tspan>
          <tspan x={x} dy={lineSpacing}>
            {percentLabel}
          </tspan>
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
function ExpenditureChart({ projectId, viewMode, pieType }) {
  const darkMode = useSelector(state => state.theme.darkMode);

function ExpenditureChart({ projectId }) {
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
        <span className={styles['expenditure-chart-spinner']} aria-hidden="true" />
        Loading expenditure data…
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
      <div className={styles['expenditure-chart-comparison']}>
        {/*
          Tab bar — hidden via CSS on desktop (>640 px),
          visible on mobile to switch between the two panels.
        */}
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

        {/* Side-by-side row (desktop) / single visible panel (mobile) */}
        <div className={styles['expenditure-chart-panes']}>
          <div
            id="expenditure-panel-actual"
            role="tabpanel"
            aria-labelledby="expenditure-tab-actual"
            className={`${styles['expenditure-chart-panel']} ${
              activeTab !== 'actual' ? styles['expenditure-chart-panel--hidden-mobile'] : ''
            }`}
          >
            <PieChartPanel data={actual} title="Actual Expenditure" darkMode={darkMode} compact />
          </div>

          <div
            id="expenditure-panel-planned"
            role="tabpanel"
            aria-labelledby="expenditure-tab-planned"
            className={`${styles['expenditure-chart-panel']} ${
              activeTab !== 'planned' ? styles['expenditure-chart-panel--hidden-mobile'] : ''
            }`}
          >
            <PieChartPanel data={planned} title="Planned Expenditure" darkMode={darkMode} compact />
          </div>
        </div>
      </div>
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
};

export default ExpenditureChart;
