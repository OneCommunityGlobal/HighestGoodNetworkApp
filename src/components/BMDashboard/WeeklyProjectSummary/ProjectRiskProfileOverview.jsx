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
  Line,
  LineChart,
  ResponsiveContainer,
} from 'recharts';
import Select from 'react-select';
import { Container } from 'reactstrap';
import httpService from '../../../services/httpService';
import styles from './ProjectRiskProfileOverview.module.css';

// --- Helper Functions ---
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.codePointAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function formatDateISO(d) {
  return d.toISOString().slice(0, 10);
}

function buildDateRange(endDateISO, days) {
  const end = new Date(endDateISO);
  const dates = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const dt = new Date(end);
    dt.setDate(end.getDate() - i);
    dates.push(formatDateISO(dt));
  }
  return dates;
}

function generateSyntheticHistory(projectName, snapshot, days, endDateISO) {
  const seed = hashString(projectName);
  const dates = buildDateRange(endDateISO, days);
  const baseCost = Number(snapshot.predictedCostOverrun ?? 0);
  const baseDelay = Number(snapshot.predictedTimeDelay ?? 0);
  const baseIssues = Number(snapshot.totalOpenIssues ?? 0);
  let cost = baseCost,
    delay = baseDelay,
    issues = baseIssues;

  return dates.map((date, idx) => {
    const r1 = ((seed % 97) / 97 - 0.5) * 2;
    const r2 = (((seed >> 3) % 89) / 89 - 0.5) * 2;
    const r3 = (((seed >> 7) % 83) / 83 - 0.5) * 2;
    cost = clamp(cost + r1 * 1.2 + Math.sin((idx + seed) / 5) * 0.6, 0, 999);
    delay = clamp(delay + r2 * 0.4 + Math.cos((idx + seed) / 6) * 0.2, 0, 999);
    issues = clamp(Math.round(issues + r3 * 0.3 + Math.sin((idx + seed) / 7) * 0.1), 0, 999);
    return {
      date,
      predictedCostOverrun: Number(cost.toFixed(2)),
      predictedTimeDelay: Number(delay.toFixed(2)),
      totalOpenIssues: issues,
    };
  });
}

function getArrow(delta) {
  if (delta > 0) return '↑';
  if (delta < 0) return '↓';
  return '→';
}

function getStableRiskContributorKey(series) {
  if (!series || series.length === 0) return null;
  const avg = series.reduce(
    (acc, p) => {
      acc.cost += p.predictedCostOverrun || 0;
      acc.delay += p.predictedTimeDelay || 0;
      acc.issues += p.totalOpenIssues || 0;
      return acc;
    },
    { cost: 0, delay: 0, issues: 0 },
  );
  avg.cost /= series.length;
  avg.delay /= series.length;
  avg.issues /= series.length;
  const scores = [
    { key: 'Cost overrun', score: avg.cost },
    { key: 'Time delay', score: avg.delay },
    { key: 'Issues', score: avg.issues * 10 },
  ];
  scores.sort((a, b) => b.score - a.score);
  return scores[0]?.key ?? null;
}

// --- Extracted Tooltip Component ---
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
          cost: last.predictedCostOverrun - first.predictedCostOverrun,
          delay: last.predictedTimeDelay - first.predictedTimeDelay,
          issues: last.totalOpenIssues - first.totalOpenIssues,
        }
      : { cost: 0, delay: 0, issues: 0 };

  const contributor = getStableRiskContributorKey(series);

  return (
    <div className={`${styles.tooltip} ${darkMode ? styles.tooltipDark : ''}`}>
      <div className={styles.tooltipTitle}>{label}</div>
      <div>Cost overrun: {row.predictedCostOverrun}</div>
      <div>Time delay: {row.predictedTimeDelay}</div>
      <div>Issues: {row.totalOpenIssues}</div>
      <hr className={styles.tooltipDivider} />
      <div className={styles.tooltipSubtitle}>Summary (selected period)</div>
      <div>
        Key drivers of change: Cost {getArrow(deltas.cost)} {deltas.cost.toFixed(2)}, Delay{' '}
        {getArrow(deltas.delay)} {deltas.delay.toFixed(2)}, Issues {getArrow(deltas.issues)}{' '}
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

// --- Main Component ---
export default function ProjectRiskProfileOverview() {
  const darkMode = useSelector(state => Boolean(state?.theme?.darkMode));

  const [data, setData] = useState([]);
  const [rawProjects, setRawProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(30);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [allDates, setAllDates] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const projectWrapperRef = useRef(null);
  const dateWrapperRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await httpService.get(
          `${process.env.REACT_APP_APIENDPOINT}/projects/risk-profile`,
        );
        let result = res.data;

        if (!Array.isArray(result)) result = [result];

        setData(result);
        const normalized = result.map(p => ({
          ...p,
          projectName: p.projectName || p.name || 'Unknown Project',
          history: Array.isArray(p.history) ? p.history : null,
        }));

        setRawProjects(normalized);
        const names = normalized.map(p => p.projectName);
        setAllProjects(names);
        setSelectedProjects(names);

        const datesFromPayload = Array.from(new Set(normalized.flatMap(p => p.dates || [])));
        setAllDates(datesFromPayload);
        setSelectedDates(datesFromPayload);
      } catch (err) {
        setError('Failed to fetch project risk profile data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredData = data.filter(
    p =>
      (selectedProjects.length === 0 || selectedProjects.includes(p.projectName)) &&
      (selectedDates.length === 0 || (p.dates || []).some(d => selectedDates.includes(d))),
  );

  const effectiveWindow = useMemo(() => {
    const fallbackEnd = formatDateISO(new Date());
    const end =
      (timeRange === 'custom' && customEnd) ||
      (selectedDates?.length
        ? [...selectedDates].sort((a, b) => new Date(a) - new Date(b)).at(-1)
        : null) ||
      fallbackEnd;

    if (timeRange === 'custom') {
      const start = customStart || end;
      return { start, end, days: null };
    }
    const days = Number(timeRange);
    const startDate = new Date(end);
    startDate.setDate(startDate.getDate() - (days - 1));
    return { start: formatDateISO(startDate), end, days };
  }, [timeRange, customStart, customEnd, selectedDates]);

  const projectsWithHistory = useMemo(() => {
    if (!rawProjects || rawProjects.length === 0) return [];
    const endISO = effectiveWindow.end;

    return rawProjects.map(p => {
      if (Array.isArray(p.history) && p.history.length > 0) {
        const hist = p.history
          .map(h => ({
            date: h.date || h.day || h.createdAt || h.timestamp || null,
            predictedCostOverrun: Number(h.predictedCostOverrun ?? h.costOverrun ?? 0),
            predictedTimeDelay: Number(h.predictedTimeDelay ?? h.timeDelay ?? 0),
            totalOpenIssues: Number(h.totalOpenIssues ?? h.issues ?? 0),
          }))
          .filter(h => h.date);
        return { ...p, history: hist };
      }
      const snapshot = {
        predictedCostOverrun: p.predictedCostOverrun,
        predictedTimeDelay: p.predictedTimeDelay,
        totalOpenIssues: p.totalOpenIssues,
      };
      const hist = generateSyntheticHistory(
        p.projectName,
        snapshot,
        effectiveWindow.days || 30,
        endISO,
      );
      return { ...p, history: hist };
    });
  }, [rawProjects, effectiveWindow.start, effectiveWindow.end, effectiveWindow.days]);

  const filteredProjects = useMemo(() => {
    return projectsWithHistory
      .filter(p => selectedProjects.length === 0 || selectedProjects.includes(p.projectName))
      .map(p => {
        const hist = (p.history || [])
          .filter(h => h.date >= effectiveWindow.start && h.date <= effectiveWindow.end)
          .filter(h => selectedDates.length === 0 || selectedDates.includes(h.date));
        return { ...p, historyFiltered: hist };
      })
      .filter(p => (p.historyFiltered || []).length > 0);
  }, [
    projectsWithHistory,
    selectedProjects,
    selectedDates,
    effectiveWindow.start,
    effectiveWindow.end,
  ]);

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

  const chartColors = {
    text: darkMode ? '#dbe3f0' : '#333333',
    grid: darkMode ? '#3a506b' : '#cccccc',
    tooltipBg: darkMode ? '#1c2541' : '#ffffff',
    tooltipBorder: darkMode ? '#3a506b' : '#ccc',
    tooltipText: darkMode ? '#ffffff' : '#000000',
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
    control: base => ({
      ...base,
      backgroundColor: darkMode ? '#2c2c2c' : '#fff',
      borderColor: darkMode ? '#555' : '#ccc',
      color: darkMode ? '#eee' : '#222',
    }),
    menu: base => ({
      ...base,
      backgroundColor: darkMode ? '#2c2c2c' : '#fff',
      zIndex: 9999,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? darkMode
          ? '#3a3a3a'
          : '#f0f0f0'
        : darkMode
        ? '#2c2c2c'
        : '#fff',
      color: darkMode ? '#eee' : '#000',
    }),
    multiValue: base => ({
      ...base,
      backgroundColor: darkMode ? '#444' : '#e6f7ff',
    }),
    multiValueLabel: base => ({
      ...base,
      color: darkMode ? '#eee' : '#222',
    }),
  };

  if (loading) return <div className={styles.loading}>Loading project risk profiles...</div>;
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <Container fluid className="mt-5 pt-5 mb-5">
      <div className={`${styles.chartCard} ${darkMode ? styles.darkMode : ''}`}>
        <h2 className={styles.chartTitle}>Project Risk Profile Overview</h2>

        <div className={styles.filterContainer}>
          <div className={styles.formGroup}>
            <span className={styles.label}>Time Range</span>
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

          <div ref={projectWrapperRef} className={styles.formGroup}>
            <span className={styles.label}>Projects</span>
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
                  onChange={opts => setSelectedProjects(opts?.length ? opts.map(o => o.value) : [])}
                  onBlur={() => setShowProjectDropdown(false)}
                  closeMenuOnSelect={false}
                  styles={customSelectStyles}
                />
              </div>
            )}
          </div>
        </div>

        <div className={styles.chartContainer}>
          {filteredData.length === 0 ? (
            <div className={styles.noData}>No data available for the selected filters.</div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filteredData} margin={{ top: 20, right: 40, left: 60, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartColors.grid} />
                <XAxis
                  dataKey="projectName"
                  tick={{ fontSize: 12, fill: chartColors.text }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tickFormatter={val => (Number.isInteger(val) ? val : val.toFixed(0))}
                  tick={{ fontSize: 12, fill: chartColors.text }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartColors.tooltipBg,
                    border: `1px solid ${chartColors.tooltipBorder}`,
                    color: chartColors.tooltipText,
                  }}
                  cursor={{ fill: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                />
                <Legend wrapperStyle={{ marginTop: 20, color: chartColors.text }} />
                <Bar
                  dataKey="predictedCostOverrun"
                  name="Predicted Cost Overrun (%)"
                  fill="#4285F4"
                  barSize={35}
                />
                <Bar dataKey="totalOpenIssues" name="Issues" fill="#EA4335" barSize={35} />
                <Bar
                  dataKey="predictedTimeDelay"
                  name="Predicted Time Delay (%)"
                  fill="#FBBC05"
                  barSize={35}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className={styles.trendSection}>
          <h3 className={styles.subHeading}>Trend Summary</h3>
          <div className={styles.chartContainer}>
            {barChartData.length === 0 ? (
              <div className={styles.noData}>
                No trend data available for the selected time window.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={barChartData} margin={{ top: 20, right: 40, left: 40, bottom: 80 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke={chartColors.grid}
                  />
                  <XAxis
                    dataKey="projectName"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12, fill: chartColors.text }}
                  />
                  <YAxis
                    tickFormatter={val => (Number.isInteger(val) ? val : val.toFixed(0))}
                    tick={{ fontSize: 12, fill: chartColors.text }}
                  />
                  <Tooltip content={<RiskTooltip darkMode={darkMode} />} />
                  <Legend wrapperStyle={{ marginTop: 20, color: chartColors.text }} />
                  <Bar
                    dataKey="predictedCostOverrun"
                    name="Cost Overrun (%)"
                    fill="#4285F4"
                    barSize={30}
                  />
                  <Bar dataKey="totalOpenIssues" name="Issues" fill="#EA4335" barSize={30} />
                  <Bar
                    dataKey="predictedTimeDelay"
                    name="Time Delay (%)"
                    fill="#FBBC05"
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

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
                  const costDelta =
                    s[s.length - 1].predictedCostOverrun - s[0].predictedCostOverrun;
                  const delayDelta = s[s.length - 1].predictedTimeDelay - s[0].predictedTimeDelay;
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
                          <span className={styles.deltaText}>{costDelta.toFixed(2)}</span>
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
                          <span className={styles.deltaText}>{delayDelta.toFixed(2)}</span>
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
      </div>
    </Container>
  );
}
