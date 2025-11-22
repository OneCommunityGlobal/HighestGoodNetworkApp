import { useEffect, useState } from 'react';
import Select from 'react-select';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import axios from 'axios';
import { ENDPOINTS } from '../../../../utils/URL';
import styles from './ToolsHorizontalBarChart.module.css';

// No mock data - use real backend data only

// Custom tooltip component
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);

  return (
    <div className={styles['tools-horizontal-bar-chart-tooltip']}>
      <p className={styles['tools-horizontal-bar-chart-tooltip-label']}>{label}</p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
      <p className={styles['tools-horizontal-bar-chart-tooltip-total']}>Total: {total}</p>
    </div>
  );
}

function ToolsHorizontalBarChart({ darkMode }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [allTools, setAllTools] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);

  // Date range state for filters
  const currentDate = new Date();
  const startDate12MonthsAgo = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
  const endOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const [startDate, setStartDate] = useState(startDate12MonthsAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(endOfCurrentMonth.toISOString().split('T')[0]);

  // Date range logging removed for production

  // Fetch projects list
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsResponse = await axios.get(ENDPOINTS.TOOLS_AVAILABILITY_PROJECTS);
        const projects = projectsResponse.data;

        // Projects fetched successfully

        if (projects && projects.length > 0) {
          const projectOptions = projects.map(project => ({
            value: project.projectId,
            label: project.projectId, // Use project ID as the visible label
          }));
          setAllProjects(projectOptions);

          // Auto-select first project for initial display
          setSelectedProject(projectOptions[0]);
        }
      } catch (err) {
        setError('Failed to load projects');
      }
    };

    fetchProjects();
  }, []);

  // Fetch tools data when project or date range changes
  useEffect(() => {
    const fetchToolsData = async () => {
      if (!selectedProject?.value) {
        setData([]);
        setAllTools([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const projectId = selectedProject.value;

        // 1. Fetch unfiltered dataset (for fallback + full tool list)
        const toolsResponseNoFilter = await axios.get(
          ENDPOINTS.TOOLS_AVAILABILITY_BY_PROJECT(projectId),
        );

        // 2. Fetch filtered dataset
        const toolsResponse = await axios.get(
          ENDPOINTS.TOOLS_AVAILABILITY_BY_PROJECT(projectId, startDate, endDate),
        );

        const toolsDataFiltered = toolsResponse.data;
        const toolsDataUnfiltered = toolsResponseNoFilter.data;

        // Use filtered data if available; otherwise fallback to unfiltered
        const toolsData =
          toolsDataFiltered && toolsDataFiltered.length > 0
            ? toolsDataFiltered
            : toolsDataUnfiltered;

        // Extract unique tool names for dropdown
        if (toolsDataUnfiltered?.length > 0) {
          const uniqueTools = [...new Set(toolsDataUnfiltered.map(item => item.toolName))]
            .filter(Boolean) // remove null/undefined
            .map(tool => ({
              label: tool,
              value: tool,
            }));

          setAllTools(uniqueTools);
        } else {
          setAllTools([]);
        }

        // If tool filters active → apply them
        let filteredForChart = toolsData;
        if (selectedTools.length > 0) {
          const selectedNames = selectedTools.map(t => t.value);
          filteredForChart = toolsData.filter(item => selectedNames.includes(item.toolName));
        }

        // ✅ Format chart data
        if (filteredForChart.length > 0) {
          const formattedData = filteredForChart.map(item => ({
            name: item.toolName || 'Unknown Tool',
            inUse: item.inUse || 0,
            needsReplacement: item.needsReplacement || 0,
            yetToReceive: item.yetToReceive || 0,
          }));

          setData(formattedData);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load tools data');
        setData([]);
        setAllTools([]);
      } finally {
        setLoading(false);
      }
    };

    fetchToolsData();
  }, [selectedProject, startDate, endDate, selectedTools]);

  // Filter handlers
  const handleToolChange = selectedOption => setSelectedTools(selectedOption || []);

  const handleProjectChange = selectedOption => {
    setSelectedProject(selectedOption);
  };

  const handleStartDateChange = e => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = e => {
    setEndDate(e.target.value);
  };

  const handleClearDates = () => {
    const currentDate = new Date();
    const startDate12MonthsAgo = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
    const endOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    setStartDate(startDate12MonthsAgo.toISOString().split('T')[0]);
    setEndDate(endOfCurrentMonth.toISOString().split('T')[0]);
  };

  if (loading) {
    return (
      <div className={styles['tools-horizontal-bar-chart-card']}>
        <h4 className={styles['tools-horizontal-bar-chart-title']}>Tools by Availability</h4>
        <div className={styles['tools-horizontal-bar-chart-loading']}>Loading...</div>
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <div className={styles['tools-horizontal-bar-chart-card']}>
        <h4 className={styles['tools-horizontal-bar-chart-title']}>Tools by Availability</h4>
        <div className={styles['tools-horizontal-bar-chart-error']}>{error}</div>
      </div>
    );
  }

  const darkSelectStyles = {
    control: base => ({
      ...base,
      backgroundColor: '#2c3344',
      borderColor: '#364156',
      minHeight: '32px',
      fontSize: '12px',
    }),
    menu: base => ({
      ...base,
      backgroundColor: '#2c3344',
      fontSize: '12px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#364156' : '#2c3344',
      color: '#e0e0e0',
      fontSize: '12px',
    }),
    multiValue: base => ({
      ...base,
      backgroundColor: '#364156',
    }),
    multiValueLabel: base => ({
      ...base,
      color: '#e0e0e0',
      fontSize: '12px',
    }),
    placeholder: base => ({
      ...base,
      color: '#aaaaaa',
      fontSize: '12px',
    }),
  };

  const lightSelectStyles = {
    control: base => ({
      ...base,
      minHeight: '32px',
      fontSize: '12px',
    }),
    menu: base => ({
      ...base,
      fontSize: '12px',
    }),
    option: base => ({
      ...base,
      fontSize: '12px',
    }),
    multiValue: base => ({
      ...base,
      backgroundColor: '#e6e6e6',
    }),
    multiValueLabel: base => ({
      ...base,
      fontSize: '12px',
    }),
    placeholder: base => ({
      ...base,
      fontSize: '12px',
    }),
  };

  return (
    <div
      className={
        styles[
          `tools-horizontal-bar-chart-card ${
            darkMode ? 'tools-horizontal-bar-chart-dark-mode' : ''
          }`
        ]
      }
    >
      <h4 className={styles['tools-horizontal-bar-chart-title']}>Tools by Availability</h4>

      {/* Filters Section */}
      <div className={styles['tools-horizontal-bar-chart-filter-group']}>
        <label htmlFor="tool-select">Tool(s)</label>
        <Select
          id="tool-select"
          className={styles['tools-horizontal-bar-chart-tool-select']}
          classNamePrefix="select"
          value={selectedTools}
          onChange={handleToolChange}
          options={allTools}
          placeholder="Select tools"
          isMulti={true}
          isClearable={true}
          isDisabled={allTools.length === 0}
          closeMenuOnSelect={false}
          styles={darkMode ? darkSelectStyles : lightSelectStyles}
        />
      </div>

      <div className={styles['tools-horizontal-bar-chart-filters']}>
        <div className={styles['tools-horizontal-bar-chart-filter-group']}>
          <label htmlFor="project-select">Project</label>
          <Select
            id="project-select"
            className={styles['tools-horizontal-bar-chart-project-select']}
            classNamePrefix="select"
            value={selectedProject}
            onChange={handleProjectChange}
            options={allProjects}
            placeholder="Select a project"
            isClearable={false}
            isDisabled={allProjects.length === 0}
            styles={
              darkMode
                ? {
                    control: baseStyles => ({
                      ...baseStyles,
                      backgroundColor: '#2c3344',
                      borderColor: '#364156',
                      minHeight: '32px',
                      fontSize: '12px',
                    }),
                    menu: baseStyles => ({
                      ...baseStyles,
                      backgroundColor: '#2c3344',
                      fontSize: '12px',
                    }),
                    option: (baseStyles, state) => ({
                      ...baseStyles,
                      backgroundColor: state.isFocused ? '#364156' : '#2c3344',
                      color: '#e0e0e0',
                      fontSize: '12px',
                    }),
                    singleValue: baseStyles => ({
                      ...baseStyles,
                      color: '#e0e0e0',
                      fontSize: '12px',
                    }),
                    placeholder: baseStyles => ({
                      ...baseStyles,
                      color: '#aaaaaa',
                      fontSize: '12px',
                    }),
                  }
                : {
                    control: baseStyles => ({
                      ...baseStyles,
                      minHeight: '32px',
                      fontSize: '12px',
                    }),
                    menu: baseStyles => ({
                      ...baseStyles,
                      fontSize: '12px',
                    }),
                    option: baseStyles => ({
                      ...baseStyles,
                      fontSize: '12px',
                    }),
                    singleValue: baseStyles => ({
                      ...baseStyles,
                      fontSize: '12px',
                    }),
                    placeholder: baseStyles => ({
                      ...baseStyles,
                      fontSize: '12px',
                    }),
                  }
            }
          />
        </div>

        <div className={styles['tools-horizontal-bar-chart-filter-group']}>
          <label htmlFor="start-date-picker">Date Range</label>
          <div className={styles['tools-horizontal-bar-chart-date-picker-group']}>
            <input
              id="start-date-picker"
              type="date"
              className={styles['tools-horizontal-bar-chart-date-picker']}
              value={startDate}
              onChange={handleStartDateChange}
              placeholder="Start date"
              aria-label="Start date"
            />
            <span>to</span>
            <input
              id="end-date-picker"
              type="date"
              className={styles['tools-horizontal-bar-chart-date-picker']}
              value={endDate}
              onChange={handleEndDateChange}
              placeholder="End date"
              aria-label="End date"
            />
            <button
              type="button"
              className={styles['tools-horizontal-bar-chart-clear-dates-btn']}
              onClick={handleClearDates}
              aria-label="Clear date filters"
              title="Reset to default date range"
            >
              ↻
            </button>
          </div>
        </div>
      </div>

      {data.length > 0 ? (
        <div className={styles['tools-horizontal-bar-chart-content']}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tick={{
                  fill: darkMode ? '#e0e0e0' : '#333',
                  fontSize: 12,
                }}
                width={35}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="inUse" stackId="a" fill="#2196F3" name="In Use" />
              <Bar dataKey="needsReplacement" stackId="a" fill="#F44336" name="Needs Replacement" />
              <Bar dataKey="yetToReceive" stackId="a" fill="#FF9800" name="Yet to Receive" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className={styles['tools-horizontal-bar-chart-empty']}>
          <p>📊 No tools data available</p>
        </div>
      )}
    </div>
  );
}

export default ToolsHorizontalBarChart;
