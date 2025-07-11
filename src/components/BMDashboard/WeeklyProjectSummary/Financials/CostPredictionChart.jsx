import { useState, useEffect } from 'react';
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
import { useHistory } from 'react-router-dom';
import Select from 'react-select';
import './CostPredictionChart.css';
import { getProjectCosts, getProjectIds } from '../../../../services/projectCostTrackingService';
import moment from 'moment';

// Cost category options
const costOptions = [
  { value: 'Labor', label: 'Labor Cost' },
  { value: 'Materials', label: 'Materials Cost' },
  { value: 'Equipment', label: 'Equipment Cost' },
  { value: 'Total', label: 'Total Cost' },
];

// Custom tooltip component
function CustomTooltip({ active, payload, label, currency }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const isPrediction = payload[0]?.payload?.isPrediction;

  return (
    <div className="cost-chart-tooltip">
      <p className="tooltip-date">{label}</p>
      <p className="tooltip-type">{isPrediction ? 'Predicted' : 'Actual'}</p>
      {payload.map((entry, index) => {
        let costLabel = '';

        if (entry.dataKey === 'Labor') costLabel = 'Labor Cost';
        else if (entry.dataKey === 'Materials') costLabel = 'Materials Cost';
        else if (entry.dataKey === 'Equipment') costLabel = 'Equipment Cost';
        else if (entry.dataKey === 'Total') costLabel = 'Total Cost';

        return (
          <div key={index} className="tooltip-item">
            <span className="tooltip-marker" style={{ backgroundColor: entry.color }}></span>
            <span className="tooltip-label">{costLabel}:</span>
            <span className="tooltip-value">{`${currency}${entry.value.toLocaleString()}`}</span>
          </div>
        );
      })}
    </div>
  );
}

function CostPredictionChart({ darkMode, isFullPage = false, projectId }) {
  console.log('Rendering CostPredictionChart', { darkMode, isFullPage, projectId });

  const [data, setData] = useState([]);
  const [selectedCosts, setSelectedCosts] = useState([
    { value: 'Labor', label: 'Labor Cost' },
    { value: 'Materials', label: 'Materials Cost' },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currency] = useState('$'); // Currency symbol
  const [availableProjects, setAvailableProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [plannedBudget, setPlannedBudget] = useState(null);
  const [lastPredictedValues, setLastPredictedValues] = useState({});
  const history = useHistory();

  // Fetch available projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectIds = await getProjectIds();
        setAvailableProjects(projectIds.map(id => ({ value: id, label: id })));

        // Select the first project by default or use the provided projectId
        if (projectIds.length > 0) {
          const initialProject = projectId || projectIds[0];
          setSelectedProject({ value: initialProject, label: initialProject });
        }
      } catch (err) {
        console.error('Error fetching project IDs:', err);
        setError('Failed to load projects');
      }
    };

    fetchProjects();
  }, [projectId]);

  // Fetch cost data when selected project changes
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedProject) return;

      setLoading(true);
      try {
        const costData = await getProjectCosts(selectedProject.value);

        // Process the data for the chart
        const processedData = processDataForChart(costData);
        setData(processedData);

        // Set the planned budget from the response
        if (costData.plannedBudget) {
          setPlannedBudget(costData.plannedBudget);
        }

        // Calculate and store last predicted values for reference lines
        const lastValues = getLastPredictedValues(costData);
        setLastPredictedValues(lastValues);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching cost data:', err);
        setError('Failed to load cost data');
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedProject]);

  // Calculate last predicted values for reference lines
  const getLastPredictedValues = costData => {
    const lastValues = {};

    if (!costData || !costData.predicted) {
      return lastValues;
    }

    Object.keys(costData.predicted).forEach(category => {
      const predictedItems = costData.predicted[category];
      if (predictedItems && predictedItems.length > 0) {
        // Get the last predicted value for this category
        const lastPredicted = predictedItems[predictedItems.length - 1];
        lastValues[category] = lastPredicted.cost;
      }
    });

    return lastValues;
  };

  // Process data for chart - modify this function to connect actual and predicted data
  const processDataForChart = costData => {
    const processedData = [];

    if (!costData || !costData.actual) {
      return processedData;
    }

    // Get all dates from both actual and predicted data
    const allDates = new Set();
    const actualCategories = Object.keys(costData.actual);
    const predictedCategories = costData.predicted ? Object.keys(costData.predicted) : [];

    // Collect all dates
    actualCategories.forEach(category => {
      costData.actual[category].forEach(item => {
        const dateStr = moment(item.date).format('MMM YYYY');
        allDates.add(dateStr);
      });
    });

    if (costData.predicted) {
      predictedCategories.forEach(category => {
        costData.predicted[category].forEach(item => {
          const dateStr = moment(item.date).format('MMM YYYY');
          allDates.add(dateStr);
        });
      });
    }

    // Sort dates chronologically
    const sortedDates = Array.from(allDates).sort((a, b) =>
      moment(a, 'MMM YYYY').diff(moment(b, 'MMM YYYY')),
    );

    // Create data points for each date
    sortedDates.forEach(dateStr => {
      const dataPoint = { date: dateStr };

      // Add actual data values
      actualCategories.forEach(category => {
        const item = costData.actual[category].find(
          item => moment(item.date).format('MMM YYYY') === dateStr,
        );
        if (item) {
          dataPoint[category] = item.cost;
        }
      });

      // Add predicted data values
      if (costData.predicted) {
        predictedCategories.forEach(category => {
          const item = costData.predicted[category].find(
            item => moment(item.date).format('MMM YYYY') === dateStr,
          );
          if (item) {
            dataPoint[`${category}Predicted`] = item.cost;
          }
        });
      }

      // For the last actual data point of each category, also add it as the first predicted point
      // This ensures the lines connect without a gap
      if (costData.predicted) {
        actualCategories.forEach(category => {
          // Find the last actual data point for this category
          const actualItems = costData.actual[category];
          if (actualItems && actualItems.length > 0) {
            const lastActualItem = actualItems[actualItems.length - 1];
            const lastActualDateStr = moment(lastActualItem.date).format('MMM YYYY');

            // If this is the last actual data point, also set it as the predicted value
            if (dateStr === lastActualDateStr) {
              dataPoint[`${category}Predicted`] = lastActualItem.cost;
            }
          }
        });
      }

      processedData.push(dataPoint);
    });

    return processedData;
  };

  const handleCardClick = () => {
    if (!isFullPage) {
      // This would navigate to the full page view
      history.push('/bmdashboard/cost-prediction');
    }
  };

  // Handle cost category selection
  const handleCostChange = selected => {
    setSelectedCosts(selected || []);
  };

  // Handle project selection
  const handleProjectChange = selected => {
    setSelectedProject(selected);
  };

  // Define line colors
  const costColors = {
    Labor: '#4589FF',
    Materials: '#FF6A00',
    Equipment: '#8A2BE2',
    Total: '#3CB371',
  };

  // Render a simplified chart for card view
  if (!isFullPage) {
    return (
      <div
        className={`cost-prediction-chart-container ${darkMode ? 'dark-mode' : ''}`}
        onClick={handleCardClick}
        style={{
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '10px',
          width: '100%',
        }}
      >
        <h3
          className="cost-chart-title"
          style={{
            margin: '0 0 10px 0',
            textAlign: 'center',
            width: '100%',
            fontSize: '16px',
            fontWeight: '600',
          }}
        >
          Planned v Actual Costs Tracking
        </h3>

        {loading && <div className="cost-chart-loading">Loading...</div>}
        {error && <div className="cost-chart-error">{error}</div>}

        {!loading && !error && data.length > 0 && (
          <div
            style={{
              height: 'calc(100% - 40px)',
              width: '100%',
              position: 'relative',
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#364156' : '#ccc'} />
                <XAxis
                  dataKey="date"
                  tick={{
                    fill: darkMode ? '#e0e0e0' : '#333',
                    fontSize: 10,
                  }}
                  tickMargin={5}
                  height={25}
                />
                <YAxis
                  tick={{
                    fill: darkMode ? '#e0e0e0' : '#333',
                    fontSize: 10,
                  }}
                  tickFormatter={value => `${currency}${value}`}
                  width={35}
                />
                <Tooltip content={<CustomTooltip currency={currency} />} />
                <Legend
                  verticalAlign="bottom"
                  height={15}
                  iconSize={8}
                  wrapperStyle={{
                    fontSize: 9,
                    padding: 0,
                    margin: '0 auto',
                    width: '100%',
                    textAlign: 'center',
                    lineHeight: '1.2',
                  }}
                  align="center"
                />

                {/* Reference Lines for Last Predicted Values */}
                {['Labor', 'Materials'].map(category => {
                  if (lastPredictedValues[category]) {
                    return (
                      <ReferenceLine
                        key={`ref-${category}`}
                        y={lastPredictedValues[category]}
                        stroke={costColors[category]}
                        strokeWidth={1.5}
                      />
                    );
                  }
                  return null;
                })}

                {/* Only show Labor and Materials cost in card view */}
                <Line
                  key="Labor"
                  type="linear"
                  dataKey="Labor"
                  name="Labor Cost"
                  stroke={costColors.Labor}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
                <Line
                  key="LaborPredicted"
                  type="linear"
                  dataKey="LaborPredicted"
                  name="Labor Cost (Predicted)"
                  stroke={costColors.Labor}
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  dot={props => {
                    const { cx, cy, payload } = props;
                    if (!payload || !payload.LaborPredicted) return null;
                    return (
                      <path
                        d={`M${cx},${cy - 3} L${cx + 3},${cy} L${cx},${cy + 3} L${cx - 3},${cy} Z`}
                        fill="none"
                        stroke={costColors.Labor}
                        strokeWidth={1.5}
                      />
                    );
                  }}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
                <Line
                  key="Materials"
                  type="linear"
                  dataKey="Materials"
                  name="Materials Cost"
                  stroke={costColors.Materials}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
                <Line
                  key="MaterialsPredicted"
                  type="linear"
                  dataKey="MaterialsPredicted"
                  name="Materials Cost (Predicted)"
                  stroke={costColors.Materials}
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  dot={props => {
                    const { cx, cy, payload } = props;
                    if (!payload || !payload.MaterialsPredicted) return null;
                    return (
                      <path
                        d={`M${cx},${cy - 3} L${cx + 3},${cy} L${cx},${cy + 3} L${cx - 3},${cy} Z`}
                        fill="none"
                        stroke={costColors.Materials}
                        strokeWidth={1.5}
                      />
                    );
                  }}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="cost-chart-empty" style={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>
            <p>No data available</p>
          </div>
        )}
      </div>
    );
  }

  // Full page view
  return (
    <div
      className={`cost-prediction-chart-container full-page ${darkMode ? 'dark-mode' : ''}`}
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
        className="cost-chart-title"
        style={{
          margin: '10px 0 20px 0',
          textAlign: 'center',
          width: '100%',
          color: darkMode ? '#ffffff' : 'inherit',
          fontSize: '20px',
          fontWeight: '600',
        }}
      >
        Planned v Actual Costs Tracking
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '20px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '8px', ...(darkMode ? { color: '#e0e0e0' } : {}) }}>
            Project
          </label>
          <div style={{ width: '100%' }}>
            <Select
              className="project-select"
              classNamePrefix="select"
              value={selectedProject}
              onChange={handleProjectChange}
              options={availableProjects}
              placeholder="Select a project"
              isSearchable={false}
              styles={
                darkMode
                  ? {
                      container: baseStyles => ({
                        ...baseStyles,
                        width: '100%',
                      }),
                      control: baseStyles => ({
                        ...baseStyles,
                        backgroundColor: '#2c3344',
                        borderColor: '#364156',
                        width: '100%',
                        minWidth: 'auto',
                      }),
                      menu: baseStyles => ({
                        ...baseStyles,
                        backgroundColor: '#2c3344',
                        width: '100%',
                      }),
                      option: (baseStyles, state) => ({
                        ...baseStyles,
                        backgroundColor: state.isFocused ? '#364156' : '#2c3344',
                        color: '#e0e0e0',
                      }),
                    }
                  : {
                      container: baseStyles => ({
                        ...baseStyles,
                        width: '100%',
                      }),
                      control: baseStyles => ({
                        ...baseStyles,
                        width: '100%',
                        minWidth: 'auto',
                      }),
                      menu: baseStyles => ({
                        ...baseStyles,
                        width: '100%',
                      }),
                    }
              }
            />
          </div>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '8px', ...(darkMode ? { color: '#e0e0e0' } : {}) }}>
            Cost Categories
          </label>
          <div style={{ width: '100%' }}>
            <Select
              className="cost-select"
              classNamePrefix="select"
              value={selectedCosts}
              onChange={handleCostChange}
              options={costOptions}
              placeholder="Select cost categories"
              isMulti
              isClearable={true}
              styles={
                darkMode
                  ? {
                      control: baseStyles => ({
                        ...baseStyles,
                        backgroundColor: '#2c3344',
                        borderColor: '#364156',
                        width: '100%',
                        minWidth: '200px',
                      }),
                      menu: baseStyles => ({
                        ...baseStyles,
                        backgroundColor: '#2c3344',
                        width: '100%',
                      }),
                      option: (baseStyles, state) => ({
                        ...baseStyles,
                        backgroundColor: state.isFocused ? '#364156' : '#2c3344',
                        color: '#e0e0e0',
                      }),
                      multiValue: baseStyles => ({
                        ...baseStyles,
                        backgroundColor: '#364156',
                      }),
                      multiValueLabel: baseStyles => ({
                        ...baseStyles,
                        color: '#e0e0e0',
                      }),
                      multiValueRemove: baseStyles => ({
                        ...baseStyles,
                        color: '#e0e0e0',
                        ':hover': {
                          backgroundColor: '#ff4d4f',
                          color: '#fff',
                        },
                      }),
                    }
                  : {
                      control: baseStyles => ({
                        ...baseStyles,
                        width: '100%',
                        minWidth: '200px',
                      }),
                      menu: baseStyles => ({
                        ...baseStyles,
                        width: '100%',
                      }),
                    }
              }
            />
          </div>
        </div>
      </div>

      {loading && <div className="cost-chart-loading">Loading cost prediction data...</div>}
      {error && <div className="cost-chart-error">{error}</div>}

      {!loading && !error && (
        <div
          style={{
            width: '100%',
            height: 'calc(100% - 150px)',
            position: 'relative',
            backgroundColor: darkMode ? '#1e2736' : 'transparent',
            minHeight: '600px',
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
            <LineChart
              data={data}
              margin={{ top: 20, right: 60, left: 60, bottom: 40 }}
              style={{ backgroundColor: darkMode ? '#1e2736' : 'transparent' }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#364156' : '#ccc'} />
              <XAxis
                dataKey="date"
                tick={{
                  fill: darkMode ? '#e0e0e0' : '#333',
                  fontSize: 12,
                }}
                tickMargin={10}
                height={40}
                padding={{ left: 0, right: 10 }}
                axisLine={{ stroke: darkMode ? '#364156' : '#ccc' }}
              />
              <YAxis
                tick={{
                  fill: darkMode ? '#e0e0e0' : '#333',
                  fontSize: 12,
                }}
                tickFormatter={value => `${currency}${value}`}
                label={{
                  value: `Cost (${currency})`,
                  angle: -90,
                  position: 'insideLeft',
                  style: {
                    textAnchor: 'middle',
                    fill: darkMode ? '#e0e0e0' : '#333',
                  },
                }}
                padding={{ top: 20 }}
                axisLine={{ stroke: darkMode ? '#364156' : '#ccc' }}
              />
              <Tooltip
                content={<CustomTooltip currency={currency} />}
                cursor={{ strokeDasharray: '3 3' }}
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

              {/* Reference Lines for Last Predicted Values */}
              {selectedCosts.map(cost => {
                const category = cost.value;
                if (lastPredictedValues[category]) {
                  return (
                    <ReferenceLine
                      key={`ref-${category}`}
                      y={lastPredictedValues[category]}
                      stroke={costColors[category]}
                      strokeWidth={2}
                    />
                  );
                }
                return null;
              })}

              {selectedCosts.map(cost => {
                const dataKey = cost.value;
                return (
                  <>
                    <Line
                      key={dataKey}
                      type="linear"
                      dataKey={dataKey}
                      name={cost.label}
                      stroke={costColors[dataKey]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      isAnimationActive={false}
                    />
                    <Line
                      key={`${dataKey}Predicted`}
                      type="linear"
                      dataKey={`${dataKey}Predicted`}
                      name={`${cost.label} (Predicted)`}
                      stroke={costColors[dataKey]}
                      strokeWidth={2}
                      strokeDasharray="8 4"
                      dot={props => {
                        const { cx, cy, payload, index } = props;
                        if (!payload || !payload[`${dataKey}Predicted`]) return null;
                        return (
                          <path
                            d={`M${cx},${cy - 4} L${cx + 4},${cy} L${cx},${cy + 4} L${cx -
                              4},${cy} Z`}
                            fill="none"
                            stroke={costColors[dataKey]}
                            strokeWidth={1.5}
                            key={`dot-${dataKey}-${index}`}
                          />
                        );
                      }}
                      activeDot={{ r: 6 }}
                      isAnimationActive={false}
                    />
                  </>
                );
              })}
            </LineChart>
          </ResponsiveContainer>

          <div
            className="chart-legend-container"
            style={{ marginTop: '20px', textAlign: 'center' }}
          >
            <div
              className="chart-legend-item"
              style={{ display: 'inline-block', marginRight: '20px' }}
            >
              <svg width="16" height="16" style={{ display: 'inline-block', marginRight: '4px' }}>
                <path
                  d="M8,2 L14,8 L8,14 L2,8 Z"
                  fill="none"
                  stroke="#999"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                />
              </svg>
              <span className="legend-label" style={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>
                Projected Values
              </span>
            </div>
            <div className="chart-legend-item" style={{ display: 'inline-block' }}>
              <svg width="16" height="16" style={{ display: 'inline-block', marginRight: '4px' }}>
                <line x1="2" y1="8" x2="14" y2="8" stroke="#999" strokeWidth={1.5} />
              </svg>
              <span className="legend-label" style={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>
                Final Prediction Targets
              </span>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="cost-chart-empty" style={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>
          <p>No data available for the selected filters.</p>
        </div>
      )}
    </div>
  );
}

export default CostPredictionChart;
