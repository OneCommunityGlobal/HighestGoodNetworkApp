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
import 'react-datepicker/dist/react-datepicker.css';
import './InjuryCategoryBarChart.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchInjuryData,
  fetchSeverities,
  fetchInjuryTypes,
  fetchInjuryProjects,
} from '../../../../actions/bmdashboard/injuryActions';

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

  const projectNameOptions = useMemo(() => {
    const seen = new Set();
    const opts = [];
    for (const p of projects) {
      const name = p?.name ?? '';
      if (!name || seen.has(name)) continue;
      seen.add(name);
      opts.push({ value: name, label: name });
    }
    return opts.sort((a, b) => a.label.localeCompare(b.label));
  }, [projects]);

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
      projectNames: projectNameFilter.length ? projectNameFilter.map(p => p.value).join(',') : '',
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

  const showLabels = seriesProjectIds.length <= 4;

  return (
    <div className={`injury-chart-container ${darkMode ? 'darkMode' : ''}`}>
      <div className="injury-chart-header">
        <h3 className="injury-chart-title">Injury Severity by Category of Worker Injured</h3>

        <div className="injury-chart-filters">
          <div className="filter">
            <label htmlFor="project-names-select">Projects</label>
            <Select
              inputId="project-names-select"
              classNamePrefix="injury-select"
              isMulti
              options={projectNameOptions}
              value={projectNameFilter}
              onChange={setProjectNameFilter}
              placeholder="All names"
            />
          </div>

          <div className="filter">
            <label htmlFor="severities-select">Severities</label>
            <Select
              inputId="severities-select"
              classNamePrefix="injury-select"
              isMulti
              options={severityOptions}
              value={severityFilter}
              onChange={setSeverityFilter}
              placeholder="All severities"
            />
          </div>

          <div className="filter">
            <label htmlFor="injury-types-select">Injury types</label>
            <Select
              inputId="injury-types-select"
              classNamePrefix="injury-select"
              isMulti
              options={typeOptions}
              value={injuryTypeFilter}
              onChange={setInjuryTypeFilter}
              placeholder="All types"
            />
          </div>

          <div className="filter">
            <label htmlFor="start-date">Start date</label>
            <DatePicker
              id="start-date"
              selected={startDate}
              onChange={setStartDate}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              maxDate={endDate || undefined}
              placeholderText="Start date"
            />
          </div>

          <div className="filter">
            <label htmlFor="end-date">End date</label>
            <DatePicker
              id="end-date"
              selected={endDate}
              onChange={setEndDate}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate || undefined}
              placeholderText="End date"
            />
          </div>
        </div>
      </div>

      {loading && <p className={darkMode ? 'darkMode' : ''}>Loading…</p>}
      {!loading && error && (
        <p className={`error ${darkMode ? 'darkMode' : ''}`}>Error: {String(error)}</p>
      )}

      {!loading && !error && (
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={chartData} margin={{ top: 16, right: 24, bottom: 8, left: 8 }}>
            <XAxis
              dataKey="workerCategory"
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fill: darkMode ? '#fff' : '#000' }}
            />
            <YAxis allowDecimals={false} tick={{ fill: darkMode ? '#fff' : '#000' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? '#2b3e59' : '#fff',
                border: darkMode ? '1px solid #555' : '1px solid #ccc',
                color: darkMode ? '#fff' : '#000',
              }}
              formatter={(value, name) => [
                value,
                projectNameById.get(String(name)) || 'Unknown Project',
              ]}
            />
            <Legend
              wrapperStyle={{
                maxHeight: 72,
                overflowY: 'auto',
                color: darkMode ? '#fff' : '#000',
              }}
              payload={seriesProjectIds.map(pid => ({
                id: pid,
                type: 'square',
                value: projectNameById.get(pid) || 'Unknown Project',
              }))}
            />
            {seriesProjectIds.map((pid, index) => (
              <Bar
                key={pid}
                dataKey={pid}
                fill={index % 2 === 0 ? '#17c9d3' : darkMode ? '#888' : '#000'}
              >
                {showLabels && (
                  <LabelList
                    dataKey={pid}
                    position="top"
                    formatter={v => (v > 0 ? v : '')}
                    fill={darkMode ? '#fff' : '#000'}
                  />
                )}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}

      {!loading && !error && chartData.length === 0 && (
        <div className={`empty ${darkMode ? 'darkMode' : ''}`}>No data for selected filters.</div>
      )}
    </div>
  );
}

export default InjuryCategoryBarChart;
