import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
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

  const chartData = availabilityData?.data || [];
  const total = availabilityData?.total || 0;

  // Use unfiltered toolslist for options to prevent options disappearing after selection
  // availabilityData is only used for chart data, not for building dropdown options
  const uniqueProjects = useMemo(
    () =>
      Array.from(
        new Map(
          toolslist
            .filter(t => t?.projectId)
            .map(t => [t.projectId, { id: t.projectId, name: t.projectName || 'Unnamed Project' }]),
        ).values(),
      ),
    [toolslist],
  );

  const uniqueTools = useMemo(
    () =>
      Array.from(
        new Map(
          toolslist
            .filter(t => t?.toolId)
            .map(t => [t.toolId, { id: t.toolId, name: t.name || 'Unnamed Tool' }]),
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

  // Consistent react-select styles matching paid-labor-cost pattern
  const selectStyles = useMemo(
    () => ({
      control: base => ({
        ...base,
        minHeight: '38px',
        fontSize: '12px',
        backgroundColor: darkMode ? '#253342' : '#fff',
        borderColor: darkMode ? '#2d4059' : '#ccc',
        color: darkMode ? '#ffffff' : '#000',
        boxShadow: 'none',
        borderRadius: '6px',
        '&:hover': {
          borderColor: darkMode ? '#2d4059' : '#999',
        },
      }),
      valueContainer: base => ({
        ...base,
        padding: '2px 8px',
        color: darkMode ? '#ffffff' : '#000',
      }),
      input: base => ({
        ...base,
        margin: '0px',
        padding: '0px',
        color: darkMode ? '#ffffff' : '#000',
      }),
      indicatorsContainer: base => ({
        ...base,
        padding: '0 4px',
      }),
      menu: base => ({
        ...base,
        backgroundColor: darkMode ? '#253342' : '#fff',
        fontSize: '12px',
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? darkMode
            ? '#e8a71c'
            : '#0d55b3'
          : state.isFocused
          ? darkMode
            ? '#3a506b'
            : '#f0f0f0'
          : darkMode
          ? '#253342'
          : '#fff',
        color: state.isSelected ? (darkMode ? '#000' : '#fff') : darkMode ? '#ffffff' : '#000',
        cursor: 'pointer',
        padding: '8px 12px',
        fontSize: '12px',
        ':active': {
          backgroundColor: darkMode ? '#3a506b' : '#e0e0e0',
        },
      }),
      singleValue: base => ({
        ...base,
        color: darkMode ? '#ffffff' : '#000',
        fontSize: '12px',
      }),
      placeholder: base => ({
        ...base,
        color: darkMode ? '#aaaaaa' : '#666',
        fontSize: '12px',
      }),
      indicatorSeparator: base => ({
        ...base,
        backgroundColor: darkMode ? '#2d4059' : '#ccc',
      }),
      dropdownIndicator: base => ({
        ...base,
        color: darkMode ? '#ffffff' : '#999',
        padding: '4px',
        ':hover': {
          color: darkMode ? '#ffffff' : '#666',
        },
      }),
    }),
    [darkMode],
  );

  // Responsive sizing standardized to match tallest chart: 240px mobile, 280px tablet, 300px desktop
  let innerRadius;
  let outerRadius;
  let chartHeight;
  const isSmall = windowWidth <= 768;
  if (windowWidth <= 768) {
    // Mobile
    innerRadius = 40;
    outerRadius = 65;
    chartHeight = 240;
  } else if (windowWidth <= 1024) {
    // Tablet
    innerRadius = 50;
    outerRadius = 80;
    chartHeight = 280;
  } else {
    // Desktop
    innerRadius = 70;
    outerRadius = 100;
    chartHeight = 300;
  }

  // Calculate responsive margins: mobile {20,20,20,20}, tablet {25,25,30,30}, desktop {30,30,40,40}
  const getChartMargins = () => {
    if (windowWidth <= 768) {
      return { top: 20, bottom: 20, left: 20, right: 20 }; // Mobile
    } else if (windowWidth <= 1024) {
      return { top: 25, bottom: 25, left: 30, right: 30 }; // Tablet
    }
    return { top: 30, bottom: 30, left: 40, right: 40 }; // Desktop
  };

  // Calculate responsive font size for center text: mobile 10, tablet 12, desktop 14
  const getCenterTextFontSize = () => {
    if (windowWidth <= 768) {
      return 10; // Mobile
    } else if (windowWidth <= 1024) {
      return 12; // Tablet
    }
    return 14; // Desktop
  };

  return (
    <div
      className={`tool-donut-wrapper tool-donut-wrapper-constrain ${darkMode ? 'dark-mode' : ''}`}
    >
      <h3 className="tool-donut-title">Proportion of Tools/Equipment</h3>

      <div className="tool-donut-filters">
        <div className="filter-item">
          <label htmlFor="tool-select" className="filter-label">
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

        <div className="filter-item">
          <label htmlFor="project-select" className="filter-label">
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

      <div className="tool-donut-chart-container">
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
              formatter={value => `${((value / total) * 100).toFixed(1)}%`}
              contentStyle={{ fontSize: '14px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

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
