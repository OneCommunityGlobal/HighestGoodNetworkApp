import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bar, BarChart, CartesianGrid, LabelList, Tooltip, XAxis, YAxis } from 'recharts';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import { fetchToolReplacements } from '../../actions/toolReplacementActions';
import { fetchBMProjects } from '../../actions/bmdashboard/projectActions';
import styles from './ToolReplacementChart.module.css';

const ALL_PROJECTS_OPTION = { value: 'all', label: 'All Projects' };
const MIN_CHART_WIDTH = 40;

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

const getYAxisWidth = (isMobile, isCompact) => {
  if (isMobile) return 92;
  if (isCompact) return 112;
  return 145;
};

const getChartMargin = isMobile => ({
  top: 16,
  right: isMobile ? 42 : 58,
  left: isMobile ? 0 : 8,
  bottom: isMobile ? 44 : 40,
});

const getAxisFill = darkMode => (darkMode ? '#f8fafc' : '#4b5563');
const getAxisStroke = darkMode => (darkMode ? '#94a3b8' : '#6b7280');
const getBarFill = darkMode => (darkMode ? '#4f9bff' : '#3b82f6');
const getBarStroke = darkMode => (darkMode ? '#a8c8ff' : '#1e40af');

const buildProjectOptions = (bmProjects, data) => {
  const optionsById = new Map();

  const addOption = (id, label) => {
    if (!id || !label || optionsById.has(id)) return;
    optionsById.set(id, { value: id, label });
  };

  (Array.isArray(bmProjects) ? bmProjects : []).forEach(project => {
    addOption(String(project?._id || ''), getProjectDisplayName(project));
  });

  (Array.isArray(data) ? data : []).forEach(item => {
    addOption(getRecordProjectId(item), getRecordProjectName(item));
  });

  return [ALL_PROJECTS_OPTION, ...optionsById.values()];
};

const buildChartData = (data, selectedProject) => {
  if (!Array.isArray(data) || data.length === 0) return [];

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
};

const getEmptyMessage = selectedProject => {
  if (selectedProject?.value === 'all') {
    return 'No tool data available for the selected filters.';
  }
  return `No tools found for "${selectedProject.label}". This project may not have tool replacement records yet.`;
};

function useChartWidth(containerRef) {
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
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
  }, [containerRef]);

  return chartWidth;
}

function CustomYAxisTick({ x, y, payload, darkMode, isMobile }) {
  if (x == null || y == null || Number.isNaN(x) || Number.isNaN(y)) return null;

  const text = String(payload?.value ?? '');
  if (!text) return null;

  const words = text.split(' ').filter(Boolean);
  let lines = [text];
  if (words.length > 2) {
    lines = [words.slice(0, 2).join(' '), words.slice(2).join(' ')];
  } else if (isMobile && text.length > 15 && words.length > 1) {
    lines = [words[0], words.slice(1).join(' ')];
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <title>{text}</title>
      {lines.map((line, index) => (
        <text
          key={`${text}-${index}-${line}`}
          x={0}
          y={0}
          dy={index * 14 - (lines.length - 1) * 7}
          textAnchor="end"
          fill={darkMode ? '#e5e5e5' : '#666'}
          fontSize={isMobile ? 10 : 12}
        >
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
  if ([x, y, width, height, value].some(item => item == null || Number.isNaN(item))) return null;

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return null;

  const text = `${numericValue.toFixed(1)}%`;
  const fontSize = isMobile ? 11 : 12;
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

function ChartFilters({
  darkMode,
  projectOptions,
  selectedProject,
  onProjectChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onResetFilters,
  hasActiveFilters,
}) {
  const labelClass = `${styles.filterLabel} ${darkMode ? styles.filterLabelDark : ''}`;
  const dateClass = `${styles.datePicker} ${darkMode ? styles.datePickerDark : ''}`;
  const calendarClass = darkMode ? styles.calendarDark : styles.calendar;

  return (
    <div className={styles.filters}>
      <div className={styles.filterGroup}>
        <label htmlFor="tool-replacement-project" className={labelClass}>
          Project
        </label>
        <Select
          inputId="tool-replacement-project"
          className={styles.projectSelect}
          options={projectOptions}
          value={selectedProject}
          onChange={onProjectChange}
          placeholder="Select a project"
          styles={getSelectStyles(darkMode)}
          aria-label="Filter by project"
        />
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="tool-replacement-start-date" className={labelClass}>
          Start Date
        </label>
        <DatePicker
          id="tool-replacement-start-date"
          selected={startDate}
          onChange={onStartDateChange}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Start Date"
          className={dateClass}
          wrapperClassName={styles.datePickerWrapper}
          calendarClassName={calendarClass}
          popperClassName={styles.datePickerPopper}
          dateFormat="MMM d, yyyy"
          popperPlacement="bottom-start"
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
        />
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="tool-replacement-end-date" className={labelClass}>
          End Date
        </label>
        <DatePicker
          id="tool-replacement-end-date"
          selected={endDate}
          onChange={onEndDateChange}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          placeholderText="End Date"
          className={dateClass}
          wrapperClassName={styles.datePickerWrapper}
          calendarClassName={calendarClass}
          popperClassName={styles.datePickerPopper}
          dateFormat="MMM d, yyyy"
          popperPlacement="bottom-start"
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
        />
      </div>

      <div className={styles.filterGroup}>
        <span className={labelClass}>&nbsp;</span>
        <button
          type="button"
          onClick={onResetFilters}
          disabled={!hasActiveFilters}
          className={`${styles.resetBtn} ${darkMode ? styles.resetBtnDark : ''}`}
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}

function ToolsBarChart({ chartData, darkMode, isMobile, yAxisWidth, chartMargin, width, height }) {
  const axisFill = getAxisFill(darkMode);
  const axisStroke = getAxisStroke(darkMode);
  const fontSize = isMobile ? 10 : 12;
  const labelFontSize = isMobile ? 12 : 14;

  const renderTick = useCallback(
    props => <CustomYAxisTick {...props} darkMode={darkMode} isMobile={isMobile} />,
    [darkMode, isMobile],
  );

  const renderPercentageLabel = useCallback(
    props => <PercentageLabel {...props} darkMode={darkMode} isMobile={isMobile} />,
    [darkMode, isMobile],
  );

  if (width < MIN_CHART_WIDTH || height < MIN_CHART_WIDTH) {
    return <div className={styles.statusMessage}>Loading chart...</div>;
  }

  return (
    <BarChart width={width} height={height} layout="vertical" data={chartData} margin={chartMargin}>
      <CartesianGrid
        strokeDasharray="3 3"
        horizontal={false}
        stroke={darkMode ? '#44556b' : '#e5e5e5'}
      />
      <XAxis
        type="number"
        domain={[0, 100]}
        ticks={[0, 25, 50, 75, 100]}
        tick={{ fill: axisFill, fontSize }}
        axisLine={{ stroke: axisStroke }}
        tickLine={{ stroke: axisStroke }}
        label={{
          value: '% of requirement satisfied',
          position: 'insideBottom',
          offset: isMobile ? -16 : -12,
          fill: axisFill,
          fontSize: labelFontSize,
        }}
      />
      <YAxis
        type="category"
        dataKey="toolName"
        width={yAxisWidth}
        tick={renderTick}
        interval={0}
        tickLine={false}
        axisLine={{ stroke: axisStroke }}
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
        fill={getBarFill(darkMode)}
        stroke={getBarStroke(darkMode)}
        strokeWidth={1.5}
        barSize={chartData.length === 1 ? 28 : undefined}
        isAnimationActive={false}
      >
        <LabelList dataKey="requirementSatisfiedPercentage" content={renderPercentageLabel} />
      </Bar>
    </BarChart>
  );
}

function ChartPanel({
  chartContainerRef,
  chartHeight,
  chartWidth,
  loading,
  error,
  chartData,
  selectedProject,
  darkMode,
  isMobile,
  yAxisWidth,
  chartMargin,
}) {
  let body = null;
  if (loading) {
    body = <div className={styles.statusMessage}>Loading...</div>;
  } else if (error) {
    body = <div className={styles.errorMessage}>{error}</div>;
  } else if (chartData.length === 0) {
    body = <div className={styles.emptyMessage}>{getEmptyMessage(selectedProject)}</div>;
  } else {
    body = (
      <ToolsBarChart
        chartData={chartData}
        darkMode={darkMode}
        isMobile={isMobile}
        yAxisWidth={yAxisWidth}
        chartMargin={chartMargin}
        width={chartWidth}
        height={chartHeight}
      />
    );
  }

  return (
    <div ref={chartContainerRef} className={styles.chartContainer} style={{ height: chartHeight }}>
      {body}
    </div>
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
  const chartContainerRef = useRef(null);
  const chartWidth = useChartWidth(chartContainerRef);

  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate.toISOString());
    if (endDate) queryParams.append('endDate', endDate.toISOString());
    dispatch(fetchToolReplacements(queryParams.toString()));
  }, [startDate, endDate, dispatch]);

  const projectOptions = useMemo(() => buildProjectOptions(bmProjects, data), [bmProjects, data]);

  useEffect(() => {
    if (selectedProject?.value === 'all') return;
    const stillValid = projectOptions.some(option => option.value === selectedProject?.value);
    if (!stillValid) {
      setSelectedProject(ALL_PROJECTS_OPTION);
    }
  }, [projectOptions, selectedProject]);

  const chartData = useMemo(() => buildChartData(data, selectedProject), [data, selectedProject]);

  const chartHeight = Math.max(280, chartData.length * 48 + 80);
  const isMobile = chartWidth > 0 && chartWidth < 600;
  const isCompact = chartWidth > 0 && chartWidth < 900;
  const yAxisWidth = getYAxisWidth(isMobile, isCompact);
  const chartMargin = getChartMargin(isMobile);

  const handleStartDateChange = useCallback(
    date => {
      if (endDate && date && date > endDate) {
        setEndDate(date);
      }
      setStartDate(date);
    },
    [endDate],
  );

  const handleEndDateChange = useCallback(
    date => {
      if (startDate && date && date < startDate) {
        setStartDate(date);
      }
      setEndDate(date);
    },
    [startDate],
  );

  const handleResetFilters = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
    setSelectedProject(ALL_PROJECTS_OPTION);
  }, []);

  const handleProjectChange = useCallback(option => {
    setSelectedProject(option || ALL_PROJECTS_OPTION);
  }, []);

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

      <ChartFilters
        darkMode={darkMode}
        projectOptions={projectOptions}
        selectedProject={selectedProject}
        onProjectChange={handleProjectChange}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <ChartPanel
        chartContainerRef={chartContainerRef}
        chartHeight={chartHeight}
        chartWidth={chartWidth}
        loading={loading}
        error={error}
        chartData={chartData}
        selectedProject={selectedProject}
        darkMode={darkMode}
        isMobile={isMobile}
        yAxisWidth={yAxisWidth}
        chartMargin={chartMargin}
      />
    </div>
  );
};

export default ToolReplacementChart;
