import { useEffect, useState } from 'react';
import Select from 'react-select';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import axios from 'axios';
import { ENDPOINTS } from '../../../../utils/URL';
import { getOptionBackgroundColor, getOptionColor } from '../../../../utils/reactSelectUtils';
import './ToolsHorizontalBarChart.css';

// No mock data - use real backend data only

// Custom tooltip component
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);

  return (
    <div className="tools-horizontal-bar-chart-tooltip">
      <p className="tools-horizontal-bar-chart-tooltip-label">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
      <p className="tools-horizontal-bar-chart-tooltip-total">Total: {total}</p>
    </div>
  );
}

function ToolsHorizontalBarChart({ darkMode }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Date range state for filters
  const currentDate = new Date();
  const startDate12MonthsAgo = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
  const endOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const [startDate, setStartDate] = useState(startDate12MonthsAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(endOfCurrentMonth.toISOString().split('T')[0]);

  // Responsive height calculation
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Gradient responsive chart height scaling - matches ToolsStoppageHorizontalBarChart
  // Scales smoothly from smallest phones (180px) to desktop (300px)
  const getChartHeight = () => {
    if (windowWidth <= 375) {
      return 180;
    } else if (windowWidth <= 428) {
      return 200;
    } else if (windowWidth <= 480) {
      return 220;
    } else if (windowWidth <= 768) {
      return 240;
    } else if (windowWidth <= 1024) {
      return 280;
    }
    return 300;
  };

  // Gradient responsive margins scaling
  const getChartMargins = () => {
    if (windowWidth <= 375) {
      return { top: 3, right: 3, left: 12, bottom: 3 };
    } else if (windowWidth <= 428) {
      return { top: 4, right: 4, left: 13, bottom: 4 };
    } else if (windowWidth <= 480) {
      return { top: 4, right: 4, left: 14, bottom: 4 };
    } else if (windowWidth <= 768) {
      return { top: 5, right: 5, left: 15, bottom: 5 };
    } else if (windowWidth <= 1024) {
      return { top: 8, right: 15, left: 25, bottom: 8 };
    }
    return { top: 10, right: 30, left: 40, bottom: 10 };
  };

  // Gradient responsive Y-axis width scaling
  const getYAxisWidth = () => {
    if (windowWidth <= 375) {
      return 18;
    } else if (windowWidth <= 428) {
      return 19;
    } else if (windowWidth <= 480) {
      return 19.5;
    } else if (windowWidth <= 768) {
      return 20;
    } else if (windowWidth <= 1024) {
      return 28;
    }
    return 35;
  };

  // Gradient responsive Y-axis font size scaling
  const getYAxisFontSize = () => {
    if (windowWidth <= 375) {
      return 8;
    } else if (windowWidth <= 428) {
      return 9;
    } else if (windowWidth <= 480) {
      return 9.5;
    } else if (windowWidth <= 768) {
      return 10;
    } else if (windowWidth <= 1024) {
      return 11;
    }
    return 12;
  };

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
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const projectId = selectedProject.value;
        // Fetching tools data for selected project

        if (!projectId) {
          throw new Error('No valid project ID found');
        }

        // First try without date filters to see if there's any data at all
        const toolsResponseNoFilter = await axios.get(
          ENDPOINTS.TOOLS_AVAILABILITY_BY_PROJECT(projectId),
        );

        // Then try with date filters
        const toolsResponse = await axios.get(
          ENDPOINTS.TOOLS_AVAILABILITY_BY_PROJECT(projectId, startDate, endDate),
        );
        const toolsDataFiltered = toolsResponse.data;
        const toolsDataUnfiltered = toolsResponseNoFilter.data;

        // Use filtered data if available, otherwise fall back to unfiltered
        const toolsData =
          toolsDataFiltered && toolsDataFiltered.length > 0
            ? toolsDataFiltered
            : toolsDataUnfiltered;

        if (toolsData && toolsData.length > 0) {
          // Process and format the data using correct backend field names
          const formattedData = toolsData
            .slice(0, 5) // Show only top 5 tools
            .map(item => ({
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
        setError('Failed to load tools data');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchToolsData();
  }, [selectedProject, startDate, endDate]);

  // Filter handlers
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
      <div className="tools-horizontal-bar-chart-card">
        <h4 className="tools-horizontal-bar-chart-title">Tools by Availability</h4>
        <div className="tools-horizontal-bar-chart-loading">Loading...</div>
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <div className="tools-horizontal-bar-chart-card">
        <h4 className="tools-horizontal-bar-chart-title">Tools by Availability</h4>
        <div className="tools-horizontal-bar-chart-error">{error}</div>
      </div>
    );
  }

  return (
    <div
      className={`tools-horizontal-bar-chart-card ${
        darkMode ? 'tools-horizontal-bar-chart-dark-mode' : ''
      }`}
    >
      <h4 className="tools-horizontal-bar-chart-title">Tools by Availability</h4>

      {/* Filters Section */}
      <div className="tools-horizontal-bar-chart-filters">
        <div className="tools-horizontal-bar-chart-filter-group">
          <label htmlFor="project-select">Project</label>
          <Select
            id="project-select"
            className="tools-horizontal-bar-chart-project-select"
            classNamePrefix="select"
            value={selectedProject}
            onChange={handleProjectChange}
            options={allProjects}
            placeholder="Select a project"
            isClearable={false}
            isDisabled={allProjects.length === 0}
            styles={{
              control: baseStyles => ({
                ...baseStyles,
                minHeight: '38px',
                fontSize: '12px',
                backgroundColor: darkMode ? '#253342' : '#fff',
                borderColor: darkMode ? '#2d4059' : '#ccc',
                color: darkMode ? '#ffffff' : '#000',
                boxShadow: 'none',
                borderRadius: '6px',
                '&:hover': {
                  borderColor: darkMode ? '#2d4059' : '#999',
                },
              }),
              valueContainer: baseStyles => ({
                ...baseStyles,
                padding: '2px 8px',
                color: darkMode ? '#ffffff' : '#000',
              }),
              input: baseStyles => ({
                ...baseStyles,
                margin: '0px',
                padding: '0px',
                color: darkMode ? '#ffffff' : '#000',
              }),
              indicatorsContainer: baseStyles => ({
                ...baseStyles,
                padding: '0 4px',
              }),
              menu: baseStyles => ({
                ...baseStyles,
                backgroundColor: darkMode ? '#253342' : '#fff',
                fontSize: '12px',
              }),
              option: (baseStyles, state) => ({
                ...baseStyles,
                backgroundColor: getOptionBackgroundColor(state, darkMode),
                color: getOptionColor(state, darkMode),
                cursor: 'pointer',
                padding: '8px 12px',
                fontSize: '12px',
                ':active': {
                  backgroundColor: darkMode ? '#3a506b' : '#e0e0e0',
                },
              }),
              singleValue: baseStyles => ({
                ...baseStyles,
                color: darkMode ? '#ffffff' : '#000',
                fontSize: '12px',
              }),
              placeholder: baseStyles => ({
                ...baseStyles,
                color: darkMode ? '#aaaaaa' : '#666',
                fontSize: '12px',
              }),
              indicatorSeparator: baseStyles => ({
                ...baseStyles,
                backgroundColor: darkMode ? '#2d4059' : '#ccc',
              }),
              dropdownIndicator: baseStyles => ({
                ...baseStyles,
                color: darkMode ? '#ffffff' : '#999',
                padding: '4px',
                ':hover': {
                  color: darkMode ? '#ffffff' : '#666',
                },
              }),
            }}
          />
        </div>

        <div className="tools-horizontal-bar-chart-filter-group">
          <label htmlFor="start-date-picker">Date Range</label>
          <div className="tools-horizontal-bar-chart-date-picker-group">
            <input
              id="start-date-picker"
              type="date"
              className="tools-horizontal-bar-chart-date-picker"
              value={startDate}
              onChange={handleStartDateChange}
              placeholder="Start date"
              aria-label="Start date"
            />
            <span>to</span>
            <input
              id="end-date-picker"
              type="date"
              className="tools-horizontal-bar-chart-date-picker"
              value={endDate}
              onChange={handleEndDateChange}
              placeholder="End date"
              aria-label="End date"
            />
            <button
              type="button"
              className="tools-horizontal-bar-chart-clear-dates-btn"
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
        <div className="tools-horizontal-bar-chart-content">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={data} margin={getChartMargins()}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tick={{
                  fill: darkMode ? '#e0e0e0' : '#333',
                  fontSize: getYAxisFontSize(),
                }}
                width={getYAxisWidth()}
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
        <div className="tools-horizontal-bar-chart-empty">
          <p>📊 No tools data available</p>
        </div>
      )}
    </div>
  );
}

export default ToolsHorizontalBarChart;
