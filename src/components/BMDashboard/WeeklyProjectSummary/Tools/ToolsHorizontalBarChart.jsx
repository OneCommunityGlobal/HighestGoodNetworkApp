import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import axios from 'axios';
import { ENDPOINTS } from '../../../../utils/URL';
import styles from './ToolsHorizontalBarChart.module.css';

function CustomTooltip({ active, payload, label, darkMode }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);

  return (
    <div
      className={styles['tools-horizontal-bar-chart-tooltip']}
      style={{
        backgroundColor: darkMode ? 'rgba(27, 42, 65, 0.97)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: darkMode ? '#3a506b' : '#ccc',
      }}
    >
      <p
        className={styles['tools-horizontal-bar-chart-tooltip-label']}
        style={{ color: darkMode ? '#e0e0e0' : '#333' }}
      >
        {label}
      </p>
      {payload.map(entry => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
      <p
        className={styles['tools-horizontal-bar-chart-tooltip-total']}
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

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.object),
  label: PropTypes.string,
  darkMode: PropTypes.bool,
};
CustomTooltip.defaultProps = {
  active: false,
  payload: [],
  label: '',
  darkMode: false,
};

function ToolsHorizontalBarChart({ darkMode: darkModeProp }) {
  const reduxDarkMode = useSelector(state => state.theme.darkMode);
  const darkMode = typeof darkModeProp === 'boolean' ? darkModeProp : reduxDarkMode;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [allTools, setAllTools] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);
  const [isPreviewHovering, setIsPreviewHovering] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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

  // Calculate responsive chart height: 240px mobile, 280px tablet, 300px desktop
  // Standardized to match tallest chart (ToolsStoppageHorizontalBarChart)
  const getChartHeight = () => {
    if (windowWidth <= 768) {
      return 240; // Mobile
    } else if (windowWidth <= 1024) {
      return 280; // Tablet
    }
    return 300; // Desktop
  };

  // Calculate responsive margins: mobile {5,5,15,5}, tablet {8,15,25,8}, desktop {10,30,40,10}
  const getChartMargins = () => {
    if (windowWidth <= 768) {
      return { top: 5, right: 5, left: 15, bottom: 5 }; // Mobile
    } else if (windowWidth <= 1024) {
      return { top: 8, right: 15, left: 25, bottom: 8 }; // Tablet
    }
    return { top: 10, right: 30, left: 40, bottom: 10 }; // Desktop
  };

  // Calculate responsive Y-axis width: mobile 20, tablet 28, desktop 35
  const getYAxisWidth = () => {
    if (windowWidth <= 768) {
      return 20; // Mobile
    } else if (windowWidth <= 1024) {
      return 28; // Tablet
    }
    return 35; // Desktop
  };

  // Calculate responsive font size: mobile 10, tablet 11, desktop 12
  const getYAxisFontSize = () => {
    if (windowWidth <= 768) {
      return 10; // Mobile
    } else if (windowWidth <= 1024) {
      return 11; // Tablet
    }
    return 12; // Desktop
  };

  // Date range logging removed for production

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
          setSelectedProject(null);
        } else {
          setAllProjects([]);
          setSelectedProject(null);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load projects:', err);
        setError('Failed to load projects');
        setAllProjects([]);
        setSelectedProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchToolsData = async () => {
      if (!selectedProject?.value) {
        setData([]);
        setAllTools([]);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const projectId = selectedProject.value;

        const toolsResponseNoFilter = await axios.get(
          ENDPOINTS.TOOLS_AVAILABILITY_BY_PROJECT(projectId),
        );

        const toolsResponse = await axios.get(
          ENDPOINTS.TOOLS_AVAILABILITY_BY_PROJECT(projectId, startDate, endDate),
        );

        const toolsDataFiltered = toolsResponse.data;
        const toolsDataUnfiltered = toolsResponseNoFilter.data;

        const toolsData =
          toolsDataFiltered && toolsDataFiltered.length > 0
            ? toolsDataFiltered
            : toolsDataUnfiltered;

        if (toolsDataUnfiltered?.length > 0) {
          const uniqueTools = [...new Set(toolsDataUnfiltered.map(item => item.toolName))]
            .filter(Boolean)
            .map(tool => ({
              label: tool,
              value: tool,
            }));

          setAllTools(uniqueTools);
        } else {
          setAllTools([]);
        }

        let filteredForChart = toolsData;
        if (selectedTools.length > 0) {
          const selectedNames = selectedTools.map(t => t.value);
          filteredForChart = toolsData.filter(item => selectedNames.includes(item.toolName));
        }

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
        // eslint-disable-next-line no-console
        console.error('Failed to load tools data:', err);
        setError('Failed to load tools data');
        setData([]);
        setAllTools([]);
      } finally {
        setLoading(false);
      }
    };

    fetchToolsData();
  }, [selectedProject, startDate, endDate, selectedTools]);

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
    const now = new Date();
    const start = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
    setSelectedProject(null);
  };

  const darkSelectStyles = {
    control: base => ({
      ...base,
      backgroundColor: '#253342',
      borderColor: '#3a506b',
      minHeight: '32px',
      fontSize: '12px',
    }),
    menu: base => ({
      ...base,
      backgroundColor: '#253342',
      fontSize: '12px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#3a506b' : '#253342',
      color: '#e0e0e0',
      fontSize: '12px',
    }),
    multiValue: base => ({
      ...base,
      backgroundColor: '#3a506b',
    }),
    multiValueLabel: base => ({
      ...base,
      color: '#e0e0e0',
      fontSize: '12px',
    }),
    singleValue: base => ({
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
    singleValue: base => ({
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
      className={`${styles['tools-horizontal-bar-chart-card']} ${
        darkMode ? styles['tools-horizontal-bar-chart-dark-mode'] : ''
      }`}
    >
      <h4 className={styles['tools-horizontal-bar-chart-title']}>Tools by Availability</h4>

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
          isMulti
          isClearable
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
            styles={darkMode ? darkSelectStyles : lightSelectStyles}
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

      {!selectedProject?.value && (
        <button
          type="button"
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
            width: '100%',
            padding: 0,
          }}
          aria-label="Chart preview - select a project to load data"
          onMouseEnter={() => setIsPreviewHovering(true)}
          onMouseLeave={() => setIsPreviewHovering(false)}
          onFocus={() => setIsPreviewHovering(true)}
          onBlur={() => setIsPreviewHovering(false)}
          onClick={() => setIsPreviewHovering(prev => !prev)}
        >
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
            Hover to preview - apply filters to load data.
          </div>

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
            <div
              style={{ textAlign: 'center', width: '100%', maxWidth: '360px', padding: '0 12px' }}
            >
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: darkMode ? '#ffffff' : '#111',
                  marginBottom: '6px',
                }}
              >
                Chart Preview
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: darkMode ? 'rgba(224,224,224,0.6)' : 'rgba(0,0,0,0.45)',
                  marginBottom: '14px',
                }}
              >
                Select a project to load data
              </div>
              {[80, 55, 70].map(w => (
                <div
                  key={w}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '10px',
                      borderRadius: '3px',
                      background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                    }}
                  />
                  <div
                    style={{
                      width: `${w}%`,
                      height: '14px',
                      borderRadius: '4px',
                      background: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </button>
      )}

      {selectedProject?.value && loading && (
        <div className={styles['tools-horizontal-bar-chart-loading']}>Loading...</div>
      )}

      {selectedProject?.value && !loading && error && data.length === 0 && (
        <div className={styles['tools-horizontal-bar-chart-error']}>{error}</div>
      )}

      {selectedProject?.value && !loading && !error && data.length > 0 && (
        <div
          className={styles['tools-horizontal-bar-chart-content']}
          style={{ flex: 1, minHeight: 0 }}
        >
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
                tick={{
                  fill: darkMode ? '#e0e0e0' : '#333',
                  fontSize: getYAxisFontSize(),
                }}
                width={getYAxisWidth()}
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
        <div className={styles['tools-horizontal-bar-chart-empty']}>
          <p>No tools data available</p>
        </div>
      )}
    </div>
  );
}

ToolsHorizontalBarChart.propTypes = {
  darkMode: PropTypes.bool,
};
ToolsHorizontalBarChart.defaultProps = {
  darkMode: undefined,
};

export default ToolsHorizontalBarChart;
