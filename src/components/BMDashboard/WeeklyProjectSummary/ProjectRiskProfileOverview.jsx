import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
} from 'recharts';
import Select from 'react-select';
import { Container } from 'reactstrap';
import httpService from '../../../services/httpService';
import styles from './ProjectRiskProfileOverview.module.css';

function formatDateISO(d) {
  return d.toISOString().slice(0, 10);
}

const toNullableNumber = value =>
  value === null || value === undefined || value === '' ? null : Number(value);

function niceStep(rawStep) {
  if (!(rawStep > 0)) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const residual = rawStep / magnitude;
  let nice = 10;
  if (residual <= 1) nice = 1;
  else if (residual <= 2) nice = 2;
  else if (residual <= 2.5) nice = 2.5;
  else if (residual <= 5) nice = 5;
  return nice * magnitude;
}

function buildTicks(lo, hi, step) {
  const ticks = [];
  for (let t = lo; t <= hi + step / 1e6; t += step) ticks.push(Number(t.toFixed(6)));
  return ticks;
}

// Percent values and issue counts live on very different scales, so Issues get
// their own axis. Both axes share the same zero line so all bars grow from it.
function computeAlignedScales(percentValues, issueValues) {
  const pctMin = Math.min(0, ...percentValues);
  const pctMax = Math.max(0, ...percentValues);
  const pctStep = niceStep((pctMax - pctMin) / 5);
  const pctLo = Math.floor(pctMin / pctStep) * pctStep;
  const pctHi = Math.max(pctStep, Math.ceil(pctMax / pctStep) * pctStep);

  const issuesMax = Math.max(0, ...issueValues);
  const issuesStep = Math.max(1, Math.ceil(niceStep(issuesMax / 5)));
  const issuesHi = Math.max(issuesStep, Math.ceil(issuesMax / issuesStep) * issuesStep);
  const issuesLo = (pctLo / pctHi) * issuesHi;

  return {
    percentDomain: [pctLo, pctHi],
    percentTicks: buildTicks(pctLo, pctHi, pctStep),
    issuesDomain: [issuesLo, issuesHi],
    issuesTicks: buildTicks(0, issuesHi, issuesStep),
  };
}

function getArrow(delta) {
  if (delta === null || delta === undefined) return 'N/A';
  if (delta > 0) return '↑';
  if (delta < 0) return '↓';
  return '→';
}

function getNullableDelta(current, previous) {
  if (current === null || current === undefined || previous === null || previous === undefined) {
    return null;
  }
  return current - previous;
}

const formatDelta = (value, digits = 2) =>
  value === null || value === undefined ? 'N/A' : value.toFixed(digits);

function getStableRiskContributorKey(series) {
  if (!series || series.length === 0) return null;
  const costValues = series
    .map(point => point.predictedCostOverrun)
    .filter(value => value !== null && value !== undefined);
  const delayValues = series
    .map(point => point.predictedTimeDelay)
    .filter(value => value !== null && value !== undefined);
  const issueAverage =
    series.reduce((sum, point) => sum + (point.totalOpenIssues || 0), 0) / series.length;
  const scores = [];
  if (costValues.length) {
    scores.push({
      key: 'Cost overrun',
      score: costValues.reduce((sum, value) => sum + value, 0) / costValues.length,
    });
  }
  if (delayValues.length) {
    scores.push({
      key: 'Time delay',
      score: delayValues.reduce((sum, value) => sum + value, 0) / delayValues.length,
    });
  }
  if (issueAverage > 0) scores.push({ key: 'Issues', score: issueAverage * 10 });
  if (!scores.length) return null;
  scores.sort((a, b) => b.score - a.score);
  return scores[0]?.key ?? null;
}

const getTrendIndicator = (current, previous) => {
  if (previous === undefined || previous === null) return null;
  if (current > previous) return { symbol: '↑', color: '#EA4335', label: 'Increased' };
  if (current < previous) return { symbol: '↓', color: '#34A853', label: 'Decreased' };
  return { symbol: '→', color: '#FBBC05', label: 'Unchanged' };
};

const formatPercent = (value, digits = 2) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  const num = Number(value);
  return `${Number.isInteger(num) ? num : num.toFixed(digits)}%`;
};

const RiskTooltip = ({ active, payload, label, darkMode }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  const series = row.__history || [];
  const first = series[0];
  const last = series[series.length - 1];
  const deltas =
    first && last
      ? {
          cost: getNullableDelta(last.predictedCostOverrun, first.predictedCostOverrun),
          delay: getNullableDelta(last.predictedTimeDelay, first.predictedTimeDelay),
          issues: last.totalOpenIssues - first.totalOpenIssues,
        }
      : { cost: 0, delay: 0, issues: 0 };

  const contributor = getStableRiskContributorKey(series);

  return (
    <div className={`${styles.tooltip} ${darkMode ? styles.tooltipDark : ''}`}>
      <div className={styles.tooltipTitle}>{label}</div>
      <div>Cost overrun: {formatPercent(row.predictedCostOverrun)}</div>
      <div>Time delay: {formatPercent(row.predictedTimeDelay)}</div>
      <div>Issues: {row.totalOpenIssues}</div>
      <hr className={styles.tooltipDivider} />
      <div className={styles.tooltipSubtitle}>Summary (selected period)</div>
      <div>
        Key drivers of change: Cost {getArrow(deltas.cost)} {formatPercent(deltas.cost)}, Delay{' '}
        {getArrow(deltas.delay)} {formatPercent(deltas.delay)}, Issues {getArrow(deltas.issues)}{' '}
        {deltas.issues.toFixed(0)}
      </div>
      <div>Largest risk contributor: {contributor || 'N/A'}</div>
    </div>
  );
};

RiskTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.string,
  darkMode: PropTypes.bool,
};

export default function ProjectRiskProfileOverview() {
  const darkMode = useSelector(state => Boolean(state?.theme?.darkMode));

  const [rawProjects, setRawProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [timeRange, setTimeRange] = useState(30);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const projectWrapperRef = useRef(null);
  const selectionInitialized = useRef(false);

  useEffect(() => {
    const handleClickOutside = event => {
      if (projectWrapperRef.current && !projectWrapperRef.current.contains(event.target)) {
        setShowProjectDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const effectiveWindow = useMemo(() => {
    const fallbackEnd = formatDateISO(new Date());
    const end = timeRange === 'custom' && customEnd ? customEnd : fallbackEnd;

    if (timeRange === 'custom') {
      const start = customStart || end;
      const startD = new Date(start);
      const endD = new Date(end);
      const diffTime = Math.abs(endD - startD);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      return { start, end, days: diffDays || 30 };
    }

    const days = Number(timeRange);
    const startDate = new Date(end);
    startDate.setDate(startDate.getDate() - (days - 1));
    return { start: formatDateISO(startDate), end, days };
  }, [timeRange, customStart, customEnd]);

  // Reload when the time range changes so range-based counts (e.g. issues)
  // can come from the API.
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await httpService.get(
          `${process.env.REACT_APP_APIENDPOINT}/projects/risk-profile?startDate=${effectiveWindow.start}&endDate=${effectiveWindow.end}`,
        );
        let result = res.data;

        if (!Array.isArray(result)) result = [result];

        const normalized = result.map(p => ({
          ...p,
          projectName: p.projectName || p.name || 'Unknown Project',
          history: Array.isArray(p.history) ? p.history : null,
        }));

        setRawProjects(normalized);
        const names = normalized.map(p => p.projectName);
        setAllProjects(names);
        if (selectionInitialized.current === false) {
          setSelectedProjects(names);
          selectionInitialized.current = true;
        }
      } catch (err) {
        setError('Failed to fetch project risk profile data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [effectiveWindow.start, effectiveWindow.end]);

  const projectsWithHistory = useMemo(() => {
    if (!rawProjects || rawProjects.length === 0) return [];
    const endISO = effectiveWindow.end;

    return rawProjects.map(p => {
      if (Array.isArray(p.history) && p.history.length > 0) {
        const hist = p.history
          .map(h => ({
            date: h.date || h.day || h.createdAt || h.timestamp || null,
            predictedCostOverrun: toNullableNumber(h.predictedCostOverrun ?? h.costOverrun),
            predictedTimeDelay: toNullableNumber(h.predictedTimeDelay ?? h.timeDelay),
            totalOpenIssues: toNullableNumber(h.totalOpenIssues ?? h.issues),
          }))
          .filter(h => h.date);
        return { ...p, history: hist };
      }
      return {
        ...p,
        history: [
          {
            date: endISO,
            predictedCostOverrun: toNullableNumber(p.predictedCostOverrun),
            predictedTimeDelay: toNullableNumber(p.predictedTimeDelay),
            totalOpenIssues: toNullableNumber(p.totalOpenIssues),
          },
        ],
      };
    });
  }, [rawProjects, effectiveWindow.start, effectiveWindow.end, effectiveWindow.days]);

  const filteredProjects = useMemo(() => {
    return projectsWithHistory
      .filter(p => selectedProjects.includes(p.projectName))
      .map(p => {
        const hist = (p.history || []).filter(
          h => h.date >= effectiveWindow.start && h.date <= effectiveWindow.end,
        );
        return { ...p, historyFiltered: hist };
      })
      .filter(p => (p.historyFiltered || []).length > 0);
  }, [projectsWithHistory, selectedProjects, effectiveWindow.start, effectiveWindow.end]);

  const barChartData = useMemo(() => {
    return filteredProjects.map(p => {
      const latest = p.historyFiltered[p.historyFiltered.length - 1];
      return {
        projectName: p.projectName,
        predictedCostOverrun: latest.predictedCostOverrun,
        predictedTimeDelay: latest.predictedTimeDelay,
        totalOpenIssues: latest.totalOpenIssues,
        __history: p.historyFiltered,
      };
    });
  }, [filteredProjects]);

  const axisScales = useMemo(
    () =>
      computeAlignedScales(
        barChartData.flatMap(d => [
          Number(d.predictedCostOverrun) || 0,
          Number(d.predictedTimeDelay) || 0,
        ]),
        barChartData.map(d => Number(d.totalOpenIssues) || 0),
      ),
    [barChartData],
  );

  const chartColors = {
    text: darkMode ? '#dbe3f0' : '#333333',
    grid: darkMode ? '#3f4652' : '#e8e8e8',
    axisLine: darkMode ? '#6b7280' : '#d5d5d5',
  };

  const sparklineTooltipProps = useMemo(
    () => ({
      contentStyle: {
        backgroundColor: darkMode ? '#2c2c2c' : '#fff',
        border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
        borderRadius: 6,
        color: darkMode ? '#eee' : '#222',
      },
      labelStyle: { color: darkMode ? '#eee' : '#222' },
      itemStyle: { color: darkMode ? '#eee' : '#222' },
    }),
    [darkMode],
  );

  const customSelectStyles = {
    container: base => ({
      ...base,
      minWidth: '250px',
      marginTop: '6px',
    }),
    control: base => ({
      ...base,
      fontSize: 13,
      minHeight: 36,
      backgroundColor: darkMode ? '#2c2c2c' : '#fff',
      borderColor: darkMode ? '#555' : '#ccc',
      boxShadow: 'none',
      color: darkMode ? '#eee' : '#222',
    }),
    valueContainer: base => ({
      ...base,
      padding: '2px 8px',
    }),
    multiValue: base => ({
      ...base,
      background: darkMode ? '#444' : '#e6f7ff',
      fontSize: 12,
      borderRadius: 4,
    }),
    multiValueLabel: base => ({
      ...base,
      color: darkMode ? '#eee' : '#222',
    }),
    multiValueRemove: base => ({
      ...base,
      color: darkMode ? '#eee' : '#333',
      ':hover': {
        backgroundColor: darkMode ? '#555' : '#dbe7ff',
        color: darkMode ? '#fff' : '#111',
      },
    }),
    input: base => ({
      ...base,
      color: darkMode ? '#eee' : '#333',
    }),
    placeholder: base => ({
      ...base,
      color: darkMode ? '#c7c7c7' : '#666',
    }),
    menu: base => ({
      ...base,
      backgroundColor: darkMode ? '#2c2c2c' : '#fff',
      border: darkMode ? '1px solid #555' : '1px solid #e2e2e2',
      boxShadow: darkMode ? '0 4px 16px rgba(0, 0, 0, 0.45)' : '0 4px 16px rgba(0,0,0,0.12)',
      zIndex: 9999,
    }),
    option: (base, state) => {
      let optionBg;
      if (state.isSelected) {
        optionBg = darkMode ? '#4a4a4a' : '#dbe7ff';
      } else if (state.isFocused) {
        optionBg = darkMode ? '#3a3a3a' : '#f0f0f0';
      } else {
        optionBg = darkMode ? '#2c2c2c' : '#fff';
      }
      return {
        ...base,
        color: darkMode ? '#eee' : '#333',
        backgroundColor: optionBg,
      };
    },
  };

  if (loading) return <div className={styles.loading}>Loading project risk profiles...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <Container fluid className={styles.riskProfileRoot}>
      <div className={`${styles.wrapper} ${darkMode ? styles.darkMode : ''}`}>
        <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
          <div className={styles.headerRow}>
            <h2 className={styles.heading}>Project Risk Profile Overview</h2>

            <div className={styles.filterRow}>
              <div className={styles.dropdownWrapper}>
                <span className={styles.dropdownLabel}>Time Range</span>
                <select
                  className={styles.dropdownButton}
                  value={timeRange}
                  onChange={e => setTimeRange(e.target.value)}
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {timeRange === 'custom' && (
                <div className={styles.customDateContainer}>
                  <div className={styles.dropdownWrapper}>
                    <span className={styles.dropdownLabel}>Start Date</span>
                    <input
                      type="date"
                      className={styles.dateInput}
                      value={customStart}
                      onChange={e => setCustomStart(e.target.value)}
                    />
                  </div>
                  <div className={styles.dropdownWrapper}>
                    <span className={styles.dropdownLabel}>End Date</span>
                    <input
                      type="date"
                      className={styles.dateInput}
                      value={customEnd}
                      onChange={e => setCustomEnd(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div ref={projectWrapperRef} className={styles.dropdownWrapper}>
                <span className={styles.dropdownLabel}>Projects</span>
                <button
                  type="button"
                  className={styles.dropdownButton}
                  onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                >
                  {selectedProjects.length === allProjects.length
                    ? 'ALL'
                    : `${selectedProjects.length} selected`}
                </button>
                {showProjectDropdown && (
                  <div className={styles.dropdownMenu}>
                    <Select
                      menuIsOpen
                      isMulti
                      options={allProjects.map(p => ({ label: p, value: p }))}
                      value={selectedProjects.map(p => ({ label: p, value: p }))}
                      onChange={opts =>
                        setSelectedProjects(opts?.length ? opts.map(o => o.value) : [])
                      }
                      onBlur={() => setShowProjectDropdown(false)}
                      closeMenuOnSelect={false}
                      styles={customSelectStyles}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.chartWrapper}>
            {barChartData.length === 0 ? (
              <div className={styles.emptyState}>
                {selectedProjects.length === 0 && allProjects.length > 0
                  ? 'No projects selected. Choose at least one project to see its risk profile.'
                  : 'No data available for the selected filters.'}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 30, right: 40, left: 20, bottom: 10 }}>
                  <CartesianGrid
                    yAxisId="percent"
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                    stroke={chartColors.grid}
                  />
                  <XAxis
                    dataKey="projectName"
                    tick={{ fontSize: 13, fill: chartColors.text, fontWeight: 500 }}
                    angle={-45}
                    textAnchor="end"
                    height={190}
                    axisLine={{ stroke: chartColors.axisLine, strokeWidth: 1.5 }}
                    tickLine={{ stroke: chartColors.axisLine }}
                  />
                  <YAxis
                    yAxisId="percent"
                    domain={axisScales.percentDomain}
                    ticks={axisScales.percentTicks}
                    tickFormatter={val => `${Number.isInteger(val) ? val : val.toFixed(0)}%`}
                    tick={{ fontSize: 12, fill: chartColors.text, fontWeight: 500 }}
                    axisLine={{ stroke: chartColors.axisLine, strokeWidth: 1.5 }}
                    tickLine={{ stroke: chartColors.axisLine }}
                  />
                  <YAxis
                    yAxisId="issues"
                    domain={axisScales.issuesDomain}
                    ticks={axisScales.issuesTicks}
                    allowDecimals={false}
                    width={50}
                    tick={{ fontSize: 12, fill: '#EA4335', fontWeight: 500 }}
                    axisLine={{ stroke: '#EA4335', strokeWidth: 1.5 }}
                    tickLine={{ stroke: '#EA4335' }}
                    label={{
                      value: 'Issues',
                      angle: -90,
                      position: 'insideLeft',
                      style: {
                        textAnchor: 'middle',
                        fill: '#EA4335',
                        fontSize: 12,
                        fontWeight: 600,
                      },
                    }}
                  />
                  <Tooltip
                    content={<RiskTooltip darkMode={darkMode} />}
                    cursor={{ fill: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 10, color: chartColors.text }} />
                  <Bar
                    yAxisId="percent"
                    dataKey="predictedCostOverrun"
                    name="Predicted Cost Overrun (%)"
                    fill="#4285F4"
                    radius={[3, 3, 0, 0]}
                    barSize={35}
                  >
                    <LabelList
                      dataKey="predictedCostOverrun"
                      position="top"
                      formatter={value => formatPercent(value, 0)}
                      fill={chartColors.text}
                      fontSize={11}
                    />
                  </Bar>
                  <Bar
                    yAxisId="issues"
                    dataKey="totalOpenIssues"
                    name="Issues"
                    fill="#EA4335"
                    radius={[3, 3, 0, 0]}
                    barSize={35}
                  >
                    <LabelList
                      dataKey="totalOpenIssues"
                      position="top"
                      formatter={value => Math.round(Number(value) || 0)}
                      fill={chartColors.text}
                      fontSize={11}
                    />
                  </Bar>
                  <Bar
                    yAxisId="percent"
                    dataKey="predictedTimeDelay"
                    name="Predicted Time Delay (%)"
                    fill="#FBBC05"
                    radius={[3, 3, 0, 0]}
                    barSize={35}
                  >
                    <LabelList
                      dataKey="predictedTimeDelay"
                      position="top"
                      formatter={value => formatPercent(value, 0)}
                      fill={chartColors.text}
                      fontSize={11}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {filteredProjects.length > 0 && (
            <div className={styles.trendSection}>
              <h3 className={styles.trendTitle}>Risk Movement Tracking</h3>
              <div className={styles.trendGrid}>
                {filteredProjects.map(project => {
                  const s = project.historyFiltered;
                  const currentData = s[s.length - 1];
                  const prevData = s.length > 1 ? s[s.length - 2] : s[0];

                  const costTrend = getTrendIndicator(
                    currentData.predictedCostOverrun,
                    prevData?.predictedCostOverrun,
                  );
                  const issueTrend = getTrendIndicator(
                    currentData.totalOpenIssues,
                    prevData?.totalOpenIssues,
                  );
                  const timeTrend = getTrendIndicator(
                    currentData.predictedTimeDelay,
                    prevData?.predictedTimeDelay,
                  );

                  return (
                    <div key={project.projectName} className={styles.trendCard}>
                      <div className={styles.projectName}>{project.projectName}</div>

                      <div className={styles.trendRow}>
                        <span>Cost Overrun:</span>
                        {costTrend && (
                          <span
                            className={styles.trendIndicator}
                            style={{ color: costTrend.color }}
                            title={costTrend.label}
                          >
                            {costTrend.symbol}
                          </span>
                        )}
                        <span>{formatPercent(currentData.predictedCostOverrun)}</span>
                      </div>
                      <div className={styles.trendRow}>
                        <span>Issues:</span>
                        {issueTrend && (
                          <span
                            className={styles.trendIndicator}
                            style={{ color: issueTrend.color }}
                            title={issueTrend.label}
                          >
                            {issueTrend.symbol}
                          </span>
                        )}
                        <span>{currentData.totalOpenIssues || 0}</span>
                      </div>
                      <div className={styles.trendRow}>
                        <span>Time Delay:</span>
                        {timeTrend && (
                          <span
                            className={styles.trendIndicator}
                            style={{ color: timeTrend.color }}
                            title={timeTrend.label}
                          >
                            {timeTrend.symbol}
                          </span>
                        )}
                        <span>{formatPercent(currentData.predictedTimeDelay)}</span>
                      </div>

                      {project.status && (
                        <>
                          <div className={styles.attributeRow}>
                            <span className={styles.label}>Status:</span>
                            <span className={styles.value}>{project.status || 'N/A'}</span>
                          </div>
                          <div className={styles.attributeRow}>
                            <span className={styles.label}>Severity:</span>
                            <span className={styles.value}>{project.severity || 'N/A'}</span>
                          </div>
                          <div className={styles.attributeRow}>
                            <span className={styles.label}>Owner:</span>
                            <span className={styles.value}>{project.owner || 'N/A'}</span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className={styles.trendSection}>
            <h3 className={styles.trendTitle}>Trend Summary Table</h3>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead>
                  <tr className={styles.tableHeadRow}>
                    <th className={styles.th}>Project</th>
                    <th className={styles.th}>Cost overrun trend</th>
                    <th className={styles.th}>Time delay trend</th>
                    <th className={styles.th}>Issue count trend</th>
                    <th className={styles.th}>Comparison + indicators</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map(p => {
                    const s = p.historyFiltered;
                    const costDelta = getNullableDelta(
                      s[s.length - 1].predictedCostOverrun,
                      s[0].predictedCostOverrun,
                    );
                    const delayDelta = getNullableDelta(
                      s[s.length - 1].predictedTimeDelay,
                      s[0].predictedTimeDelay,
                    );
                    const issuesDelta = s[s.length - 1].totalOpenIssues - s[0].totalOpenIssues;
                    const contributor = getStableRiskContributorKey(s);

                    return (
                      <tr key={p.projectName}>
                        <td className={styles.tdProject}>{p.projectName}</td>
                        <td className={styles.td}>
                          <div className={styles.sparkRow}>
                            <span className={styles.arrow}>{getArrow(costDelta)}</span>
                            <div className={styles.sparkline}>
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={s}>
                                  <Line
                                    type="monotone"
                                    dataKey="predictedCostOverrun"
                                    dot={false}
                                    strokeWidth={2}
                                  />
                                  <Tooltip {...sparklineTooltipProps} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                            <span className={styles.deltaText}>{formatDelta(costDelta)}</span>
                          </div>
                        </td>
                        <td className={styles.td}>
                          <div className={styles.sparkRow}>
                            <span className={styles.arrow}>{getArrow(delayDelta)}</span>
                            <div className={styles.sparkline}>
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={s}>
                                  <Line
                                    type="monotone"
                                    dataKey="predictedTimeDelay"
                                    dot={false}
                                    strokeWidth={2}
                                  />
                                  <Tooltip {...sparklineTooltipProps} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                            <span className={styles.deltaText}>{formatDelta(delayDelta)}</span>
                          </div>
                        </td>
                        <td className={styles.td}>
                          <div className={styles.sparkRow}>
                            <span className={styles.arrow}>{getArrow(issuesDelta)}</span>
                            <div className={styles.sparkline}>
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={s}>
                                  <Line
                                    type="monotone"
                                    dataKey="totalOpenIssues"
                                    dot={false}
                                    strokeWidth={2}
                                  />
                                  <Tooltip {...sparklineTooltipProps} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                            <span className={styles.deltaText}>{issuesDelta.toFixed(0)}</span>
                          </div>
                        </td>
                        <td className={styles.td}>
                          <div className={styles.indicatorBox}>
                            <div className={styles.indicatorLine}>
                              Cost: {getArrow(costDelta)} | Delay: {getArrow(delayDelta)} | Issues:{' '}
                              {getArrow(issuesDelta)}
                            </div>
                            <div className={styles.indicatorSub}>
                              Largest contributor: <b>{contributor || 'N/A'}</b>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!filteredProjects.length && (
                    <tr>
                      <td colSpan={5} className={styles.noDataRow}>
                        No data for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {selectedProjects.length === 1 &&
            filteredProjects.length === 1 &&
            filteredProjects[0].historyFiltered.length > 1 && (
              <div className={styles.timelineSection}>
                <h3 className={styles.trendTitle}>Historical Risk Trend - {selectedProjects[0]}</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart
                    data={filteredProjects[0].historyFiltered.map(h => ({
                      date: h.date,
                      costOverrun: h.predictedCostOverrun,
                      issues: h.totalOpenIssues,
                      timeDelay: h.predictedTimeDelay,
                    }))}
                    margin={{ top: 20, right: 30, left: 0, bottom: 30 }}
                  >
                    <CartesianGrid
                      strokeDasharray="5 5"
                      stroke={darkMode ? '#3a3a3a' : '#e8e8e8'}
                      horizontal={true}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: darkMode ? '#888' : '#666' }}
                      axisLine={{ stroke: darkMode ? '#555' : '#d5d5d5', strokeWidth: 1 }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: darkMode ? '#888' : '#666' }}
                      axisLine={{ stroke: darkMode ? '#555' : '#d5d5d5', strokeWidth: 1 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? '#333' : '#fff',
                        border: `1px solid ${darkMode ? '#666' : '#e0e0e0'}`,
                        borderRadius: '6px',
                        padding: '10px',
                        color: darkMode ? '#fff' : '#333',
                        fontSize: '12px',
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        paddingTop: '20px',
                        fontSize: '13px',
                        color: darkMode ? '#ddd' : '#444',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="costOverrun"
                      stroke="#4285F4"
                      name="Cost Overrun %"
                      dot={{ r: 4 }}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="issues"
                      stroke="#EA4335"
                      name="Issues"
                      dot={{ r: 4 }}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="timeDelay"
                      stroke="#FBBC05"
                      name="Time Delay %"
                      dot={{ r: 4 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
        </div>
      </div>
    </Container>
  );
}
