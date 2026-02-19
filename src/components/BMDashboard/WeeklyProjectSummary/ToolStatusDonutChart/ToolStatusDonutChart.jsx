import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { fetchToolAvailability, fetchTools } from '../../../../actions/bmdashboard/toolActions';
import { ENDPOINTS } from '../../../../utils/URL';
import { getStandardSelectStyles } from '../../../../utils/reactSelectUtils';
import styles from './ToolStatusDonutChart.module.css';

const COLORS = {
  AVAILABLE: '#220F57',
  USED: '#2B73B6',
  MAINTENANCE: '#6DC5DA',
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, outerRadius, percent, width }) => {
  // Hide labels on mobile/tablet for better readability
  if (width <= 1024) return null;

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

// Custom tooltip component
const CustomTooltip = ({ active, payload, total, hasNoData, toolName, toolId }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  // If total is 0, show no tools match message
  if (total === 0) {
    return (
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '8px 12px',
          fontSize: '14px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          maxWidth: '200px',
        }}
      >
        <div style={{ fontWeight: '600', color: '#333' }}>📊 No Tools Match</div>
        <div style={{ color: '#666', fontSize: '12px' }}>
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
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '8px 12px',
          fontSize: '14px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          maxWidth: '200px',
        }}
      >
        <div style={{ fontWeight: '600', color: '#333' }}>{toolName}</div>
        <div style={{ color: '#666', fontSize: '12px' }}>❌ Not used in this project</div>
      </div>
    );
  }

  const data = payload[0];
  const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0.0';

  return (
    <div
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '8px 12px',
        fontSize: '14px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        maxWidth: '200px',
      }}
    >
      <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
        {toolName || 'All Tools'}
      </div>
      <div style={{ color: '#666', marginBottom: '2px' }}>
        Count: <strong>{data.value}</strong>
      </div>
      <div style={{ color: '#666' }}>
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
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    dispatch(fetchTools());
    // Fetch all tool availability data initially to populate dropdowns
    dispatch(fetchToolAvailability('', ''));
  }, [dispatch]);

  // Fetch projects from tools-availability endpoint
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(ENDPOINTS.TOOLS_AVAILABILITY_PROJECTS);
        const projectsData = response.data;
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      } catch {
        // Silently fail - projects dropdown will be empty
        setProjects([]);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    dispatch(fetchToolAvailability(toolId, projectId));
  }, [dispatch, toolId, projectId]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const chartData = availabilityData?.data || [];
  const total = availabilityData?.total || 0;

  // Check if we have no data for the selected combination
  const hasNoData = (toolId || projectId) && chartData.length === 0 && total === 0;
  const hasNoToolsMatch = total === 0;

  // Extract unique projects from fetched projects list
  const uniqueProjects = useMemo(
    () =>
      Array.from(
        new Map(
          projects
            .filter(p => p?.projectId)
            .map(p => [
              p.projectId,
              { id: p.projectId, name: p.projectName || p.projectId || 'Unnamed Project' },
            ]),
        ).values(),
      ),
    [projects],
  );

  // Extract unique tools from toolslist using correct data structure (tool.itemType._id and tool.itemType.name)
  const uniqueTools = useMemo(
    () =>
      Array.from(
        new Map(
          toolslist
            .filter(t => t?.itemType?._id && t?.itemType?.name)
            .map(t => [t.itemType._id, { id: t.itemType._id, name: t.itemType.name }]),
        ).values(),
      ),
    [toolslist],
  );

  // Build react-select option lists
  const projectOptions = useMemo(
    () => [
      { label: 'All', value: '' },
      ...uniqueProjects.map(project => ({
        label: project.name,
        value: project.id,
      })),
    ],
    [uniqueProjects],
  );

  const toolOptions = useMemo(
    () => [
      { label: 'All', value: '' },
      ...uniqueTools.map(tool => ({
        label: tool.name,
        value: tool.id,
      })),
    ],
    [uniqueTools],
  );

  // Use shared react-select styles to reduce duplication
  const selectStyles = useMemo(() => getStandardSelectStyles(darkMode), [darkMode]);

  // Get the selected tool name for tooltip
  const selectedTool = uniqueTools.find(tool => tool.id === toolId);
  const toolName = selectedTool ? selectedTool.name : null;

  // Gradient responsive sizing - scales smoothly from smallest phones to desktop
  let innerRadius;
  let outerRadius;
  let chartHeight;

  if (windowWidth <= 375) {
    innerRadius = 30;
    outerRadius = 50;
    chartHeight = 180;
  } else if (windowWidth <= 428) {
    innerRadius = 35;
    outerRadius = 55;
    chartHeight = 200;
  } else if (windowWidth <= 480) {
    innerRadius = 37;
    outerRadius = 60;
    chartHeight = 220;
  } else if (windowWidth <= 768) {
    innerRadius = 40;
    outerRadius = 65;
    chartHeight = 240;
  } else if (windowWidth <= 1024) {
    innerRadius = 50;
    outerRadius = 80;
    chartHeight = 280;
  } else {
    innerRadius = 70;
    outerRadius = 100;
    chartHeight = 300;
  }

  // Gradient responsive margins scaling
  const getChartMargins = () => {
    if (windowWidth <= 375) {
      return { top: 15, bottom: 15, left: 15, right: 15 };
    } else if (windowWidth <= 428) {
      return { top: 18, bottom: 18, left: 18, right: 18 };
    } else if (windowWidth <= 480) {
      return { top: 19, bottom: 19, left: 19, right: 19 };
    } else if (windowWidth <= 768) {
      return { top: 20, bottom: 20, left: 20, right: 20 };
    } else if (windowWidth <= 1024) {
      return { top: 25, bottom: 25, left: 30, right: 30 };
    }
    return { top: 30, bottom: 30, left: 40, right: 40 };
  };

  // Gradient responsive font size for center text scaling
  const getCenterTextFontSize = () => {
    if (windowWidth <= 375) {
      return 8;
    } else if (windowWidth <= 428) {
      return 9;
    } else if (windowWidth <= 480) {
      return 9.5;
    } else if (windowWidth <= 768) {
      return 10;
    } else if (windowWidth <= 1024) {
      return 12;
    }
    return 14;
  };

  const wrapperClass = `${styles.toolDonutWrapper} ${darkMode ? styles.toolDonutWrapperDark : ''}`;

  return (
    <div className={wrapperClass}>
      <h3 className={styles.toolDonutTitle}>Proportion of Tools/Equipment</h3>
      <div className={styles.toolDonutFilters}>
        <div className={styles.filterItem}>
          <label htmlFor="tool-select" className={styles.filterLabel}>
            Tool/Equipment Name
          </label>
          <Select
            inputId="tool-select"
            className="tool-donut-select"
            classNamePrefix="select"
            options={toolOptions}
            value={toolOptions.find(option => option.value === toolId) || toolOptions[0]}
            onChange={selected => setToolId(selected ? selected.value : '')}
            isClearable={false}
            placeholder="All"
            styles={selectStyles}
          />
        </div>

        <div className={styles.filterItem}>
          <label htmlFor="project-select" className={styles.filterLabel}>
            Project
          </label>
          <Select
            inputId="project-select"
            className="tool-donut-select"
            classNamePrefix="select"
            options={projectOptions}
            value={projectOptions.find(option => option.value === projectId) || projectOptions[0]}
            onChange={selected => setProjectId(selected ? selected.value : '')}
            isClearable={false}
            placeholder="All"
            styles={selectStyles}
          />
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
            <PieChart margin={getChartMargins()}>
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
                fontSize={getCenterTextFontSize()}
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
