import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchToolAvailability, fetchTools } from '../../../../actions/bmdashboard/toolActions';
import './ToolStatusDonutChart.css';

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

export default function ToolStatusDonutChart() {
  const dispatch = useDispatch();
  const toolslist = useSelector(state => state.tools.toolslist);
  const availabilityData = useSelector(state => state.toolAvailability.availabilityData);
  const darkMode = useSelector(state => state.theme.darkMode);

  const [toolId, setToolId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    dispatch(fetchTools());
  }, [dispatch]);

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

  const toolsFromAvailability = availabilityData?.tools;
  const allTools =
    Array.isArray(toolsFromAvailability) && toolsFromAvailability.length
      ? toolsFromAvailability
      : toolslist;

  const uniqueProjects = Array.from(
    new Map(
      allTools
        .filter(t => t?.projectId)
        .map(t => [t.projectId, { id: t.projectId, name: t.projectName || 'Unnamed Project' }]),
    ).values(),
  );

  const uniqueTools = Array.from(
    new Map(
      allTools
        .filter(t => t?.toolId)
        .map(t => [t.toolId, { id: t.toolId, name: t.name || 'Unnamed Tool' }]),
    ).values(),
  );

  let innerRadius;
  let outerRadius;
  let chartHeight;
  if (isXS) {
    innerRadius = 35;
    outerRadius = 60;
    chartHeight = 240;
  } else if (windowWidth <= 768) {
    innerRadius = 45;
    outerRadius = 75;
    chartHeight = 280;
  } else {
    innerRadius = 70;
    outerRadius = 100;
    chartHeight = 300; // Match other charts
  }

  return (
    <div className={`tool-donut-wrapper ${darkMode ? 'dark-mode' : ''}`}>
      <h3 className="tool-donut-title">Proportion of Tools/Equipment</h3>

      <div className="tool-donut-filters">
        <div className="filter-item">
          <label htmlFor="tool-select" className="filter-label">
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

        <div className="filter-item">
          <label htmlFor="project-select" className="filter-label">
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
            formatter={value => `${((value / total) * 100).toFixed(1)}%`}
            contentStyle={{ fontSize: '14px' }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="tool-donut-legend">
        {chartData.map(entry => (
          <div
            key={entry.status}
            className="tool-donut-legend-item"
            style={{ backgroundColor: COLORS[entry.status.toUpperCase()] }}
          >
            {entry.status}
          </div>
        ))}
      </div>
    </div>
  );
}
