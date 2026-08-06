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

  const projectLabelById = useMemo(() => {
    const nameCounts = new Map();
    for (const p of projects) {
      const name = p?.name ?? '';
      if (name) nameCounts.set(name, (nameCounts.get(name) || 0) + 1);
    }

    const labels = new Map();
    for (const p of projects) {
      const name = p?.name ?? '';
      const id = String(p?._id ?? '');
      if (!name || !id) continue;

      // Use a short ID only when duplicate project names need disambiguation.
      labels.set(id, nameCounts.get(name) > 1 ? `${name} (${id.slice(0, 6)})` : name);
    }
    return labels;
  }, [projects]);

  const projectNameOptions = useMemo(() => {
    const opts = [];
    for (const p of projects) {
      const id = String(p?._id ?? '');
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
    return Array.from(set);
  }, [projects]);

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
  [...allSeriesProjectIds]
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

  const selectStyles = darkMode && {
    control: base => ({
      ...base,
      backgroundColor: '#2b3e59',
      color: 'white',
    }),
    menu: base => ({
      ...base,
      backgroundColor: '#2b3e59',
      color: 'white',
    }),
    option: (base, state) => ({
      ...base,
      color: 'white',
      backgroundColor: state.isSelected
        ? 'rgba(255, 255, 255, 0.15)'
        : state.isFocused
        ? 'rgba(255, 255, 255, 0.1)'
        : 'transparent',
      '&:active': {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
      },
    }),
    singleValue: base => ({
      ...base,
      color: 'white',
    }),
  };
  // : {};

  return (
    <div className={`injury-chart-container ${darkMode && 'darkMode'}`}>
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
            />
          </div>
        </div>
      </div>

      {loading && <p className={darkMode ? styles.darkMode : ''}>Loading…</p>}
      {!loading && error && <p className={styles.error}>Error: {String(error)}</p>}

      {!loading && !error && chartData.length > 0 && (
        <ResponsiveContainer key={chartKey} width="100%" height={560}>
          <BarChart
            data={chartData}
            margin={{ top: 16, right: 24, bottom: 8, left: 8 }}
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
              contentStyle={{
                backgroundColor: darkMode ? '#2b3e59' : '#fff',
                color: darkMode ? '#fff' : '#000',
                border: darkMode ? '1px solid #555' : '1px solid #ccc',
              }}
              labelStyle={{
                color: darkMode ? '#fff' : '#000',
              }}
              formatter={(value, name) => [
                value,
                projectLabelById.get(String(name)) ||
                  projectNameById.get(String(name)) ||
                  'Unknown Project',
              ]}
            />
            <Legend
              wrapperStyle={{
                color: darkMode ? '#fff' : '#000',
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
      )}

      {!loading && !error && chartData.length === 0 && (
        <div className="empty">No data for selected filters.</div>
      )}
    </div>
  );
}

export default InjuryCategoryBarChart;
