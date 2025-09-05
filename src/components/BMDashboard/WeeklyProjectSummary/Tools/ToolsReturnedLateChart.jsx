import { useEffect, useState } from 'react';
import Select from 'react-select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from 'recharts';
import axios from 'axios';
import { ENDPOINTS } from '../../../../utils/URL';
import './ToolsReturnedLateChart.css';

// Custom tooltip component
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="tools-returned-late-tooltip">
      <p className="tools-returned-late-tooltip-label">{label}</p>
      <p style={{ color: payload[0].color }}>Returned Late: {payload[0].value}%</p>
    </div>
  );
}

// Custom label component for displaying percentage values on top of bars
function CustomLabel({ x, y, width, height, value }) {
  return (
    <text x={x + width / 2} y={y - 5} fill="#666" textAnchor="middle" dy={0} fontSize={12}>
      {`${value}%`}
    </text>
  );
}

function ToolsReturnedLateChart({ darkMode }) {
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

  // Fetch projects list
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsResponse = await axios.get(ENDPOINTS.TOOLS_AVAILABILITY_PROJECTS);
        const projects = projectsResponse.data;

        if (projects && projects.length > 0) {
          const projectOptions = projects.map(project => ({
            value: project.projectId,
            label: project.projectId,
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

  // Fetch all tools for multi-select filter
  useEffect(() => {
    const fetchAllTools = async () => {
      try {
        const toolsResponse = await axios.get(ENDPOINTS.BM_TOOLS);
        const tools = toolsResponse.data;

        if (tools && tools.length > 0) {
          const toolOptions = tools.map(tool => ({
            value: tool.toolName || tool.name,
            label: tool.toolName || tool.name,
          }));
          setAllTools(toolOptions);
        }
      } catch (err) {
        console.warn('Could not fetch tools list for filter:', err);
        setAllTools([]);
      }
    };

    fetchAllTools();
  }, []);

  // Fetch tools returned late data when filters change
  useEffect(() => {
    const fetchToolsReturnedLateData = async () => {
      if (!selectedProject?.value) {
        setData([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const projectId = selectedProject.value;
        const selectedToolNames = selectedTools.map(tool => tool.value);

        // Call the API endpoint for tools returned late
        const response = await axios.get(
          ENDPOINTS.TOOLS_RETURNED_LATE(projectId, startDate, endDate, selectedToolNames),
        );

        const toolsReturnedLateData = response.data;

        if (toolsReturnedLateData && toolsReturnedLateData.length > 0) {
          // Format data for the chart
          const formattedData = toolsReturnedLateData.map(item => ({
            toolName: item.toolName || 'Unknown Tool',
            percentLate: Math.round(item.percentLate || 0),
          }));
          setData(formattedData);
        } else {
          setData([]);
        }
      } catch (err) {
        // If API endpoint doesn't exist yet, use mock data
        if (err.response?.status === 404 || err.code === 'ERR_NETWORK') {
          console.warn('API endpoint not available, using mock data');
          const mockData = [
            { toolName: 'Hammer', percentLate: 35 },
            { toolName: 'Drill', percentLate: 20 },
            { toolName: 'Saw', percentLate: 15 },
            { toolName: 'Wrench', percentLate: 45 },
            { toolName: 'Screwdriver', percentLate: 10 },
          ];
          setData(mockData);
        } else {
          setError('Failed to load tools returned late data');
          setData([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchToolsReturnedLateData();
  }, [selectedProject, startDate, endDate, selectedTools]);

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

  const handleToolsChange = selectedOptions => {
    setSelectedTools(selectedOptions || []);
  };

  if (loading) {
    return (
      <div
        className={`tools-returned-late-card ${darkMode ? 'tools-returned-late-dark-mode' : ''}`}
      >
        <h4 className="tools-returned-late-title">Percent of Tools Returned Late</h4>
        <div className="tools-returned-late-loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`tools-returned-late-card ${darkMode ? 'tools-returned-late-dark-mode' : ''}`}
      >
        <h4 className="tools-returned-late-title">Percent of Tools Returned Late</h4>
        <div className="tools-returned-late-error">{error}</div>
      </div>
    );
  }

  return (
    <div className={`tools-returned-late-card ${darkMode ? 'tools-returned-late-dark-mode' : ''}`}>
      <h4 className="tools-returned-late-title">Percent of Tools Returned Late</h4>

      {/* Filters Section */}
      <div className="tools-returned-late-filters">
        <div className="tools-returned-late-filter-group">
          <label htmlFor="project-select">Project</label>
          <Select
            id="project-select"
            className="tools-returned-late-project-select"
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

        <div className="tools-returned-late-filter-group">
          <label htmlFor="start-date-picker">Date Range</label>
          <div className="tools-returned-late-date-picker-group">
            <input
              id="start-date-picker"
              type="date"
              className="tools-returned-late-date-picker"
              value={startDate}
              onChange={handleStartDateChange}
              placeholder="Start date"
            />
            <input
              id="end-date-picker"
              type="date"
              className="tools-returned-late-date-picker"
              value={endDate}
              onChange={handleEndDateChange}
              placeholder="End date"
            />
          </div>
        </div>

        <div className="tools-returned-late-filter-group">
          <label htmlFor="tools-select">Tools</label>
          <Select
            id="tools-select"
            className="tools-returned-late-tools-select"
            classNamePrefix="select"
            value={selectedTools}
            onChange={handleToolsChange}
            options={allTools}
            placeholder="Select tools (optional)"
            isMulti
            isClearable
            isDisabled={allTools.length === 0}
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
                    multiValue: baseStyles => ({
                      ...baseStyles,
                      backgroundColor: '#364156',
                    }),
                    multiValueLabel: baseStyles => ({
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
                    multiValueLabel: baseStyles => ({
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
      </div>

      {/* Chart Section */}
      {data.length > 0 ? (
        <div className="tools-returned-late-chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 30, right: 30, left: 20, bottom: 50 }}
              barSize={60}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="toolName"
                tick={{
                  fill: darkMode ? '#e0e0e0' : '#333',
                  fontSize: 12,
                }}
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis
                tick={{
                  fill: darkMode ? '#e0e0e0' : '#333',
                  fontSize: 12,
                }}
                label={{
                  value: '% Returned Late',
                  angle: -90,
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fill: darkMode ? '#e0e0e0' : '#333' },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="percentLate" fill="#ff6b6b" name="% Returned Late">
                <LabelList content={<CustomLabel />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="tools-returned-late-no-data">
          <p>No data available for the selected filters.</p>
        </div>
      )}
    </div>
  );
}

export default ToolsReturnedLateChart;
