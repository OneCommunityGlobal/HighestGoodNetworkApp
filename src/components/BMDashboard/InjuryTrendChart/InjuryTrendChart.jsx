import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { fetchInjuryProjects, fetchInjuryTrend } from '../../../actions/bmdashboard/injuryActions';
import styles from './InjuryTrendChart.module.css';

const SEVERITY_COLORS = {
  serious: '#dc3545',
  medium: '#fd7e14',
  low: '#28a745',
};

const toYMD = date => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function InjuryTrendTooltip({ active, payload, label, projectLabel, darkMode }) {
  if (!active || !payload?.length) return null;

  return (
    <div className={`${styles.tooltip} ${darkMode ? styles.tooltipDark : ''}`}>
      <div className={styles.tooltipTitle}>{label}</div>
      {projectLabel && <div className={styles.tooltipProject}>{projectLabel}</div>}
      {payload.map(item => (
        <div key={item.dataKey} className={styles.tooltipRow}>
          <span className={styles.tooltipMarker} style={{ backgroundColor: item.color }} />
          <span>{item.name}</span>
          <span>{Number(item.value) || 0}</span>
        </div>
      ))}
    </div>
  );
}

function InjuryTrendChart() {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme?.darkMode);
  const {
    projects = [],
    trend = { months: [], serious: [], medium: [], low: [] },
    loading,
    error,
  } = useSelector(state => state.bmInjury || {});

  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  useEffect(() => {
    dispatch(fetchInjuryProjects({}));
  }, [dispatch]);

  useEffect(() => {
    const selectedProject = projects.find(project => String(project._id) === selectedProjectId);
    let projectIds = [];
    if (selectedProject?.projectIds?.length) {
      projectIds = selectedProject.projectIds;
    } else if (selectedProjectId !== 'all') {
      projectIds = [selectedProjectId];
    }

    // Backend trend-data accepts ObjectId(s) in projectId; omit for All Projects.
    const params = {
      startDate: toYMD(startDate),
      endDate: toYMD(endDate),
    };
    if (projectIds.length) {
      params.projectId = projectIds.join(',');
    }

    dispatch(fetchInjuryTrend(params));
  }, [dispatch, projects, selectedProjectId, startDate, endDate]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('injury-dark-body');
    } else {
      document.body.classList.remove('injury-dark-body');
    }
    return () => {
      document.body.classList.remove('injury-dark-body');
    };
  }, [darkMode]);

  const selectedProjectLabel = useMemo(() => {
    if (selectedProjectId === 'all') return 'All Projects';
    const match = projects.find(project => String(project._id) === selectedProjectId);
    return match?.name || 'Selected Project';
  }, [projects, selectedProjectId]);

  const chartData = useMemo(() => {
    const months = Array.isArray(trend.months) ? trend.months : [];
    const serious = Array.isArray(trend.serious) ? trend.serious : [];
    const medium = Array.isArray(trend.medium) ? trend.medium : [];
    const low = Array.isArray(trend.low) ? trend.low : [];

    return months.map((month, index) => ({
      month,
      serious: Number(serious[index]) || 0,
      medium: Number(medium[index]) || 0,
      low: Number(low[index]) || 0,
    }));
  }, [trend]);

  const hasAnyData = useMemo(() => {
    return chartData.some(row => row.serious > 0 || row.medium > 0 || row.low > 0);
  }, [chartData]);

  const tickColor = darkMode ? '#cfd7e3' : '#666';
  const gridStroke = darkMode ? 'rgba(255,255,255,0.12)' : '#e0e0e0';

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Injury Trend Over Time</h2>
          <p className={styles.subtitle}>
            Track monthly injury counts by severity across projects.
          </p>
        </div>
      </header>

      <div className={styles.filters}>
        <div className={styles.filterItem}>
          <label htmlFor="injury-project-select">Project</label>
          <select
            id="injury-project-select"
            className={styles.select}
            value={selectedProjectId}
            onChange={event => setSelectedProjectId(event.target.value)}
          >
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={String(project._id)} value={String(project._id)}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterItem}>
          <label htmlFor="injury-date-range">Date range</label>
          <DatePicker
            id="injury-date-range"
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={setDateRange}
            placeholderText="Select start and end date"
            isClearable
            dateFormat="yyyy-MM-dd"
            className={styles.datepicker}
          />
        </div>
      </div>

      <div className={styles.chartCard}>
        {loading && <div className={styles.statusMessage}>Loading injury trend…</div>}
        {error && (
          <div className={`${styles.statusMessage} ${styles.statusError}`}>
            Failed to load injury trend: {String(error)}
          </div>
        )}
        {!loading && !error && !hasAnyData && (
          <div className={styles.statusMessage}>No injuries recorded for the selected filters.</div>
        )}

        {!loading && !error && hasAnyData && (
          <ResponsiveContainer width="100%" height={420}>
            <LineChart data={chartData} margin={{ top: 24, right: 28, left: 8, bottom: 48 }}>
              <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fill: tickColor }}
                label={{
                  value: 'Month',
                  position: 'insideBottom',
                  offset: -24,
                  style: { fill: tickColor },
                }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: tickColor }}
                label={{
                  value: 'Number of Injuries',
                  angle: -90,
                  position: 'insideLeft',
                  style: { fill: tickColor },
                }}
              />
              <Tooltip
                content={
                  <InjuryTrendTooltip projectLabel={selectedProjectLabel} darkMode={darkMode} />
                }
              />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: tickColor }} />
              <Line
                type="monotone"
                dataKey="serious"
                name="Serious"
                stroke={SEVERITY_COLORS.serious}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              >
                <LabelList
                  dataKey="serious"
                  position="top"
                  style={{ fill: SEVERITY_COLORS.serious, fontSize: 10 }}
                />
              </Line>
              <Line
                type="monotone"
                dataKey="medium"
                name="Medium"
                stroke={SEVERITY_COLORS.medium}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              >
                <LabelList
                  dataKey="medium"
                  position="top"
                  style={{ fill: SEVERITY_COLORS.medium, fontSize: 10 }}
                />
              </Line>
              <Line
                type="monotone"
                dataKey="low"
                name="Low"
                stroke={SEVERITY_COLORS.low}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              >
                <LabelList
                  dataKey="low"
                  position="top"
                  style={{ fill: SEVERITY_COLORS.low, fontSize: 10 }}
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default InjuryTrendChart;
