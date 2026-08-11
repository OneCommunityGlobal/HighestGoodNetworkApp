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

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const FALLBACK_PROJECTS = [
  { _id: 'dummy-akv-test', name: 'akv_test', projectIds: ['dummy-akv-test'] },
  { _id: 'dummy-building-1', name: 'Building 1', projectIds: ['dummy-building-1'] },
  { _id: 'dummy-building-2', name: 'Building 2', projectIds: ['dummy-building-2'] },
  {
    _id: 'dummy-commercial',
    name: 'Commercial Test - Project',
    projectIds: ['dummy-commercial'],
  },
  { _id: 'dummy-housing', name: 'Housing Project', projectIds: ['dummy-housing'] },
  {
    _id: 'dummy-residential',
    name: 'Residential Test - Project',
    projectIds: ['dummy-residential'],
  },
  { _id: 'dummy-solar', name: 'Solar Panel Project', projectIds: ['dummy-solar'] },
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

const hashString = value => {
  let hash = 0;
  const text = String(value || '');
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const buildMonthWindow = (startDate, endDate) => {
  const end = endDate instanceof Date && !Number.isNaN(endDate.getTime()) ? endDate : new Date();
  let start =
    startDate instanceof Date && !Number.isNaN(startDate.getTime())
      ? startDate
      : new Date(end.getFullYear(), end.getMonth() - 11, 1);

  // Keep a readable chart window when only one bound is set.
  if (!(startDate instanceof Date) || Number.isNaN(startDate?.getTime())) {
    start = new Date(end.getFullYear(), end.getMonth() - 11, 1);
  }

  const months = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  let guard = 0;

  while (cursor <= last && guard < 36) {
    months.push({
      key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
      label: `${MONTH_LABELS[cursor.getMonth()]} ${cursor.getFullYear()}`,
      year: cursor.getFullYear(),
      monthIndex: cursor.getMonth(),
    });
    cursor.setMonth(cursor.getMonth() + 1);
    guard += 1;
  }

  return months.length
    ? months
    : [
        {
          key: `${end.getFullYear()}-${end.getMonth()}`,
          label: `${MONTH_LABELS[end.getMonth()]} ${end.getFullYear()}`,
          year: end.getFullYear(),
          monthIndex: end.getMonth(),
        },
      ];
};

// Every demo injury is tied to a project — there are no orphan/unlinked injuries.
const buildProjectSeries = (project, months) => {
  const seed = hashString(project.name || project._id);
  const serious = [];
  const medium = [];
  const low = [];

  months.forEach((month, index) => {
    const mix = (seed + month.monthIndex * 17 + index * 13) % 10;
    serious.push(mix === 1 || mix === 7 ? ((seed + index) % 3) + 1 : 0);
    medium.push(mix === 2 || mix === 5 || mix === 8 ? ((seed + index * 2) % 3) + 1 : 0);
    low.push(mix === 0 || mix === 3 || mix === 6 || mix === 9 ? ((seed + index) % 4) + 1 : 0);
  });

  return { serious, medium, low };
};

const sumSeries = (left = [], right = []) => {
  const length = Math.max(left.length, right.length);
  return Array.from(
    { length },
    (_, index) => (Number(left[index]) || 0) + (Number(right[index]) || 0),
  );
};

const buildLinkedDummyTrend = (projectList, selectedProjectId, startDate, endDate) => {
  const months = buildMonthWindow(startDate, endDate);
  const selectedProjects =
    selectedProjectId === 'all'
      ? projectList
      : projectList.filter(project => String(project._id) === String(selectedProjectId));

  // Refuse to invent injuries that are not linked to a project.
  if (!selectedProjects.length) {
    return {
      months: months.map(month => month.label),
      serious: months.map(() => 0),
      medium: months.map(() => 0),
      low: months.map(() => 0),
    };
  }

  const totals = selectedProjects.reduce(
    (acc, project) => {
      const series = buildProjectSeries(project, months);
      return {
        serious: sumSeries(acc.serious, series.serious),
        medium: sumSeries(acc.medium, series.medium),
        low: sumSeries(acc.low, series.low),
      };
    },
    {
      serious: months.map(() => 0),
      medium: months.map(() => 0),
      low: months.map(() => 0),
    },
  );

  return {
    months: months.map(month => month.label),
    serious: totals.serious,
    medium: totals.medium,
    low: totals.low,
  };
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

  const projectOptions = useMemo(() => {
    if (projects.length) return projects;
    return FALLBACK_PROJECTS;
  }, [projects]);

  useEffect(() => {
    dispatch(fetchInjuryProjects({}));
  }, [dispatch]);

  useEffect(() => {
    const selectedProject = projectOptions.find(
      project => String(project._id) === selectedProjectId,
    );
    let projectIds = [];
    if (selectedProject?.projectIds?.length) {
      projectIds = selectedProject.projectIds.filter(id => !String(id).startsWith('dummy-'));
    } else if (selectedProjectId !== 'all' && !String(selectedProjectId).startsWith('dummy-')) {
      projectIds = [selectedProjectId];
    }

    // Local fallback projects are demo-only and are not queried from the API.
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
  }, [dispatch, projectOptions, selectedProjectId, startDate, endDate]);

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

  const linkedDummyTrend = useMemo(
    () => buildLinkedDummyTrend(projectOptions, selectedProjectId, startDate, endDate),
    [projectOptions, selectedProjectId, startDate, endDate],
  );

  const usingDummyData = useMemo(() => {
    if (String(selectedProjectId).startsWith('dummy-')) return true;
    if (!loading && !hasTrendValues(trend)) return true;
    return false;
  }, [selectedProjectId, loading, trend]);

  const activeTrend = useMemo(() => {
    if (usingDummyData) return linkedDummyTrend;
    return trend;
  }, [usingDummyData, linkedDummyTrend, trend]);

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
