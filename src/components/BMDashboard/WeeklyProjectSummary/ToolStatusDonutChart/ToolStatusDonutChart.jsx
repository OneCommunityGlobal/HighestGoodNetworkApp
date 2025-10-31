import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchToolAvailability, fetchTools } from '../../../../actions/bmdashboard/toolActions';
import styles from './ToolStatusDonutChart.module.css';

const COLORS = {
  AVAILABLE: '#220F57',
  USED: '#2B73B6',
  MAINTENANCE: '#6DC5DA',
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, width, darkMode }) => {
  const isSmall = width <= 768;
  if (isSmall) return null;

  const radius = outerRadius + 20;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill={darkMode ? '#fff' : '#000'}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize="12"
    >
      {(percent * 100).toFixed(1)}%
    </text>
  );
};

// Custom tooltip component
const CustomTooltip = ({
  active,
  payload,
  total,
  hasNoData,
  toolName,
  projectName,
  toolId,
  darkMode,
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  // If total is 0, show no tools match message
  if (total === 0) {
    return (
      <div
        style={{
          backgroundColor: darkMode ? 'rgba(58, 80, 107, .95)' : 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '8px 12px',
          fontSize: '14px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          maxWidth: '200px',
          color: darkMode ? '#ffffff' : '#000000ff',
        }}
      >
        <div style={{ fontWeight: '600', color: darkMode ? '#ffffff' : '#333' }}>
          📊 No Tools Match
        </div>
        <div style={{ color: darkMode ? '#ffffff' : '#666', fontSize: '12px' }}>
          No tools match the selected combination
        </div>
      </div>
    );
  }

  // If specific tool is selected but has no data
  if (hasNoData && toolId) {
    return (
      <div
        style={{
          backgroundColor: darkMode ? 'rgba(58, 80, 107, .95)' : 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '8px 12px',
          fontSize: '14px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          maxWidth: '200px',
          color: darkMode ? '#ffffff' : '#000000ff',
        }}
      >
        <div style={{ fontWeight: '600', color: darkMode ? '#ffffff' : '#333' }}>{toolName}</div>
        <div style={{ color: '#666', fontSize: '12px' }}>❌ Not used in this project</div>
      </div>
    );
  }

  const data = payload[0];
  const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0.0';

  return (
    <div
      style={{
        backgroundColor: darkMode ? 'rgba(58, 80, 107, .95)' : 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '8px 12px',
        fontSize: '14px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        maxWidth: '200px',
      }}
    >
      <div style={{ fontWeight: '600', color: darkMode ? '#ffffff' : '#333', marginBottom: '4px' }}>
        {toolName || 'All Tools'}
      </div>
      <div style={{ color: darkMode ? '#ffffff' : '#666', marginBottom: '2px' }}>
        Count: <strong>{data.value}</strong>
      </div>
      <div style={{ color: darkMode ? '#ffffff' : '#666' }}>
        Percentage: <strong>{percentage}%</strong>
      </div>
    </div>
  );
};

export default function ToolStatusDonutChart() {
  const dispatch = useDispatch();
  const toolslist = useSelector(state => state.tools.toolslist);
  const availabilityData = useSelector(state => state.toolAvailability.availabilityData);
  const darkMode = useSelector(state => state.theme.darkMode);

  const [toolId, setToolId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [allToolsData, setAllToolsData] = useState(null);

  useEffect(() => {
    dispatch(fetchTools());
    // Fetch all tool availability data initially to populate dropdowns
    dispatch(fetchToolAvailability('', ''));
  }, [dispatch]);

  // Store the initial data for dropdowns when it's available
  useEffect(() => {
    if (availabilityData && !toolId && !projectId && !allToolsData) {
      setAllToolsData(availabilityData);
    }
  }, [availabilityData, toolId, projectId, allToolsData]);

  useEffect(() => {
    dispatch(fetchToolAvailability(toolId, projectId));
  }, [dispatch, toolId, projectId]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isXS = windowWidth <= 480;
  const chartData = availabilityData?.data || [];
  const total = availabilityData?.total || 0;

  // Check if we have no data for the selected combination
  const hasNoData = (toolId || projectId) && chartData.length === 0 && total === 0;
  const hasNoToolsMatch = total === 0;

  // Use the stored initial data for dropdowns, or fall back to current data
  const dropdownData = allToolsData || availabilityData;
  const toolsFromDropdown = dropdownData?.tools || [];
  const allAvailableTools =
    Array.isArray(toolsFromDropdown) && toolsFromDropdown.length
      ? toolsFromDropdown
      : toolslist || [];

  // Get all unique projects from the combined data
  const uniqueProjects = Array.from(
    new Map(
      allAvailableTools
        .filter(t => t?.projectId)
        .map(t => [t.projectId, { id: t.projectId, name: t.projectName || 'Unnamed Project' }]),
    ).values(),
  );

  // Get all unique tools from the combined data
  const uniqueTools = Array.from(
    new Map(
      allAvailableTools
        .filter(t => t?.toolId)
        .map(t => [t.toolId, { id: t.toolId, name: t.name || 'Unnamed Tool' }]),
    ).values(),
  );

  // Get the selected tool name
  const selectedTool = uniqueTools.find(tool => tool.id === toolId);
  const toolName = selectedTool ? selectedTool.name : null;

  let innerRadius;
  let outerRadius;
  let chartHeight;
  if (isXS) {
    innerRadius = 25;
    outerRadius = 40;
    chartHeight = 180;
  } else if (windowWidth <= 768) {
    innerRadius = 30;
    outerRadius = 50;
    chartHeight = 200;
  } else {
    innerRadius = 35;
    outerRadius = 60;
    chartHeight = 220;
  }

  return (
    <div className={`${styles.toolDonutWrapper} ${darkMode ? 'darkMode' : ''}`}>
      <h3 className={styles.toolDonutTitle}>Proportion of Tools/Equipment</h3>

      <div className={styles.toolDonutFilters}>
        <div className={styles.filterItem}>
          <label htmlFor="tool-select" className={styles.filterLabel}>
            Tool/Equipment Name
          </label>
          <select
            id="tool-select"
            value={toolId}
            onChange={e => setToolId(e.target.value)}
            className={darkMode ? styles.selectDarkMode : styles.selectLightMode}
          >
            <option value="">All</option>
            {uniqueTools.map(tool => (
              <option key={`tool-${tool.id}`} value={tool.id}>
                {tool.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterItem}>
          <label htmlFor="project-select" className={styles.filterLabel}>
            Project
          </label>
          <select
            id="project-select"
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            className={darkMode ? styles.selectDarkMode : styles.selectLightMode}
          >
            <option value="">All</option>
            {uniqueProjects.map(project => (
              <option key={`project-${project.id}`} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasNoData || hasNoToolsMatch ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            padding: '2rem',
            textAlign: 'center',
            position: 'relative',
          }}
          title={
            hasNoToolsMatch
              ? 'No tools match the selected combination'
              : 'Tool not used in this project'
          }
        >
          <div
            style={{
              fontSize: '1.2rem',
              color: 'var(--donut-text-color)',
              fontWeight: '500',
              marginBottom: '0.5rem',
            }}
          >
            {hasNoToolsMatch ? '📊 No Tools Match' : '📊 No Data Available'}
          </div>
          <div
            style={{
              fontSize: '0.9rem',
              color: darkMode ? '#fff' : '#000',
              opacity: 0.7,
            }}
          >
            {hasNoToolsMatch
              ? 'No tools match the selected combination'
              : 'Tool not used in this project'}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart margin={{ top: 30, bottom: 30, left: isXS ? 30 : 40, right: isXS ? 30 : 40 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                labelLine={false}
                label={props => renderCustomizedLabel({ ...props, width: windowWidth, darkMode })}
                dataKey="count"
                isAnimationActive={false}
              >
                {chartData.map(entry => (
                  <Cell key={entry.status} fill={COLORS[entry.status.toUpperCase()]} />
                ))}
              </Pie>

              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill={darkMode ? '#fff' : '#000'}
                fontSize={14}
                fontWeight="bold"
              >
                TOTAL: {total}
              </text>

              <Tooltip
                content={
                  <CustomTooltip
                    total={total}
                    hasNoData={hasNoData}
                    toolName={toolName}
                    toolId={toolId}
                    darkMode={darkMode}
                  />
                }
                cursor={false}
                allowEscapeViewBox={{ x: false, y: false }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {!hasNoData && !hasNoToolsMatch && (
        <div className={styles.toolDonutLegend}>
          {chartData.map(entry => (
            <div
              key={entry.status}
              className={styles.toolDonutLegendItem}
              style={{ backgroundColor: COLORS[entry.status.toUpperCase()] }}
            >
              {entry.status}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
