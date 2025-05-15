import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import './CostBreakdownChart.css';

// Color scheme for the donut chart - fixed color for each category
const CATEGORY_COLORS = {
  plumbing: '#0088FE',
  electrical: '#00C49F',
  structural: '#FFBB28',
  mechanical: '#FF8042'
};

const CATEGORY_NAMES = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  structural: 'Structural',
  mechanical: 'Mechanical'
};

const CostBreakdownChart = () => {
  const [uniqueProjectIds, setUniqueProjectIds] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [costData, setCostData] = useState({
    current: {},
    previousMonthTotal: 0,
    currentTotal: 0,
    percentageChange: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        console.log("Fetching expenditure data from:", ENDPOINTS.GET_ALL_EXPENDITURES);
        const response = await axios.get(ENDPOINTS.GET_ALL_EXPENDITURES);
        console.log("Expenditure response:", response.data);
        
        if (response.data.success && Array.isArray(response.data.data)) {
          const { data } = response.data;
          
          // Extract unique project IDs
          const projectIds = [...new Set(data.map(item => item.projectId))];
          setUniqueProjectIds(projectIds);
          
          // Don't set a default project - user must select one explicitly
        } else {
          throw new Error("Invalid data format received from server");
        }
      } catch (error) {
        console.error('Error fetching project data:', error);
        setError('Failed to load project data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
    // Don't set default dates - user must select explicitly
  }, []);

  // Format date as YYYY-MM-DD
  const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };

  // Fetch cost data when filters change
  useEffect(() => {
    if (selectedProject && fromDate && toDate) {
      fetchCostData();
    }
  }, [selectedProject, fromDate, toDate]);

  // Fetch cost data from the API
  const fetchCostData = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${ENDPOINTS.ACTUAL_COST_BREAKDOWN(selectedProject)}?fromDate=${fromDate}&toDate=${toDate}`;
      console.log("Fetching cost data from API:", url);
      
      const response = await axios.get(url);
      console.log("Cost data response:", response.data);
      
      setCostData(response.data);
    } catch (error) {
      console.error('Error fetching cost breakdown data:', error);
      setError('Failed to load cost data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle project selection change
  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
  };

  // Handle date changes
  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
  };

  // Prepare data for the chart - only include categories that exist in the data
  const chartData = Object.entries(costData.current || {}).map(([key, value]) => ({
    name: CATEGORY_NAMES[key] || key,
    value: value,
    category: key
  })).filter(item => item.value > 0);

  // Calculate percentages for each category
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const chartDataWithPercentage = chartData.map(item => ({
    ...item,
    percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : 0
  }));

  // Custom tooltip component for the chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="cost-breakdown-tooltip">
          <p className="category">{data.name}</p>
          <p className="value">${data.value.toLocaleString()}</p>
          <p className="percentage">{data.percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  // Display error message if there's an error
  if (error) {
    return (
      <div className="cost-breakdown-container">
        <h2 className="chart-title">Actual Cost Breakdown by Type of Expenditure</h2>
        <div className="error-message">{error}</div>
        <div className="filter-container">
          <div className="filter-group">
            <label htmlFor="project-select">Project:</label>
            <select 
              id="project-select" 
              value={selectedProject} 
              onChange={handleProjectChange}
            >
              <option value="">Select a project</option>
              {uniqueProjectIds.map(projectId => (
                <option key={projectId} value={projectId}>
                  {projectId}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="from-date">From:</label>
            <input 
              id="from-date" 
              type="date" 
              value={fromDate} 
              onChange={handleFromDateChange}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="to-date">To:</label>
            <input 
              id="to-date" 
              type="date" 
              value={toDate} 
              onChange={handleToDateChange} 
            />
          </div>
        </div>
      </div>
    );
  }

  // Display message when no filters are selected
  if (!selectedProject || !fromDate || !toDate) {
    return (
      <div className="cost-breakdown-container">
        <h2 className="chart-title">Actual Cost Breakdown by Type of Expenditure</h2>
        <div className="filter-container">
          <div className="filter-group">
            <label htmlFor="project-select">Project:</label>
            <select 
              id="project-select" 
              value={selectedProject} 
              onChange={handleProjectChange}
            >
              <option value="">Select a project</option>
              {uniqueProjectIds.map(projectId => (
                <option key={projectId} value={projectId}>
                  {projectId}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="from-date">From:</label>
            <input 
              id="from-date" 
              type="date" 
              value={fromDate} 
              onChange={handleFromDateChange}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="to-date">To:</label>
            <input 
              id="to-date" 
              type="date" 
              value={toDate} 
              onChange={handleToDateChange} 
            />
          </div>
        </div>
        <div className="select-filters-message">
          Please select a project and date range to view cost breakdown data.
        </div>
      </div>
    );
  }

  // No data message
  if (!loading && chartData.length === 0 && selectedProject) {
    return (
      <div className="cost-breakdown-container">
        <h2 className="chart-title">Actual Cost Breakdown by Type of Expenditure</h2>
        <div className="filter-container">
          <div className="filter-group">
            <label htmlFor="project-select">Project:</label>
            <select 
              id="project-select" 
              value={selectedProject} 
              onChange={handleProjectChange}
            >
              <option value="">Select a project</option>
              {uniqueProjectIds.map(projectId => (
                <option key={projectId} value={projectId}>
                  {projectId}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="from-date">From:</label>
            <input 
              id="from-date" 
              type="date" 
              value={fromDate} 
              onChange={handleFromDateChange}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="to-date">To:</label>
            <input 
              id="to-date" 
              type="date" 
              value={toDate} 
              onChange={handleToDateChange} 
            />
          </div>
        </div>
        <div className="no-data-message">
          No cost data available for the selected project and date range.
        </div>
      </div>
    );
  }

  return (
    <div className="cost-breakdown-container">
      <h2 className="chart-title">Actual Cost Breakdown by Type of Expenditure</h2>
      
      <div className="filter-container">
        <div className="filter-group">
          <label htmlFor="project-select">Project:</label>
          <select 
            id="project-select" 
            value={selectedProject} 
            onChange={handleProjectChange}
          >
            <option value="">Select a project</option>
            {uniqueProjectIds.map(projectId => (
              <option key={projectId} value={projectId}>
                {projectId}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="from-date">From:</label>
          <input 
            id="from-date" 
            type="date" 
            value={fromDate} 
            onChange={handleFromDateChange}
          />
        </div>
        
        <div className="filter-group">
          <label htmlFor="to-date">To:</label>
          <input 
            id="to-date" 
            type="date" 
            value={toDate} 
            onChange={handleToDateChange} 
          />
        </div>
      </div>
      
      <div className="chart-container">
        {loading ? (
          <div className="loading">Loading cost breakdown data...</div>
        ) : chartDataWithPercentage.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartDataWithPercentage}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                label={({ name, percentage }) => `${name}: ${percentage}%`}
              >
                {chartDataWithPercentage.map((entry) => (
                  <Cell 
                    key={`cell-${entry.category}`} 
                    fill={CATEGORY_COLORS[entry.category] || '#999999'} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Center text showing percentage change */}
              {costData.percentageChange !== undefined && (
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`percentage-change ${costData.percentageChange >= 0 ? 'positive' : 'negative'}`}
                  style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    fill: costData.percentageChange >= 0 ? '#4caf50' : '#f44336'
                  }}
                >
                  {`${costData.percentageChange >= 0 ? '+' : ''}${costData.percentageChange.toFixed(1)}%`}
                  <tspan x="50%" dy="20" fontSize="12px">vs prev period</tspan>
                </text>
              )}
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data-message">
            No cost data available for the selected project and date range.
          </div>
        )}
      </div>
    </div>
  );
};

export default CostBreakdownChart;