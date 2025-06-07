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

// Generate fixed mock data
const mockData = [
  { date: 'Jan 2024', laborCost: 120, materialsCost: 80, equipmentCost: 50, isPrediction: false },
  { date: 'Feb 2024', laborCost: 180, materialsCost: 100, equipmentCost: 60, isPrediction: false },
  { date: 'Mar 2024', laborCost: 240, materialsCost: 160, equipmentCost: 80, isPrediction: false },
  { date: 'Apr 2024', laborCost: 300, materialsCost: 200, equipmentCost: 120, isPrediction: false },
  { date: 'May 2024', laborCost: 380, materialsCost: 230, equipmentCost: 150, isPrediction: false },
  { date: 'Jun 2024', laborCost: 450, materialsCost: 280, equipmentCost: 170, isPrediction: false },
  { date: 'Jul 2024', laborCost: 520, materialsCost: 320, equipmentCost: 190, isPrediction: false },
  { date: 'Aug 2024', laborCost: 580, materialsCost: 360, equipmentCost: 210, isPrediction: false },
  { date: 'Sep 2024', laborCost: 650, materialsCost: 400, equipmentCost: 230, isPrediction: false },
  { date: 'Oct 2024', laborCost: 700, materialsCost: 430, equipmentCost: 250, isPrediction: false },
  { date: 'Nov 2024', laborCost: 750, materialsCost: 470, equipmentCost: 260, isPrediction: true },
  { date: 'Dec 2024', laborCost: 800, materialsCost: 510, equipmentCost: 280, isPrediction: true },
  { date: 'Jan 2025', laborCost: 850, materialsCost: 550, equipmentCost: 300, isPrediction: true },
  { date: 'Feb 2025', laborCost: 900, materialsCost: 590, equipmentCost: 320, isPrediction: true },
  { date: 'Mar 2025', laborCost: 950, materialsCost: 630, equipmentCost: 340, isPrediction: true },
  { date: 'Apr 2025', laborCost: 1000, materialsCost: 670, equipmentCost: 360, isPrediction: true },
  { date: 'May 2025', laborCost: 1050, materialsCost: 710, equipmentCost: 380, isPrediction: true },
  { date: 'Jun 2025', laborCost: 1100, materialsCost: 750, equipmentCost: 400, isPrediction: true },
];

// Add total cost for each entry
const mockDataWithTotal = mockData.map(item => ({
  ...item,
  totalCost: item.laborCost + item.materialsCost + item.equipmentCost,
}));

// Cost category options
const costOptions = [
  { value: 'laborCost', label: 'Labor Cost' },
  { value: 'materialsCost', label: 'Materials Cost' },
  { value: 'equipmentCost', label: 'Equipment Cost' },
  { value: 'totalCost', label: 'Total Cost' },
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

        if (entry.dataKey === 'laborCost') costLabel = 'Labor Cost';
        else if (entry.dataKey === 'materialsCost') costLabel = 'Materials Cost';
        else if (entry.dataKey === 'equipmentCost') costLabel = 'Equipment Cost';
        else if (entry.dataKey === 'totalCost') costLabel = 'Total Cost';

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

function CostPredictionChart({ darkMode, isFullPage = false }) {
  console.log('Rendering CostPredictionChart', { darkMode, isFullPage });

  const [data, setData] = useState([]);
  const [selectedCosts, setSelectedCosts] = useState([
    { value: 'laborCost', label: 'Labor Cost' },
    { value: 'materialsCost', label: 'Materials Cost' },
  ]);
  const [loading, setLoading] = useState(true);
  const [currency] = useState('$'); // Currency symbol
  const [plannedBudget] = useState(2250); // Mock planned budget
  const history = useHistory();

  // Load mock data on component mount
  useEffect(() => {
    console.log('Loading data...');
    setData(mockDataWithTotal);
    setLoading(false);
  }, []);

  // Log when data changes
  useEffect(() => {
    console.log('Data updated:', data);
  }, [data]);

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

  // Define line colors
  const costColors = {
    laborCost: '#4589FF',
    materialsCost: '#FF6A00',
    equipmentCost: '#8A2BE2',
    totalCost: '#3CB371',
  };

  // Simple function to render dots
  const renderDot = dataKey => props => {
    const { cx, cy, payload, index } = props;
    if (!payload || payload.isPrediction) return null;
    return (
      <circle key={`dot-${dataKey}-${index}`} cx={cx} cy={cy} r={4} fill={costColors[dataKey]} />
    );
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

        {!loading && data.length > 0 && (
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
                  tickFormatter={value => value.split(' ')[0]}
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

                {/* Only show Labor and Materials cost in card view */}
                <Line
                  key="laborCost"
                  type="monotone"
                  dataKey="laborCost"
                  name="Labor Cost"
                  stroke={costColors.laborCost}
                  strokeWidth={2}
                  dot={props => {
                    const { cx, cy, payload } = props;
                    if (!payload || payload.isPrediction) return null;
                    return <circle cx={cx} cy={cy} r={2} fill={costColors.laborCost} />;
                  }}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                  strokeDasharray={payload => (payload && payload.isPrediction ? '5 5' : '0')}
                />
                <Line
                  key="materialsCost"
                  type="monotone"
                  dataKey="materialsCost"
                  name="Materials Cost"
                  stroke={costColors.materialsCost}
                  strokeWidth={2}
                  dot={props => {
                    const { cx, cy, payload } = props;
                    if (!payload || payload.isPrediction) return null;
                    return <circle cx={cx} cy={cy} r={2} fill={costColors.materialsCost} />;
                  }}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                  strokeDasharray={payload => (payload && payload.isPrediction ? '5 5' : '0')}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {!loading && data.length === 0 && (
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

      <div className="cost-chart-filters">
        <div className="filter-group">
          <label style={darkMode ? { color: '#e0e0e0' } : {}}>Cost Categories</label>
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
                      ':hover': {
                        backgroundColor: '#ff4d4f',
                        color: '#fff',
                      },
                    }),
                  }
                : {}
            }
          />
        </div>
        <div className="cost-currency">
          <span style={darkMode ? { color: '#e0e0e0' } : {}}>Currency: {currency}</span>
        </div>
      </div>

      {loading && <div className="cost-chart-loading">Loading cost prediction data...</div>}

      {!loading && (
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
              <ReferenceLine
                y={plannedBudget}
                stroke="#00C853"
                strokeDasharray="3 3"
                label={{
                  value: `Planned Budget: ${currency}${plannedBudget}`,
                  fill: darkMode ? '#e0e0e0' : '#333',
                  position: 'top',
                }}
              />

              {selectedCosts.map(cost => {
                const dataKey = cost.value;
                return (
                  <Line
                    key={dataKey}
                    type="monotone"
                    dataKey={dataKey}
                    name={cost.label}
                    stroke={costColors[dataKey]}
                    strokeWidth={2}
                    dot={props => {
                      const { cx, cy, payload, index } = props;
                      if (!payload) return null;
                      // Different markers for actual vs predicted data
                      if (payload.isPrediction) {
                        // Diamond marker for predictions
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
                      }
                      // Circle for actual data
                      return (
                        <circle
                          key={`dot-${dataKey}-${index}`}
                          cx={cx}
                          cy={cy}
                          r={4}
                          fill={costColors[dataKey]}
                        />
                      );
                    }}
                    activeDot={{ r: 6 }}
                    isAnimationActive={false}
                    strokeDasharray={payload => (payload && payload.isPrediction ? '5 5' : '0')}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>

          <div
            className="chart-legend-container"
            style={{ marginTop: '20px', textAlign: 'center' }}
          >
            <div className="chart-legend-item">
              <span className="legend-marker" style={{ backgroundColor: '#00C853' }}></span>
              <span className="legend-label" style={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>
                Planned Budget
              </span>
            </div>
            <div className="chart-legend-item">
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
          </div>
        </div>
      )}

      {!loading && data.length === 0 && (
        <div className="cost-chart-empty" style={{ color: darkMode ? '#e0e0e0' : 'inherit' }}>
          <p>No data available for the selected filters.</p>
        </div>
      )}
    </div>
  );
}

export default CostPredictionChart;
