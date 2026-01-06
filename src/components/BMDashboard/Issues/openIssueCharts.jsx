import { useEffect, useState, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import Select from 'react-select';
import { fetchBMProjects } from '../../../actions/bmdashboard/projectActions';
import {
  fetchLongestOpenIssues,
  setProjectFilter,
} from '../../../actions/bmdashboard/issueChartActions';
import styles from './issueCharts.module.css';

/* ---------- helpers ---------- */

const getThemeColors = isDark => ({
  textColor: isDark ? '#f7fafc' : '#1a202c',
  gridColor: isDark ? '#4a5568' : '#e2e8f0',
  tooltipBg: isDark ? '#2d3748' : '#ffffff',
  tooltipBorder: isDark ? '#4a5568' : '#e2e8f0',
  hoverBg: isDark ? '#2d3748' : '#e2e8f0',
});

const getErrorColor = isDark => (isDark ? '#fca5a5' : '#dc2626');

const getOptionBackground = (isDark, isFocused) => {
  if (isFocused) {
    return isDark ? '#2d3748' : '#e2e8f0';
  }
  return isDark ? '#1a202c' : '#ffffff';
};

const getChartClasses = (css, isDark) => ({
  containerClass: `${css.issueChartContainer} ${isDark ? css.issueChartContainerDark : ''}`,
  labelClass: `${css.issueChartLabel} ${isDark ? css.issueChartLabelDark : ''}`,
  filterSelectClass: `${css.filterSelect} ${isDark ? css.filterSelectDark : ''}`,
  chartContainerClass: `${css.chartContainer} ${isDark ? css.chartContainerDark : ''}`,
  noDataMessageClass: `${css.noDataMessage} ${isDark ? css.noDataMessageDark : ''}`,
  noDataContentClass: `${css.noDataContent} ${isDark ? css.noDataContentDark : ''}`,
});

const createSelectStyles = (isDark, textColor) => ({
  control: (base, state) => ({
    ...base,
    backgroundColor: isDark ? '#2d3748' : '#ffffff',
    borderColor: isDark ? '#4a5568' : '#cbd5e0',
    boxShadow: state.isFocused ? '0 0 0 1px #4caf50' : 'none',
    '&:hover': {
      borderColor: '#4caf50',
    },
    color: textColor,
  }),
  menu: base => ({
    ...base,
    backgroundColor: isDark ? '#1a202c' : '#ffffff',
    color: textColor,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: getOptionBackground(isDark, state.isFocused),
    color: textColor,
    cursor: 'pointer',
  }),
  singleValue: base => ({
    ...base,
    color: textColor,
  }),
  multiValue: base => ({
    ...base,
    backgroundColor: isDark ? '#4a5568' : '#e2e8f0',
  }),
  multiValueLabel: base => ({
    ...base,
    color: textColor,
  }),
  placeholder: base => ({
    ...base,
    color: isDark ? '#a0aec0' : '#718096',
  }),
});

// Deterministic, collision-resistant color per projectId
const getStableProjectColor = projectId => {
  if (!projectId) return '#94a3b8';

  let hash = 0;
  for (let i = 0; i < projectId.length; i++) {
    hash = projectId.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  const saturation = 65;
  const lightness = 50;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const getProjectColorMap = issues => {
  const map = {};
  (issues || []).forEach(issue => {
    (issue.projects || []).forEach(p => {
      if (p?.projectId && !map[p.projectId]) {
        map[p.projectId] = getStableProjectColor(p.projectId);
      }
    });
  });
  return map;
};

/* --------------------------- component --------------------------- */

function IssueCharts() {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const { issues, loading, error, selectedProjects } = useSelector(state => state.bmissuechart);
  const projects = useSelector(state => state.bmProjects);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const chartContainerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);

  const { textColor, gridColor, tooltipBg, tooltipBorder, hoverBg } = getThemeColors(darkMode);
  const errorColor = getErrorColor(darkMode);
  const {
    containerClass,
    labelClass,
    filterSelectClass,
    chartContainerClass,
    noDataMessageClass,
    noDataContentClass,
  } = getChartClasses(styles, darkMode);
  const selectStyles = createSelectStyles(darkMode, textColor);

  const loadingMessageStyle = {
    color: textColor,
    textAlign: 'center',
    padding: '20px',
  };

  const errorMessageStyle = {
    color: errorColor,
    textAlign: 'center',
    padding: '20px',
  };

  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  useEffect(() => {
    let dateRange = [];

    if (startDate && endDate) {
      dateRange = [
        `${startDate.toISOString().split('T')[0]},${endDate.toISOString().split('T')[0]}`,
      ];
    } else if (startDate && !endDate) {
      const today = new Date().toISOString().split('T')[0];
      dateRange = [`${startDate.toISOString().split('T')[0]},${today}`];
    } else if (!startDate && endDate) {
      dateRange = [`1980-01-01,${endDate.toISOString().split('T')[0]}`];
    }

    dispatch(fetchLongestOpenIssues(dateRange, selectedProjects));
  }, [dispatch, startDate, endDate, selectedProjects]);

  // Log the raw backend response when issues changes
  useEffect(() => {
    console.log('[Frontend] Longest Open Issues response:', issues);
  }, [issues]);

  const normalizedIssues = (issues || []).map(issue => {
    if (Array.isArray(issue.projects) && issue.projects.length > 0) {
      return issue;
    }
    // fallback when backend does not send projects
    return {
      ...issue,
      projects: [
        {
          projectId: 'unknown',
          projectName: 'Unknown Project',
          durationOpen: issue.durationOpen,
        },
      ],
    };
  });

  // Step 1: Normalize missing issue names
  const safeIssues = normalizedIssues.map(issue => {
    const name = issue.issueName;
    return {
      ...issue,
      issueName:
        typeof name === 'string' && name.trim() && name !== 'undefined'
          ? name.trim()
          : 'Unknown Issue',
    };
  });

  // Step 2: Use safeIssues for chartData
  const chartData = safeIssues.flatMap(issue =>
    (issue.projects || []).map(project => ({
      issueName: issue.issueName,
      projectId: project.projectId,
      durationOpen: project.durationOpen,
    })),
  );

  // Step 3: Stable project color map and legend
  const projectColorMap = getProjectColorMap(safeIssues);

  const projectLegend = Object.entries(projectColorMap).map(([projectId, color]) => {
    const project = safeIssues.flatMap(i => i.projects || []).find(p => p.projectId === projectId);

    return {
      projectId,
      projectName: project?.projectName || 'Unknown Project',
      color,
    };
  });

  useEffect(() => {
    function handleResize() {
      if (chartContainerRef.current) {
        setContainerWidth(chartContainerRef.current.offsetWidth);
      }
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleProjectChange = selected => {
    dispatch(setProjectFilter(selected ? selected.map(option => option.value) : []));
  };

  const projectOptions = projects.map(project => ({
    value: project._id,
    label: project.name,
  }));

  const getChartLayout = () => {
    const leftRightMargin = Math.max(20, Math.min(200, containerWidth * 0.12));
    const yAxisWidth = Math.max(60, Math.min(180, containerWidth * 0.13));
    return {
      margin: { top: 20, right: leftRightMargin, left: leftRightMargin, bottom: 5 },
      yAxisWidth,
    };
  };

  const { margin, yAxisWidth } = getChartLayout();

  /* ------------ decide what to show inside chart container ------------ */

  // (chartContent block removed; chart rendering is below in render)

  /* --------------------------- render --------------------------- */

  return (
    <div className={containerClass} style={{ width: '100%' }}>
      <h2>Longest Open Issues</h2>

      <div className={styles.filtersContainer}>
        <div className={styles.dateFilter}>
          <label className={labelClass} htmlFor="start-date">
            Date Range:
          </label>
          <div className={styles.dateRangePicker}>
            <div className={styles.dateRangePickerStart}>
              <DatePicker
                id="start-date"
                selected={startDate}
                onChange={date => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                maxDate={endDate}
                placeholderText="Start Date"
                isClearable
                className={filterSelectClass}
                calendarClassName={darkMode ? 'darkCalendar' : 'lightCalendar'}
              />
            </div>
            <span className={styles.dateRangeSeparator}>to</span>
            <div className={styles.dateRangePickerEnd}>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                maxDate={new Date()}
                placeholderText="End Date"
                isClearable
                className={filterSelectClass}
                calendarClassName={darkMode ? 'darkCalendar' : 'lightCalendar'}
              />
            </div>
          </div>
        </div>

        <div className={styles.projectFilter}>
          <label className={labelClass} htmlFor="projects-select">
            Projects:
          </label>
          <Select
            id="projects-select"
            isMulti
            options={projectOptions}
            onChange={handleProjectChange}
            value={projectOptions.filter(option => (selectedProjects ?? []).includes(option.value))}
            // className={filterSelectClass}
            classNamePrefix="select"
            styles={{
              control: base => ({
                ...base,
                backgroundColor: darkMode ? '#22272e' : '#ffffff',
                borderColor: darkMode ? '#3d444d' : '#ccc',
                color: darkMode ? '#cfd7e3' : '#333',
                boxShadow: 'none',
                '&:hover': {
                  borderColor: darkMode ? '#4caf50' : '#4caf50',
                },
              }),
              menu: base => ({
                ...base,
                backgroundColor: darkMode ? '#22272e' : '#ffffff',
                color: darkMode ? '#cfd7e3' : '#333',
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused
                  ? darkMode
                    ? '#2f3540'
                    : '#e5e5e5'
                  : 'transparent',
                color: darkMode ? '#fff' : '#333',
              }),
              multiValue: base => ({
                ...base,
                backgroundColor: darkMode ? '#3d444d' : '#e2e8f0',
                color: darkMode ? '#fff' : '#333',
              }),
              multiValueLabel: base => ({
                ...base,
                color: darkMode ? '#fff' : '#333',
              }),
              multiValueRemove: base => ({
                ...base,
                color: darkMode ? '#fff' : '#333',
                ':hover': {
                  backgroundColor: darkMode ? '#4caf50' : '#4caf50',
                  color: '#fff',
                },
              }),
            }}
          />
        </div>
      </div>

      <div className={chartContainerClass} ref={chartContainerRef}>
        {/* Step 6: Project Legend above the chart */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
          {projectLegend.map(p => (
            <div key={p.projectId} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: p.color,
                  borderRadius: 2,
                  display: 'inline-block',
                }}
              />
              <span style={{ fontSize: 13, color: textColor }}>{p.projectName}</span>
            </div>
          ))}
        </div>
        {!issues || issues.length === 0 ? (
          <div className={noDataMessageClass}>
            <div className={noDataContentClass}>
              <h3>No Open Issues Found</h3>
              <p>There are currently no open issues matching your selected criteria.</p>
              <p>Try adjusting your date range or project filters to see more results.</p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={margin}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                label={{ value: 'Duration in Months', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                dataKey="issueName"
                type="category"
                tick={{ fontSize: 14, fontWeight: 500 }}
                width={yAxisWidth}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
                  border: `1px solid ${darkMode ? '#4a5568' : '#e2e8f0'}`,
                  color: darkMode ? '#f3f4f6' : '#1a202c',
                  borderRadius: '6px',
                }}
                labelStyle={{
                  color: darkMode ? '#d1d5db' : '#111827',
                  fontWeight: 600,
                }}
                itemStyle={{
                  color: darkMode ? '#e5e7eb' : '#1a202c',
                }}
                formatter={value => `${value} months`}
                labelFormatter={label => `Issue: ${label}`}
              />
              {/* Step 5: Bar uses per-project colors */}
              <Bar dataKey="durationOpen" barSize={22} isAnimationActive={false}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={projectColorMap[entry.projectId] || '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default IssueCharts;
