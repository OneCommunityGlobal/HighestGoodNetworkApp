import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Legend,
  Label,
  CartesianGrid,
} from 'recharts';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import './ToolsStoppageHorizontalBarChart.css';

// Define tooltip component separately to avoid nested component definition
function CustomTooltip({ active, payload }) {
  const barColors = {
    usedForLifetime: '#4589FF',
    damaged: '#FF0000',
    lost: '#FFB800',
  };
  if (!active || !payload || !payload.length) {
    return null;
  }

  // Full detailed tooltip for full page view
  return (
    <div className="tools-chart-tooltip">
      <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{payload[0].payload.name}</p>
      {payload.map(entry => {
        let statusLabel = 'Unknown';
        if (entry.dataKey === 'usedForLifetime') {
          statusLabel = 'Used its lifetime';
        } else if (entry.dataKey === 'damaged') {
          statusLabel = 'Damaged';
        } else if (entry.dataKey === 'lost') {
          statusLabel = 'Lost';
        }

        return (
          <p
            key={entry.dataKey}
            style={{
              color: entry.color,
              margin: '3px 0',
              fontSize: '11px',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ color: barColors[entry.dataKey] }}>{statusLabel}</span>
            <span style={{ color: barColors[entry.dataKey], marginLeft: '10px' }}>
              {entry.value}
            </span>
          </p>
        );
      })}
    </div>
  );
}

// Define label component separately to avoid nested component definition
function CustomLabel({ x, y, width, value }) {
  // Don't show zero values
  if (value === 0) return null;

  return (
    <text
      x={x + width / 2}
      y={y + 15}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="12"
    >
      {value}
    </text>
  );
}

export default function ToolsStoppageHorizontalBarChart() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const emptyData = [];

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(ENDPOINTS.BM_TOOL_PROJECTS);
        setProjects(response.data);
      } catch (err) {
        // Error logging should be replaced with proper logging service
        // eslint-disable-next-line no-console
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchToolsStoppageData = async () => {
      setLoading(true);
      setError(null);
      const formattedStart = startDate ? new Date(startDate).toISOString() : null;
      const formattedEnd = endDate ? new Date(endDate).toISOString() : null;

      try {
        // If we have a specific project ID, fetch data for that project
        if (selectedProject) {
          const url = ENDPOINTS.BM_TOOLS_STOPPAGE_BY_PROJECT(
            selectedProject?.value,
            formattedStart,
            formattedEnd,
          );
          const response = await axios.get(url);
          const responseData = response.data;

          if (responseData && responseData.length > 0) {
            // Sort by total quantity and ensure tool names are properly formatted
            const sortedData = [...responseData].map(item => ({
              ...item,
              // Ensure the name property is properly formatted and capitalized
              name: item.toolName || item.name,
            }));
            setData(sortedData);
          } else {
            setData(emptyData);
            setError('No tool stoppage reason data found for this project.');
          }
        }
        // when no specific project is selected, fetch first project as sample
        else if (projects.length > 0) {
          // Use first project for the widget view
          const firstProject = projects[0];
          setSelectedProject({ value: firstProject.projectId, label: firstProject.projectName });
          const url = ENDPOINTS.BM_TOOLS_STOPPAGE_BY_PROJECT(firstProject.projectId, null, null);
          const response = await axios.get(url);
          const responseData = response.data;

          if (responseData && responseData.length > 0) {
            // Sort by total quantity and ensure tool names are properly formatted
            const sortedData = [...responseData].map(item => ({
              ...item,
              // Ensure the name property is properly formatted and capitalized
              name: item.toolName || item.name,
            }));
            setData(sortedData);
          } else {
            setData(emptyData);
          }
        } else {
          setData(emptyData);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching tools data:', err);
        setData(emptyData);
        setError('Failed to load tools stoppage reason data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchToolsStoppageData();
  }, [selectedProject, startDate, endDate, projects]);

  const projectOptions = projects.map(project => ({
    value: project.projectId,
    label: project.projectName,
  }));

  // Handle project selection change
  const handleProjectChange = selectedOption => {
    setSelectedProject(selectedOption);
  };

  // Clear date filters
  const handleClearDates = () => {
    setStartDate(null);
    setEndDate(null);
  };

  // Styles for dark mode select component
  const selectDarkStyles = {
    control: base => ({
      ...base,
      backgroundColor: '#2c3344',
      borderColor: '#364156',
    }),
    menu: base => ({
      ...base,
      backgroundColor: '#2c3344',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#364156' : '#2c3344',
      color: '#e0e0e0',
    }),
    singleValue: base => ({
      ...base,
      color: '#e0e0e0',
    }),
    placeholder: base => ({
      ...base,
      color: '#aaaaaa',
    }),
  };

  return (
    <div className={`tools-availability-page ${darkMode ? 'dark-mode' : ''}`}>
      <h3 className={`tools-chart-title ${darkMode ? 'dark-mode' : ''}`}>
        Reason of Stoppage of Tools
      </h3>
      <div className="tools-availability-content">
        <div className="tools-chart-filters">
          <div className="filter-group">
            <label htmlFor="project-select">Project</label>
            <Select
              id="project-select"
              className="project-select"
              classNamePrefix="select"
              value={selectedProject}
              onChange={handleProjectChange}
              options={projectOptions}
              placeholder="Select a project ID to view data"
              isClearable={false}
              isDisabled={projects.length === 0}
              styles={darkMode ? selectDarkStyles : {}}
            />
          </div>

          <div className="filter-group">
            <label>Date Range (Optional)</label>
            <div className="date-picker-group">
              <DatePicker
                selected={startDate}
                onChange={date => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Start Date"
                className="date-picker"
                isClearable
                maxDate={endDate}
              />
              <span>to</span>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                placeholderText="End Date"
                className="date-picker"
                isClearable
                minDate={startDate}
              />
              {(startDate || endDate) && (
                <button
                  type="button"
                  className="clear-dates-btn"
                  onClick={handleClearDates}
                  aria-label="Clear date filters"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="tools-horizontal-chart-container">
          {error && <div className="tools-chart-error">{error}</div>}
          {loading && <div className="tools-chart-loading">Loading tool availability data...</div>}

          {!loading && selectedProject && data.length > 0 && (
            <ResponsiveContainer width="100%" height={600}>
              <BarChart
                layout="vertical"
                data={data}
                margin={{ top: 20, right: 60, left: 60, bottom: 40 }}
                barSize={32}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, dataMax => Math.ceil(dataMax / 25) * 25]}
                  tickCount={5}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickFormatter={value =>
                    value.length > 20 ? `${value.substring(0, 18)}...` : value
                  }
                >
                  <Label
                    value="Tool Name  -->"
                    angle={-90}
                    position="insideBottomLeft"
                    offset={-5}
                    style={{ textAnchor: 'middle', fontWeight: 'bold' }}
                  />
                </YAxis>
                <Tooltip
                  cursor={{
                    fill: darkMode ? 'rgb(50, 73, 105)' : '#e0e0e0',
                  }}
                  content={<CustomTooltip darkMode={darkMode} />}
                />
                <Legend verticalAlign="bottom" height={36} />
                <Bar dataKey="usedForLifetime" stackId="a" fill="#4589FF" name="Used its lifetime">
                  <LabelList dataKey="usedForLifetime" content={<CustomLabel />} />
                </Bar>
                <Bar dataKey="damaged" stackId="a" fill="#FF0000" name="Damaged">
                  <LabelList dataKey="damaged" content={<CustomLabel />} />
                </Bar>
                <Bar dataKey="lost" stackId="a" fill="#FFB800" name="Lost">
                  <LabelList dataKey="lost" content={<CustomLabel />} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {!loading && selectedProject && data.length === 0 && (
            <div className="tools-chart-empty">
              <p>No data available for the selected filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
