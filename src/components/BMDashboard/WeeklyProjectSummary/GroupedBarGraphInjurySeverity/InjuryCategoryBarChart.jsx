import { useCallback, useEffect, useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
  Rectangle,
  ResponsiveContainer,
} from 'recharts';
import Select from 'react-select';
import DatePicker from 'react-datepicker';

import styles from './InjuryCategoryBarChart.module.css';
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

// The injury project list groups projects by name, because legacy injury rows can use several
// project IDs for one project. Use the same normalized name as the project key everywhere, so
// one project is always one series, one legend entry and one color.
const normalizeName = value =>
  String(value ?? '')
    .trim()
    .toLowerCase();
const projectKeyOf = project => normalizeName(project?.name) || String(project?._id ?? '');
// Rows with no project name and no single matching project are shown as one "Unknown Project"
const UNKNOWN_PROJECT_KEY = '__unknown_project__';

// Distinct colors so projects never share one; extra projects get evenly spread hues.
const COLOR_PALETTE = [
  '#34D399', // green
  '#2563EB', // blue
  '#F472B6', // pink
  '#FBBF24', // amber
  '#A78BFA', // purple
  '#FB923C', // orange
  '#F87171', // red
  '#38BDF8', // cyan
  '#84CC16', // lime
  '#D946EF', // fuchsia
  '#14B8A6', // teal
  '#A16207', // brown
  '#6366F1', // indigo
  '#94A3B8', // slate
];
const getSeriesColor = index =>
  index < COLOR_PALETTE.length
    ? COLOR_PALETTE[index]
    : `hsl(${Math.round((index * 137.508) % 360)}, 65%, 55%)`;

// Gap between bars in a group (also passed to BarChart so the packed positions line up)
const BAR_GAP = 4;

// All project IDs recorded under one project-list entry
const getProjectIds = project =>
  Array.isArray(project?.projectIds) && project.projectIds.length
    ? project.projectIds
    : [project?._id];

// Project ID -> project key, for rows saved without a project name. Only IDs used by a single
// project are mapped, since some legacy IDs are shared by several project names.
const buildProjectKeyById = projectList => {
  const keysById = new Map();
  for (const p of projectList) {
    const key = projectKeyOf(p);
    for (const id of getProjectIds(p)) {
      if (id) {
        const idString = String(id);
        if (!keysById.has(idString)) keysById.set(idString, new Set());
        keysById.get(idString).add(key);
      }
    }
  }
  const result = new Map();
  keysById.forEach((keys, id) => {
    if (keys.size === 1) result.set(id, [...keys][0]);
  });
  return result;
};

// Every project ID recorded under the selected project names, as a comma-separated list
const buildSelectedProjectIdsParam = (projectList, selectedKeys) => {
  if (!selectedKeys.size) return '';
  const ids = new Set();
  for (const p of projectList) {
    if (selectedKeys.has(projectKeyOf(p))) {
      getProjectIds(p).forEach(id => id && ids.add(String(id)));
    }
  }
  return Array.from(ids).join(',');
};

// Grouped view: x position of a bar once the bars with a value in its category are packed
// together and centered (Recharts otherwise reserves a slot for every visible project).
const getPackedBarX = ({ x, width, pid, payload, visibleSeriesIds }) => {
  const slot = visibleSeriesIds.indexOf(pid);
  const presentIds = visibleSeriesIds.filter(id => Number(payload?.[id]) > 0);
  const step = width + BAR_GAP;
  const groupLeft = x - slot * step;
  const centeringOffset = ((visibleSeriesIds.length - presentIds.length) * step) / 2;
  return groupLeft + centeringOffset + presentIds.indexOf(pid) * step;
};

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
  const [unfilteredProjects, setUnfilteredProjects] = useState([]);
  // 'grouped' compares projects side by side; 'stacked' shows total impact per category
  const [viewMode, setViewMode] = useState('grouped');
  // Project series hidden by clicking their legend entry
  const [hiddenSeries, setHiddenSeries] = useState([]);

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
      // Keep the original project set so colors and labels stay stable while filtering.
      setUnfilteredProjects(projects);
    }
  }, [hasProjectListFilters, projects]);

  // Display name per project key
  const projectLabelById = useMemo(() => {
    const labels = new Map();
    for (const p of [...unfilteredProjects, ...projects]) {
      const key = projectKeyOf(p);
      const name = String(p?.name ?? '').trim();
      if (key && name && !labels.has(key)) labels.set(key, name);
    }
    return labels;
  }, [projects, unfilteredProjects]);

  const projectNameOptions = useMemo(() => {
    const opts = [];
    const seen = new Set();
    for (const p of projects) {
      const key = projectKeyOf(p);
      const label = projectLabelById.get(key);
      if (!key || !label || seen.has(key)) continue;
      seen.add(key);
      opts.push({ value: key, label });
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

  const projectKeyById = useMemo(() => buildProjectKeyById([...unfilteredProjects, ...projects]), [
    projects,
    unfilteredProjects,
  ]);

  const rowKeyOf = useCallback(
    row =>
      normalizeName(row?.projectName) ||
      projectKeyById.get(String(row?.projectId ?? '')) ||
      UNKNOWN_PROJECT_KEY,
    [projectKeyById],
  );

  const selectedProjectKeys = useMemo(() => new Set(projectNameFilter.map(p => p.value)), [
    projectNameFilter,
  ]);

  // Every project ID recorded under the selected project names, so no injuries are left out
  const selectedProjectIdsParam = useMemo(
    () => buildSelectedProjectIdsParam([...unfilteredProjects, ...projects], selectedProjectKeys),
    [selectedProjectKeys, unfilteredProjects, projects],
  );

  useEffect(() => {
    const params = {
      projectIds: selectedProjectIdsParam,
      startDate: toYMD(startDate),
      endDate: toYMD(endDate),
      severities: severityFilter.map(s => s.value).join(','),
      types: injuryTypeFilter.map(t => t.value).join(','),
    };
    dispatch(fetchInjuryData(params));
  }, [dispatch, selectedProjectIdsParam, severityFilter, injuryTypeFilter, startDate, endDate]);

  // Rows of the selected projects only (a legacy project ID can also be used by another name)
  const projectRows = useMemo(
    () =>
      selectedProjectKeys.size ? data.filter(r => selectedProjectKeys.has(rowKeyOf(r))) : data,
    [data, selectedProjectKeys, rowKeyOf],
  );

  const projectNameById = useMemo(() => {
    const m = new Map(projectLabelById);
    m.set(UNKNOWN_PROJECT_KEY, 'Unknown Project');
    for (const r of projectRows) {
      const key = rowKeyOf(r);
      const name = String(r?.projectName ?? '').trim();
      if (!m.has(key) && name) m.set(key, name);
    }
    return m;
  }, [projectLabelById, projectRows, rowKeyOf]);

  const chartData = useMemo(() => {
    const acc = Object.create(null);
    for (const r of projectRows) {
      const workerCategory = r?.workerCategory ?? 'Unknown';
      const key = rowKeyOf(r);
      const total = Number(r?.totalInjuries) || 0;
      if (!acc[workerCategory]) acc[workerCategory] = { workerCategory };
      acc[workerCategory][key] = (acc[workerCategory][key] || 0) + total;
    }
    return Object.values(acc);
  }, [projectRows, rowKeyOf]);

  const seriesProjectIds = useMemo(() => {
    const set = new Set(projectRows.map(rowKeyOf));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [projectRows, rowKeyOf]);
  const allSeriesProjectIds = useMemo(() => {
    const set = new Set();
    for (const p of projects) {
      const key = projectKeyOf(p);
      if (!selectedProjectKeys.size || selectedProjectKeys.has(key)) set.add(key);
    }
    // Include projects that have bars but are missing from the project list, so the legend matches the chart
    for (const key of seriesProjectIds) set.add(key);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [projects, selectedProjectKeys, seriesProjectIds]);
  const colorProjectIds = useMemo(() => {
    const set = new Set([...unfilteredProjects, ...projects].map(projectKeyOf));
    // Every project shown needs its own color; otherwise it renders black, which is invisible
    // on the dark-mode chart background
    for (const key of seriesProjectIds) set.add(key);
    return Array.from(set);
  }, [unfilteredProjects, projects, seriesProjectIds]);

  const isStacked = viewMode === 'stacked';
  const visibleSeriesIds = useMemo(
    () => seriesProjectIds.filter(pid => !hiddenSeries.includes(pid)),
    [seriesProjectIds, hiddenSeries],
  );
  const lastVisibleSeriesId = visibleSeriesIds.at(-1);
  // Per-bar labels only when few projects are visible, so they do not overlap
  const showLabels = !isStacked && visibleSeriesIds.length <= 4;

  // Add the visible total per worker category (used for stacked totals and insights)
  const displayData = useMemo(
    () =>
      chartData.map(row => ({
        ...row,
        __total: visibleSeriesIds.reduce((sum, pid) => sum + (Number(row[pid]) || 0), 0),
      })),
    [chartData, visibleSeriesIds],
  );

  const insights = useMemo(() => {
    const grandTotal = displayData.reduce((sum, row) => sum + row.__total, 0);
    if (grandTotal === 0) return null;

    const topCategoryRow = displayData.reduce((best, row) =>
      row.__total > best.__total ? row : best,
    );

    let topProjectId = null;
    let topProjectTotal = 0;
    visibleSeriesIds.forEach(pid => {
      const total = displayData.reduce((sum, row) => sum + (Number(row[pid]) || 0), 0);
      if (total > topProjectTotal) {
        topProjectTotal = total;
        topProjectId = pid;
      }
    });

    return {
      grandTotal,
      categoryCount: displayData.filter(row => row.__total > 0).length,
      topCategory: topCategoryRow.workerCategory,
      topCategoryTotal: topCategoryRow.__total,
      topCategoryShare: Math.round((topCategoryRow.__total / grandTotal) * 100),
      topProjectId,
      topProjectTotal,
    };
  }, [displayData, visibleSeriesIds]);

  const topCategory = insights?.topCategory;

  const toggleSeries = pid => {
    setHiddenSeries(prev => (prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]));
  };

  // Rotate x-axis labels only when there are many categories
  const xTickAngle = displayData.length > 6 ? -35 : 0;

  // Sorted by project key so colors do not depend on API or filter response order
  const projectColorById = new Map();
  [...colorProjectIds]
    .sort((a, b) => a.localeCompare(b))
    .forEach((pid, index) => {
      projectColorById.set(pid, getSeriesColor(index));
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
    viewMode,
    hiddenSeries.length,
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

  const highlightColor = darkMode ? '#f87171' : '#b91c1c';
  const axisTextColor = darkMode ? '#fff' : '#000';
  const valueLabelColor = darkMode ? '#f3f4f6' : '#374151';

  // Abbreviates long category names (full name on hover) and highlights the top category
  const renderCategoryTick = ({ x, y, payload }) => {
    const fullName = String(payload?.value ?? '');
    const shortName = fullName.length > 12 ? `${fullName.slice(0, 11)}…` : fullName;
    const isTop = fullName === topCategory;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          dy={16}
          textAnchor={xTickAngle ? 'end' : 'middle'}
          transform={xTickAngle ? `rotate(${xTickAngle})` : undefined}
          fill={isTop ? highlightColor : axisTextColor}
          fontSize={12}
          fontWeight={isTop ? 700 : 400}
        >
          <title>{isTop ? `${fullName} (highest injuries)` : fullName}</title>
          {isTop ? `▲ ${shortName}` : shortName}
        </text>
      </g>
    );
  };

  // Grouped view: Recharts reserves a slot for every project in every category, which leaves
  // gaps where a project has no injuries. Pack each category's bars together (centered) and
  // draw the value label on the packed bar.
  const renderPackedBar = (pid, props) => {
    const { x, y, width, height, fill, stroke, payload } = props;
    const value = Number(payload?.[pid]) || 0;
    const barHeight = Number(height) || 0;
    if (value <= 0 || barHeight <= 0) return null;

    const packedX = getPackedBarX({ x, width, pid, payload, visibleSeriesIds });

    return (
      <g>
        <Rectangle
          x={packedX}
          y={y}
          width={width}
          height={barHeight}
          fill={fill}
          stroke={stroke}
          strokeWidth={1}
        />
        {showLabels && (
          <text
            x={packedX + width / 2}
            y={y - 6}
            textAnchor="middle"
            fill={valueLabelColor}
            fontSize={12}
          >
            {value}
          </text>
        )}
      </g>
    );
  };

  const viewToggleButtonClass = isActive =>
    `${styles.injuryViewToggleButton} ${isActive ? styles.injuryViewToggleButtonActive : ''}`;

  const topProjectLabel = insights?.topProjectId
    ? projectNameById.get(insights.topProjectId) || 'Unknown Project'
    : null;

  return (
    <div className={containerClassName}>
      <div className={styles.injuryChartHeader}>
        <h3 className={styles.injuryChartTitle}>Injury Severity by Category of Worker Injured</h3>

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

      {/* Switch between comparing projects and seeing total impact per category */}
      <fieldset
        className={`${styles.injuryViewToggle} ${darkMode ? styles.injuryViewToggleDark : ''}`}
        aria-label="Bar layout"
      >
        <button
          type="button"
          className={viewToggleButtonClass(!isStacked)}
          aria-pressed={!isStacked}
          onClick={() => setViewMode('grouped')}
        >
          Grouped
        </button>
        <button
          type="button"
          className={viewToggleButtonClass(isStacked)}
          aria-pressed={isStacked}
          onClick={() => setViewMode('stacked')}
        >
          Stacked
        </button>
      </fieldset>

      {loading && <p className={styles.injuryStatusText}>Loading…</p>}
      {!loading && error && <p className={styles.injuryErrorText}>Error: {String(error)}</p>}

      {!loading && !error && chartData.length > 0 && (
        <div className={styles.chartArea}>
          <ResponsiveContainer key={chartKey} width="100%" height="100%">
            <BarChart
              data={displayData}
              barGap={BAR_GAP}
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
                height={xTickAngle ? 70 : 40}
                tick={renderCategoryTick}
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
                      {payload
                        .filter(entry => Number(entry.value) > 0)
                        .map(entry => {
                          const projectId = String(entry.dataKey);
                          const projectColor =
                            projectColorById.get(projectId) || entry.color || '#000';
                          const projectLabel = projectNameById.get(projectId) || 'Unknown Project';

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
                // Legend sits above the chart; click an entry to hide/show that project
                verticalAlign="top"
                wrapperStyle={{
                  color: darkMode ? '#fff' : '#000',
                  paddingBottom: 10,
                  cursor: 'pointer',
                }}
                onClick={entry => entry?.id && toggleSeries(entry.id)}
                payload={allSeriesProjectIds.map(pid => ({
                  id: pid,
                  type: 'square',
                  color: projectColorById.get(pid),
                  inactive: hiddenSeries.includes(pid),
                  value: projectNameById.get(pid) || 'Unknown Project',
                }))}
              />
              {seriesProjectIds.map(pid => (
                <Bar
                  key={pid}
                  dataKey={pid}
                  stackId={isStacked ? 'injuries' : undefined}
                  hide={hiddenSeries.includes(pid)}
                  fill={projectColorById.get(pid)}
                  stroke={darkMode ? '#E5E7EB' : '#ffffff'}
                  strokeWidth={1}
                  shape={isStacked ? undefined : barProps => renderPackedBar(pid, barProps)}
                >
                  {/* Stacked view: show the category total on top of the stack */}
                  {isStacked && pid === lastVisibleSeriesId && (
                    <LabelList
                      position="top"
                      valueAccessor={entry => entry?.payload?.__total}
                      formatter={v => (v > 0 ? v : '')}
                      fill={valueLabelColor}
                    />
                  )}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {!loading && !error && chartData.length > 0 && (
        <section className={styles.injuryInsights} aria-label="Key insights">
          <h4 className={styles.injuryInsightsTitle}>Key Insights</h4>
          {insights ? (
            <ul className={styles.injuryInsightsList}>
              <li>
                <strong>{insights.grandTotal}</strong> injuries across{' '}
                <strong>{insights.categoryCount}</strong> worker categories.
              </li>
              <li>
                <strong>{insights.topCategory}</strong> has the most injuries (
                {insights.topCategoryTotal}, {insights.topCategoryShare}% of the total).
              </li>
              {topProjectLabel && (
                <li>
                  <strong>{topProjectLabel}</strong> reports the most injuries (
                  {insights.topProjectTotal}).
                </li>
              )}
            </ul>
          ) : (
            <p className={styles.injuryInsightsEmpty}>
              All projects are hidden. Click a legend entry to show it again.
            </p>
          )}
        </section>
      )}

      {!loading && !error && chartData.length === 0 && (
        <div className={styles.injuryEmptyText}>
          No injury records match the selected filters. Try widening the date range or clearing some
          filters.
        </div>
      )}
    </div>
  );
}

export default InjuryCategoryBarChart;
