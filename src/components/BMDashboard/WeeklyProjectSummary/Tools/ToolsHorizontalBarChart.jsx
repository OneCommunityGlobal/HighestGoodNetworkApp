import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { ENDPOINTS } from '../../../../utils/URL';
import './ToolsHorizontalBarChart.css';

// Empty state data (only used if API fails)
const emptyData = [];

// Define tooltip component separately to avoid nested component definition
function CustomTooltip({ active, payload, isCardView }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  // Simple, compact tooltip for card view
  if (isCardView) {
    return (
      <div
        style={{
          backgroundColor: 'white',
          border: '1px solid #ccc',
          padding: '4px 6px',
          borderRadius: '2px',
          fontSize: '10px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
          maxWidth: '120px',
        }}
      >
        <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', fontSize: '10px' }}>
          {payload[0].payload.name}
        </p>
        {payload.map(entry => {
          let statusLabel = 'Unknown:';
          if (entry.dataKey === 'inUse') {
            statusLabel = 'In Use:';
          } else if (entry.dataKey === 'needsReplacement') {
            statusLabel = 'Needs Replace:';
          } else if (entry.dataKey === 'yetToReceive') {
            statusLabel = 'To Receive:';
          }

          return (
            <div
              key={entry.dataKey}
              style={{ display: 'flex', justifyContent: 'space-between', margin: '1px 0' }}
            >
              <span style={{ color: entry.color, fontSize: '9px' }}>{statusLabel}</span>
              <span style={{ marginLeft: '4px', fontSize: '9px' }}>{entry.value}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Full detailed tooltip for full page view
  return (
    <div
      className="tools-chart-tooltip"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #ccc',
        padding: '8px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        maxWidth: '200px',
      }}
    >
      <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{payload[0].payload.name}</p>
      {payload.map(entry => {
        let statusLabel = 'Unknown';
        if (entry.dataKey === 'inUse') {
          statusLabel = 'In Use';
        } else if (entry.dataKey === 'needsReplacement') {
          statusLabel = 'Needs replacement';
        } else if (entry.dataKey === 'yetToReceive') {
          statusLabel = 'Yet to receive';
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
            <span>{statusLabel}</span>
            <span style={{ marginLeft: '10px' }}>{entry.value}</span>
          </p>
        );
      })}
    </div>
  );
}

// Define label component separately to avoid nested component definition
function CustomLabel({ x, y, width, value, isCardView }) {
  // Don't show any labels in card view
  if (isCardView) return null;

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

// Pre-defined tooltip for card view to avoid inline function in render
const CardViewTooltip = <CustomTooltip isCardView />;

// Pre-defined tooltip for full page view to avoid inline function in render
const FullPageTooltip = <CustomTooltip isCardView={false} />;

// Pre-defined label for full page view to avoid inline function in render
const FullPageLabel = <CustomLabel isCardView={false} />;

function ToolsHorizontalBarChart({ darkMode, isFullPage = false, projectId, startDate, endDate }) {
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const history = useHistory();

  // Fetch all projects for potential aggregate view
  useEffect(() => {
    const fetchProjects = async () => {
      if (!isFullPage || (isFullPage && !projectId)) {
        try {
          const response = await axios.get(ENDPOINTS.TOOLS_AVAILABILITY_PROJECTS);
          setAllProjects(response.data);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Error fetching projects:', err);
        }
      }
    };

    fetchProjects();
  }, [isFullPage, projectId]);

  // Fetch tools data for a specific project or for all projects
  useEffect(() => {
    const fetchToolsData = async () => {
      setLoading(true);
      setError(null);

      try {
        // In full page mode with no project selected, don't fetch anything
        if (isFullPage && !projectId) {
          setData(emptyData);
          setLoading(false);
          return;
        }

        // If we have a specific project ID, fetch data for that project
        if (projectId) {
          const url = ENDPOINTS.TOOLS_AVAILABILITY_BY_PROJECT(projectId, startDate, endDate);
          const response = await axios.get(url);
          const responseData = response.data;

          if (responseData && responseData.length > 0) {
            // Sort by total quantity and ensure tool names are properly formatted
            const sortedData = [...responseData]
              .map(item => ({
                ...item,
                // Ensure the name property is properly formatted and capitalized
                name: item.toolName || item.name,
              }))
              .sort((a, b) => {
                const totalA = a.inUse + a.needsReplacement + a.yetToReceive;
                const totalB = b.inUse + b.needsReplacement + b.yetToReceive;
                return totalB - totalA;
              });
            setData(sortedData);
          } else {
            setData(emptyData);
            if (isFullPage) {
              setError('No tool availability data found for this project.');
            }
          }
        }
        // For widget view or when no specific project is selected, fetch first project as sample
        else if (!isFullPage && allProjects.length > 0) {
          // Use first project for the widget view
          const firstProject = allProjects[0];
          const url = ENDPOINTS.TOOLS_AVAILABILITY_BY_PROJECT(firstProject.projectId, null, null);
          const response = await axios.get(url);
          const responseData = response.data;

          if (responseData && responseData.length > 0) {
            // Sort by total quantity and ensure tool names are properly formatted
            const sortedData = [...responseData]
              .map(item => ({
                ...item,
                // Ensure the name property is properly formatted and capitalized
                name: item.toolName || item.name,
              }))
              .sort((a, b) => {
                const totalA = a.inUse + a.needsReplacement + a.yetToReceive;
                const totalB = b.inUse + b.needsReplacement + b.yetToReceive;
                return totalB - totalA;
              })
              // For card view, limit to top 2 tools only
              .slice(0, 2);
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
        if (isFullPage) {
          setError('Failed to load tools availability data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchToolsData();
  }, [projectId, startDate, endDate, isFullPage, allProjects]);

  const handleCardClick = () => {
    if (!isFullPage) {
      history.push('/bmdashboard/tools-availability');
    }
  };

  // Function to render the empty state when no data
  const renderEmptyState = () => {
    if (error || loading) {
      return null;
    }

    return (
      <div className="tools-chart-empty" style={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>
        <p>No data available</p>
      </div>
    );
  };

  // Render a completely simplified chart for card view
  if (!isFullPage) {
    return (
      <div
        className={`tools-horizontal-chart-container ${darkMode ? 'dark-mode' : ''}`}
        onClick={handleCardClick}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Click to view full page tools availability chart"
        style={{
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0',
        }}
      >
        <h3
          className="tools-chart-title"
          style={{
            margin: '10px 0',
            textAlign: 'center',
            width: '100%',
          }}
        >
          Tools by Availability
        </h3>

        {error && <div className="tools-chart-error">{error}</div>}

        {loading && <div className="tools-chart-loading">Loading...</div>}

        {!loading && data.length > 0 && (
          <div
            style={{
              height: 'calc(100% - 70px)',
              width: '100%',
              position: 'relative',
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={data}
                margin={{ top: 10, right: 40, left: 40, bottom: 30 }}
                barSize={16}
              >
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{
                    fill: darkMode ? '#e0e0e0' : '#333',
                    fontSize: 11,
                    textAnchor: 'end',
                  }}
                  width={40}
                  tickMargin={5}
                  tickFormatter={value => {
                    return value.length > 12 ? `${value.substring(0, 10)}...` : value;
                  }}
                  axisLine={false}
                />
                <XAxis type="number" hide />
                <Tooltip content={CardViewTooltip} />
                <Legend
                  verticalAlign="bottom"
                  height={25}
                  iconSize={8}
                  wrapperStyle={{
                    fontSize: 10,
                    paddingTop: 5,
                    paddingBottom: 0,
                    margin: '0 auto',
                    width: '100%',
                    textAlign: 'center',
                  }}
                  align="center"
                />
                <Bar dataKey="inUse" stackId="a" fill="#4589FF" name="In Use" />
                <Bar
                  dataKey="needsReplacement"
                  stackId="a"
                  fill="#FF0000"
                  name="Needs to be replaced"
                />
                <Bar dataKey="yetToReceive" stackId="a" fill="#FFB800" name="Yet to receive" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {!loading && data.length === 0 && renderEmptyState()}
      </div>
    );
  }

  // Helper function to render the "no project selected" message
  const renderNoProjectMessage = () => {
    if (projectId) {
      return null;
    }

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '200px',
          width: '100%',
          textAlign: 'center',
          color: darkMode ? '#e0e0e0' : '#555',
          backgroundColor: darkMode ? '#2c2c2c' : '#f8f8f8',
          borderRadius: '8px',
          padding: '20px',
          marginTop: '40px',
        }}
      >
        <div style={{ fontSize: '36px', marginBottom: '15px' }}>📊</div>
        <h4 style={{ margin: '0 0 10px 0' }}>Please Select a Project ID</h4>
        <p style={{ margin: '0', fontSize: '14px' }}>
          Tools availability data will be displayed once you select a specific project.
        </p>
      </div>
    );
  };

  // Full page view with improved dark mode styling
  return (
    <div
      className={`tools-horizontal-chart-container full-page ${darkMode ? 'dark-mode' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        padding: '15px',
        backgroundColor: darkMode ? '#1e2736' : 'white',
        color: darkMode ? '#e0e0e0' : 'inherit',
      }}
    >
      <h3
        className="tools-chart-title"
        style={{
          margin: '10px 0 20px 0',
          textAlign: 'center',
          width: '100%',
          color: darkMode ? '#ffffff' : 'inherit',
        }}
      >
        {projectId ? `Tools by Availability - Project ${projectId}` : 'Tools by Availability'}
      </h3>

      {error && <div className="tools-chart-error">{error}</div>}

      {loading && <div className="tools-chart-loading">Loading tool availability data...</div>}

      {!loading && !projectId && renderNoProjectMessage()}

      {!loading && projectId && data.length > 0 && (
        <div
          style={{
            width: '100%',
            height: 'calc(100% - 70px)',
            position: 'relative',
            backgroundColor: darkMode ? '#1e2736' : 'transparent',
          }}
        >
          <style>
            {darkMode &&
              `
              .recharts-wrapper, .recharts-surface {
                background-color: #1e2736 !important;
              }
              .recharts-cartesian-grid-horizontal line,
              .recharts-cartesian-grid-vertical line {
                stroke: #364156 !important;
              }
              .recharts-text {
                fill: #e0e0e0 !important;
              }
              .recharts-default-legend {
                background-color: #1e2736 !important;
              }
              .recharts-tooltip-wrapper {
                background-color: transparent !important;
              }
            `}
          </style>
          <ResponsiveContainer
            width="100%"
            height={600}
            style={{ backgroundColor: darkMode ? '#1e2736' : 'transparent' }}
          >
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 20, right: 60, left: 60, bottom: 40 }}
              barSize={32}
              maxBarSize={40}
              style={{ backgroundColor: darkMode ? '#1e2736' : 'transparent' }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke={darkMode ? '#364156' : '#ccc'}
              />
              <XAxis
                type="number"
                domain={[0, dataMax => Math.max(dataMax + 5, 15)]}
                tickCount={6}
                padding={{ left: 0, right: 10 }}
                tick={{ fill: darkMode ? '#e0e0e0' : '#333' }}
                axisLine={{ stroke: darkMode ? '#364156' : '#ccc' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{
                  fill: darkMode ? '#e0e0e0' : '#333',
                  fontSize: 12,
                  textAnchor: 'end',
                }}
                width={60}
                tickMargin={10}
                tickFormatter={value => {
                  return value.length > 20 ? `${value.substring(0, 18)}...` : value;
                }}
                axisLine={{ stroke: darkMode ? '#364156' : '#ccc' }}
              />
              <Tooltip
                content={FullPageTooltip}
                cursor={{
                  fill: darkMode ? 'rgba(100, 120, 160, 0.1)' : 'rgba(200, 200, 200, 0.1)',
                }}
                wrapperStyle={{
                  backgroundColor: darkMode ? '#1e2736' : 'transparent',
                  zIndex: 1000,
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                align="center"
                wrapperStyle={{
                  paddingTop: 15,
                  margin: '0 auto',
                  width: '100%',
                  textAlign: 'center',
                  color: darkMode ? '#e0e0e0' : 'inherit',
                  backgroundColor: darkMode ? '#1e2736' : 'transparent',
                }}
              />
              <Bar dataKey="inUse" stackId="a" fill="#4589FF" name="In Use">
                <LabelList content={FullPageLabel} />
              </Bar>
              <Bar
                dataKey="needsReplacement"
                stackId="a"
                fill="#FF0000"
                name="Needs to be replaced"
              >
                <LabelList content={FullPageLabel} />
              </Bar>
              <Bar dataKey="yetToReceive" stackId="a" fill="#FFB800" name="Yet to receive">
                <LabelList content={FullPageLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {!loading && projectId && data.length === 0 && (
        <div className="tools-chart-empty" style={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>
          <p>No data available for the selected filters.</p>
        </div>
      )}
    </div>
  );
}

export default ToolsHorizontalBarChart;
