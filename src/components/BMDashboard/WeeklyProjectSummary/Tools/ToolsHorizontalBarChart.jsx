import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import axios from 'axios';
import { ENDPOINTS } from '../../../../utils/URL';
import './ToolsHorizontalBarChart.css';

// Custom tooltip component
function CustomTooltip({ active, payload, label, darkMode }) {
  if (!active || !payload || !payload.length) return null;

  const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);

  return (
    <div
      className="tools-horizontal-bar-chart-tooltip"
      style={{
        backgroundColor: darkMode ? 'rgba(27, 42, 65, 0.97)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: darkMode ? '#3a506b' : '#ccc',
      }}
    >
      <p
        className="tools-horizontal-bar-chart-tooltip-label"
        style={{ color: darkMode ? '#e0e0e0' : '#333' }}
      >
        {label}
      </p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
      <p
        className="tools-horizontal-bar-chart-tooltip-total"
        style={{
          color: darkMode ? '#e0e0e0' : '#333',
          borderTopColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : '#eee',
        }}
      >
        Total: {total}
      </p>
    </div>
  );
}

function ToolsHorizontalBarChart() {
  const darkMode = useSelector(state => state.theme.darkMode);
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
    setSelectedProject(null);
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
                      backgroundColor: '#253342',
                      borderColor: '#3a506b',
                      minHeight: '32px',
                      fontSize: '12px',
                    }),
                    menu: baseStyles => ({
                      ...baseStyles,
                      backgroundColor: '#253342',
                      fontSize: '12px',
                    }),
                    option: (baseStyles, state) => ({
                      ...baseStyles,
                      backgroundColor: state.isFocused ? '#3a506b' : '#253342',
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
          style={{
            position: 'relative',
            height: '200px',
            border: `1px dashed ${darkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)'}`,
            borderRadius: '8px',
            background: darkMode ? '#1f2e40' : 'rgba(0,0,0,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            cursor: 'default',
          }}
          onMouseEnter={() => setIsPreviewHovering(true)}
          onMouseLeave={() => setIsPreviewHovering(false)}
        >
          {/* Tooltip — only visible on hover */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: darkMode ? 'rgba(27,42,65,0.97)' : 'rgba(255,255,255,0.95)',
              border: `1px solid ${darkMode ? '#3a506b' : 'rgba(0,0,0,0.12)'}`,
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '13px',
              fontWeight: 600,
              color: darkMode ? '#fff' : '#111',
              boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
              opacity: isPreviewHovering ? 1 : 0,
              pointerEvents: 'none',
              transition: 'opacity 0.25s ease',
              textAlign: 'center',
              whiteSpace: 'nowrap',
              zIndex: 2,
            }}
          >
            Hover to preview — apply filters to load data.
          </div>

          {/* Silhouette body — blurs on hover */}
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: isPreviewHovering ? 'blur(1px)' : 'none',
              opacity: isPreviewHovering ? 0.92 : 1,
              transition: 'filter 0.25s ease, opacity 0.25s ease',
            }}
          >
            <div style={{ textAlign: 'center', width: '100%', maxWidth: '360px', padding: '0 12px' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: darkMode ? '#ffffff' : '#111', marginBottom: '6px' }}>📊 Chart Preview</div>
              <div style={{ fontSize: '14px', color: darkMode ? 'rgba(224,224,224,0.6)' : 'rgba(0,0,0,0.45)', marginBottom: '14px' }}>Select a project to load data</div>
              {/* Bar silhouette rows */}
              {[80, 55, 70].map((w, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ width: '40px', height: '10px', borderRadius: '3px', background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} />
                  <div style={{ width: `${w}%`, height: '14px', borderRadius: '4px', background: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)' }} />
                </div>
              ))}
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
        <div className="tools-horizontal-bar-chart-content" style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height={Math.max(data.length * 100 + 60, 320)}>
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 10, right: 80, left: 40, bottom: 10 }}
              barSize={40}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: darkMode ? '#e0e0e0' : '#333', fontSize: 12 }}
                width={80}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip darkMode={darkMode} />}
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                wrapperStyle={{ zIndex: 10, outline: 'none', pointerEvents: 'none' }}
                position={{ x: 0, y: -110 }}
              />
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
