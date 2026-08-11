import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { fetchInjuryProjects, fetchInjuryTrend } from '../../../actions/bmdashboard/injuryActions';
import styles from './InjuryTrendChart.module.css';

// Keep severity colors aligned with Phase 2 requirements.
const SEVERITY_COLORS = {
  serious: '#dc3545',
  medium: '#fd7e14',
  low: '#28a745',
};

const LEGEND_ITEMS = [
  { key: 'serious', label: 'Serious', color: SEVERITY_COLORS.serious },
  { key: 'medium', label: 'Medium', color: SEVERITY_COLORS.medium },
  { key: 'low', label: 'Low Level', color: SEVERITY_COLORS.low },
];

// Demo series used for All Projects when API has no data yet.
const DUMMY_ALL_PROJECTS_TREND = {
  months: [
    'Jan 2024',
    'Feb 2024',
    'Mar 2024',
    'Apr 2024',
    'May 2024',
    'Jun 2024',
    'Jul 2024',
    'Aug 2024',
    'Sep 2024',
    'Oct 2024',
    'Nov 2024',
    'Dec 2024',
  ],
  serious: [0, 2, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  medium: [0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 2, 5],
  low: [1, 2, 2, 3, 4, 5, 6, 7, 3, 2, 1, 2],
};

const DUMMY_PROJECTS = [
  { _id: 'dummy-building-1', name: 'Building 1', projectIds: ['dummy-building-1'] },
  { _id: 'dummy-building-2', name: 'Building 2', projectIds: ['dummy-building-2'] },
  { _id: 'dummy-site-a', name: 'Site A', projectIds: ['dummy-site-a'] },
];

const toYMD = date => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateLabel = date => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return 'ALL';
  return toYMD(date);
};

const hasTrendValues = trend => {
  const serious = Array.isArray(trend?.serious) ? trend.serious : [];
  const medium = Array.isArray(trend?.medium) ? trend.medium : [];
  const low = Array.isArray(trend?.low) ? trend.low : [];
  return [...serious, ...medium, ...low].some(value => Number(value) > 0);
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
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    dispatch(fetchInjuryProjects({}));
  }, [dispatch]);

  useEffect(() => {
    const selectedProject = projects.find(project => String(project._id) === selectedProjectId);
    let projectIds = [];
    if (selectedProject?.projectIds?.length) {
      projectIds = selectedProject.projectIds;
    } else if (selectedProjectId !== 'all' && !String(selectedProjectId).startsWith('dummy-')) {
      projectIds = [selectedProjectId];
    }

    // Skip API calls for local dummy project selections.
    if (String(selectedProjectId).startsWith('dummy-')) {
      return undefined;
    }

    const params = {
      startDate: toYMD(startDate),
      endDate: toYMD(endDate),
    };
    if (projectIds.length) {
      params.projectId = projectIds.join(',');
    }

    dispatch(fetchInjuryTrend(params));
    return undefined;
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

  const projectOptions = useMemo(() => {
    if (projects.length) return projects;
    return DUMMY_PROJECTS;
  }, [projects]);

  const selectedProjectLabel = useMemo(() => {
    if (selectedProjectId === 'all') return 'ALL';
    const match = projectOptions.find(project => String(project._id) === selectedProjectId);
    return match?.name || 'Selected Project';
  }, [projectOptions, selectedProjectId]);

  const dateFilterLabel = useMemo(() => {
    if (!startDate && !endDate) return 'ALL';
    if (startDate && endDate) return `${formatDateLabel(startDate)} – ${formatDateLabel(endDate)}`;
    if (startDate) return `From ${formatDateLabel(startDate)}`;
    return `Until ${formatDateLabel(endDate)}`;
  }, [startDate, endDate]);

  const usingDummyData = useMemo(() => {
    if (String(selectedProjectId).startsWith('dummy-')) return true;
    if (selectedProjectId === 'all' && !loading && !hasTrendValues(trend)) return true;
    return false;
  }, [selectedProjectId, loading, trend]);

  const activeTrend = useMemo(() => {
    if (usingDummyData) return DUMMY_ALL_PROJECTS_TREND;
    return trend;
  }, [usingDummyData, trend]);

  const chartData = useMemo(() => {
    const months = Array.isArray(activeTrend.months) ? activeTrend.months : [];
    const serious = Array.isArray(activeTrend.serious) ? activeTrend.serious : [];
    const medium = Array.isArray(activeTrend.medium) ? activeTrend.medium : [];
    const low = Array.isArray(activeTrend.low) ? activeTrend.low : [];

    return months.map((month, index) => ({
      month,
      serious: Number(serious[index]) || 0,
      medium: Number(medium[index]) || 0,
      low: Number(low[index]) || 0,
    }));
  }, [activeTrend]);

  const hasAnyData = chartData.some(row => row.serious > 0 || row.medium > 0 || row.low > 0);
  const tickColor = darkMode ? '#cfd7e3' : '#555';
  const gridStroke = darkMode ? 'rgba(255,255,255,0.12)' : '#d9d9d9';

  const datePickerProps = {
    showMonthDropdown: true,
    showYearDropdown: true,
    dropdownMode: 'select',
    yearDropdownItemNumber: 15,
    scrollableYearDropdown: true,
    dateFormat: 'yyyy-MM-dd',
    className: styles.datepicker,
    isClearable: true,
  };

  return (
    <div className={`${styles.page} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.panel}>
        <div className={styles.topBar}>
          <h2 className={styles.title}>Injuries Tracking</h2>

          <div className={styles.headerFilters}>
            <div className={styles.filterGroup}>
              <label htmlFor="injury-project-select" className={styles.filterLabel}>
                Project
              </label>
              <select
                id="injury-project-select"
                className={styles.select}
                value={selectedProjectId}
                onChange={event => setSelectedProjectId(event.target.value)}
              >
                <option value="all">ALL</option>
                {projectOptions.map(project => (
                  <option key={String(project._id)} value={String(project._id)}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Dates</span>
              <div className={styles.dateInputs}>
                <DatePicker
                  id="injury-start-date"
                  selected={startDate}
                  onChange={setStartDate}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  placeholderText="Start date"
                  {...datePickerProps}
                />
                <DatePicker
                  id="injury-end-date"
                  selected={endDate}
                  onChange={setEndDate}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  placeholderText="End date"
                  {...datePickerProps}
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.legendRow} aria-label="Injury severity legend">
          {LEGEND_ITEMS.map(item => (
            <div key={item.key} className={styles.legendItem}>
              <span className={styles.legendLine} style={{ backgroundColor: item.color }} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.metaRow}>
          <span>
            <strong>Project:</strong> {selectedProjectLabel}
          </span>
          <span>
            <strong>Dates:</strong> {dateFilterLabel}
          </span>
          {usingDummyData && <span className={styles.demoBadge}>Demo data</span>}
        </div>

        {loading && !usingDummyData && (
          <div className={styles.statusMessage}>Loading injury trend…</div>
        )}
        {error && !usingDummyData && (
          <div className={`${styles.statusMessage} ${styles.statusError}`}>
            Failed to load injury trend: {String(error)}
          </div>
        )}
        {!loading && !error && !hasAnyData && (
          <div className={styles.statusMessage}>No injuries recorded for the selected filters.</div>
        )}

        {hasAnyData && (
          <div className={styles.chartArea}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} margin={{ top: 16, right: 20, left: 8, bottom: 28 }}>
                <CartesianGrid stroke={gridStroke} strokeDasharray="0" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: tickColor, fontSize: 12 }}
                  interval="preserveStartEnd"
                  minTickGap={28}
                  label={{
                    value: 'Month',
                    position: 'insideBottom',
                    offset: -12,
                    style: { fill: tickColor, fontSize: 13 },
                  }}
                />
                <YAxis allowDecimals={false} tick={{ fill: tickColor, fontSize: 12 }} width={40} />
                <Tooltip
                  content={
                    <InjuryTrendTooltip projectLabel={selectedProjectLabel} darkMode={darkMode} />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="serious"
                  name="Serious"
                  stroke={SEVERITY_COLORS.serious}
                  strokeWidth={2.5}
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
                  strokeWidth={2.5}
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
                  name="Low Level"
                  stroke={SEVERITY_COLORS.low}
                  strokeWidth={2.5}
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
          </div>
        )}
      </div>
    </div>
  );
}

export default InjuryTrendChart;
