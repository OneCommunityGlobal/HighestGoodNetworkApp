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
    <div className={styles.toolsHorizontalBarChartTooltip}>
      <p className={styles.toolsHorizontalBarChartTooltipLabel}>{label}</p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
      <p className={styles.toolsHorizontalBarChartTooltipTotal}>Total: {total}</p>
    </div>
  );
}

function ToolsHorizontalBarChart({ darkMode }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

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
      <div className={styles.toolsHorizontalBarChartCard}>
        <h4 className={styles.toolsHorizontalBarChartTitle}>Tools by Availability</h4>
        <div className={styles.toolsHorizontalBarChartLoading}>Loading...</div>
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <div className={styles.toolsHorizontalBarChartCard}>
        <h4 className={styles.toolsHorizontalBarChartTitle}>Tools by Availability</h4>
        <div className={styles.toolsHorizontalBarChartError}>{error}</div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.toolsHorizontalBarChartCard} ${
        darkMode ? styles.toolsHorizontalBarChartDarkMode : ''
      }`}
    >
      <h4 className={styles.toolsHorizontalBarChartTitle}>Tools by Availability</h4>

      {/* Filters Section */}
      <div className={styles.toolsHorizontalBarChartFilters}>
        <div className={styles.toolsHorizontalBarChartFilterGroup}>
          <label htmlFor="project-select">Project</label>
          <Select
            id="project-select"
            className={styles.toolsHorizontalBarChartProjectSelect}
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

        <div className={styles.toolsHorizontalBarChartFilterGroup}>
          <label htmlFor="start-date-picker">Date Range</label>
          <div className={styles.toolsHorizontalBarChartDatePickerGroup}>
            <input
              id="start-date-picker"
              type="date"
              className={styles.toolsHorizontalBarChartDatePicker}
              value={startDate}
              onChange={handleStartDateChange}
              placeholder="Start date"
              aria-label="Start date"
            />
            <span> to </span>
            <input
              id="end-date-picker"
              type="date"
              className={styles.toolsHorizontalBarChartDatePicker}
              value={endDate}
              onChange={handleEndDateChange}
              placeholder="End date"
              aria-label="End date"
            />
            <button
              type="button"
              className={styles.toolsHorizontalBarChartClearDatesBtn}
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
        <div className={styles.toolsHorizontalBarChartContent}>
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
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: darkMode ? 'rgba(28, 37, 65, .25)' : 'rgba(145, 140, 140, 0.25)' }}
              />
              <Bar dataKey="inUse" stackId="a" fill="#2196F3" name="In Use" />
              <Bar dataKey="needsReplacement" stackId="a" fill="#F44336" name="Needs Replacement" />
              <Bar dataKey="yetToReceive" stackId="a" fill="#FF9800" name="Yet to Receive" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className={styles.toolsHorizontalBarChartEmpty}>
          <p>📊 No tools data available</p>
        </div>
      )}
    </div>
  );
}

export default ToolsHorizontalBarChart;
