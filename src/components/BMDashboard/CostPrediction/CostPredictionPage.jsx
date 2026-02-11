import { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
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
import moment from 'moment';
import Select from 'react-select';
import { getProjectCosts, getProjectIds } from '../../../services/projectCostTrackingService';
import { useSelector } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import { Info } from 'lucide-react';
import styles from './CostPredictionPage.module.css';

// Cost category options
const costOptions = [
  { value: 'Labor', label: 'Labor Cost' },
  { value: 'Materials', label: 'Materials Cost' },
  { value: 'Equipment', label: 'Equipment Cost' },
  { value: 'Total', label: 'Total Cost' },
];

// Custom dot component for predicted values - consolidated to reduce duplication
function PredictedDot({ cx, cy, payload, category, costColors, size = 4 }) {
  if (!payload || !payload[`${category}Predicted`]) return null;
  return (
    <path
      d={`M${cx},${cy - size} L${cx + size},${cy} L${cx},${cy + size} L${cx - size},${cy} Z`}
      fill={costColors[category]}
      stroke={costColors[category]}
      strokeWidth={0}
    />
  );
}

PredictedDot.propTypes = {
  cx: PropTypes.number,
  cy: PropTypes.number,
  payload: PropTypes.object,
  category: PropTypes.string.isRequired,
  costColors: PropTypes.object.isRequired,
  size: PropTypes.number,
};

// Define line colors
const costColors = {
  Labor: '#4589FF',
  Materials: '#FF6A00',
  Equipment: '#8A2BE2',
  Total: '#3CB371',
};

// Create specific dot components for common categories
function createDotComponent(category) {
  function DotComponent(props) {
    return (
      <PredictedDot
        cx={props.cx}
        cy={props.cy}
        payload={props.payload}
        category={category}
        costColors={costColors}
        size={4}
      />
    );
  }
  DotComponent.propTypes = {
    cx: PropTypes.number,
    cy: PropTypes.number,
    payload: PropTypes.object,
  };
  return DotComponent;
}

// Pre-defined dot components for different categories
const LaborDot = createDotComponent('Labor');
const MaterialsDot = createDotComponent('Materials');
const EquipmentDot = createDotComponent('Equipment');
const TotalDot = createDotComponent('Total');

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
    costData.actual[category].forEach(costItem => {
      const dateStr = moment(costItem.date).format('MMM YYYY');
      allDates.add(dateStr);
    });
  });

  if (costData.predicted) {
    predictedCategories.forEach(category => {
      costData.predicted[category].forEach(costItem => {
        const dateStr = moment(costItem.date).format('MMM YYYY');
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
      const costItem = costData.actual[category].find(
        costEntry => moment(costEntry.date).format('MMM YYYY') === dateStr,
      );
      if (costItem) {
        dataPoint[category] = costItem.cost;
      }
    });

    // Add predicted data values
    if (costData.predicted) {
      predictedCategories.forEach(category => {
        const costItem = costData.predicted[category].find(
          costEntry => moment(costEntry.date).format('MMM YYYY') === dateStr,
        );
        if (costItem) {
          dataPoint[`${category}Predicted`] = costItem.cost;
        }
      });
    }

    // For the last actual data point of each category, also add it as the first predicted point
    if (costData.predicted) {
      actualCategories.forEach(category => {
        const actualItems = costData.actual[category];
        if (actualItems && actualItems.length > 0) {
          const lastActualItem = actualItems[actualItems.length - 1];
          const lastActualDateStr = moment(lastActualItem.date).format('MMM YYYY');

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

// Custom tooltip component
function CustomTooltip({ active, payload, label, currency, darkMode }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  // Check if any payload entry is predicted data
  const hasActualData = payload.some(entry => !entry.dataKey.includes('Predicted'));
  const hasPredictedData = payload.some(entry => entry.dataKey.includes('Predicted'));

  // If both actual and predicted exist, prioritize showing "Actual"
  const displayType = hasActualData ? 'Actual' : hasPredictedData ? 'Predicted' : 'Actual';
  // Filter payload: if actual data exists, only show actual data; otherwise show predicted data
  const filteredPayload = hasActualData
    ? payload.filter(entry => !entry.dataKey.includes('Predicted'))
    : payload;

  return (
    <div
      className="cost-chart-tooltip"
      style={{
        backgroundColor: darkMode ? '#2c3344' : '#fff',
        border: `1px solid ${darkMode ? '#364156' : '#ccc'}`,
        borderRadius: '4px',
        padding: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        color: darkMode ? '#e0e0e0' : '#333',
        fontSize: '12px',
      }}
    >
      <p
        className="tooltip-date"
        style={{
          margin: '0 0 4px 0',
          fontWeight: 'bold',
          color: darkMode ? '#e0e0e0' : '#333',
        }}
      >
        {label}
      </p>
      <p
        className="tooltip-type"
        style={{
          margin: '0 0 4px 0',
          fontSize: '10px',
          color: darkMode ? '#e0e0e0' : '#333',
          opacity: 0.8,
        }}
      >
        {displayType}
      </p>
      {filteredPayload.map(entry => {
        const isPredicted = entry.dataKey.includes('Predicted');
        let costLabel = '';
        const baseDataKey = entry.dataKey.replace('Predicted', '');

        if (baseDataKey === 'Labor') costLabel = 'Labor Cost';
        else if (baseDataKey === 'Materials') costLabel = 'Materials Cost';
        else if (baseDataKey === 'Equipment') costLabel = 'Equipment Cost';
        else if (baseDataKey === 'Total') costLabel = 'Total Cost';

        return (
          <div
            key={`tooltip-${entry.dataKey}-${entry.value}`}
            className="tooltip-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              margin: '2px 0',
              color: darkMode ? '#e0e0e0' : '#333',
            }}
          >
            {isPredicted ? (
              // Solid diamond shape for predicted data
              <span
                className="tooltip-marker"
                style={{
                  backgroundColor: entry.color,
                  width: '6px',
                  height: '6px',
                  transform: 'rotate(45deg)',
                  display: 'inline-block',
                }}
              />
            ) : (
              // Solid circle for actual data
              <span
                className="tooltip-marker"
                style={{
                  backgroundColor: entry.color,
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  display: 'inline-block',
                }}
              />
            )}
            <span className="tooltip-label" style={{ color: darkMode ? '#e0e0e0' : '#333' }}>
              {costLabel}:
            </span>
            <span
              className="tooltip-value"
              style={{ fontWeight: 'bold', color: darkMode ? '#e0e0e0' : '#333' }}
            >
              {`${currency}${entry.value.toLocaleString()}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.string,
  currency: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
};

function CostPredictionPage({ projectId }) {
  const [data, setData] = useState([]);
  const [selectedCosts, setSelectedCosts] = useState(['Labor', 'Materials']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currency] = useState('$');
  const [availableProjects, setAvailableProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [lastPredictedValues, setLastPredictedValues] = useState({});
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectIds = await getProjectIds();
        setAvailableProjects(projectIds.map(id => ({ value: id, label: id })));
        if (projectIds.length > 0) {
          const initialProject = projectId || projectIds[0];
          setSelectedProject({ value: initialProject, label: initialProject });
        }
      } catch {
        setError('Failed to load projects');
      }
    };
    fetchProjects();
  }, [projectId]);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedProject) return;
      setLoading(true);
      try {
        const costData = await getProjectCosts(selectedProject.value);
        setData(processDataForChart(costData));
        setLastPredictedValues(getLastPredictedValues(costData));
        setLoading(false);
      } catch {
        setError('Failed to load cost data');
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedProject]);

  const handleCostChange = selected => {
    const selectedValues = selected ? selected.map(option => option.value) : [];
    setSelectedCosts(selectedValues);
  };
  const handleProjectChange = selected => setSelectedProject(selected);

  // Pick the right dot component by name
  const getDotRenderer = category => {
    switch (category) {
      case 'Labor':
        return LaborDot;
      case 'Materials':
        return MaterialsDot;
      case 'Equipment':
        return EquipmentDot;
      case 'Total':
        return TotalDot;
      default:
        return LaborDot;
    }
  };

  // Apply dark mode styles to document body when in dark mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode-body');
    } else {
      document.body.classList.remove('dark-mode-body');
    }

    // Add dark mode CSS for chart
    if (!document.getElementById('dark-mode-styles-cost-prediction')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'dark-mode-styles-cost-prediction';
      styleElement.innerHTML = `
        .dark-mode-body .recharts-wrapper,
        .dark-mode-body .recharts-surface {
          background-color: #1e2736 !important;
        }
        .dark-mode-body .recharts-cartesian-grid-horizontal line,
        .dark-mode-body .recharts-cartesian-grid-vertical line {
          stroke: #364156 !important;
        }
        .dark-mode-body .recharts-text {
          fill: #e0e0e0 !important;
        }
        .dark-mode-body .recharts-default-legend {
          background-color: #1e2736 !important;
        }
        .dark-mode-body .recharts-legend-item-text {
          color: #e0e0e0 !important;
        }
        .dark-mode-body .recharts-tooltip-wrapper {
          background-color: transparent !important;
        }
        .dark-mode-body .cost-prediction-page {
          background-color: #1e2736 !important;
          color: #e0e0e0 !important;
        }
      `;
      document.head.appendChild(styleElement);
    }

    return () => {
      // Cleanup
      document.body.classList.remove('dark-mode-body');
    };
  }, [darkMode]);

  return (
    <div className={`${styles.costPredictionPage} ${darkMode ? 'dark-mode' : ''}`}>
      {/* ReactTooltip moved outside wrapper for better positioning */}
      <ReactTooltip
        id="cost-prediction-info"
        place="left"
        effect="solid"
        className={styles.costPredictionTooltip}
        clickable
        event="click"
        globalEventOff="click"
        delayHide={100}
        delayShow={0}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Chart Overview</div>
        <div>This chart compares planned vs actual costs across different categories.</div>
        <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
          <li>Solid lines represent actual costs for each category.</li>
          <li>Dashed lines with diamond markers represent predicted/planned costs.</li>
          <li>Hover over lines to view exact cost values.</li>
          <li>
            The dropdown filters allow you to:
            <ul style={{ paddingLeft: '16px' }}>
              <li>Select specific cost categories (multi-select).</li>
              <li>Pick a specific project.</li>
            </ul>
          </li>
          <li>
            Color coding:
            <ul style={{ paddingLeft: '16px' }}>
              <li>
                <strong>Blue</strong> – Labor costs
              </li>
              <li>
                <strong>Orange</strong> – Materials costs
              </li>
              <li>
                <strong>Purple</strong> – Equipment costs
              </li>
              <li>
                <strong>Green</strong> – Total costs
              </li>
            </ul>
          </li>
        </ul>
      </ReactTooltip>

      <div className={styles.costPredictionWrapper}>
        <div className={styles.chartTitleContainer}>
          <h2 className={styles.costPredictionTitle}>Planned v Actual Costs Tracking</h2>
          <button
            type="button"
            className={styles.costPredictionInfoButton}
            data-tip
            data-for="cost-prediction-info"
            aria-label="Chart Info"
          >
            <Info size={14} strokeWidth={2} />
          </button>
        </div>

        <div className={styles.dropdownContainer}>
          <Select
            options={availableProjects}
            value={selectedProject}
            onChange={handleProjectChange}
            placeholder="Select Project"
            classNamePrefix="custom-select"
            className={styles.dropdownItem}
            styles={
              darkMode
                ? {
                    control: baseStyles => ({
                      ...baseStyles,
                      backgroundColor: '#2c3344',
                      borderColor: '#364156',
                    }),
                    menu: baseStyles => ({
                      ...baseStyles,
                      backgroundColor: '#2c3344',
                    }),
                    option: (baseStyles, state) => ({
                      ...baseStyles,
                      backgroundColor: state.isFocused ? '#364156' : '#2c3344',
                      color: '#e0e0e0',
                    }),
                    singleValue: baseStyles => ({
                      ...baseStyles,
                      color: '#e0e0e0',
                    }),
                  }
                : {}
            }
          />

          <Select
            isMulti
            isSearchable
            options={costOptions}
            value={costOptions.filter(option => selectedCosts.includes(option.value))}
            onChange={handleCostChange}
            placeholder="All Cost Categories"
            classNamePrefix="custom-select"
            className={`${styles.dropdownItem} ${styles.multiSelect}`}
            menuPosition="fixed"
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            styles={
              darkMode
                ? {
                    control: baseStyles => ({
                      ...baseStyles,
                      backgroundColor: '#2c3344',
                      borderColor: '#364156',
                    }),
                    menu: baseStyles => ({
                      ...baseStyles,
                      backgroundColor: '#2c3344',
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
                      ':hover': { backgroundColor: '#ff4d4f', color: '#fff' },
                    }),
                  }
                : {}
            }
          />
        </div>

        <div className={styles.costPredictionChartContainer}>
          {loading && <div className={styles.costChartLoading}>Loading...</div>}
          {error && <div className={styles.costChartError}>{error}</div>}

          {!loading && !error && data.length > 0 && (
            <div style={{ height: 'calc(100% - 20px)', width: '100%', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 25, right: 10, left: 45, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#364156' : '#ccc'} />
                  <XAxis
                    dataKey="date"
                    tick={{
                      fill: darkMode ? '#e0e0e0' : '#333',
                      fontSize: 12,
                    }}
                    tickMargin={5}
                    height={25}
                  />
                  <YAxis
                    tick={{
                      fill: darkMode ? '#e0e0e0' : '#333',
                      fontSize: 12,
                    }}
                    tickFormatter={value => `${currency}${value}`}
                    width={50}
                  />
                  <Tooltip content={<CustomTooltip currency={currency} darkMode={darkMode} />} />
                  <Legend
                    verticalAlign="bottom"
                    height={15}
                    iconSize={8}
                    wrapperStyle={{
                      fontSize: 11,
                      padding: 0,
                      margin: '0 auto',
                      width: '100%',
                      textAlign: 'center',
                      lineHeight: '1.2',
                      color: darkMode ? '#e0e0e0' : '#333',
                    }}
                    align="center"
                    content={props => {
                      const { payload } = props;
                      return (
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '15px',
                            flexWrap: 'wrap',
                            fontSize: '11px',
                            color: darkMode ? '#e0e0e0' : '#333',
                          }}
                        >
                          {payload.map((entry, index) => {
                            const isPredicted = entry.value.includes('Predicted');
                            return (
                              <div
                                key={index}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                {isPredicted ? (
                                  // Solid diamond shape for predicted
                                  <div
                                    style={{
                                      width: '6px',
                                      height: '6px',
                                      backgroundColor: entry.color,
                                      transform: 'rotate(45deg)',
                                    }}
                                  />
                                ) : (
                                  // Solid circle for actual
                                  <div
                                    style={{
                                      width: '8px',
                                      height: '8px',
                                      backgroundColor: entry.color,
                                      borderRadius: '50%',
                                    }}
                                  />
                                )}
                                <span style={{ color: darkMode ? '#e0e0e0' : '#333' }}>
                                  {entry.value}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }}
                  />

                  {/* Reference Lines for Last Predicted Values */}
                  {(selectedCosts.length > 0
                    ? selectedCosts
                    : ['Labor', 'Materials']
                  ).map(category =>
                    lastPredictedValues[category] ? (
                      <ReferenceLine
                        key={`ref-${category}`}
                        y={lastPredictedValues[category]}
                        stroke={costColors[category]}
                        strokeWidth={1.5}
                      />
                    ) : null,
                  )}

                  {/* Dynamically render lines based on selected costs */}
                  {(selectedCosts.length > 0 ? selectedCosts : ['Labor', 'Materials']).map(
                    category => (
                      <Fragment key={`${category}-container`}>
                        {/* Actual cost line */}
                        <Line
                          key={category}
                          type="linear"
                          dataKey={category}
                          name={`${category} Cost`}
                          stroke={costColors[category]}
                          strokeWidth={2}
                          connectNulls={true}
                          dot={{
                            r: 3,
                            fill: costColors[category],
                            stroke: costColors[category],
                            strokeWidth: 0,
                          }}
                          activeDot={{
                            r: 4,
                            fill: costColors[category],
                            stroke: costColors[category],
                            strokeWidth: 0,
                          }}
                          isAnimationActive={false}
                        />
                        {/* Predicted cost line */}
                        <Line
                          key={`${category}Predicted`}
                          type="linear"
                          dataKey={`${category}Predicted`}
                          name={`${category} Cost (Predicted)`}
                          stroke={costColors[category]}
                          strokeWidth={2}
                          strokeDasharray="8 4"
                          connectNulls={true}
                          dot={getDotRenderer(category)}
                          activeDot={{ r: 4 }}
                          isAnimationActive={false}
                        />
                      </Fragment>
                    ),
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {!loading && !error && data.length === 0 && (
            <div
              className={styles.costChartEmpty}
              style={{ color: darkMode ? '#e0e0e0' : 'inherit' }}
            >
              <p>No data available</p>
            </div>
          )}
        </div>

        {/* Fixed label below chart */}
        <div className={styles.chartLegend}>
          <span>📊 Actual Costs</span>
          <span>vs</span>
          <span>📈 Predicted Costs</span>
        </div>
      </div>
    </div>
  );
}

CostPredictionPage.propTypes = {
  projectId: PropTypes.string,
};

export default CostPredictionPage;
