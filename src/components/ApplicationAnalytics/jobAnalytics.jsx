
import React, { useState, useMemo } from 'react';
import { getJobAnalyticsData } from './api';
import './jobAnalytics.css';

const JobAnalytics = () => {
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [hoveredBar, setHoveredBar] = useState(null);

  // Get raw data
  const rawData = getJobAnalyticsData();

  // Process data with filters
  const processedData = useMemo(() => {
    let filtered = [...rawData];

    console.log('=== JOB ANALYTICS FILTERING DEBUG ===');
    console.log('Initial data count:', filtered.length);
    console.log('Date filter:', dateFilter);
    console.log('Role filter:', selectedRole);

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      console.log('Current date:', now.toISOString());
      
      const beforeDateFilter = filtered.length;
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.timestamp);
        const daysAgo = Math.floor((now - itemDate) / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case 'weekly': 
            const includeWeekly = daysAgo <= 7;
            return includeWeekly;
          case 'monthly': return daysAgo <= 30;
          case 'yearly': return daysAgo <= 365;
          default: return true;
        }
      });
      console.log(`After date filter (${dateFilter}): ${beforeDateFilter} -> ${filtered.length}`);
    }

    // Apply role filter
    if (selectedRole !== 'all') {
      const beforeRoleFilter = filtered.length;
      filtered = filtered.filter(item => item.role === selectedRole);
      console.log(`After role filter (${selectedRole}): ${beforeRoleFilter} -> ${filtered.length}`);
    }

    // Group by role and count applications
    const roleGroups = {};
    filtered.forEach(item => {
      if (!roleGroups[item.role]) {
        roleGroups[item.role] = 0;
      }
      roleGroups[item.role]++;
    });

    console.log('Role groups:', roleGroups);

    // Create chart data and sort least to most competitive (ascending)
    const chartData = Object.entries(roleGroups)
      .map(([role, applicationCount]) => ({
        role,
        applications: applicationCount,
        hits: Math.floor(applicationCount * (Math.random() * 10 + 5)) // Simulated hits data
      }))
      .sort((a, b) => a.applications - b.applications); // Sort ascending (least to most)

    console.log('Final chart data:', chartData);
    console.log('=== END DEBUG ===');
    return chartData;
  }, [rawData, dateFilter, selectedRole]);

  // Get unique roles for dropdown
  const roles = useMemo(() => {
    const uniqueRoles = [...new Set(rawData.map(item => item.role))];
    return ['all', ...uniqueRoles];
  }, [rawData]);

  const maxApplications = Math.max(...processedData.map(item => item.applications), 10);

  return (
    <div className="job-analytics-container">
      {/* Chart Container */}
      <div className="chart-container">
        {/* Title */}
        <h2 className="chart-title">Least Popular Roles</h2>

        {/* Chart */}
        <div className="chart-area">
          {processedData.length > 0 ? (
            <>
              {/* Grid Lines */}
              <div className="grid-lines" />

              {/* Y-axis (Roles) */}
              <div className="y-axis">
                {processedData.map((item, index) => (
                  <div key={index} className="y-axis-label">
                    {item.role}
                  </div>
                ))}
              </div>

              {/* X-axis */}
              <div className="x-axis">
                {[0, 5, 10, 15, 20, 25].map(tick => (
                  <div key={tick} className="x-axis-tick" style={{left: `${(tick/maxApplications) * 100}%`}}>
                    {tick <= maxApplications ? tick : ''}
                  </div>
                ))}
              </div>

              {/* Bars */}
              <div className="bars-container">
                {processedData.map((item, index) => (
                  <div 
                    key={index} 
                    className="bar-row"
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <div 
                      className="bar"
                      style={{
                        width: `${(item.applications/maxApplications) * 100}%`
                      }}
                    >
                      {/* Data Label */}
                      <div className="data-label">
                        {item.applications}
                      </div>
                    </div>
                    
                    {/* Hover Tooltip */}
                    {hoveredBar === index && (
                      <div className="tooltip">
                        <div><strong>{item.role}</strong></div>
                        <div>Applications: {item.applications}</div>
                        <div>Hits: {item.hits}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* X-axis Label */}
              <div className="x-axis-label">Applications</div>
            </>
          ) : (
            <div className="no-data">
              No data available for the selected filters
            </div>
          )}
        </div>

        {/* Summary Info */}
        {processedData.length > 0 && (
          <div className="summary-info">
            <div><strong>Showing:</strong> {processedData.length} role(s)</div>
            <div><strong>Least Popular:</strong> {processedData[0]?.role} ({processedData[0]?.applications} applications)</div>
            <div><strong>Most Popular:</strong> {processedData[processedData.length - 1]?.role} ({processedData[processedData.length - 1]?.applications} applications)</div>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      <div className="filters-panel">
        {/* Dates Filter */}
        <div className="filter-group">
          <div className="filter-label">Dates</div>
          <select
            value={dateFilter}
            onChange={(e) => {
              console.log('Date filter changed to:', e.target.value);
              setDateFilter(e.target.value);
            }}
            className="filter-select"
          >
            <option value="all">ALL</option>
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Last 30 Days</option>
            <option value="yearly">Last Year</option>
          </select>
        </div>

        {/* Role Filter */}
        <div className="filter-group">
          <div className="filter-label">Role</div>
          <select
            value={selectedRole}
            onChange={(e) => {
              console.log('Role filter changed to:', e.target.value);
              setSelectedRole(e.target.value);
            }}
            className="filter-select"
          >
            {roles.map(role => (
              <option key={role} value={role}>
                {role === 'all' ? 'ALL' : role}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default JobAnalytics;