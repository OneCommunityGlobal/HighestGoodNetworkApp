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

const generateColors = n =>
  Array.from({ length: n }, (_, i) => {
    const hue = Math.round((i * 360) / n);
    return `hsl(${hue}, 70%, 50%)`;
  });

function hslToRgb(h, s, l) {
  const sat = s / 100;
  const light = l / 100;
  const k = n => (n + h / 30) % 12;
  const a = sat * Math.min(light, 1 - light);
  const f = n => light - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [255 * f(0), 255 * f(8), 255 * f(4)];
}

function getContrastTextColor(fillColor) {
  const match = fillColor.match(/hsl\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)%,\s*(\d+(?:\.\d+)?)%\)/);
  if (!match) return '#333333';
  const [h, s, l] = match.slice(1).map(Number);
  const [r, g, b] = hslToRgb(h, s, l);
  const relativeLuminance = [r, g, b]
    .map(c => c / 255)
    .map(cs => (cs <= 0.03928 ? cs / 12.92 : ((cs + 0.055) / 1.055) ** 2.4))
    .reduce((acc, cur, i) => acc + cur * [0.2126, 0.7152, 0.0722][i], 0);
  const contrastWithWhite = 1.05 / (relativeLuminance + 0.05);
  const contrastWithBlack = (relativeLuminance + 0.05) / 0.05;
  return contrastWithWhite > contrastWithBlack ? '#ffffff' : '#000000';
}

const SEVERITY_ORDER = ['Minor', 'Major', 'Critical'];

function CustomTooltip({ active, payload, label, darkMode }) {
  if (!active || !payload || payload.length === 0) return null;

  // Group data by project
  const projectData = {};

  payload.forEach(entry => {
    if (entry.value > 0) {
      // Extract project and department from dataKey
      const match = entry.dataKey.match(/^([^_]+)_(.+)$/);
      if (match) {
        const [, projectName, department] = match;
        if (!projectData[projectName]) projectData[projectName] = [];
        projectData[projectName].push({ department, value: entry.value, color: entry.color });
      }
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

function InjurySeverityDashboard(props) {
  const dispatch = useDispatch();
  const bmProjects = useSelector(state => state.bmProjects);
  const rawData = useSelector(state => state.bmInjury?.severityData || []);
  const { darkMode } = props;

  const [selProjects, setSelProjects] = useState([]);
  const [selTypes, setSelTypes] = useState([]);
  const [selDepts, setSelDepts] = useState([]);
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

  const visibleProjects = useMemo(() => {
    const projectsWithData = Array.from(new Set(rawData.map(r => r.projectName)));
    return bmProjects.filter(
      project =>
        projectsWithData.includes(project.name) &&
        (selProjects.length === 0 || selProjects.includes(project._id)),
    );
  }, [bmProjects, rawData, selProjects]);

  const visibleDepartments = useMemo(() => {
    const depts = Array.from(new Set(rawData.map(r => r.department).filter(Boolean)));
    return depts;
  }, [rawData]);

  const chartData = useMemo(() => {
    return SEVERITY_ORDER.map(sev => {
      const entry = { severity: sev };

      if (visibleDepartments.length <= 1) {
        // Single department - show total injuries per project
        visibleProjects.forEach(project => {
          const rec = rawData.find(r => r.severity === sev && r.projectName === project.name);
          entry[project.name] = rec ? rec.totalInjuries : 0;
        });
      } else {
        // Multiple departments - show department breakdown per project
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

      return entry;
    });
  }, [rawData, visibleProjects, visibleDepartments]);

  const chartBars = useMemo(() => {
    if (visibleDepartments.length <= 1) {
      // Single department - one bar per project (these will be grouped)
      const projectColors = generateColors(visibleProjects.length);
      return visibleProjects.map((project, idx) => ({
        key: project._id,
        dataKey: project.name,
        name: project.name,
        fill: projectColors[idx],
      }));
      // eslint-disable-next-line no-else-return
    } else {
      // Multiple departments - create stacked bars per project
      const departmentColors = generateColors(visibleDepartments.length);
      const bars = [];

      visibleDepartments.forEach((dept, deptIdx) => {
        visibleProjects.forEach((project, projectIdx) => {
          bars.push({
            key: `${project._id}_${dept}`,
            dataKey: `${project.name}_${dept}`,
            name: `${project.name} - ${dept}`, // Keep full name for tooltip
            fill: departmentColors[deptIdx],
            stackId: project.name, // Stack departments within each project
            legendType: projectIdx === 0 ? 'rect' : 'none', // Only show first occurrence in legend
          });
        });
      });
      // eslint-disable-next-line prettier/prettier

      return bars;
    }
  }, [visibleProjects, visibleDepartments]);

  const filterStyle = {
    flex: 1,
    minWidth: 180,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: darkMode ? '#f5f5f5' : '#333333',
    borderColor: darkMode ? 'rgb(255 255 255 / 20%)' : '#d9d9d9',
  };

  const dropdownClassName = darkMode ? 'oxideDark-dropdown' : '';

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
        style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20, paddingLeft: 20 }}
      >
        <Select
          className={styles.filterSelect}
          mode="multiple"
          allowClear
          placeholder="Projects"
          style={filterStyle}
          popupClassName={dropdownClassName}
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
          popupClassName={dropdownClassName}
          value={dateRange}
          onChange={dates => setDateRange(dates || [null, null])}
          style={filterStyle}
        />

        <Select
          className={styles.filterSelect}
          mode="multiple"
          allowClear
          placeholder="Injury Types"
          style={filterStyle}
          popupClassName={dropdownClassName}
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
          mode="multiple"
          allowClear
          placeholder="Departments"
          style={filterStyle}
          popupClassName={dropdownClassName}
          value={selDepts}
          onChange={setSelDepts}
          maxTagCount="responsive"
          maxTagPlaceholder={omitted => `+${omitted.length}`}
        >
          {['Plumbing', 'Electrical', 'Carpentry', 'Welding'].map(d => (
            <Option key={d} value={d}>
              {d}
            </Option>
          ))}
        </Select>
      </div>

      {/* Chart */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin size="large" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="severity"
              height={60}
              tick={{ fill: darkMode ? '#f5f5f5' : '#333333' }}
              label={{
                value: 'Severity',
                position: 'bottom',
                dy: 0,
                fill: darkMode ? '#f5f5f5' : '#333333',
              }}
            />
            <YAxis
              tick={{ fill: darkMode ? '#f5f5f5' : '#333333' }}
              label={{
                value: 'Injury Count',
                angle: -90,
                position: 'insideLeft',
                fill: darkMode ? '#f5f5f5' : '#333333',
              }}
            />
            <Tooltip
              cursor={{ fill: darkMode ? 'rgb(255 255 255 / 8%)' : 'rgb(204 204 204 / 30%)' }}
              content={
                <CustomTooltip
                  visibleProjects={visibleProjects}
                  visibleDepartments={visibleDepartments}
                  darkMode={darkMode}
                />
              }
            />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ paddingTop: 30 }}
              payload={
                visibleDepartments.length > 1
                  ? visibleDepartments.map((dept, idx) => ({
                      value: dept,
                      type: 'rect',
                      color: generateColors(visibleDepartments.length)[idx],
                    }))
                  : undefined
              }
            />
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
                  fill={getContrastTextColor(bar.fill)}
                  style={{
                    fontSize: '10px',
                    fontWeight: 'bold',
                  }}
                  formatter={value => (value > 0 ? value : '')}
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

const mapStateToProps = state => ({
  darkMode: state.theme.darkMode,
});
export default connect(mapStateToProps)(InjurySeverityDashboard);
