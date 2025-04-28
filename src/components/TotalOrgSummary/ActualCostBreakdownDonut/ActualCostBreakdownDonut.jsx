import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Tooltip, Cell, Legend } from 'recharts';
import axios from 'axios';
import { ApiEndpoint } from 'utils/URL'; // Your API base

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50'];

const categories = ['plumbing', 'electrical', 'structural', 'mechanical'];

const ActualCostBreakdownDonut = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [data, setData] = useState([]);
  const [percentageChange, setPercentageChange] = useState(0);

  // Fetch all projects initially
  useEffect(() => {
    axios.get(`${ApiEndpoint}/projects`)
      .then(res => setProjects(res.data))
      .catch(err => console.error('Error fetching projects:', err));
  }, []);

  // Fetch cost breakdown when a project is selected
  useEffect(() => {
    if (selectedProjectId) {
      axios.get(`${ApiEndpoint}/projects/${selectedProjectId}/actual-cost-breakdown`)
        .then(res => {
          const { current, previousMonthTotal } = res.data;

          const chartData = categories.map((cat) => ({
            name: cat,
            value: current[cat.toLowerCase()] || 0,
          }));

          const total = chartData.reduce((sum, item) => sum + item.value, 0);
          const percentChange = previousMonthTotal
            ? (((total - previousMonthTotal) / previousMonthTotal) * 100).toFixed(2)
            : 0;

          setData(chartData);
          setPercentageChange(percentChange);
        })
        .catch(err => console.error('Error fetching cost breakdown:', err));
    }
  }, [selectedProjectId]);

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h3>Actual Cost Breakdown by Type of Expenditure</h3>

      {/* Project Dropdown */}
      <div style={{ marginBottom: '20px' }}>
        <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
          <option value="">Select a Project</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.projectName}
            </option>
          ))}
        </select>
      </div>
      

      {/* Only show chart if project selected */}
      {selectedProjectId && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <PieChart width={400} height={400}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`$${value}`, name]} />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          </PieChart>

          {/* Center Text */}
          <div style={{
            position: 'absolute',
            top: '55%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            {percentageChange}% vs Last Month
          </div>
        </div>
      )}
    </div>
  );
};

export default ActualCostBreakdownDonut;
