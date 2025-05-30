import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import './InjuriesDashboard.css';

function InjuriesOverTimeChart() {
  const [uniqueProjectIds, setUniqueProjectIds] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [injuryTypes, setInjuryTypes] = useState([]);
  const [selectedInjuryTypes, setSelectedInjuryTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [severityLevels, setSeverityLevels] = useState([]);
  const [selectedSeverityLevels, setSelectedSeverityLevels] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch projects
        const projectsResponse = await axios.get(ENDPOINTS.BM_PROJECTS);
        if (projectsResponse.data && Array.isArray(projectsResponse.data)) {
          const projectIds = projectsResponse.data.map(project => project._id);
          setUniqueProjectIds(projectIds);
        }

        // Fetch filter options
        const filterOptionsResponse = await axios.get(ENDPOINTS.INJURIES_FILTER_OPTIONS);
        if (filterOptionsResponse.data) {
          setInjuryTypes(filterOptionsResponse.data.injuryTypes || []);
          setDepartments(filterOptionsResponse.data.departments || []);
          setSeverityLevels(filterOptionsResponse.data.severityLevels || []);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Failed to load initial data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch injuries data when filters change
  useEffect(() => {
    if (selectedProject && fromDate && toDate) {
      fetchInjuriesData();
    }
  }, [selectedProject, fromDate, toDate, selectedInjuryTypes, selectedDepartments, selectedSeverityLevels]);

  const fetchInjuriesData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        projectId: selectedProject,
        startDate: fromDate,
        endDate: toDate,
      });

      if (selectedInjuryTypes.length > 0) {
        params.append('types', selectedInjuryTypes.join(','));
      }
      if (selectedDepartments.length > 0) {
        params.append('departments', selectedDepartments.join(','));
      }
      if (selectedSeverityLevels.length > 0) {
        params.append('severities', selectedSeverityLevels.join(','));
      }

      const url = `${ENDPOINTS.INJURIES_OVER_TIME}?${params.toString()}`;
      const response = await axios.get(url);
      
      if (response.data && Array.isArray(response.data)) {
        // Format dates for display
        const formattedData = response.data.map(item => ({
          ...item,
          displayDate: new Date(item.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })
        }));
        setChartData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching injuries data:', error);
      setError('Failed to load injuries data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
  };

  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
  };

  const handleMultiSelectChange = (value, selectedArray, setSelectedArray) => {
    if (selectedArray.includes(value)) {
      setSelectedArray(selectedArray.filter(item => item !== value));
    } else {
      setSelectedArray([...selectedArray, value]);
    }
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="injuries-custom-tooltip">
          <p className="label">{label}</p>
          <p className="value">Total Injuries: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  // Display error message if there's an error
  if (error) {
    return (
      <div className="injuries-chart-container">
        <h2 className="chart-title">Total Injuries Over Time</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="injuries-chart-container">
      <h2 className="chart-title">Total Injuries Over Time</h2>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="project-select">Project:</label>
            <select 
              id="project-select" 
              value={selectedProject} 
              onChange={handleProjectChange}
              className="filter-select"
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
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="to-date">To:</label>
            <input 
              id="to-date" 
              type="date" 
              value={toDate} 
              onChange={handleToDateChange}
              className="filter-input"
            />
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group multi-select">
            <label>Injury Types:</label>
            <div className="checkbox-group">
              {injuryTypes.map(type => (
                <label key={type} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedInjuryTypes.includes(type)}
                    onChange={() => handleMultiSelectChange(type, selectedInjuryTypes, setSelectedInjuryTypes)}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group multi-select">
            <label>Departments:</label>
            <div className="checkbox-group">
              {departments.map(dept => (
                <label key={dept} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedDepartments.includes(dept)}
                    onChange={() => handleMultiSelectChange(dept, selectedDepartments, setSelectedDepartments)}
                  />
                  {dept}
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group multi-select">
            <label>Severity Levels:</label>
            <div className="checkbox-group">
              {severityLevels.map(level => (
                <label key={level} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedSeverityLevels.includes(level)}
                    onChange={() => handleMultiSelectChange(level, selectedSeverityLevels, setSelectedSeverityLevels)}
                  />
                  {level}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-container">
        {loading ? (
          <div className="loading">Loading injuries data...</div>
        ) : !selectedProject || !fromDate || !toDate ? (
          <div className="select-filters-message">
            Please select a project and date range to view injuries data.
          </div>
        ) : chartData.length === 0 ? (
          <div className="no-data-message">
            No injuries data available for the selected criteria.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="displayDate" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                label={{ value: 'Total Injuries', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="totalInjuries" 
                stroke="#ff7300"
                strokeWidth={2}
                dot={{ fill: '#ff7300', r: 4 }}
                activeDot={{ r: 6 }}
                name="Total Injuries"
              >
                <LabelList 
                  dataKey="totalInjuries" 
                  position="top" 
                  style={{ fontSize: '12px', fill: '#333' }}
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default InjuriesOverTimeChart;