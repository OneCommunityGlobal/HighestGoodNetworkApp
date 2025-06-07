import { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Text,
} from 'recharts';
import {
  getAllProjectsCostBreakdown,
  getProjectCostBreakdown,
  getCostBreakdownByDateRange,
} from '../../../../../actions/bmdashboard/costBreakdownActions';


// --- Helper Components ---
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        style={{
          backgroundColor: "white",
          padding: "8px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          fontSize: "12px",
        }}
      >
        <p style={{ color: data.fill, fontWeight: "bold", margin: "0 0 4px 0" }}>
          {data.label}
        </p>
        <p style={{ margin: 0 }}>{`Cost: $${data.value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

const CenteredMetric = ({ cx, cy, projectData }) => {
  if (!projectData) return null;

  const { projectName, totalCost, percentageChange } = projectData;

  return (
    <>
      <Text
        x={cx}
        y={cy - 15}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="14"
        fontWeight="bold"
        fill="#333"
      >
        {projectName}
      </Text>
      <Text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
        fill="#333"
      >
        Total Cost:
      </Text>
      <Text
        x={cx}
        y={cy + 15}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="16"
        fontWeight="bold"
        fill="#333"
      >
        ${totalCost.toLocaleString()}
      </Text>
      {percentageChange && (
        <Text
          x={cx}
          y={cy + 30}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="10"
          fill="#666"
        >
          {percentageChange}
        </Text>
      )}
    </>
  );
};

const CostBreakdownPieChart = ({ data }) => {
  if (!data) return null;

  return (
    <div style={{ display: "flex", height: "240px", alignItems: "center" }}>
      {/* Chart Container - Left (20% bigger) */}
      <div style={{ width: "290px", height: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.breakdown}
              cx="50%"
              cy="50%"
              innerRadius="35%"
              outerRadius="75%"
              paddingAngle={2}
              dataKey="value"
              nameKey="label"
            >
              {data.breakdown.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {/* Centered Text */}
            <CenteredMetric cx="50%" cy="50%" projectData={data} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Container - Right */}
      <div
        style={{
          width: "110px",
          paddingLeft: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {data.breakdown.map((entry, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: entry.fill,
                marginRight: "8px",
                borderRadius: "2px",
              }}
            ></div>
            <span
              style={{
                fontSize: "11px",
                color: "#333",
                lineHeight: "1.2",
              }}
            >
              {entry.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const CostDonutChartComponent = () => {
  const dispatch = useDispatch();
  const { data: costBreakdownData, fetching, error } = useSelector(
    state => state.costBreakdown
  );
  
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [dateRange, setDateRange] = useState('ALL');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  // Fetch initial data
  useEffect(() => {
    dispatch(getAllProjectsCostBreakdown());
  }, [dispatch]);

  // Transform API data to match your component's expected format
  const chartData = useMemo(() => {
    if (!costBreakdownData) return null;

    return {
      projectName: costBreakdownData.projectName || 'Cost Breakdown',
      totalCost: costBreakdownData.totalCost || 0,
      percentageChange: costBreakdownData.percentageChange || '',
      breakdown: costBreakdownData.breakdown || [],
    };
  }, [costBreakdownData]);

  // Handle project change
  const handleProjectChange = event => {
    const projectId = event.target.value;
    setSelectedProjectId(projectId);

    if (dateRange === 'CUSTOM' && customDateRange.startDate && customDateRange.endDate) {
      dispatch(getCostBreakdownByDateRange(
        customDateRange.startDate,
        customDateRange.endDate,
        projectId === 'all' ? null : projectId
      ));
    } else if (projectId === 'all') {
      dispatch(getAllProjectsCostBreakdown());
    } else {
      dispatch(getProjectCostBreakdown(projectId));
    }
  };

  // Handle date range change
  const handleDateChange = event => {
    const range = event.target.value;
    setDateRange(range);

    if (range === 'ALL') {
      if (selectedProjectId === 'all') {
        dispatch(getAllProjectsCostBreakdown());
      } else {
        dispatch(getProjectCostBreakdown(selectedProjectId));
      }
    }
    // Handle other date ranges as needed
  };

  // Handle custom date range
  const handleCustomDateSubmit = () => {
    if (customDateRange.startDate && customDateRange.endDate) {
      dispatch(getCostBreakdownByDateRange(
        customDateRange.startDate,
        customDateRange.endDate,
        selectedProjectId === 'all' ? null : selectedProjectId
      ));
    }
  };

  if (fetching) {
    return (
      <div style={{ 
        width: '400px', 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        width: '400px', 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'red'
      }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div
      style={{
        width: '400px',
        height: '400px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        fontFamily: 'Arial, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      {/* Title */}
      <h2
        style={{
          textAlign: 'center',
          marginBottom: '15px',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#333',
          margin: '0 0 15px 0',
        }}
      >
        Cost Breakdown by Category
      </h2>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '15px',
          paddingBottom: '8px',
        }}
      >
        {/* Project Filter */}
        <div>
          <label htmlFor="project-filter" style={{ fontWeight: 'bold', fontSize: '12px' }}>
            Project
          </label>
          <select
            id="project-filter"
            value={selectedProjectId}
            onChange={handleProjectChange}
            style={{
              padding: '6px 8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '12px',
              width: '100px',
              backgroundColor: 'white',
              marginTop: '6px',
            }}
          >
            <option value="all">All Projects</option>
            {/* Add your project options here */}
          </select>
        </div>

        {/* Date Filter */}
        <div style={{ textAlign: 'right' }}>
          <label htmlFor="date-filter" style={{ fontWeight: 'bold', fontSize: '12px' }}>
            Dates
          </label>
          <select
            id="date-filter"
            value={dateRange}
            onChange={handleDateChange}
            style={{
              padding: '6px 8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '12px',
              width: '60px',
              backgroundColor: 'white',
              marginTop: '6px',
            }}
          >
            <option value="ALL">ALL</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </div>
      </div>

      {/* Custom Date Range Inputs */}
      {dateRange === 'CUSTOM' && (
        <div style={{ marginBottom: '15px', fontSize: '12px' }}>
          <input
            type="date"
            value={customDateRange.startDate}
            onChange={e => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            style={{ marginRight: '8px', padding: '4px' }}
          />
          <input
            type="date"
            value={customDateRange.endDate}
            onChange={e => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            style={{ marginRight: '8px', padding: '4px' }}
          />
          <button onClick={handleCustomDateSubmit} style={{ padding: '4px 8px', fontSize: '10px' }}>
            Apply
          </button>
        </div>
      )}

      {/* Chart */}
      <CostBreakdownPieChart data={chartData} />
    </div>
  );
};

export default CostDonutChartComponent;