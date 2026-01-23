import { useEffect, useState } from 'react';
import Select from 'react-select';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import axios from 'axios';
import { ENDPOINTS } from '../../../../utils/URL';
import './ToolsHorizontalBarChart.module.css';

// Custom tooltip component
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

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

  // Hover state for preview
  const [isPreviewHovering, setIsPreviewHovering] = useState(false);

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
            label: project.projectId, // Use project ID as the visible label
          }));
          setAllProjects(projectOptions);

          /**
           * IMPORTANT FOR TASK:
           * Do NOT auto-select first project.
           * This allows the placeholder preview to show until user selects filters.
           */
          setSelectedProject(null);
        } else {
          setAllProjects([]);
          setSelectedProject(null);
        }
      } catch (err) {
        setError('Failed to load projects');
        setAllProjects([]);
        setSelectedProject(null);
      } finally {
        // we are done with initial load of projects
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch tools data when project or date range changes
  useEffect(() => {
    const fetchToolsData = async () => {
      // If no project selected, show placeholder (no chart fetch)
      if (!selectedProject?.value) {
        setData([]);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const projectId = selectedProject.value;

        // First try without date filters
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
          const formattedData = toolsData.slice(0, 5).map(item => ({
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
    const now = new Date();
    const start = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

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

      {/* 1) NO PROJECT SELECTED => SHOW PLACEHOLDER + HOVER PREVIEW */}
      {!selectedProject?.value && (
        <div
          className="tools-horizontal-bar-chart-preview-wrapper"
          onMouseEnter={() => setIsPreviewHovering(true)}
          onMouseLeave={() => setIsPreviewHovering(false)}
        >
          <div
            className={`tools-horizontal-bar-chart-preview-tooltip ${
              isPreviewHovering ? 'show' : ''
            }`}
          >
            Hover to preview — apply filters to load data.
          </div>

          <div
            className={`tools-horizontal-bar-chart-preview-body ${
              isPreviewHovering ? 'hover' : ''
            }`}
          >
            <div className="tools-horizontal-bar-chart-preview-inner">
              <div className="tools-horizontal-bar-chart-preview-title">📊 Chart Preview</div>
              <div className="tools-horizontal-bar-chart-preview-subtitle">
                Apply filters to load data
              </div>

              {/* axes + layout silhouette only */}
              <div className="tools-horizontal-bar-chart-preview-silhouette">
                <div className="silhouette-row">
                  <div className="silhouette-label" />
                  <div className="silhouette-bar w80" />
                </div>
                <div className="silhouette-row">
                  <div className="silhouette-label" />
                  <div className="silhouette-bar w55" />
                </div>
                <div className="silhouette-row">
                  <div className="silhouette-label" />
                  <div className="silhouette-bar w70" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2) PROJECT SELECTED => SHOW LOADING / ERROR / CHART / EMPTY */}
      {selectedProject?.value && loading && (
        <div className="tools-horizontal-bar-chart-loading">Loading...</div>
      )}

      {selectedProject?.value && !loading && error && data.length === 0 && (
        <div className="tools-horizontal-bar-chart-error">{error}</div>
      )}

      {selectedProject?.value && !loading && !error && data.length > 0 && (
        <div className="tools-horizontal-bar-chart-content">
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
                tick={{ fill: darkMode ? '#e0e0e0' : '#333', fontSize: 12 }}
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
      )}

      {selectedProject?.value && !loading && !error && data.length === 0 && (
        <div className="tools-horizontal-bar-chart-empty">
          <p>📊 No tools data available</p>
        </div>
      )}
    </div>
  );
}

export default ToolsHorizontalBarChart;
