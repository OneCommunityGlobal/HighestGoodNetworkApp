import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { fetchSupplierProjects, fetchSupplierPerformance } from '../../../actions/summaryDashboard';
import {
  DEFAULT_SETTINGS,
  STATUS_COLORS,
  DATE_RANGE_OPTIONS,
  getDateRange,
  normalizeSettings,
  prepareSupplierRows,
  summarizeSuppliers,
  formatDifference,
  toProjectOption,
} from './supplierPerformanceUtils';
import styles from './SupplierPerformancePage.module.css';

const LOAD_ERROR = 'Could not load supplier performance data.';

function SupplierTooltip({ active, payload, target }) {
  if (active && payload && payload.length) {
    const row = payload[0].payload;
    return (
      <div className={styles.tooltip}>
        <div className={styles.tooltipTitle}>{row.supplierName}</div>
        <div>On-time delivery: {row.percentage}%</div>
        <div className={styles.tooltipDiff} style={{ color: row.color }}>
          {formatDifference(row.difference)}
        </div>
        {row.deliveries === null ? null : <div>Deliveries: {row.deliveries}</div>}
        <div className={styles.tooltipMuted}>Target: {target}%</div>
      </div>
    );
  }
  return null;
}

SupplierTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.object),
  target: PropTypes.number,
};

SupplierTooltip.defaultProps = {
  active: false,
  payload: [],
  target: DEFAULT_SETTINGS.target,
};

export default function SupplierPerformancePage() {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);

  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [targetInput, setTargetInput] = useState(String(DEFAULT_SETTINGS.target));
  const [minimumInput, setMinimumInput] = useState(String(DEFAULT_SETTINGS.minimum));
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.resolve(dispatch(fetchSupplierProjects()))
      .then(data => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        setProjects(list.map(toProjectOption).filter(Boolean));
      })
      .catch(() => {
        if (cancelled === false) setProjects([]);
      });
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;
    const { startDate, endDate } = getDateRange(dateRange);
    setLoading(true);
    setError('');
    Promise.resolve(dispatch(fetchSupplierPerformance({ projectId, startDate, endDate })))
      .then(data => {
        if (cancelled) return;
        if (Array.isArray(data)) {
          setRawData(data);
        } else {
          setRawData([]);
          setError(LOAD_ERROR);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setRawData([]);
        setError(LOAD_ERROR);
      })
      .finally(() => {
        if (cancelled === false) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dispatch, projectId, dateRange]);

  const settings = useMemo(
    () => normalizeSettings({ target: Number(targetInput), minimum: Number(minimumInput) }),
    [targetInput, minimumInput],
  );
  const settingsError =
    Number(minimumInput) > Number(targetInput)
      ? 'The minimum acceptable % must be at or below the target.'
      : '';
  const rows = useMemo(() => prepareSupplierRows(rawData, settings), [rawData, settings]);
  const summary = useMemo(() => summarizeSuppliers(rows, settings), [rows, settings]);

  const resetTargets = () => {
    setTargetInput(String(DEFAULT_SETTINGS.target));
    setMinimumInput(String(DEFAULT_SETTINGS.minimum));
  };

  const axisColor = darkMode ? '#cbd5e1' : '#374151';
  const gridColor = darkMode ? 'rgb(255 255 255 / 12%)' : 'rgb(0 0 0 / 10%)';
  const targetLineColor = darkMode ? '#e5e7eb' : '#111827';
  const chartHeight = Math.max(280, rows.length * 40 + 70);
  const showChart = loading === false && error === '' && rows.length > 0;

  return (
    <div className={`${styles.page} ${darkMode ? styles.dark : ''}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>Supplier Performance by On-Time Delivery %</h1>
        <p className={styles.subtitle}>
          Compare each supplier with your on-time delivery target and spot the ones that need
          attention.
        </p>
      </header>

      <div className={styles.controls}>
        <label className={styles.field} htmlFor="sp-project">
          <span>Project</span>
          <select id="sp-project" value={projectId} onChange={e => setProjectId(e.target.value)}>
            <option value="all">All projects</option>
            {projects.map(project => (
              <option key={project.value} value={project.value}>
                {project.label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field} htmlFor="sp-date-range">
          <span>Date range</span>
          <select id="sp-date-range" value={dateRange} onChange={e => setDateRange(e.target.value)}>
            {DATE_RANGE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field} htmlFor="sp-target">
          <span>Target (%)</span>
          <input
            id="sp-target"
            type="number"
            min="1"
            max="100"
            step="1"
            value={targetInput}
            onChange={e => setTargetInput(e.target.value)}
          />
        </label>
        <label className={styles.field} htmlFor="sp-minimum">
          <span>Minimum acceptable (%)</span>
          <input
            id="sp-minimum"
            type="number"
            min="0"
            max="100"
            step="1"
            value={minimumInput}
            onChange={e => setMinimumInput(e.target.value)}
          />
        </label>
        <button type="button" className={styles.resetButton} onClick={resetTargets}>
          Reset targets
        </button>
      </div>
      {settingsError && (
        <p className={styles.settingsError} role="alert">
          {settingsError}
        </p>
      )}

      {loading && <p className={styles.message}>Loading supplier performance…</p>}
      {loading === false && error && (
        <p className={styles.errorMessage} role="alert">
          {error}
        </p>
      )}
      {loading === false && error === '' && rows.length === 0 && (
        <p className={styles.message}>No supplier data for the selected filters.</p>
      )}

      {showChart && (
        <>
          <section className={styles.summary} aria-label="Supplier performance summary">
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Above target</span>
              <span className={`${styles.summaryValue} ${styles.good}`}>{summary.aboveTarget}</span>
              <span className={styles.summaryHint}>of {summary.total} suppliers</span>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Below target</span>
              <span className={`${styles.summaryValue} ${styles.bad}`}>{summary.belowTarget}</span>
              <span className={styles.summaryHint}>of {summary.total} suppliers</span>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Best performer</span>
              <span className={styles.summaryName}>{summary.best.supplierName}</span>
              <span className={styles.summaryHint}>{summary.best.percentage}% on time</span>
            </div>
            <div className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Needs attention</span>
              <span className={styles.summaryName}>{summary.worst.supplierName}</span>
              <span className={styles.summaryHint}>{summary.worst.percentage}% on time</span>
            </div>
          </section>

          <ul className={styles.legend}>
            <li className={styles.legendItem}>
              <span className={styles.swatch} style={{ background: STATUS_COLORS.above }} />
              At or above target (≥ {settings.target}%)
            </li>
            <li className={styles.legendItem}>
              <span className={styles.swatch} style={{ background: STATUS_COLORS.warning }} />
              Warning ({settings.minimum}–{settings.target}%)
            </li>
            <li className={styles.legendItem}>
              <span className={styles.swatch} style={{ background: STATUS_COLORS.below }} />
              Below minimum (&lt; {settings.minimum}%)
            </li>
          </ul>

          <div className={styles.chartCard}>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart
                data={rows}
                layout="vertical"
                margin={{ top: 28, right: 32, left: 8, bottom: 8 }}
              >
                <CartesianGrid stroke={gridColor} horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={value => `${value}%`}
                  tick={{ fill: axisColor, fontSize: 12 }}
                />
                <YAxis
                  type="category"
                  dataKey="supplierName"
                  width={160}
                  tick={{ fill: axisColor, fontSize: 12 }}
                />
                <Tooltip
                  content={<SupplierTooltip target={settings.target} />}
                  cursor={{ fill: gridColor }}
                />
                <ReferenceLine
                  x={settings.minimum}
                  stroke={STATUS_COLORS.below}
                  strokeDasharray="4 4"
                  label={{
                    value: `Min ${settings.minimum}%`,
                    position: 'top',
                    fill: axisColor,
                    fontSize: 11,
                  }}
                />
                <ReferenceLine
                  x={settings.target}
                  stroke={targetLineColor}
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  label={{
                    value: `Target ${settings.target}%`,
                    position: 'top',
                    fill: axisColor,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />
                <Bar dataKey="percentage" radius={[0, 4, 4, 0]} maxBarSize={28}>
                  {rows.map(row => (
                    <Cell key={row.key} fill={row.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
