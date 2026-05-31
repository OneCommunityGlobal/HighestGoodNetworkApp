import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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
const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, width }) => {
  const isSmall = width <= 768;
  if (isSmall) return null;

  const radius = outerRadius + 20;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="var(--donut-text-color)"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize="12"
    >
      {(percent * 100).toFixed(1)}%
    </text>
  );
};

// Shared tooltip container style
const getTooltipContainerStyle = darkMode => ({
  backgroundColor: darkMode ? 'rgba(27, 42, 65, 0.97)' : 'rgba(255, 255, 255, 0.95)',
  border: `1px solid ${darkMode ? '#3a506b' : '#ccc'}`,
  borderRadius: '4px',
  padding: '8px 12px',
  fontSize: '14px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  maxWidth: '200px',
});

const NoMatchTooltip = ({ darkMode }) => (
  <div style={getTooltipContainerStyle(darkMode)}>
    <div style={{ fontWeight: '600', color: darkMode ? '#e0e0e0' : '#333' }}>📊 No Tools Match</div>
    <div style={{ color: darkMode ? '#c5d0dd' : '#666', fontSize: '12px' }}>
      No tools match the selected combination
    </div>
  </div>
);

NoMatchTooltip.propTypes = { darkMode: PropTypes.bool };
NoMatchTooltip.defaultProps = { darkMode: false };

const NoDataTooltip = ({ darkMode, toolName }) => (
  <div style={getTooltipContainerStyle(darkMode)}>
    <div style={{ fontWeight: '600', color: darkMode ? '#e0e0e0' : '#333' }}>{toolName}</div>
    <div style={{ color: darkMode ? '#c5d0dd' : '#666', fontSize: '12px' }}>
      ❌ Not used in this project
    </div>
  </div>
);

NoDataTooltip.propTypes = {
  darkMode: PropTypes.bool,
  toolName: PropTypes.string,
};
NoDataTooltip.defaultProps = { darkMode: false, toolName: '' };

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
  if (!active || !payload?.length) return null;
  if (total === 0) return <NoMatchTooltip darkMode={darkMode} />;
  if (hasNoData && toolId) return <NoDataTooltip darkMode={darkMode} toolName={toolName} />;

  const data = payload[0];
  const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0.0';

  return (
    <div style={getTooltipContainerStyle(darkMode)}>
      <div style={{ fontWeight: '600', color: textColor, marginBottom: '4px' }}>
        {toolName || 'All Tools'}
      </div>
      <div style={{ color: subTextColor, marginBottom: '2px' }}>
        Count: <strong>{data.value}</strong>
      </div>
      <div style={{ color: subTextColor }}>
        Percentage: <strong>{percentage}%</strong>
      </div>
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.object),
  total: PropTypes.number,
  hasNoData: PropTypes.bool,
  toolName: PropTypes.string,
  projectName: PropTypes.string,
  toolId: PropTypes.string,
  darkMode: PropTypes.bool,
};
CustomTooltip.defaultProps = {
  active: false,
  payload: [],
  total: 0,
  hasNoData: false,
  toolName: '',
  projectName: '',
  toolId: '',
  darkMode: false,
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

  const wrapperClass = `${styles.toolDonutWrapper} ${darkMode ? styles.toolDonutWrapperDark : ''}`;

  return (
    <div className={wrapperClass}>
      <h3 className={styles.toolDonutTitle}>Proportion of Tools/Equipment</h3>
      <div className={styles.toolDonutFilters}>
        <div className={styles.filterItem}>
          <label htmlFor="tool-select" className={styles.filterLabel}>
            Tool/Equipment Name
          </label>
          <select id="tool-select" value={toolId} onChange={e => setToolId(e.target.value)}>
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
              color: 'var(--donut-text-color)',
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
                label={props => renderCustomizedLabel({ ...props, width: windowWidth })}
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
                fill="var(--donut-text-color)"
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
