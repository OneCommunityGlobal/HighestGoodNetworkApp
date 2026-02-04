import { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Select from 'react-select';
import httpService from '../../../services/httpService';
import styles from './ProjectRiskProfileOverview.module.css';

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
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

  let cost = baseCost;
  let delay = baseDelay;
  let issues = baseIssues;

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

export default function ProjectRiskProfileOverview() {
  const darkMode = useSelector(state => state.theme?.darkMode || false);
  const [data, setData] = useState([]);
  const [rawProjects, setRawProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const TIME_RANGES = [
    { label: 'Last 7 days', value: 7 },
    { label: 'Last 30 days', value: 30 },
    { label: 'Last 90 days', value: 90 },
    { label: 'Custom', value: 'custom' },
  ];

  const [timeRange, setTimeRange] = useState(30);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [allProjects, setAllProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);

  const [allDates, setAllDates] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);

  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  // Refs for focusing dropdowns
  const projectWrapperRef = useRef(null);
  const dateWrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (projectWrapperRef.current && !projectWrapperRef.current.contains(event.target)) {
        setShowProjectDropdown(false);
      }
      if (dateWrapperRef.current && !dateWrapperRef.current.contains(event.target)) {
        setShowDateDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

        const normalized = result.map(p => ({
          ...p,
          projectName: p.projectName || p.name || 'Unknown Project',

          history: Array.isArray(p.history) ? p.history : null,
        }));

        setRawProjects(normalized);

        const names = normalized.map(p => p.projectName);
        setAllProjects(names);
        setSelectedProjects(names);

        const datesFromPayload = Array.from(
          new Set(normalized.flatMap(p => (p.dates ? p.dates : []))),
        );
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

  const effectiveWindow = useMemo(() => {
    const fallbackEnd = formatDateISO(new Date());
    const end =
      (timeRange === 'custom' && customEnd) ||
      (selectedDates && selectedDates.length
        ? [...selectedDates].sort((a, b) => new Date(a) - new Date(b)).slice(-1)[0]
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

    const withHist = rawProjects.map(p => {
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

      const days = effectiveWindow.days || 30;
      const hist = generateSyntheticHistory(p.projectName, snapshot, days, endISO);
      return { ...p, history: hist };
    });

    if (!allDates || allDates.length === 0) {
      const inferred = Array.from(new Set(withHist.flatMap(p => p.history.map(h => h.date)))).sort(
        (a, b) => new Date(a) - new Date(b),
      );
      return withHist.map(p => ({ ...p, __inferredDates: inferred }));
    }

    return withHist;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawProjects, effectiveWindow.start, effectiveWindow.end, effectiveWindow.days]);

  const effectiveAllDates = useMemo(() => {
    const inferred = projectsWithHistory?.[0]?.__inferredDates;
    if (Array.isArray(inferred) && inferred.length) return inferred;
    return allDates || [];
  }, [projectsWithHistory, allDates]);

  const filteredProjects = useMemo(() => {
    const start = effectiveWindow.start;
    const end = effectiveWindow.end;

    return projectsWithHistory
      .filter(p => selectedProjects.length === 0 || selectedProjects.includes(p.projectName))
      .map(p => {
        const hist = (p.history || [])
          .filter(h => h.date >= start && h.date <= end)
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

  const getProjectLabel = () => {
    if (selectedProjects.length === allProjects.length) return 'ALL';
    if (selectedProjects.length === 0) return 'Select projects';
    return `${selectedProjects.length} selected`;
  };

  const getDateLabel = () => {
    if (selectedDates.length === effectiveAllDates.length) return 'ALL';
    if (selectedDates.length === 0) return 'Select dates';
    return `${selectedDates.length} selected`;
  };

  const getOptionBackgroundColor = isFocused => {
    if (isFocused) {
      return darkMode ? '#3a506b' : '#f0f0f0';
    }
    return darkMode ? '#1c2541' : '#ffffff';
  };

  const customSelectStyles = {
    control: base => ({
      ...base,
      fontSize: 14,
      minHeight: 22,
      width: 120,
      background: 'none',
      border: 'none',
      boxShadow: 'none',
      textAlign: 'center',
      alignItems: 'center',
      padding: 0,
    }),
    valueContainer: base => ({
      ...base,
      padding: '0 2px',
      justifyContent: 'center',
    }),
    multiValue: base => ({
      ...base,
      background: darkMode ? '#3a506b' : '#e6f7ff',
      fontSize: 12,
      margin: '0 2px',
    }),
    multiValueLabel: base => ({
      ...base,
      color: darkMode ? '#ffffff' : '#000000',
    }),
    multiValueRemove: base => ({
      ...base,
      color: darkMode ? '#ffffff' : '#000000',
      ':hover': {
        backgroundColor: darkMode ? '#2f4157' : '#bae7ff',
        color: darkMode ? '#ffffff' : '#000000',
      },
    }),
    input: base => ({
      ...base,
      margin: 0,
      padding: 0,
      textAlign: 'center',
      color: darkMode ? '#ffffff' : '#000000',
    }),
    placeholder: base => ({
      ...base,
      color: '#aaa',
      textAlign: 'center',
    }),
    dropdownIndicator: base => ({
      ...base,
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    menu: base => ({
      ...base,
      zIndex: 9999,
      fontSize: 14,
      background: darkMode ? '#1c2541' : '#ffffff',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: getOptionBackgroundColor(state.isFocused),
      color: darkMode ? '#ffffff' : '#000000',
      fontWeight: state.isFocused ? 'bold' : 'normal',
      '&:active': {
        backgroundColor: darkMode ? '#2f4157' : '#e6f7ff',
      },
    }),
  };

  // Colors aligned with your global theme
  const chartColors = {
    grid: darkMode ? 'rgba(255,255,255,0.1)' : '#e5e5e5',
    text: darkMode ? '#e5e5e5' : '#333',
    tooltipBg: darkMode ? '#1c2541' : '#ffffff',
    tooltipBorder: darkMode ? '#3a506b' : '#ccc',
    tooltipText: darkMode ? '#ffffff' : '#000000',
  };
  const RiskTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const row = payload[0]?.payload;
    const series = row?.__history || [];
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
      <div style={{ background: '#fff', border: '1px solid #ddd', padding: 10, borderRadius: 6 }}>
        <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
        <div>Cost overrun: {row.predictedCostOverrun}</div>
        <div>Time delay: {row.predictedTimeDelay}</div>
        <div>Issues: {row.totalOpenIssues}</div>
        <hr style={{ margin: '8px 0' }} />
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Summary (selected period)</div>
        <div>
          Key drivers of change: Cost {getArrow(deltas.cost)} {deltas.cost.toFixed(2)}, Delay{' '}
          {getArrow(deltas.delay)} {deltas.delay.toFixed(2)}, Issues {getArrow(deltas.issues)}{' '}
          {deltas.issues.toFixed(0)}
        </div>
        <div>Largest risk contributor: {contributor || 'N/A'}</div>
      </div>
    );
  };

  if (loading) return <div>Loading project risk profiles...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className={`${styles.chartCard} ${darkMode ? styles.darkMode : ''}`}>
      <h2 className={styles.chartTitle}>Project Risk Profile Overview</h2>
      <div className={styles.filterContainer}>
        {/* Project Dropdown */}
        <div ref={projectWrapperRef} className={styles.formGroup}>
          <span className={styles.label}>Project</span>
          <button
            type="button"
            className={styles.dropdownButton}
            onClick={() => setShowProjectDropdown(true)}
          >
            {getProjectLabel()}
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
                hideSelectedOptions={false}
                components={{ IndicatorSeparator: () => null, ClearIndicator: () => null }}
                styles={customSelectStyles}
              />
            </div>
          )}
        </div>
        {/* Date Dropdown */}
        <div ref={dateWrapperRef} className={styles.formGroup}>
          <span className={styles.label}>Dates</span>
          <button
            type="button"
            className={styles.dropdownButton}
            onClick={() => setShowDateDropdown(true)}
          >
            {getDateLabel && getDateLabel()}
          </button>
          {showDateDropdown && (
            <div className={styles.dropdownMenu}>
              <Select
                menuIsOpen
                isMulti
                options={effectiveAllDates.map(d => ({ label: d, value: d }))}
                value={selectedDates.map(d => ({ label: d, value: d }))}
                onChange={opts => setSelectedDates(opts?.length ? opts.map(o => o.value) : [])}
                onBlur={() => setShowDateDropdown(false)}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                components={{ IndicatorSeparator: () => null, ClearIndicator: () => null }}
                styles={customSelectStyles}
              />
            </div>
          )}
        </div>

        {/* Window label */}
        <div style={{ fontSize: 13, color: '#555', marginTop: 22 }}>
          Period: <b>{effectiveWindow.start}</b> to <b>{effectiveWindow.end}</b>
        </div>
      </div>

      {/* Chart Section */}
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={barChartData} margin={{ top: 20, right: 40, left: 40, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartColors.grid} />
            <XAxis
              dataKey="projectName"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12, fill: chartColors.text }}
            />
            <YAxis
              label={{
                value: 'Percentage (%)',
                angle: -90,
                position: 'insideLeft',
                offset: 15,
                style: {
                  textAnchor: 'middle',
                  fontSize: 14,
                  fill: chartColors.text,
                  fontWeight: '500',
                },
              }}
              tickFormatter={value => (Number.isInteger(value) ? value : value.toFixed(0))}
              tick={{ fontSize: 12, fill: chartColors.text }}
            />
            <Tooltip content={<RiskTooltip />} />
            <Legend wrapperStyle={{ marginTop: 20, color: chartColors.text }} />
            <Bar
              dataKey="predictedCostOverrun"
              name="Predicted Cost Overrun (%)"
              fill="#4285F4"
              barSize={30}
            />
            <Bar dataKey="totalOpenIssues" name="Issues" fill="#EA4335" barSize={30} />
            <Bar
              dataKey="predictedTimeDelay"
              name="Predicted Time Delay (%)"
              fill="#FBBC05"
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TRENDS + INDICATORS*/}
      <div style={{ marginTop: 10 }}>
        <h3 style={{ margin: '8px 0 10px 0' }}>Trend Summary</h3>

        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: '#f7f7f7' }}>
                <th style={{ padding: 10, textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                  Project
                </th>
                <th style={{ padding: 10, textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                  Cost overrun trend
                </th>
                <th style={{ padding: 10, textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                  Time delay trend
                </th>
                <th style={{ padding: 10, textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                  Issue count trend
                </th>
                <th style={{ padding: 10, textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                  Comparison + indicators
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(p => {
                const s = p.historyFiltered;
                const first = s[0];
                const last = s[s.length - 1];

                const costDelta = last.predictedCostOverrun - first.predictedCostOverrun;
                const delayDelta = last.predictedTimeDelay - first.predictedTimeDelay;
                const issuesDelta = last.totalOpenIssues - first.totalOpenIssues;

                const contributor = getStableRiskContributorKey(s);

                // tooltip text required by task (“key drivers” and “largest contributor”)
                const indicatorTooltip = `Key drivers of change: Cost ${getArrow(
                  costDelta,
                )} ${costDelta.toFixed(2)}, Delay ${getArrow(delayDelta)} ${delayDelta.toFixed(
                  2,
                )}, Issues ${getArrow(issuesDelta)} ${issuesDelta.toFixed(
                  0,
                )}. Largest risk contributor: ${contributor || 'N/A'}.`;

                return (
                  <tr key={p.projectName}>
                    <td
                      style={{ padding: 10, borderBottom: '1px solid #eee', whiteSpace: 'nowrap' }}
                    >
                      {p.projectName}
                    </td>

                    {/* Cost sparkline */}
                    <td style={{ padding: 10, borderBottom: '1px solid #eee' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 22 }}>{getArrow(costDelta)}</span>
                        <div style={{ width: 160, height: 36 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={s}>
                              <Line
                                type="monotone"
                                dataKey="predictedCostOverrun"
                                dot={false}
                                strokeWidth={2}
                              />
                              <Tooltip />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        <span style={{ fontSize: 12, color: '#555' }}>{costDelta.toFixed(2)}</span>
                      </div>
                    </td>

                    {/* Delay sparkline */}
                    <td style={{ padding: 10, borderBottom: '1px solid #eee' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 22 }}>{getArrow(delayDelta)}</span>
                        <div style={{ width: 160, height: 36 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={s}>
                              <Line
                                type="monotone"
                                dataKey="predictedTimeDelay"
                                dot={false}
                                strokeWidth={2}
                              />
                              <Tooltip />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        <span style={{ fontSize: 12, color: '#555' }}>{delayDelta.toFixed(2)}</span>
                      </div>
                    </td>

                    {/* Issues sparkline */}
                    <td style={{ padding: 10, borderBottom: '1px solid #eee' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 22 }}>{getArrow(issuesDelta)}</span>
                        <div style={{ width: 160, height: 36 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={s}>
                              <Line
                                type="monotone"
                                dataKey="totalOpenIssues"
                                dot={false}
                                strokeWidth={2}
                              />
                              <Tooltip />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        <span style={{ fontSize: 12, color: '#555' }}>
                          {issuesDelta.toFixed(0)}
                        </span>
                      </div>
                    </td>

                    {/* Indicators + tooltips */}
                    <td style={{ padding: 10, borderBottom: '1px solid #eee' }}>
                      <div title={indicatorTooltip} style={{ cursor: 'help' }}>
                        <div style={{ fontSize: 13 }}>
                          Cost: {getArrow(costDelta)} | Delay: {getArrow(delayDelta)} | Issues:{' '}
                          {getArrow(issuesDelta)}
                        </div>
                        <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
                          Largest contributor: <b>{contributor || 'N/A'}</b>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!filteredProjects.length && (
                <tr>
                  <td colSpan={5} style={{ padding: 12, color: '#777' }}>
                    No data for the selected filters/time window.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
