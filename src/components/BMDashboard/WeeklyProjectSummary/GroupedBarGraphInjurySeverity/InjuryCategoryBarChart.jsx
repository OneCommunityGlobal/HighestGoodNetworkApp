import { useEffect, useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from 'recharts';
import Select from 'react-select';
import DatePicker from 'react-datepicker';

import styles from './InjuryCategoryBarChart.module.css';
import InjuryAnalysisDialog from './InjuryAnalysisDialog';
import { injuryProjectParams } from './injuryAnalysis';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchInjuryData,
  fetchSeverities,
  fetchInjuryTypes,
  fetchInjuryProjects,
} from '../../../../actions/bmdashboard/injuryActions';
import 'react-datepicker/dist/react-datepicker.css';
// YYYY-MM-DD (no tz shift)
const toYMD = d =>
  d instanceof Date && !isNaN(d)
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate(),
      ).padStart(2, '0')}`
    : '';

function InjuryCategoryBarChart() {
  const dispatch = useDispatch();

  const {
    data: rawData = [],
    loading,
    error,
    projects: injuryProjects = [],
    severities = [],
    injuryTypes = [],
  } = useSelector(state => state.bmInjury || {});
  const darkMode = useSelector(state => state.theme?.darkMode);

  const [projectNameFilter, setProjectNameFilter] = useState([]);
  const [severityFilter, setSeverityFilter] = useState([]);
  const [injuryTypeFilter, setInjuryTypeFilter] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysisSettings, setAnalysisSettings] = useState(null);
  const [unfilteredProjects, setUnfilteredProjects] = useState([]);

  // ✅ NEW: key to force Recharts remount when needed (fixes "renders only on hover")
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    dispatch(fetchSeverities());
    dispatch(fetchInjuryTypes());
  }, [dispatch]);

  useEffect(() => {
    const params = {
      startDate: toYMD(startDate),
      endDate: toYMD(endDate),
      severities: severityFilter.map(s => s.value).join(','),
      types: injuryTypeFilter.map(t => t.value).join(','),
    };
    dispatch(fetchInjuryProjects(params));
  }, [dispatch, startDate, endDate, severityFilter, injuryTypeFilter]);

  const data = Array.isArray(rawData) ? rawData : [];
  const projects = Array.isArray(injuryProjects) ? injuryProjects : [];
  const sevList = Array.isArray(severities) ? severities : [];
  const typeList = Array.isArray(injuryTypes) ? injuryTypes : [];
  const hasProjectListFilters =
    severityFilter.length > 0 || injuryTypeFilter.length > 0 || startDate || endDate;

  useEffect(() => {
    if (!hasProjectListFilters && projects.length) {
      // Keep the original project set so duplicate-name labels do not change after filtering.
      setUnfilteredProjects(projects);
    }
  }, [hasProjectListFilters, projects]);

  const projectLabelById = useMemo(() => {
    const labelSourceProjects = unfilteredProjects.length ? unfilteredProjects : projects;
    const nameCounts = new Map();
    for (const p of labelSourceProjects) {
      const name = p?.name ?? '';
      if (name) nameCounts.set(name, (nameCounts.get(name) || 0) + 1);
    }

    const labels = new Map();
    for (const p of labelSourceProjects) {
      const name = p?.name ?? '';
      const id = String(p?._id ?? '');
      if (!name || !id) continue;

      // Use project identity from the unfiltered set so duplicate labels stay stable.
      labels.set(id, nameCounts.get(name) > 1 ? `${name} (${id.slice(0, 6)})` : name);
    }
    return labels;
  }, [projects, unfilteredProjects]);

  const projectNameOptions = useMemo(() => {
    const opts = [];
    for (const p of projects) {
      const id = String(p?._id ?? '');
      // Reuse the stable label when filtered options are rebuilt from project IDs.
      const label = projectLabelById.get(id);
      if (!id || !label) continue;
      opts.push({ value: id, label, projectName: p.name });
    }
    return opts.sort((a, b) => a.label.localeCompare(b.label));
  }, [projects, projectLabelById]);

  useEffect(() => {
    if (!projectNameFilter.length) return;
    const valid = new Set(projectNameOptions.map(o => o.value));
    const filtered = projectNameFilter.filter(p => valid.has(p.value));
    if (filtered.length !== projectNameFilter.length) setProjectNameFilter(filtered);
  }, [projectNameOptions, projectNameFilter]);

  const severityOptions = useMemo(() => sevList.map(s => ({ value: s, label: s })), [sevList]);
  const typeOptions = useMemo(() => typeList.map(t => ({ value: t, label: t })), [typeList]);

  useEffect(() => {
    const params = {
      ...injuryProjectParams(projectNameFilter),
      startDate: toYMD(startDate),
      endDate: toYMD(endDate),
      severities: severityFilter.map(s => s.value).join(','),
      types: injuryTypeFilter.map(t => t.value).join(','),
    };
    dispatch(fetchInjuryData(params));
  }, [dispatch, projectNameFilter, severityFilter, injuryTypeFilter, startDate, endDate]);

  const projectNameById = useMemo(() => {
    const m = new Map();
    for (const p of projects) m.set(String(p._id), p.name);
    for (const r of data) {
      const pid = String(r?.projectId ?? 'unknown');
      if (!m.has(pid) && r?.projectName) m.set(pid, r.projectName);
    }
    return m;
  }, [projects, data]);

  const chartData = useMemo(() => {
    const acc = Object.create(null);
    for (const r of data) {
      const workerCategory = r?.workerCategory ?? 'Unknown';
      const pid = String(r?.projectId ?? 'unknown');
      const total = Number(r?.totalInjuries) || 0;
      if (!acc[workerCategory]) acc[workerCategory] = { workerCategory };
      acc[workerCategory][pid] = (acc[workerCategory][pid] || 0) + total;
    }
    return Object.values(acc);
  }, [data]);

  const seriesProjectIds = useMemo(() => {
    const set = new Set(data.map(d => String(d?.projectId ?? 'unknown')));
    return Array.from(set);
  }, [data]);
  const allSeriesProjectIds = useMemo(() => {
    const set = new Set(projects.map(p => String(p._id)));
    // Include projects that have bars but are missing from the project list, so the legend matches the chart
    for (const pid of seriesProjectIds) set.add(pid);
    return Array.from(set);
  }, [projects, seriesProjectIds]);
  const colorProjectIds = useMemo(() => {
    const source = unfilteredProjects.length ? unfilteredProjects : projects;
    const set = new Set(source.map(project => String(project._id)));
    // Every project shown (current list or bars) needs a palette color; otherwise it renders black,
    // which is invisible on the dark-mode chart background
    for (const p of projects) set.add(String(p._id));
    for (const pid of seriesProjectIds) set.add(pid);
    return Array.from(set);
  }, [unfilteredProjects, projects, seriesProjectIds]);

  const showLabels = seriesProjectIds.length <= 4;

  const COLOR_PALETTE = [
    '#34D399', // green
    '#2563EB', // blue
    '#F472B6', // pink
    '#FBBF24', // amber
    '#A78BFA', // purple
    '#FB923C', // orange
    '#F87171', // red
    '#38BDF8', // cyan
  ];

  const projectColorById = new Map();
  [...colorProjectIds]
    .sort((a, b) => a.localeCompare(b))
    .forEach((pid, index) => {
      // Sort by project ID so colors do not depend on API or filter response order.
      projectColorById.set(pid, COLOR_PALETTE[index % COLOR_PALETTE.length]);
    });

  // Force a resize/reflow after data/filter changes so chart draws immediately (no hover needed)
  useEffect(() => {
    // Only do this once the chart is supposed to be visible
    if (loading || error) return;

    const raf = requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize')); // triggers ResponsiveContainer measure
      setChartKey(k => k + 1); // extra-safe: forces a clean remount
    });

    return () => cancelAnimationFrame(raf);
  }, [
    loading,
    error,
    darkMode,
    chartData.length,
    seriesProjectIds.length,
    projectNameFilter,
    severityFilter,
    injuryTypeFilter,
    startDate,
    endDate,
  ]);

  // Theme-aware react-select styles for both modes. Styling lives here instead of global
  // CSS overrides so it cannot leak into other dropdowns in the app.
  const selectStyles = useMemo(() => {
    const textColor = darkMode ? '#ffffff' : '#111827';
    const mutedColor = darkMode ? '#cbd5e1' : '#6b7280';
    const surfaceColor = darkMode ? '#2b3e59' : '#ffffff';
    const borderColor = darkMode ? '#6b7280' : '#d1d5db';

    return {
      control: (base, state) => ({
        ...base,
        backgroundColor: surfaceColor,
        borderColor: state.isFocused ? '#3b82f6' : borderColor,
        boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
        '&:hover': { borderColor: '#3b82f6' },
      }),
      placeholder: base => ({ ...base, color: mutedColor }),
      // Typed search text stays readable in dark mode (was black on dark before)
      input: base => ({ ...base, color: textColor }),
      singleValue: base => ({ ...base, color: textColor }),
      multiValue: base => ({ ...base, backgroundColor: darkMode ? '#375071' : '#e5e7eb' }),
      multiValueLabel: base => ({ ...base, color: textColor }),
      multiValueRemove: base => ({
        ...base,
        color: textColor,
        ':hover': { backgroundColor: '#0d55b3', color: '#ffffff' },
      }),
      indicatorSeparator: base => ({ ...base, backgroundColor: borderColor }),
      dropdownIndicator: base => ({ ...base, color: mutedColor, ':hover': { color: textColor } }),
      clearIndicator: base => ({ ...base, color: mutedColor, ':hover': { color: textColor } }),
      menu: base => ({ ...base, backgroundColor: surfaceColor, zIndex: 5 }),
      option: (base, state) => {
        let backgroundColor = surfaceColor;
        if (state.isFocused) backgroundColor = darkMode ? '#334155' : '#e2e8f0';
        if (state.isSelected) backgroundColor = darkMode ? '#1d4ed8' : '#dbeafe';
        return {
          ...base,
          backgroundColor,
          color: textColor,
          ':active': { backgroundColor: darkMode ? '#0d55b3' : '#bfdbfe' },
        };
      },
      noOptionsMessage: base => ({ ...base, color: mutedColor }),
    };
  }, [darkMode]);

  const containerClassName = `${styles.injuryChartContainer} ${
    darkMode ? styles.injuryChartDark : ''
  }`;
  // Applied to the calendar popup itself so dark styles don't depend on global classes
  const calendarClassName = darkMode ? styles.injuryDarkCalendar : undefined;

  return (
    <div className={containerClassName}>
      <div className={styles.injuryChartHeader}>
        <h3 className={styles.injuryChartTitle}>Injury Severity by Category of Worker Injured</h3>
        <div className={styles.analysisAction} role="group" aria-label="Injury analysis view">
          <button type="button" aria-pressed={!analysisOpen} onClick={() => setAnalysisOpen(false)}>
            Snapshot
          </button>
          <button
            type="button"
            aria-pressed={analysisOpen}
            aria-haspopup="dialog"
            aria-expanded={analysisOpen}
            onClick={() => setAnalysisOpen(true)}
          >
            Time series <span aria-hidden="true">↗</span>
          </button>
        </div>

        <div className={styles.injuryChartFilters}>
          <div className={styles.injuryFilter}>
            <label
              className={styles.injuryFilterLabel}
              style={{ pointerEvents: 'none' }}
              htmlFor="project-names-select"
            >
              Projects
            </label>
            <Select
              inputId="project-names-select"
              classNamePrefix="injurySelect"
              isMulti
              options={projectNameOptions}
              value={projectNameFilter}
              onChange={setProjectNameFilter}
              placeholder="All names"
              styles={selectStyles}
            />
          </div>

          <div className={styles.injuryFilter}>
            <label
              className={styles.injuryFilterLabel}
              style={{ pointerEvents: 'none' }}
              htmlFor="severities-select"
            >
              Severities
            </label>
            <Select
              inputId="severities-select"
              classNamePrefix="injurySelect"
              isMulti
              options={severityOptions}
              value={severityFilter}
              onChange={setSeverityFilter}
              placeholder="All severities"
              styles={selectStyles}
            />
          </div>

          <div className={styles.injuryFilter}>
            <label
              className={styles.injuryFilterLabel}
              style={{ pointerEvents: 'none' }}
              htmlFor="injury-types-select"
            >
              Injury types
            </label>
            <Select
              inputId="injury-types-select"
              classNamePrefix="injurySelect"
              isMulti
              options={typeOptions}
              value={injuryTypeFilter}
              onChange={setInjuryTypeFilter}
              placeholder="All types"
              styles={selectStyles}
            />
          </div>

          <div className={styles.injuryFilter}>
            {/* Unique id: "start-date" is also used by Most Frequent Keywords on the same page */}
            <label
              className={styles.injuryFilterLabel}
              style={{ pointerEvents: 'none' }}
              htmlFor="injury-category-start-date"
            >
              Start date
            </label>
            <DatePicker
              id="injury-category-start-date"
              selected={startDate}
              onChange={setStartDate}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={endDate || undefined}
              placeholderText="Start date"
              className={styles.injuryDateInput}
              wrapperClassName={styles.injuryDateWrapper}
              calendarClassName={calendarClassName}
            />
          </div>

          <div className={styles.injuryFilter}>
            <label
              className={styles.injuryFilterLabel}
              style={{ pointerEvents: 'none' }}
              htmlFor="injury-category-end-date"
            >
              End date
            </label>
            <DatePicker
              id="injury-category-end-date"
              selected={endDate}
              onChange={setEndDate}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate || undefined}
              placeholderText="End date"
              className={styles.injuryDateInput}
              wrapperClassName={styles.injuryDateWrapper}
              calendarClassName={calendarClassName}
            />
          </div>
        </div>
      </div>

      {analysisOpen && (
        <InjuryAnalysisDialog
          initialSettings={analysisSettings}
          onSettingsChange={setAnalysisSettings}
          onClose={() => setAnalysisOpen(false)}
          darkMode={darkMode}
          initialRange={{
            ...(startDate ? { start: toYMD(startDate) } : {}),
            ...(endDate ? { end: toYMD(endDate) } : {}),
          }}
          selectStyles={selectStyles}
          filters={[
            {
              id: 'projects',
              label: 'Projects',
              options: projectNameOptions,
              value: projectNameFilter,
              onChange: setProjectNameFilter,
            },
            {
              id: 'severities',
              label: 'Severities',
              options: severityOptions,
              value: severityFilter,
              onChange: setSeverityFilter,
            },
            {
              id: 'types',
              label: 'Injury types',
              options: typeOptions,
              value: injuryTypeFilter,
              onChange: setInjuryTypeFilter,
            },
          ]}
        />
      )}
      {loading && <p className={styles.injuryStatusText}>Loading…</p>}
      {!loading && error && <p className={styles.injuryErrorText}>Error: {String(error)}</p>}

      {!loading && !error && chartData.length > 0 && (
        <div className={styles.chartArea}>
          <ResponsiveContainer key={chartKey} width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
              style={{
                backgroundColor: darkMode ? '#1e2a3a' : '#fff',
                borderRadius: '8px',
                padding: '8px',
              }}
            >
              <XAxis
                dataKey="workerCategory"
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fill: darkMode ? '#fff' : '#000' }}
                axisLine={{ stroke: darkMode ? '#888' : '#000' }}
                tickLine={{ stroke: darkMode ? '#888' : '#000' }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: darkMode ? '#fff' : '#000' }}
                axisLine={{ stroke: darkMode ? '#888' : '#000' }}
                tickLine={{ stroke: darkMode ? '#888' : '#000' }}
              />
              <Tooltip
                //tooltip only; no shaded hover overlay across the chart
                cursor={false}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;

                  return (
                    <div
                      style={{
                        backgroundColor: darkMode ? '#2b3e59' : '#fff',
                        border: darkMode ? '1px solid #555' : '1px solid #ccc',
                        padding: 10,
                      }}
                    >
                      <div style={{ color: darkMode ? '#fff' : '#000', margin: 0 }}>{label}</div>
                      {payload.map(entry => {
                        const projectId = String(entry.dataKey);
                        const projectColor =
                          projectColorById.get(projectId) || entry.color || '#000';
                        const projectLabel =
                          projectLabelById.get(projectId) ||
                          projectNameById.get(projectId) ||
                          'Unknown Project';

                        return (
                          <div
                            key={projectId}
                            className={styles.tooltipSeriesRow}
                            style={{ '--tooltip-series-color': projectColor }}
                          >
                            {projectLabel} : {entry.value}
                          </div>
                        );
                      })}
                    </div>
                  );
                }}
              />
              <Legend
                wrapperStyle={{
                  color: darkMode ? '#fff' : '#000',
                  paddingBottom: 10,
                }}
                payload={allSeriesProjectIds.map(pid => ({
                  id: pid,
                  type: 'square',
                  color: projectColorById.get(pid),
                  value: projectLabelById.get(pid) || projectNameById.get(pid) || 'Unknown Project',
                }))}
              />
              {seriesProjectIds.map(pid => (
                <Bar
                  key={pid}
                  dataKey={pid}
                  fill={projectColorById.get(pid)}
                  stroke={darkMode ? '#E5E7EB' : '#ffffff'}
                  strokeWidth={1}
                >
                  {showLabels && (
                    <LabelList
                      dataKey={pid}
                      position="top"
                      formatter={v => (v > 0 ? v : '')}
                      // Readable value labels in both themes (were dim gray in dark mode)
                      fill={darkMode ? '#f3f4f6' : '#374151'}
                    />
                  )}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {!loading && !error && chartData.length === 0 && (
        <div className={styles.injuryEmptyText}>No data for selected filters.</div>
      )}
    </div>
  );
}

export default InjuryCategoryBarChart;
