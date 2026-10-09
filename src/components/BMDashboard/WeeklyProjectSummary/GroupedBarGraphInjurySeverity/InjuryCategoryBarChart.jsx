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
import { buildChartSelectStyles } from '../sharedSelectStyles';
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

const buildDateAndFilterParams = (startDate, endDate, severityFilter, injuryTypeFilter) => ({
  startDate: toYMD(startDate),
  endDate: toYMD(endDate),
  severities: severityFilter.map(s => s.value).join(','),
  types: injuryTypeFilter.map(t => t.value).join(','),
});

const buildProjectNameById = (projects, data) => {
  const m = new Map();
  for (const p of projects) m.set(String(p._id), p.name);
  for (const r of data) {
    const pid = String(r?.projectId ?? 'unknown');
    if (!m.has(pid) && r?.projectName) m.set(pid, r.projectName);
  }
  return m;
};

const buildChartData = data => {
  const acc = Object.create(null);
  for (const r of data) {
    const workerCategory = r?.workerCategory ?? 'Unknown';
    const pid = String(r?.projectId ?? 'unknown');
    const total = Number(r?.totalInjuries) || 0;
    if (!acc[workerCategory]) acc[workerCategory] = { workerCategory };
    acc[workerCategory][pid] = (acc[workerCategory][pid] || 0) + total;
  }
  return Object.values(acc);
};

const buildProjectColorById = colorProjectIds => {
  const projectColorById = new Map();
  [...colorProjectIds]
    .sort((a, b) => a.localeCompare(b))
    .forEach((pid, index) => {
      // Sort by project ID so colors do not depend on API or filter response order.
      projectColorById.set(pid, COLOR_PALETTE[index % COLOR_PALETTE.length]);
    });
  return projectColorById;
};

const useChartResizeOnChange = ({ loading, error, deps }) => {
  const [chartKey, setChartKey] = useState(0);

  // Force a resize/reflow after data/filter changes so chart draws immediately (no hover needed)
  useEffect(() => {
    // Only do this once the chart is supposed to be visible
    if (loading || error) return undefined;

    const raf = requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize')); // triggers ResponsiveContainer measure
      setChartKey(k => k + 1); // extra-safe: forces a clean remount
    });

    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error, ...deps]);

  return chartKey;
};

function InjuryTooltipContent({
  active,
  payload,
  label,
  darkMode,
  projectColorById,
  projectLabelById,
  projectNameById,
}) {
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
        const projectColor = projectColorById.get(projectId) || entry.color || '#000';
        const projectLabel =
          projectLabelById.get(projectId) || projectNameById.get(projectId) || 'Unknown Project';

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
}

function InjuryBarChartView({
  chartKey,
  chartData,
  darkMode,
  seriesProjectIds,
  allSeriesProjectIds,
  projectColorById,
  projectLabelById,
  projectNameById,
  showLabels,
}) {
  return (
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
            content={
              <InjuryTooltipContent
                darkMode={darkMode}
                projectColorById={projectColorById}
                projectLabelById={projectLabelById}
                projectNameById={projectNameById}
              />
            }
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
                  // fill={darkMode ? '#fff' : '#000'}
                />
              )}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

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

  useEffect(() => {
    dispatch(fetchSeverities());
    dispatch(fetchInjuryTypes());
  }, [dispatch]);

  useEffect(() => {
    const params = buildDateAndFilterParams(startDate, endDate, severityFilter, injuryTypeFilter);
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
      opts.push({ value: id, label });
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
      projectIds: projectNameFilter.length ? projectNameFilter.map(p => p.value).join(',') : '',
      ...buildDateAndFilterParams(startDate, endDate, severityFilter, injuryTypeFilter),
    };
    dispatch(fetchInjuryData(params));
  }, [dispatch, projectNameFilter, severityFilter, injuryTypeFilter, startDate, endDate]);

  const projectNameById = useMemo(() => buildProjectNameById(projects, data), [projects, data]);

  const chartData = useMemo(() => buildChartData(data), [data]);

  const seriesProjectIds = useMemo(() => {
    const set = new Set(data.map(d => String(d?.projectId ?? 'unknown')));
    return Array.from(set);
  }, [data]);
  const allSeriesProjectIds = useMemo(() => {
    const set = new Set(projects.map(p => String(p._id)));
    return Array.from(set);
  }, [projects]);
  const colorProjectIds = useMemo(() => {
    const source = unfilteredProjects.length ? unfilteredProjects : projects;
    const set = new Set(source.map(project => String(project._id)));
    return Array.from(set);
  }, [unfilteredProjects, projects]);

  const showLabels = seriesProjectIds.length <= 4;

  const projectColorById = useMemo(() => buildProjectColorById(colorProjectIds), [colorProjectIds]);

  const chartKey = useChartResizeOnChange({
    loading,
    error,
    deps: [
      darkMode,
      chartData.length,
      seriesProjectIds.length,
      projectNameFilter,
      severityFilter,
      injuryTypeFilter,
      startDate,
      endDate,
    ],
  });

  const selectStyles = buildChartSelectStyles(darkMode);

  return (
    <div className={`injury-chart-container ${darkMode ? 'darkMode' : ''}`}>
      <div className="injury-chart-header">
        <h3 className="injury-chart-title">Injury Severity by Category of Worker Injured</h3>

        <div className="injury-chart-filters">
          <div className="filter injury-filter">
            <label style={{ pointerEvents: 'none' }} htmlFor="project-names-select">
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

          <div className="filter injury-filter">
            <label style={{ pointerEvents: 'none' }} htmlFor="severities-select">
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

          <div className="filter injury-filter">
            <label style={{ pointerEvents: 'none' }} htmlFor="injury-types-select">
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

          <div className="filter injury-filter">
            <label style={{ pointerEvents: 'none' }} htmlFor="start-date">
              Start date
            </label>
            <DatePicker
              id="start-date"
              selected={startDate}
              onChange={setStartDate}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={endDate || undefined}
              placeholderText="Start date"
              className="injury-date-input"
              calendarClassName={darkMode ? 'paid-labor-cost-dark-calendar' : ''}
            />
          </div>

          <div className="filter injury-filter">
            <label style={{ pointerEvents: 'none' }} htmlFor="end-date">
              End date
            </label>
            <DatePicker
              id="end-date"
              selected={endDate}
              onChange={setEndDate}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate || undefined}
              placeholderText="End date"
              className="injury-date-input"
              calendarClassName={darkMode ? 'paid-labor-cost-dark-calendar' : ''}
            />
          </div>
        </div>
      </div>

      {loading && <p className={darkMode ? styles.darkMode : ''}>Loading…</p>}
      {!loading && error && <p className={styles.error}>Error: {String(error)}</p>}

      {!loading && !error && chartData.length > 0 && (
        <InjuryBarChartView
          chartKey={chartKey}
          chartData={chartData}
          darkMode={darkMode}
          seriesProjectIds={seriesProjectIds}
          allSeriesProjectIds={allSeriesProjectIds}
          projectColorById={projectColorById}
          projectLabelById={projectLabelById}
          projectNameById={projectNameById}
          showLabels={showLabels}
        />
      )}

      {!loading && !error && chartData.length === 0 && (
        <div className="empty">No data for selected filters.</div>
      )}
    </div>
  );
}

export default InjuryCategoryBarChart;
