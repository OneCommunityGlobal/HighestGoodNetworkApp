import { useEffect, useMemo, useState } from 'react';
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

function CustomYAxisTick({ x, y, payload, darkMode }) {
  const text = payload?.value || '';
  const words = text.split(' ');
  const lines = words.length > 2 ? [words.slice(0, 2).join(' '), words.slice(2).join(' ')] : [text];

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
          fontSize={12}
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

export const ToolReplacementChart = () => {
  const dispatch = useDispatch();
  const darkMode = useSelector(state => state.theme.darkMode);
  const toolReplacementState = useSelector(state => state.toolReplacement);
  const { loading = false, data = [], error = '' } = toolReplacementState || {};
  const bmProjects = useSelector(state => state.bmProjects || []);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedProject, setSelectedProject] = useState(ALL_PROJECTS_OPTION);

  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate.toISOString());
    if (endDate) queryParams.append('endDate', endDate.toISOString());
    if (selectedProject?.value && selectedProject.value !== 'all') {
      queryParams.append('projectId', selectedProject.value);
    }
    dispatch(fetchToolReplacements(queryParams.toString()));
  }, [startDate, endDate, selectedProject, dispatch]);

  const projectOptions = useMemo(() => {
    const fromApi = (Array.isArray(bmProjects) ? bmProjects : []).map(project => ({
      value: project._id || project.id || project.projectId,
      label: project.name || project.projectName || project.projectId || 'Unnamed Project',
    }));

    return [ALL_PROJECTS_OPTION, ...fromApi];
  }, [bmProjects]);

  const chartData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    let filtered = data;
    if (selectedProject?.value && selectedProject.value !== 'all') {
      filtered = data.filter(item => {
        const itemProjectId = item.projectId?._id || item.projectId;
        return String(itemProjectId) === String(selectedProject.value);
      });
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

      <div className={styles.chartContainer} style={{ height: chartHeight }}>
        {loading && <div className={styles.statusMessage}>Loading...</div>}
        {!loading && error && <div className={styles.errorMessage}>{error}</div>}
        {!loading && !error && chartData.length === 0 && (
          <div className={styles.emptyMessage}>No data available for the selected filters.</div>
        )}
        {!loading && !error && chartData.length > 0 && (
          <ResponsiveContainer className={styles.chart} width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 20, right: 56, left: 24, bottom: 36 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke={darkMode ? '#44556b' : '#e5e5e5'}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: darkMode ? '#e5e5e5' : '#666' }}
                label={{
                  value: '% of requirement satisfied',
                  position: 'insideBottom',
                  offset: -10,
                  fill: darkMode ? '#e5e5e5' : '#666',
                }}
              />
              <YAxis
                type="category"
                dataKey="toolName"
                width={110}
                tick={tickProps => <CustomYAxisTick {...tickProps} darkMode={darkMode} />}
                tickLine={false}
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
                  position="right"
                  formatter={value => `${Number(value).toFixed(1)}%`}
                  style={{
                    fill: darkMode ? '#e5e5e5' : '#374151',
                    fontWeight: 600,
                    fontSize: 12,
                  }}
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
