import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import styles from './CostPredictionChart.module.css';
import { fetchBMProjects } from '../../../actions/bmdashboard/projectActions';
import projectCostService from '../../../services/projectCostService';

// Custom dot renderer (unchanged)
function renderDotTopOrBottom(lineKey, color) {
  return function CustomDot(props) {
    const { cx, cy, value, payload, index } = props;
    if (value == null) return null;

    const planned = payload.plannedCost;
    const actual = payload.actualCost;
    const predicted = payload.predictedCost;
    const values = [planned, actual, predicted].filter(v => v != null);
    if (values.length === 0) return null;

    const max = Math.max(...values);
    const min = Math.min(...values);
    const dx = index === 0 ? 32 : 0;

    if (value === max) {
      return (
        <text
          x={cx + dx}
          y={cy - 20}
          fill={color}
          fontSize={10}
          fontWeight="bold"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {value}
        </text>
      );
    }
    if (value === min) {
      return (
        <text
          x={cx + dx}
          y={cy + 18}
          fill={color}
          fontSize={10}
          fontWeight="bold"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {value}
        </text>
      );
    }
    return null;
  };
}
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className={styles.customTooltip}>
      <div className={styles.customTooltipLabel}>{label}</div>
      {payload.map(item => (
        <div key={item.name} className={styles.customTooltipItem}>
          <span style={{ color: item.color }}>{item.name}:</span> $
          {Number(item.value).toLocaleString()}
        </div>
      ))}
    </div>
  );
}
function CostPredictionChart({ projectId }) {
  const dispatch = useDispatch();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Date filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const darkMode = useSelector(state => state.theme.darkMode);
  //Project list for dropdown
  const projects = useSelector(state => state.bmProjects) || [];
  const [selectedProject, setSelectedProject] = useState('');
  const legendItems = [
    { label: 'Planned Cost', color: '#7acba6', type: 'circle' },
    { label: 'Actual Cost', color: '#9aa6ff', type: 'circle' },
    { label: 'Predicted Cost', color: '#ff8c2a', type: 'dash' },
  ];
  // Reset all the filters
  const resetFilters = () => {
    setSelectedProject('');
    setStartDate('');
    setEndDate('');
    setError('');
  };
  //Project dropdown
  useEffect(() => {
    dispatch(fetchBMProjects());
  }, [dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [costsResponse, predictionsResponse] = await Promise.all([
          projectCostService.getProjectCosts(projectId),
          projectCostService.getProjectPredictions(projectId),
        ]);

        const costsData = costsResponse.data.costs;
        const predictionsData = predictionsResponse.data.predictions;

        const predictionsMap = predictionsData.reduce((acc, pred) => {
          acc[pred.month] = pred.predictedCost;
          return acc;
        }, {});

        const combinedData = costsData.map(cost => ({
          ...cost,
          predictedCost: predictionsMap[cost.month] || null,
        }));

        setChartData(combinedData);
        setError(null);
      } catch {
        setError('Failed to load project cost data');
      } finally {
        setLoading(false);
      }
    };

    const effectiveProjectId = selectedProject || projectId; //fetches data when either the prop projectId or the dropdown selection changes
    if (effectiveProjectId) fetchData();
  }, [projectId, selectedProject]);

  if (loading) return <div>Loading chart data...</div>;
  if (error) return <div>Error: {error}</div>;

  const currentMonth = new Date().toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  //  Filter data by date range
  const filteredData = chartData.filter(item => {
    const itemDate = new Date(item.month);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return (!start || itemDate >= start) && (!end || itemDate <= end);
  });

  // THEME COLORS — only for grid, axis ticks/lines, legend
  const gridColor = darkMode ? '#e5e7eb' : '#9ca3af'; // grid lines
  const tickColor = darkMode ? '#e5e7eb' : '#9ca3af'; // tick text
  const axisLineCol = darkMode ? '#e5e7eb' : '#9ca3af'; // axis baseline & tick marks
  const legendColor = darkMode ? '#e5e7eb' : '#9ca3af'; // legend text

  return (
    <div className={styles.titleContainer}>
      <h2 className={styles.title}>Planned Vs Actual costs tracking</h2>
      {/* Project Filter Dropdown */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <div className={styles.selectorGroup}>
          <label htmlFor="projectSelect">Project: </label>
          <select
            id="projectSelect"
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
          >
            <option value="">Select a Project</option>
            {projects.map(project => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <div className={styles.selectorGroup}>
          <label htmlFor="startDate">Start Date: </label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className={styles.selectorGroup}>
          <label htmlFor="endDate">End Date: </label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>
      {/* Reset Filters button */}
      <div style={{ minWidth: '120px' }}>
        <button
          type="button"
          onClick={resetFilters}
          style={{
            padding: '0.2rem 0.8rem',
            borderRadius: '6px',
            border: '1px solid #d9d2d2ff',
            background: '#dededeff',
            cursor: 'pointer',
            fontSize: '0.95rem',
          }}
          aria-label="Reset filters"
          title="Reset filters"
        >
          Reset
        </button>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
          {/* Grid */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={gridColor}
            vertical
            horizontal
            verticalFill={[]}
            horizontalFill={[]}
          />
          {/* Axes: tick text, tick marks, baseline lines */}
          <XAxis
            dataKey="month"
            tick={({ x, y, payload }) => {
              // Converts "February 2024" to "Feb 24"
              const shortLabel = payload.value.replace(
                /(\w{3})\w*\s(\d{4})/,
                (_, m, y) => `${m} ${y.slice(-2)}`,
              );

              return (
                <text
                  x={x}
                  y={y + 15} // push text down so it doesn’t overlap axis line
                  textAnchor="middle"
                  fill={darkMode ? '#e5e7eb' : '#9ca3af'}
                  fontSize={15}
                >
                  {shortLabel}
                </text>
              );
            }}
            tickMargin={10}
          />

          <YAxis
            tick={({ x, y, payload }) => (
              <text x={x} y={y} textAnchor="end" fill={darkMode ? '#e5e7eb' : '#9ca3af'}>
                {payload.value}
              </text>
            )}
          />
          {/* Tooltip & Legend */}
          <Tooltip
            content={<CustomTooltip />}
            labelFormatter={label => ` ${label}`}
            formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name]}
          />
          <Legend
            verticalAlign="bottom"
            height={48}
            wrapperStyle={{ paddingTop: 10 }}
            content={() => (
              <ul className={styles.legendList}>
                {legendItems.map(item => (
                  <li key={item.label} className={styles.legendListItem}>
                    {/* icon */}
                    {item.type === 'circle' ? (
                      <span className={styles.legendItem} />
                    ) : (
                      <svg width="18" height="12">
                        <line
                          x1="0"
                          y1="6"
                          x2="18"
                          y2="6"
                          stroke={item.color}
                          strokeWidth="3"
                          strokeDasharray="4 4"
                        />
                      </svg>
                    )}
                    {/* label */}
                    <span style={{ color: item.color }}>{item.label}</span>
                  </li>
                ))}
              </ul>
            )}
          />
          {/* Reference line (kept fixed color) */}
          <ReferenceLine
            x={currentMonth}
            stroke="#ff0000"
            strokeDasharray="3 3"
            label={{ value: 'Current Month', position: 'top', fill: '#fc07cfff' }}
          />
          {/* Series (kept fixed colors) */}
          <Line
            type="monotone"
            dataKey="plannedCost"
            stroke="#82ca9d"
            strokeWidth={2}
            name="Planned Cost"
            dot={renderDotTopOrBottom('plannedCost', '#82ca9d')}
          />
          <Line
            type="monotone"
            dataKey="actualCost"
            stroke="#8884d8"
            strokeWidth={2}
            name="Actual Cost"
            dot={renderDotTopOrBottom('actualCost', '#8884d8')}
          />
          <Line
            type="monotone"
            dataKey="predictedCost"
            stroke="#ff7300"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Predicted Cost"
            dot={renderDotTopOrBottom('predictedCost', '#ff7300')}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CostPredictionChart;
