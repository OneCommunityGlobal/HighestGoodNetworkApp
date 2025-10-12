import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Input, Label, Row, Col, Alert, Spinner } from 'reactstrap';
import { fetchProjects, fetchPlannedCostBreakdown } from './plannedCostService';
import './PlannedCostDonutChart.module.css';

const COLORS = {
  Plumbing: '#FF6384',
  Electrical: '#36A2EB',
  Structural: '#FFCE56',
  Mechanical: '#4BC0C0',
};

const RADIAN = Math.PI / 180;

const CustomTooltip = ({ active, payload, totalCost }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percentage = ((data.value / totalCost) * 100).toFixed(1);

    return (
      <div className="planned-cost-tooltip">
        <p className="tooltip-category">{data.name}</p>
        <p className="tooltip-cost">Planned Cost: ${data.value.toLocaleString()}</p>
        <p className="tooltip-percentage">Percentage: {percentage}%</p>
      </div>
    );
  }
  return null;
};

const PlannedCostDonutChart = () => {
  const [selectedProject, setSelectedProject] = useState('');
  const [chartData, setChartData] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);

  const darkMode = useSelector(state => state.theme?.darkMode);

  // Fetch projects list
  useEffect(() => {
    const getProjects = async () => {
      try {
        const projectsData = await fetchProjects();
        setProjects(projectsData);
      } catch (err) {
        setError(err.message);
      }
    };

    getProjects();
  }, []);

  // Fetch planned cost breakdown when project changes
  useEffect(() => {
    if (!selectedProject) {
      setChartData([]);
      setTotalCost(0);
      return;
    }

    const getPlannedCostBreakdown = async () => {
      setLoading(true);
      setError(null);

      try {
        const breakdown = await fetchPlannedCostBreakdown(selectedProject);

        // Transform data for the chart - handle both array and object formats
        let transformedData = [];
        let total = 0;

        if (Array.isArray(breakdown)) {
          // If backend returns array of objects like [{category: 'Plumbing', plannedCost: 5500}, ...]
          const categoryMap = {};
          breakdown.forEach(item => {
            if (item.category && typeof item.plannedCost === 'number') {
              categoryMap[item.category] = item.plannedCost;
            }
          });

          transformedData = [
            { name: 'Plumbing', value: categoryMap.Plumbing || 0 },
            { name: 'Electrical', value: categoryMap.Electrical || 0 },
            { name: 'Structural', value: categoryMap.Structural || 0 },
            { name: 'Mechanical', value: categoryMap.Mechanical || 0 },
          ];

          total = Object.values(categoryMap).reduce((sum, cost) => sum + cost, 0);
        } else {
          // If backend returns object like {total: 90000, breakdown: {plumbing: 5500, ...}}
          if (breakdown.total && breakdown.breakdown) {
            // Use the total from backend and breakdown for chart data
            // Handle case-insensitive matching
            const breakdownData = breakdown.breakdown;

            // Check if we actually have valid data
            const hasValidData = Object.values(breakdownData).some(
              value => typeof value === 'number' && value > 0,
            );

            if (hasValidData) {
              transformedData = [
                { name: 'Plumbing', value: breakdownData.Plumbing || breakdownData.plumbing || 0 },
                {
                  name: 'Electrical',
                  value: breakdownData.Electrical || breakdownData.electrical || 0,
                },
                {
                  name: 'Structural',
                  value: breakdownData.Structural || breakdownData.structural || 0,
                },
                {
                  name: 'Mechanical',
                  value: breakdownData.Mechanical || breakdownData.mechanical || 0,
                },
              ];

              total = breakdown.total; // Use the total from backend
            } else {
              // No valid data available
              transformedData = [];
              total = 0;
            }
          } else {
            // Fallback to old format
            transformedData = [
              { name: 'Plumbing', value: breakdown.plumbing || 0 },
              { name: 'Electrical', value: breakdown.electrical || 0 },
              { name: 'Structural', value: breakdown.structural || 0 },
              { name: 'Mechanical', value: breakdown.mechanical || 0 },
            ];

            total = Object.values(breakdown).reduce((sum, cost) => sum + (cost || 0), 0);
          }
        }

        setChartData(transformedData);
        setTotalCost(total);
      } catch (err) {
        setError(err.message);
        setChartData([]);
        setTotalCost(0);
      } finally {
        setLoading(false);
      }
    };

    getPlannedCostBreakdown();
  }, [selectedProject]);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    value,
  }) => {
    if (value === 0) return null;

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
      </text>
    );
  };

  if (error && !selectedProject) {
    return (
      <div className="planned-cost-container">
        <Alert color="danger">{error}</Alert>
      </div>
    );
  }

  return (
    <div className={`planned-cost-container ${darkMode ? 'dark-mode' : ''}`}>
      <h2 className="chart-title">Planned Cost Breakdown by Type of Expenditure</h2>

      {/* Project Filter */}
      <Row className="filter-section">
        <Col md="6">
          <Label for="project-select">Select Project</Label>
          <Input
            id="project-select"
            type="select"
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            className="project-select"
          >
            <option value="">Choose a project...</option>
            {projects.map(project => (
              <option key={project._id} value={project._id}>
                {project.name || project.projectName}
              </option>
            ))}
          </Input>
        </Col>
      </Row>

      {/* Chart Area */}
      <div className="chart-area">
        {loading ? (
          <div className="loading-container">
            <Spinner color="primary" />
            <p>Loading planned cost data...</p>
          </div>
        ) : selectedProject && chartData.length > 0 && totalCost > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={150}
                  paddingAngle={2}
                  dataKey="value"
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                  ))}
                </Pie>

                <Tooltip content={<CustomTooltip totalCost={totalCost} />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center display showing total */}
            <div className="chart-center-info">
              <div className="total-cost-display">
                <span className="total-label">Total Planned Cost</span>
                <span className="total-amount">${totalCost.toLocaleString()}</span>
              </div>
            </div>

            {/* Legend */}
            <div className="legend-container">
              <div className="legend-items">
                {chartData.map((entry, index) => (
                  <div key={entry.name} className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: COLORS[entry.name] }} />
                    <span className="legend-label">{entry.name}</span>
                    <span className="legend-value">
                      ${entry.value.toLocaleString()} (
                      {((entry.value / totalCost) * 100).toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : selectedProject ? (
          <div className="no-data-container">
            <p>No planned cost data available for this project.</p>
          </div>
        ) : (
          <div className="select-project-container">
            <p>Please select a project to view the planned cost breakdown.</p>
          </div>
        )}
      </div>

      {error && (
        <Alert color="danger" className="mt-3">
          {error}
        </Alert>
      )}
    </div>
  );
};

export default PlannedCostDonutChart;
