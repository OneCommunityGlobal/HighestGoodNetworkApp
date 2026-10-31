// v1.1.0
import React, { useState, useEffect, useMemo, useId } from 'react';
import { useSelector } from 'react-redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
  ReferenceArea,
  ReferenceLine,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import Select from 'react-select';
import { Container } from 'reactstrap';
import httpService from '../../../services/httpService';
import { METRICS, riskLevel, formatMetric, buildRiskRows } from './projectRisk';
import styles from './ProjectRiskProfileOverview.module.css';

const COLORS = {
  Low: '#23734b',
  Medium: '#916000',
  High: '#b93838',
  Unknown: '#64748b',
};
const DARK_COLORS = {
  Low: '#22c55e',
  Medium: '#e8a71c',
  High: '#ef4444',
  Unknown: '#94a3b8',
};

function RiskBadge({ level }) {
  return <span className={`${styles.badge} ${styles[level.toLowerCase()]}`}>{level}</span>;
}

export function RiskTooltip({ active, payload }) {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  return (
    <div className={styles.tooltip}>
      <strong>{row.projectName}</strong>
      <p>
        <RiskBadge level={row.level} />{' '}
        {row.score === null ? 'Score unavailable' : `${row.score}/100`}
      </p>
      {METRICS.map(metric => (
        <p key={metric.key}>
          {metric.label}: {formatMetric(metric.key, row[metric.key])}
        </p>
      ))}
      <p>{row.explanation}</p>
      <p>{row.comparison}</p>
      <p>
        <strong>Next action:</strong> {row.action}
      </p>
    </div>
  );
}

export default function ProjectRiskProfileOverview() {
  const darkMode = useSelector(state => Boolean(state?.theme?.darkMode));
  const id = useId();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [timeRange, setTimeRange] = useState('30');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [sort, setSort] = useState('risk');
  const [metricKey, setMetricKey] = useState('cost');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    httpService
      .get(`${process.env.REACT_APP_APIENDPOINT}/projects/risk-profile`, {
        signal: controller.signal,
        timeout: 30000,
      })
      .then(({ data }) => {
        const result = Array.isArray(data) ? data : [data];
        if (
          result.some(
            p =>
              !p ||
              typeof p !== 'object' ||
              Array.isArray(p) ||
              (p.projectName != null && typeof p.projectName !== 'string') ||
              (p.name != null && typeof p.name !== 'string'),
          )
        ) {
          throw new Error('Invalid risk profile response');
        }
        if (!cancelled) {
          setProjects(result);
          setSelectedProjects(result.map((p, index) => String(p.projectId || p._id || index)));
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [reload]);

  const today = new Date().toISOString().slice(0, 10);
  const end = timeRange === 'custom' ? customEnd : today;
  const start =
    timeRange === 'custom'
      ? customStart
      : new Date(Date.parse(today) - (Number(timeRange) - 1) * 86400000).toISOString().slice(0, 10);
  const validRange = Boolean(start && end && start <= end);
  const hasHistory = projects.some(p => Array.isArray(p.history) && p.history.length > 0);
  const rows = useMemo(() => {
    if (!validRange) return [];
    return buildRiskRows(projects, start, end)
      .filter(p => selectedProjects.includes(p.id))
      .sort((a, b) =>
        sort === 'name'
          ? a.projectName.localeCompare(b.projectName)
          : (b.score ?? -1) - (a.score ?? -1) || a.projectName.localeCompare(b.projectName),
      );
  }, [projects, start, end, validRange, selectedProjects, sort]);
  const metric = METRICS.find(m => m.key === metricKey);
  const colors = darkMode ? DARK_COLORS : COLORS;
  const textColor = darkMode ? '#fff' : '#334155';
  const options = projects.map((p, index) => ({
    value: String(p.projectId || p._id || index),
    label: p.projectName || p.name || 'Unknown project',
  }));
  const chartRows = rows.filter(row => row[metricKey] !== null);
  const chartMin = chartRows.reduce((min, row) => Math.min(min, row[metricKey]), 0);
  const chartMax = chartRows.reduce((max, row) => Math.max(max, row[metricKey]), 20);

  return (
    <Container fluid className="mt-5 pt-5 mb-5">
      <section
        className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}
        aria-labelledby={`${id}-title`}
      >
        <h2 id={`${id}-title`}>Project Risk Profile Overview</h2>
        <p>Prioritize projects by overall risk, then review the drivers and next action.</p>
        {loading && <p role="status">Loading project risk profiles...</p>}
        {error && (
          <div role="alert">
            <p>Failed to fetch project risk profile data.</p>
            <button type="button" onClick={() => setReload(value => value + 1)}>
              Retry
            </button>
          </div>
        )}
        {!loading && !error && (
          <>
            <div className={styles.filters}>
              <div className={styles.projectFilter}>
                <label htmlFor={`${id}-projects`}>Projects</label>
                <Select
                  inputId={`${id}-projects`}
                  isMulti
                  hideSelectedOptions={false}
                  closeMenuOnSelect={false}
                  aria-describedby={`${id}-project-help`}
                  options={options}
                  value={options.filter(p => selectedProjects.includes(p.value))}
                  onChange={values => setSelectedProjects((values || []).map(p => p.value))}
                  placeholder="Select projects"
                  className={styles.select}
                  styles={{
                    control: base => ({
                      ...base,
                      backgroundColor: 'var(--subtle)',
                      borderColor: 'var(--border)',
                    }),
                    menu: base => ({
                      ...base,
                      backgroundColor: 'var(--surface)',
                      zIndex: 5,
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor:
                        state.isFocused || state.isSelected
                          ? darkMode
                            ? '#3a506b'
                            : '#e2e8f0'
                          : 'transparent',
                      color: textColor,
                    }),
                    multiValue: base => ({
                      ...base,
                      backgroundColor: darkMode ? '#3a506b' : '#e2e8f0',
                    }),
                    multiValueLabel: base => ({ ...base, color: textColor }),
                    multiValueRemove: base => ({ ...base, color: textColor }),
                    input: base => ({ ...base, color: textColor }),
                    placeholder: base => ({ ...base, color: textColor }),
                  }}
                />
                <p id={`${id}-project-help`} className={styles.note}>
                  {selectedProjects.length} of {options.length} selected. Select a project in the
                  menu to include or exclude it.
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedProjects(options.map(p => p.value))}
                >
                  All projects
                </button>{' '}
                <button type="button" onClick={() => setSelectedProjects([])}>
                  Clear selection
                </button>
              </div>
              <div>
                <label htmlFor={`${id}-sort`}>Sort projects</label>
                <select id={`${id}-sort`} value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="risk">Highest risk first</option>
                  <option value="name">Project name</option>
                </select>
              </div>
              {hasHistory && (
                <div>
                  <label htmlFor={`${id}-period`}>History period</label>
                  <select
                    id={`${id}-period`}
                    value={timeRange}
                    onChange={e => setTimeRange(e.target.value)}
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              )}
              {hasHistory && timeRange === 'custom' && (
                <>
                  <div>
                    <label htmlFor={`${id}-start`}>Start date</label>
                    <input
                      id={`${id}-start`}
                      type="date"
                      value={customStart}
                      max={customEnd || today}
                      onChange={e => setCustomStart(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${id}-end`}>End date</label>
                    <input
                      id={`${id}-end`}
                      type="date"
                      value={customEnd}
                      min={customStart}
                      max={today}
                      onChange={e => setCustomEnd(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
            {!validRange && <p role="alert">Choose a start date on or before the end date.</p>}
            <p className={styles.note}>
              {hasHistory
                ? 'History uses the latest recorded observation in each period. Snapshot-only projects always show current values.'
                : 'Current snapshot. Previous-period changes and historical trends are unavailable because no recorded history is available.'}
            </p>
            <div className={styles.summary} aria-label="Risk summary">
              {['High', 'Medium', 'Low', 'Unknown'].map(level => (
                <div key={level}>
                  <RiskBadge level={level} />
                  <strong>{rows.filter(p => p.level === level).length}</strong>
                  <span>{level === 'Unknown' ? 'Incomplete data' : `${level} risk projects`}</span>
                </div>
              ))}
            </div>
            <details className={styles.method}>
              <summary>How risk is calculated</summary>
              <p>
                Default review thresholds: cost overrun and delay are Low below 5%, Medium from 5%
                to below 15%, and High at 15% or above. Issues are Low below 3, Medium from 3 to 9,
                and High at 10 or more.
              </p>
              <p>
                Score = 40% cost + 40% delay + 20% issues. Each input is scaled from 0 to 100 using
                its High threshold and capped at 100. Negative cost variance contributes zero risk.
                Overall: Low 0–29, Medium 30–59, High 60–100. Missing metrics make the score
                unavailable. A High individual metric still calls for escalation.
              </p>
              <p>
                Cost variance uses the reported forecast: negative means under budget. Delay is the
                amount above 100% of planned duration; elapsed time within the plan is not a delay.
                These are review guidelines, not a probability of project failure.
              </p>
              <p>
                When history is available, change compares the last observation in the selected
                period with the last in the preceding equal-length period. Percentage changes are in
                percentage points (pp).
              </p>
            </details>
            {rows.length === 0 ? (
              <p role="status" className={styles.empty}>
                No data available for the selected filters.
              </p>
            ) : (
              <>
                <div className={styles.chartHeader}>
                  <h3>Risk thresholds by project</h3>
                  <div>
                    <label htmlFor={`${id}-metric`}>Chart metric</label>
                    <select
                      id={`${id}-metric`}
                      value={metricKey}
                      onChange={e => setMetricKey(e.target.value)}
                    >
                      <option value="cost">Cost variance (%)</option>
                      <option value="delay">Time delay (%)</option>
                    </select>
                  </div>
                </div>
                <p className={styles.legend}>
                  <span>
                    <RiskBadge level="Low" /> &lt;5%
                  </span>
                  <span>
                    <RiskBadge level="Medium" /> 5–&lt;15%
                  </span>
                  <span>
                    <RiskBadge level="High" /> ≥15%
                  </span>
                </p>
                <p className={styles.note}>
                  Hover a bar for details. The table below provides the same information without
                  hovering. Missing metrics are omitted from the chart.
                </p>
                {metricKey === 'delay' &&
                  chartRows.length > 0 &&
                  chartRows.every(row => row.delay === 0) && (
                    <p role="status" className={styles.note}>
                      All selected projects with delay data report 0% delay. The markers sit on the
                      zero baseline.
                    </p>
                  )}
                {chartRows.length > 0 ? (
                  <div className={styles.chartScroll}>
                    <div
                      className={styles.chart}
                      style={{ minWidth: Math.max(300, chartRows.length * 100) }}
                    >
                      <ResponsiveContainer width="100%" height={340}>
                        <BarChart
                          data={chartRows}
                          margin={{ top: 24, right: 35, left: 5, bottom: 65 }}
                          accessibilityLayer
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke={darkMode ? '#4a5a77' : '#d5dce5'}
                          />
                          <XAxis
                            dataKey="projectName"
                            tick={{ fill: textColor, fontSize: 12 }}
                            angle={-25}
                            textAnchor="end"
                            interval={0}
                            height={70}
                            tickFormatter={name =>
                              name.length > 20 ? `${name.slice(0, 19)}…` : name
                            }
                          />
                          <YAxis
                            domain={[chartMin, chartMax]}
                            tick={{ fill: textColor }}
                            tickFormatter={value => `${value}%`}
                          />
                          <ReferenceArea
                            y1={chartMin}
                            y2={5}
                            fill={colors.Low}
                            fillOpacity={0.08}
                          />
                          <ReferenceArea y1={5} y2={15} fill={colors.Medium} fillOpacity={0.08} />
                          <ReferenceArea
                            y1={15}
                            y2={chartMax}
                            fill={colors.High}
                            fillOpacity={0.08}
                          />
                          <ReferenceLine y={0} stroke={textColor} />
                          <ReferenceLine
                            y={5}
                            stroke={colors.Medium}
                            strokeDasharray="4 4"
                            label={{
                              value: 'Medium 5%',
                              fill: textColor,
                              position: 'insideTopRight',
                            }}
                          />
                          <ReferenceLine
                            y={15}
                            stroke={colors.High}
                            strokeDasharray="4 4"
                            label={{
                              value: 'High 15%',
                              fill: textColor,
                              position: 'insideTopRight',
                            }}
                          />
                          <Tooltip
                            content={<RiskTooltip />}
                            cursor={{ fill: darkMode ? '#ffffff10' : '#00000008' }}
                          />
                          <Bar
                            dataKey={metricKey}
                            name={metric.label}
                            maxBarSize={48}
                            minPointSize={3}
                            isAnimationActive={false}
                          >
                            <LabelList
                              dataKey={metricKey}
                              position="top"
                              fill={textColor}
                              formatter={value => `${Number(value.toFixed(2))}%`}
                            />
                            {chartRows.map(row => (
                              <Cell
                                key={row.id}
                                fill={colors[riskLevel(row[metricKey], metric.medium, metric.high)]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <p className={styles.empty}>No {metric.label.toLowerCase()} data available.</p>
                )}
                {/* Keyboard users need to focus the region to scroll the wide table. */}
                {/* eslint-disable jsx-a11y/no-noninteractive-tabindex */}
                <div
                  className={styles.tableScroll}
                  tabIndex={0}
                  role="region"
                  aria-label="Project risk ranking, scroll horizontally for all columns"
                >
                  <table className={styles.table}>
                    <caption>
                      Project risk ranking · {rows.length} projects ·{' '}
                      {sort === 'risk'
                        ? 'highest risk first; incomplete data last'
                        : 'project name order'}
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Project</th>
                        <th scope="col">Overall risk</th>
                        {METRICS.map(m => (
                          <th scope="col" key={m.key}>
                            {m.label}
                          </th>
                        ))}
                        <th scope="col">Risk explanation and next action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(row => (
                        <tr key={row.id}>
                          <th scope="row">
                            {row.projectName}
                            <small>
                              {row.snapshotOnly ? 'Current snapshot' : `As of ${row.date}`}
                            </small>
                          </th>
                          <td>
                            <RiskBadge level={row.level} />
                            <strong className={styles.score}>
                              {row.score === null ? 'Unavailable' : `${row.score}/100`}
                            </strong>
                          </td>
                          {METRICS.map(m => (
                            <td key={m.key}>
                              <span>{formatMetric(m.key, row[m.key])}</span>
                              <RiskBadge level={riskLevel(row[m.key], m.medium, m.high)} />
                            </td>
                          ))}
                          <td className={styles.explanation}>
                            <p>{row.explanation}</p>
                            <p>
                              <strong>Next action:</strong> {row.action}
                            </p>
                            <p>{row.comparison}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* eslint-enable jsx-a11y/no-noninteractive-tabindex */}
                {rows.length === 1 && rows[0].history.length > 1 && (
                  <div className={styles.history}>
                    <h3>
                      Recorded {metric.label.toLowerCase()} trend · {rows[0].projectName}
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={rows[0].history} margin={{ right: 25 }}>
                        <XAxis dataKey="date" tick={{ fill: textColor, fontSize: 11 }} />
                        <YAxis tick={{ fill: textColor }} tickFormatter={value => `${value}%`} />
                        <Tooltip
                          contentStyle={{
                            background: darkMode ? '#2b3e59' : '#fff',
                            color: textColor,
                          }}
                          formatter={value => formatMetric(metricKey, value)}
                        />
                        <ReferenceLine y={5} stroke={colors.Medium} strokeDasharray="4 4" />
                        <ReferenceLine y={15} stroke={colors.High} strokeDasharray="4 4" />
                        <Line
                          dataKey={metricKey}
                          name={metric.label}
                          stroke={darkMode ? '#93c5fd' : '#2563eb'}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>
    </Container>
  );
}
