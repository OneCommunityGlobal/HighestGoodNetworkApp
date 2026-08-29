import { useEffect, useMemo, useState } from 'react';
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

// YYYY-MM-DD without timezone shift
const toYMD = date =>
  date instanceof Date && !Number.isNaN(date.getTime())
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
        date.getDate(),
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
      severities: severityFilter.map(item => item.value).join(','),
      types: injuryTypeFilter.map(item => item.value).join(','),
    };

    dispatch(fetchInjuryProjects(params));
  }, [dispatch, startDate, endDate, severityFilter, injuryTypeFilter]);

  const data = Array.isArray(rawData) ? rawData : [];
  const projects = Array.isArray(injuryProjects) ? injuryProjects : [];
  const sevList = Array.isArray(severities) ? severities : [];
  const typeList = Array.isArray(injuryTypes) ? injuryTypes : [];

  const projectNameOptions = useMemo(() => {
    const seen = new Set();
    const options = [];

    projects.forEach(project => {
      const name = project?.name ?? '';

      if (!name || seen.has(name)) return;

      seen.add(name);

      options.push({
        value: name,
        label: name,
      });
    });

    return options.sort((a, b) => a.label.localeCompare(b.label));
  }, [projects]);

  useEffect(() => {
    if (!projectNameFilter.length) return;

    const validProjectNames = new Set(projectNameOptions.map(option => option.value));

    const filteredProjects = projectNameFilter.filter(project =>
      validProjectNames.has(project.value),
    );

    if (filteredProjects.length !== projectNameFilter.length) {
      setProjectNameFilter(filteredProjects);
    }
  }, [projectNameOptions, projectNameFilter]);

  const severityOptions = useMemo(
    () =>
      sevList.map(severity => ({
        value: severity,
        label: severity,
      })),
    [sevList],
  );

  const typeOptions = useMemo(
    () =>
      typeList.map(type => ({
        value: type,
        label: type,
      })),
    [typeList],
  );

  useEffect(() => {
    const params = {
      projectNames: projectNameFilter.length
        ? projectNameFilter.map(project => project.value).join(',')
        : '',
      startDate: toYMD(startDate),
      endDate: toYMD(endDate),
      severities: severityFilter.map(item => item.value).join(','),
      types: injuryTypeFilter.map(item => item.value).join(','),
    };

    dispatch(fetchInjuryData(params));
  }, [dispatch, projectNameFilter, severityFilter, injuryTypeFilter, startDate, endDate]);

  const projectNameById = useMemo(() => {
    const projectMap = new Map();

    projects.forEach(project => {
      projectMap.set(String(project._id), project.name);
    });

    data.forEach(record => {
      const projectId = String(record?.projectId ?? 'unknown');

      if (!projectMap.has(projectId) && record?.projectName) {
        projectMap.set(projectId, record.projectName);
      }
    });

    return projectMap;
  }, [projects, data]);

  const chartData = useMemo(() => {
    const accumulatedData = Object.create(null);

    data.forEach(record => {
      const workerCategory = record?.workerCategory ?? 'Unknown';
      const projectId = String(record?.projectId ?? 'unknown');
      const totalInjuries = Number(record?.totalInjuries) || 0;

      if (!accumulatedData[workerCategory]) {
        accumulatedData[workerCategory] = {
          workerCategory,
        };
      }

      accumulatedData[workerCategory][projectId] =
        (accumulatedData[workerCategory][projectId] || 0) + totalInjuries;
    });

    return Object.values(accumulatedData);
  }, [data]);

  const seriesProjectIds = useMemo(() => {
    const projectIds = new Set(data.map(record => String(record?.projectId ?? 'unknown')));

    return Array.from(projectIds);
  }, [data]);

  const showLabels = seriesProjectIds.length <= 4;

  const axisColor = darkMode ? '#e2e8f0' : '#374151';
  const tooltipBackground = darkMode ? '#263952' : '#ffffff';
  const tooltipText = darkMode ? '#f8fafc' : '#111827';
  const tooltipBorder = darkMode ? '#536985' : '#d1d5db';

  const renderLegend = ({ payload }) => {
    if (!payload?.length) return null;

    return (
      <div className={`injury-chart-legend ${darkMode ? 'injury-chart-legend-dark' : ''}`}>
        {payload.map(entry => (
          <div key={entry.value} className="injury-chart-legend-item" title={entry.value}>
            <span className="injury-chart-legend-marker" style={{ backgroundColor: entry.color }} />

            <span className="injury-chart-legend-text">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`injury-chart-container ${darkMode ? 'darkMode' : ''}`}>
      <div className="injury-chart-header">
        <h3 className="injury-chart-title">Injury Severity by Category of Worker Injured</h3>

        <div className="injury-chart-filters">
          <div className="filter">
            <label htmlFor="project-names-select" className="injury-chart-label">
              Projects
            </label>

            <Select
              inputId="project-names-select"
              className="injury-select-container"
              classNamePrefix="injury-select"
              isMulti
              options={projectNameOptions}
              value={projectNameFilter}
              onChange={selected => setProjectNameFilter(selected || [])}
              placeholder="All names"
              isSearchable
            />
          </div>

          <div className="filter">
            <label htmlFor="severities-select" className="injury-chart-label">
              Severities
            </label>

            <Select
              inputId="severities-select"
              className="injury-select-container"
              classNamePrefix="injury-select"
              isMulti
              options={severityOptions}
              value={severityFilter}
              onChange={selected => setSeverityFilter(selected || [])}
              placeholder="All severities"
              isSearchable
            />
          </div>

          <div className="filter">
            <label htmlFor="injury-types-select" className="injury-chart-label">
              Injury types
            </label>

            <Select
              inputId="injury-types-select"
              className="injury-select-container"
              classNamePrefix="injury-select"
              isMulti
              options={typeOptions}
              value={injuryTypeFilter}
              onChange={selected => setInjuryTypeFilter(selected || [])}
              placeholder="All types"
              isSearchable
            />
          </div>

          <div className="filter">
            <label htmlFor="injury-start-date" className="injury-chart-label">
              From
            </label>

            <DatePicker
              id="injury-start-date"
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

          <div className="filter">
            <label htmlFor="injury-end-date" className="injury-chart-label">
              To
            </label>

            <DatePicker
              id="injury-end-date"
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

      {loading && <p className="injury-chart-message">Loading…</p>}

      {!loading && error && <p className="injury-chart-error">Error: {String(error)}</p>}

      {!loading && !error && chartData.length > 0 && (
        <div className="injury-chart-visualization">
          <ResponsiveContainer width="100%" height={420}>
            <BarChart
              data={chartData}
              margin={{
                top: 16,
                right: 24,
                bottom: 8,
                left: 8,
              }}
            >
              <XAxis
                dataKey="workerCategory"
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{
                  fill: axisColor,
                  fontSize: 12,
                }}
                axisLine={{
                  stroke: axisColor,
                }}
                tickLine={{
                  stroke: axisColor,
                }}
              />

              <YAxis
                allowDecimals={false}
                tick={{
                  fill: axisColor,
                  fontSize: 12,
                }}
                axisLine={{
                  stroke: axisColor,
                }}
                tickLine={{
                  stroke: axisColor,
                }}
              />

              <Tooltip
                formatter={(value, name) => [
                  value,
                  projectNameById.get(String(name)) || 'Unknown Project',
                ]}
                contentStyle={{
                  backgroundColor: tooltipBackground,
                  color: tooltipText,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '6px',
                }}
                itemStyle={{
                  color: tooltipText,
                }}
                labelStyle={{
                  color: tooltipText,
                  fontWeight: 600,
                }}
              />

              <Legend verticalAlign="bottom" content={renderLegend} />

              {seriesProjectIds.map((projectId, index) => (
                <Bar
                  key={projectId}
                  dataKey={projectId}
                  name={projectNameById.get(projectId) || 'Unknown Project'}
                  fill={index % 2 === 0 ? '#17c9d3' : '#64748b'}
                >
                  {showLabels && (
                    <LabelList
                      dataKey={projectId}
                      position="top"
                      formatter={value => (value > 0 ? value : '')}
                      fill={axisColor}
                    />
                  )}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {!loading && !error && chartData.length === 0 && (
        <div className="injury-chart-empty">No data for selected filters.</div>
      )}
    </div>
  );
}

export default InjuryCategoryBarChart;
