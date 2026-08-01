import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import { fetchToolReplacements } from '../../actions/toolReplacementActions';
import { fetchBMProjects } from '../../actions/bmdashboard/projectActions';
import styles from './ToolReplacementChart.module.css';

const ALL_PROJECTS_OPTION = { value: 'all', label: 'All Projects' };

const getRecordProjectId = item => {
  if (!item?.projectId && !item?.project) return '';
  const projectRef = item.projectId || item.project;
  if (typeof projectRef === 'object') {
    return String(projectRef._id || projectRef.id || '');
  }
  return String(projectRef);
};

const getRecordProjectName = item => {
  if (!item) return '';
  if (item.projectName) return String(item.projectName);
  if (item.project?.name) return String(item.project.name);
  if (item.project?.projectName) return String(item.project.projectName);
  if (typeof item.projectId === 'object') {
    return String(item.projectId.name || item.projectId.projectName || '');
  }
  return '';
};

const getProjectDisplayName = project =>
  project?.name || project?.projectName || project?.projectId || '';

const getSelectStyles = darkMode => {
  if (!darkMode) return undefined;

  return {
    control: base => ({
      ...base,
      backgroundColor: '#3a506b',
      borderColor: '#5a7a9b',
      minHeight: '42px',
      color: '#e5e5e5',
    }),
    menu: base => ({
      ...base,
      backgroundColor: '#3a506b',
      zIndex: 5,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused || state.isSelected ? '#2e4057' : '#3a506b',
      color: '#ffffff',
    }),
    singleValue: base => ({
      ...base,
      color: '#ffffff',
    }),
    input: base => ({
      ...base,
      color: '#ffffff',
    }),
    placeholder: base => ({
      ...base,
      color: '#a0b4c8',
    }),
  };
};

function CustomYAxisTick({ x, y, payload, darkMode, isMobile }) {
  const text = payload?.value || '';
  const words = text.split(' ');
  let lines = [text];
  if (words.length > 2) {
    lines = [words.slice(0, 2).join(' '), words.slice(2).join(' ')];
  } else if (isMobile && text.length > 15 && words.length > 1) {
    lines = [words[0], words.slice(1).join(' ')];
  }

  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, index) => (
        <text
          key={`${text}-${line}`}
          x={0}
          y={0}
          dy={index * 14 - (lines.length - 1) * 7}
          textAnchor="end"
          fill={darkMode ? '#e5e5e5' : '#666'}
          fontSize={isMobile ? 10 : 12}
        >
          <title>{text}</title>
          {line}
        </text>
      ))}
    </g>
  );
}

function ChartTooltip({ active, payload, darkMode }) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;
  return (
    <div
      style={{
        backgroundColor: darkMode ? '#0f172a' : 'rgba(255, 255, 255, 0.95)',
        border: darkMode ? '1px solid #93c5fd' : '1px solid #d1d5db',
        color: darkMode ? '#f8fafc' : '#111827',
        borderRadius: 8,
        padding: '10px 12px',
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.25)',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{point.toolName}</div>
      <div style={{ fontSize: 13 }}>
        % of requirement satisfied: <strong>{point.requirementSatisfiedPercentage}%</strong>
      </div>
    </div>
  );
}

function PercentageLabel({ x, y, width, height, value, darkMode, isMobile }) {
  if ([x, y, width, height, value].some(item => item == null)) return null;

  const text = `${Number(value).toFixed(1)}%`;
  const fontSize = isMobile ? 11 : 12;
  // Narrow screens have no room outside the bar, so draw the value inside its
  // filled end where white text keeps a strong contrast ratio.
  const fitsInsideBar = width > text.length * fontSize * 0.62 + 14;
  const renderInside = isMobile && fitsInsideBar;

  let fill = darkMode ? '#f8fafc' : '#1f2937';
  if (renderInside) fill = '#ffffff';

  return (
    <text
      x={renderInside ? x + width - 7 : x + width + 6}
      y={y + height / 2}
      dy="0.35em"
      fill={fill}
      fontSize={fontSize}
      fontWeight={700}
      textAnchor={renderInside ? 'end' : 'start'}
    >
      {text}
    </text>
  );
}

export const ToolReplacementChart = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const toolReplacementState = useSelector(state => state.toolReplacement);
  const { loading = false, data = [], error = '' } = toolReplacementState || {};
  const bmProjects = useSelector(state => state.bmProjects || []);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedProject, setSelectedProject] = useState(ALL_PROJECTS_OPTION);
  const [chartWidth, setChartWidth] = useState(0);
  const chartContainerRef = useRef(null);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return undefined;

    const updateWidth = () => setChartWidth(container.getBoundingClientRect().width);
    updateWidth();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  // Fetch by date range only. Project filtering is done client-side so we
  // don't depend on the backend projectId filter returning an empty set.
  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate.toISOString());
    if (endDate) queryParams.append('endDate', endDate.toISOString());
    dispatch(fetchToolReplacements(queryParams.toString()));
  }, [startDate, endDate, dispatch]);

  const projectOptions = useMemo(() => {
    // Matches the other BM dashboard filters: options come from state.bmProjects
    // as { value: _id, label: name }, in the order the API returns them.
    const optionsById = new Map();

    const addOption = (id, label) => {
      if (!id || !label || optionsById.has(id)) return;
      optionsById.set(id, { value: id, label });
    };

    (Array.isArray(bmProjects) ? bmProjects : []).forEach(project => {
      addOption(String(project?._id || ''), getProjectDisplayName(project));
    });

    // Include projects named by the tool data itself once the API populates them.
    (Array.isArray(data) ? data : []).forEach(item => {
      addOption(getRecordProjectId(item), getRecordProjectName(item));
    });

    return [ALL_PROJECTS_OPTION, ...optionsById.values()];
  }, [bmProjects, data]);

  useEffect(() => {
    if (selectedProject?.value === 'all') return;
    const stillValid = projectOptions.some(option => option.value === selectedProject?.value);
    if (!stillValid) {
      setSelectedProject(ALL_PROJECTS_OPTION);
    }
  }, [projectOptions, selectedProject]);

  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    // Filter to one project's tools, then aggregate by tool name for the bar chart.
    let filtered = data;
    if (selectedProject?.value && selectedProject.value !== 'all') {
      filtered = data.filter(item => getRecordProjectId(item) === String(selectedProject.value));
    }

    const toolMap = {};
    filtered.forEach(item => {
      const name = item.toolName;
      const percentage = Number(item.requirementSatisfiedPercentage);
      if (!name || Number.isNaN(percentage)) return;

      if (!toolMap[name]) {
        toolMap[name] = { total: percentage, count: 1 };
      } else {
        toolMap[name].total += percentage;
        toolMap[name].count += 1;
      }
    });

    return Object.keys(toolMap)
      .map(toolName => ({
        toolName,
        requirementSatisfiedPercentage: Number(
          (toolMap[toolName].total / toolMap[toolName].count).toFixed(1),
        ),
      }))
      .sort((a, b) => a.requirementSatisfiedPercentage - b.requirementSatisfiedPercentage);
  }, [data, selectedProject]);

  const chartHeight = Math.max(280, chartData.length * 48 + 80);
  const isMobile = chartWidth > 0 && chartWidth < 600;
  const isCompact = chartWidth > 0 && chartWidth < 900;
  const yAxisWidth = isMobile ? 92 : isCompact ? 112 : 145;
  const chartMargin = {
    top: 16,
    right: isMobile ? 42 : 58,
    left: isMobile ? 0 : 8,
    bottom: isMobile ? 44 : 40,
  };

  const handleStartDateChange = date => {
    if (endDate && date && date > endDate) {
      setEndDate(date);
    }
    setStartDate(date);
  };

  const handleEndDateChange = date => {
    if (startDate && date && date < startDate) {
      setStartDate(date);
    }
    setEndDate(date);
  };

  const handleResetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedProject(ALL_PROJECTS_OPTION);
  };

  const hasActiveFilters =
    Boolean(startDate) || Boolean(endDate) || selectedProject?.value !== 'all';

  return (
    <div className={`${styles.mainContainer} ${darkMode ? styles.bgDark : ''}`}>
      <h2 className={`${styles.title} ${darkMode ? styles.titleDark : ''}`}>
        Tools Most Susceptible to Breakdown
      </h2>
      <p className={`${styles.subtitle} ${darkMode ? styles.subtitleDark : ''}`}>
        Choose a project to view its tools ranked by % of requirement satisfied. Lower % means
        higher replacement risk.
      </p>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label
            htmlFor="tool-replacement-project"
            className={`${styles.filterLabel} ${darkMode ? styles.filterLabelDark : ''}`}
          >
            Project
          </label>
          <Select
            inputId="tool-replacement-project"
            className={styles.projectSelect}
            options={projectOptions}
            value={selectedProject}
            onChange={option => setSelectedProject(option || ALL_PROJECTS_OPTION)}
            placeholder="Select a project"
            styles={getSelectStyles(darkMode)}
            aria-label="Filter by project"
          />
        </div>

        <div className={styles.filterGroup}>
          <label
            htmlFor="tool-replacement-start-date"
            className={`${styles.filterLabel} ${darkMode ? styles.filterLabelDark : ''}`}
          >
            Start Date
          </label>
          <DatePicker
            id="tool-replacement-start-date"
            selected={startDate}
            onChange={handleStartDateChange}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="Start Date"
            className={`${styles.datePicker} ${darkMode ? styles.datePickerDark : ''}`}
            wrapperClassName={styles.datePickerWrapper}
            calendarClassName={darkMode ? styles.calendarDark : styles.calendar}
            popperClassName={styles.datePickerPopper}
            dateFormat="MMM d, yyyy"
            popperPlacement="bottom-start"
          />
        </div>

        <div className={styles.filterGroup}>
          <label
            htmlFor="tool-replacement-end-date"
            className={`${styles.filterLabel} ${darkMode ? styles.filterLabelDark : ''}`}
          >
            End Date
          </label>
          <DatePicker
            id="tool-replacement-end-date"
            selected={endDate}
            onChange={handleEndDateChange}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            placeholderText="End Date"
            className={`${styles.datePicker} ${darkMode ? styles.datePickerDark : ''}`}
            wrapperClassName={styles.datePickerWrapper}
            calendarClassName={darkMode ? styles.calendarDark : styles.calendar}
            popperClassName={styles.datePickerPopper}
            dateFormat="MMM d, yyyy"
            popperPlacement="bottom-start"
          />
        </div>

        <div className={styles.filterGroup}>
          <span className={`${styles.filterLabel} ${darkMode ? styles.filterLabelDark : ''}`}>
            &nbsp;
          </span>
          <button
            type="button"
            onClick={handleResetFilters}
            disabled={!hasActiveFilters}
            className={`${styles.resetBtn} ${darkMode ? styles.resetBtnDark : ''}`}
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div
        ref={chartContainerRef}
        className={styles.chartContainer}
        style={{ height: chartHeight }}
      >
        {loading && <div className={styles.statusMessage}>Loading...</div>}
        {!loading && error && <div className={styles.errorMessage}>{error}</div>}
        {!loading && !error && chartData.length === 0 && (
          <div className={styles.emptyMessage}>
            {selectedProject?.value === 'all'
              ? 'No tool data available for the selected filters.'
              : `No tools found for "${selectedProject.label}". This project may not have tool replacement records yet.`}
          </div>
        )}
        {!loading && !error && chartData.length > 0 && (
          <ResponsiveContainer className={styles.chart} width="100%" height="100%">
            <BarChart layout="vertical" data={chartData} margin={chartMargin}>
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke={darkMode ? '#44556b' : '#e5e5e5'}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={{
                  fill: darkMode ? '#f8fafc' : '#4b5563',
                  fontSize: isMobile ? 10 : 12,
                }}
                axisLine={{ stroke: darkMode ? '#94a3b8' : '#6b7280' }}
                tickLine={{ stroke: darkMode ? '#94a3b8' : '#6b7280' }}
                label={{
                  value: '% of requirement satisfied',
                  position: 'insideBottom',
                  offset: isMobile ? -16 : -12,
                  fill: darkMode ? '#f8fafc' : '#4b5563',
                  fontSize: isMobile ? 12 : 14,
                }}
              />
              <YAxis
                type="category"
                dataKey="toolName"
                width={yAxisWidth}
                tick={tickProps => (
                  <CustomYAxisTick {...tickProps} darkMode={darkMode} isMobile={isMobile} />
                )}
                tickLine={false}
                axisLine={{ stroke: darkMode ? '#94a3b8' : '#6b7280' }}
              />
              <Tooltip
                content={<ChartTooltip darkMode={darkMode} />}
                cursor={{
                  fill: darkMode ? 'rgba(147, 197, 253, 0.12)' : 'rgba(30, 64, 175, 0.08)',
                }}
              />
              <Bar
                dataKey="requirementSatisfiedPercentage"
                name="% of requirement satisfied"
                fill={darkMode ? '#4f9bff' : '#3b82f6'}
                stroke={darkMode ? '#a8c8ff' : '#1e40af'}
                strokeWidth={1.5}
                barSize={chartData.length === 1 ? 28 : undefined}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="requirementSatisfiedPercentage"
                  content={labelProps => (
                    <PercentageLabel {...labelProps} darkMode={darkMode} isMobile={isMobile} />
                  )}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ToolReplacementChart;
