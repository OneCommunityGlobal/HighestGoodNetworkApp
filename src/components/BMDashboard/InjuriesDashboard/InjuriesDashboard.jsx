/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-console */
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
} from 'recharts';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import './InjuriesDashboard.css';
import { ENDPOINTS } from 'utils/URL';

function InjuriesDashboard() {
  // State for chart data
  const [chartData, setChartData] = useState([]);

  // State for filter options
  const [projects, setProjects] = useState([]);
  const [injuryTypes, setInjuryTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [severityLevels, setSeverityLevels] = useState([]);

  // State for selected filters
  const [selectedProject, setSelectedProject] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
  });
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedSeverities, setSelectedSeverities] = useState([]);

  // State for loading
  const [loading, setLoading] = useState(false);

  // Fetch filter options on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch projects
        const projectsResponse = await fetch('/api/projects');
        const projectsData = await projectsResponse.json();
        setProjects(
          projectsData.map(project => ({
            value: project._id,
            label: project.name,
          })),
        );

        // Fetch injury types
        const typesResponse = await fetch('/api/injury-types');
        const typesData = await typesResponse.json();
        setInjuryTypes(
          typesData.map(type => ({
            value: type,
            label: type,
          })),
        );

        // Fetch departments
        const deptsResponse = await fetch('/api/departments');
        const deptsData = await deptsResponse.json();
        setDepartments(
          deptsData.map(dept => ({
            value: dept,
            label: dept,
          })),
        );

        // Fetch severity levels
        const sevResponse = await fetch('/api/severity-levels');
        const sevData = await sevResponse.json();
        setSeverityLevels(
          sevData.map(sev => ({
            value: sev,
            label: sev,
          })),
        );
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch chart data based on selected filters
  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);

      try {
        // Construct query params
        const params = new URLSearchParams();

        if (selectedProject) {
          params.append('projectId', selectedProject.value);
        }

        params.append('startDate', dateRange.startDate.toISOString().split('T')[0]);
        params.append('endDate', dateRange.endDate.toISOString().split('T')[0]);

        if (selectedTypes.length > 0) {
          params.append('types', selectedTypes.map(type => type.value).join(','));
        }

        if (selectedDepartments.length > 0) {
          params.append('departments', selectedDepartments.map(dept => dept.value).join(','));
        }

        if (selectedSeverities.length > 0) {
          params.append('severities', selectedSeverities.map(sev => sev.value).join(','));
        }

        // Fetch data
        const response = await fetch(`${ENDPOINTS.INJURIES_OVER_TIME}?${params.toString()}`);

        const data = await response.json();

        // Format data for chart
        const formattedData = data.map(item => ({
          date: new Date(item.date).toLocaleDateString(),
          totalInjuries: item.totalInjuries,
        }));

        setChartData(formattedData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have at least a date range
    if (dateRange.startDate && dateRange.endDate) {
      fetchChartData();
    }
  }, [selectedProject, dateRange, selectedTypes, selectedDepartments, selectedSeverities]);

  // Custom tooltip component
  function CustomTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{`Date: ${label}`}</p>
          <p className="info">{`Total Injuries: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  }

  // Format Y-axis ticks to show integers only
  const formatYAxis = tickItem => {
    return Math.floor(tickItem);
  };

  return (
    <div className="injuries-dashboard">
      <h1>Total Injuries Over Time</h1>

      <div className="filters-container">
        <div className="filter">
          <label>Project</label>
          <Select
            value={selectedProject}
            onChange={setSelectedProject}
            options={projects}
            isClearable
            placeholder="Select Project"
            className="filter-select"
          />
        </div>

        <div className="filter">
          <label>Date Range</label>
          <div className="date-picker-container">
            <DatePicker
              selected={dateRange.startDate}
              onChange={date => setDateRange({ ...dateRange, startDate: date })}
              selectsStart
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              className="date-picker"
              placeholderText="Start Date"
            />
            <span>to</span>
            <DatePicker
              selected={dateRange.endDate}
              onChange={date => setDateRange({ ...dateRange, endDate: date })}
              selectsEnd
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              minDate={dateRange.startDate}
              className="date-picker"
              placeholderText="End Date"
            />
          </div>
        </div>

        <div className="filter">
          <label>Injury Type</label>
          <Select
            value={selectedTypes}
            onChange={setSelectedTypes}
            options={injuryTypes}
            isMulti
            placeholder="Select Types"
            className="filter-select"
          />
        </div>

        <div className="filter">
          <label>Department</label>
          <Select
            value={selectedDepartments}
            onChange={setSelectedDepartments}
            options={departments}
            isMulti
            placeholder="Select Departments"
            className="filter-select"
          />
        </div>

        <div className="filter">
          <label>Severity Level</label>
          <Select
            value={selectedSeverities}
            onChange={setSelectedSeverities}
            options={severityLevels}
            isMulti
            placeholder="Select Severity Levels"
            className="filter-select"
          />
        </div>
      </div>

      <div className="chart-container">
        {loading ? (
          <div className="loading">Loading chart data...</div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                angle={-45}
                textAnchor="end"
                height={70}
                tick={{ fontSize: 12 }}
              >
                <Label
                  value="Date"
                  position="bottom"
                  style={{ textAnchor: 'middle', fontSize: 14 }}
                />
              </XAxis>
              <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }}>
                <Label
                  value="Total Injuries"
                  angle={-90}
                  position="left"
                  style={{ textAnchor: 'middle', fontSize: 14 }}
                />
              </YAxis>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalInjuries"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
                strokeWidth={2}
                dot={{ stroke: '#8884d8', strokeWidth: 2, r: 4 }}
                label={{
                  position: 'top',
                  formatter: value => `${value}`,
                  fontSize: 11,
                  fill: '#666',
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data">No data available for the selected filters.</div>
        )}
      </div>
    </div>
  );
}

export default InjuriesDashboard;
