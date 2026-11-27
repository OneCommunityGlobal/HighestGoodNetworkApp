import { useEffect, useMemo, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from 'recharts';
import { Select, DatePicker, Spin } from 'antd';
import { fetchInjurySeverity } from '../../../actions/bmdashboard/injuryActions';
import { fetchBMProjects } from '../../../actions/bmdashboard/projectActions';
import styles from './InjurySeverityChart.module.css';

const { Option } = Select;
const { RangePicker } = DatePicker;

const DEPARTMENT_COLOR_MAP = {
  Welding: '#d62728',
  Electrical: '#ff7f0e',
  Plumbing: '#1f77b4',
  Carpentry: '#2ca02c',
};

const SEVERITY_ORDER = ['Minor', 'Major', 'Critical'];

const DEPARTMENT_ORDER = ['Welding', 'Electrical', 'Plumbing', 'Carpentry'];

const DEPARTMENT_OPTIONS = ['Plumbing', 'Electrical', 'Carpentry', 'Welding'];

const DEFAULT_DEPARTMENTS = DEPARTMENT_OPTIONS;

function buildSingleDeptEntry(entry, sev, rawData, visibleProjects) {
  visibleProjects.forEach(project => {
    const rec = rawData.find(r => r.severity === sev && r.projectName === project.name);

    entry[project.name] = rec ? rec.totalInjuries : 0;
  });
}

function buildMultiDeptEntry(entry, sev, rawData, visibleProjects, visibleDepartments) {
  visibleProjects.forEach(project => {
    visibleDepartments.forEach(dept => {
      const key = `${project.name}_${dept}`;

      const rec = rawData.find(
        r => r.severity === sev && r.projectName === project.name && r.department === dept,
      );

      entry[key] = rec ? rec.totalInjuries : 0;
    });
  });
}

function buildChartData(rawData, visibleProjects, visibleDepartments) {
  return SEVERITY_ORDER.map(sev => {
    const entry = { severity: sev };

    if (visibleDepartments.length <= 1) {
      buildSingleDeptEntry(entry, sev, rawData, visibleProjects);
    } else {
      buildMultiDeptEntry(entry, sev, rawData, visibleProjects, visibleDepartments);
    }

    return entry;
  });
}

function buildSingleDeptBars(visibleProjects, visibleDepartments) {
  const selectedDepartment = visibleDepartments[0];

  return visibleProjects.map(project => ({
    key: project._id,
    dataKey: project.name,
    name: project.name,
    fill: DEPARTMENT_COLOR_MAP[selectedDepartment] || '#1f77b4',
  }));
}

function buildMultiDeptBars(visibleProjects, visibleDepartments) {
  const bars = [];

  visibleDepartments.forEach(dept => {
    visibleProjects.forEach((project, projectIdx) => {
      bars.push({
        key: `${project._id}_${dept}`,
        dataKey: `${project.name}_${dept}`,
        name: `${project.name} - ${dept}`,
        fill: DEPARTMENT_COLOR_MAP[dept],
        stackId: project.name,
        legendType: projectIdx === 0 ? 'rect' : 'none',
      });
    });
  });

  return bars;
}

function buildChartBars(visibleProjects, visibleDepartments) {
  if (visibleDepartments.length <= 1) {
    return buildSingleDeptBars(visibleProjects, visibleDepartments);
  }

  return buildMultiDeptBars(visibleProjects, visibleDepartments);
}

function buildLegendPayload(visibleDepartments) {
  return visibleDepartments.map(dept => ({
    value: dept,
    type: 'rect',
    color: DEPARTMENT_COLOR_MAP[dept],
  }));
}

function formatBarLabel(value) {
  return value > 0 ? value : '';
}

function CustomTooltip({ active, payload, label, darkMode, visibleDepartments }) {
  if (!active || !payload || payload.length === 0) return null;

  const projectData = {};

  payload.forEach(entry => {
    if (entry.value <= 0) return;

    const match = entry.dataKey.match(/^([^_]+)_(.+)$/);

    if (match) {
      const [, projectName, department] = match;

      if (!projectData[projectName]) {
        projectData[projectName] = [];
      }

      projectData[projectName].push({
        department,
        value: entry.value,
        color: entry.color,
      });

      return;
    }

    if (visibleDepartments.length === 1) {
      const projectName = entry.dataKey;
      const department = visibleDepartments[0];

      if (!projectData[projectName]) {
        projectData[projectName] = [];
      }

      projectData[projectName].push({
        department,
        value: entry.value,
        color: entry.color,
      });
    }
  });

  return (
    <div className={`${styles.customTooltip} ${darkMode ? styles.dark : ''}`}>
      <p
        style={{
          margin: '0 0 8px 0',
          fontWeight: 'bold',
          color: darkMode ? '#f5f5f5' : '#333',
        }}
      >
        {label}
      </p>

      {Object.entries(projectData).map(([projectName, departments]) => (
        <div key={projectName} style={{ marginBottom: '6px' }}>
          <div
            style={{
              fontWeight: 'bold',
              color: darkMode ? '#f5f5f5' : '#333',
              marginBottom: '2px',
            }}
          >
            {projectName}:
          </div>

          <div
            style={{
              paddingLeft: '8px',
              color: darkMode ? '#e0e0e0' : '#666',
            }}
          >
            {departments.map(({ department, value, color }, idx) => (
              <span key={department}>
                <span style={{ color }}>
                  {department}: {value}
                </span>

                {idx < departments.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function InjurySeverityBarChart({
  chartData,
  chartBars,
  visibleProjects,
  visibleDepartments,
  darkMode,
}) {
  const axisTextColor = darkMode ? '#f5f5f5' : '#333333';
  const legendPayload = buildLegendPayload(visibleDepartments);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="severity"
          height={60}
          tick={{ fill: axisTextColor }}
          label={{
            value: 'Severity',
            position: 'bottom',
            dy: 0,
            fill: axisTextColor,
          }}
        />

        <YAxis
          tick={{ fill: axisTextColor }}
          label={{
            value: 'Injury Count',
            angle: -90,
            position: 'insideLeft',
            fill: axisTextColor,
          }}
        />

        <Tooltip
          cursor={false}
          content={
            <CustomTooltip
              visibleProjects={visibleProjects}
              visibleDepartments={visibleDepartments}
              darkMode={darkMode}
            />
          }
        />

        <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 30 }} payload={legendPayload} />

        {chartBars.map(bar => (
          <Bar
            key={bar.key}
            dataKey={bar.dataKey}
            name={bar.name}
            fill={bar.fill}
            stackId={bar.stackId}
            legendType={bar.legendType}
          >
            <LabelList
              dataKey={bar.dataKey}
              position="center"
              fill="#ffffff"
              style={{
                fontSize: '10px',
                fontWeight: 'bold',
              }}
              formatter={formatBarLabel}
            />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function InjurySeverityDashboard(props) {
  const dispatch = useDispatch();
  const bmProjects = useSelector(state => state.bmProjects);
  const rawData = useSelector(state => state.bmInjury?.severityData || []);
  const { darkMode } = props;

  const [selProjects, setSelProjects] = useState([]);
  const [selTypes, setSelTypes] = useState([]);
  const [selDepts, setSelDepts] = useState(DEFAULT_DEPARTMENTS);
  const [dateRange, setDateRange] = useState([null, null]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  useEffect(() => {
    setLoading(true);

    dispatch(
      fetchInjurySeverity({
        projectIds: selProjects,
        types: selTypes,
        departments: selDepts,
        startDate: dateRange[0]?.format('YYYY-MM-DD'),
        endDate: dateRange[1]?.format('YYYY-MM-DD'),
      }),
    ).finally(() => setLoading(false));
  }, [dispatch, selProjects, selTypes, selDepts, dateRange]);

  const isEmptyState =
    selProjects.length === 0 &&
    selTypes.length === 0 &&
    selDepts.length === 0 &&
    !dateRange[0] &&
    !dateRange[1];

  const hasNoData = !loading && !isEmptyState && rawData.length === 0;

  const visibleProjects = useMemo(() => {
    const base =
      selProjects.length > 0 ? bmProjects.filter(p => selProjects.includes(p._id)) : bmProjects;

    const projectNamesWithData = new Set(rawData.map(r => r.projectName));

    return base.filter(p => projectNamesWithData.has(p.name));
  }, [bmProjects, selProjects, rawData]);

  const visibleDepartments = useMemo(() => {
    const departmentsWithData = new Set(rawData.map(r => r.department).filter(Boolean));

    return DEPARTMENT_ORDER.filter(dept => departmentsWithData.has(dept));
  }, [rawData]);

  const chartData = useMemo(() => buildChartData(rawData, visibleProjects, visibleDepartments), [
    rawData,
    visibleProjects,
    visibleDepartments,
  ]);

  const chartBars = useMemo(() => buildChartBars(visibleProjects, visibleDepartments), [
    visibleProjects,
    visibleDepartments,
  ]);

  const filterStyle = {
    flex: 1,
    minWidth: 180,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: darkMode ? '#f5f5f5' : '#333333',
    borderColor: darkMode ? 'rgb(255 255 255 / 20%)' : '#d9d9d9',
  };

  const dropdownClassName = darkMode ? 'oxideDark-dropdown' : '';

  const dateDropdownClassName = `injurySeverityDateDropdown${
    darkMode ? ' oxideDark-dropdown' : ''
  }`;

  return (
    <div
      style={{ padding: '0 24px' }}
      className={`${styles.injurySeverityContainer} container-fluid h-100 ${
        darkMode ? `${styles.oxideDark} text-light` : ''
      }`}
    >
      <h2
        style={{
          textAlign: 'center',
          color: '#007bff',
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '20px',
        }}
        className={`${darkMode && 'text-light'}`}
      >
        Injury Severity by Projects
      </h2>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 20,
          paddingLeft: 20,
        }}
      >
        <Select
          className={styles.filterSelect}
          popupClassName={dropdownClassName}
          mode="multiple"
          allowClear
          placeholder="Projects"
          style={filterStyle}
          value={selProjects}
          onChange={setSelProjects}
          maxTagCount="responsive"
          maxTagPlaceholder={omitted => `+${omitted.length}`}
        >
          {bmProjects.map(p => (
            <Option key={p._id} value={p._id}>
              {p.name}
            </Option>
          ))}
        </Select>

        <RangePicker
          className={styles.filterSelect}
          popupClassName={`${dateDropdownClassName} ${
            darkMode ? styles.oxideDark : styles.lightCalendar
          }`}
          value={dateRange}
          onChange={dates => setDateRange(dates || [null, null])}
          style={filterStyle}
        />

        <Select
          className={styles.filterSelect}
          popupClassName={dropdownClassName}
          mode="multiple"
          allowClear
          placeholder="Injury Types"
          style={filterStyle}
          value={selTypes}
          onChange={setSelTypes}
          maxTagCount="responsive"
          maxTagPlaceholder={omitted => `+${omitted.length}`}
        >
          {['Cut', 'Bruise', 'Fracture', 'Burn', 'Electric Shock'].map(t => (
            <Option key={t} value={t}>
              {t}
            </Option>
          ))}
        </Select>

        <Select
          className={styles.filterSelect}
          popupClassName={dropdownClassName}
          mode="multiple"
          allowClear
          placeholder="Departments"
          style={filterStyle}
          value={selDepts}
          onChange={setSelDepts}
          maxTagCount="responsive"
          maxTagPlaceholder={omitted => `+${omitted.length}`}
        >
          {DEPARTMENT_OPTIONS.map(d => (
            <Option key={d} value={d}>
              {d}
            </Option>
          ))}
        </Select>
      </div>

      {/* Chart */}
      <div className={styles.chartStateContainer}>
        {loading ? (
          <div className={styles.chartStateCenter}>
            <Spin size="large" />
          </div>
        ) : isEmptyState ? (
          <button type="button" className={`${styles.chartPlaceholder} ${styles.chartStateCenter}`}>
            <div className={styles.placeholderGraphic} />

            <div className={styles.placeholderTooltip}>
              Select filters to generate visualization
            </div>
          </button>
        ) : hasNoData ? (
          <div className={`${styles.noDataState} ${styles.chartStateCenter}`}>
            No data available for the selected filters
          </div>
        ) : (
          <InjurySeverityBarChart
            chartData={chartData}
            chartBars={chartBars}
            visibleProjects={visibleProjects}
            visibleDepartments={visibleDepartments}
            darkMode={darkMode}
          />
        )}
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  darkMode: state.theme.darkMode,
});

export default connect(mapStateToProps)(InjurySeverityDashboard);
