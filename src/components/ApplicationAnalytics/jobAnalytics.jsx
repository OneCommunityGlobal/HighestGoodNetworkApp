import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import getJobAnalyticsData from './api';
import styles from './JobAnalytics.module.css';

function JobAnalytics() {
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [hoveredBar, setHoveredBar] = useState(null);

  // Get raw data
  const rawData = getJobAnalyticsData();

  // Process data with filters
  const processedData = useMemo(() => {
    let filtered = [...rawData];

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.timestamp);
        const daysAgo = Math.floor((now - itemDate) / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case 'weekly':
            if (daysAgo <= 7) return true;
            return false;
          case 'monthly':
            return daysAgo <= 30;
          case 'yearly':
            return daysAgo <= 365;
          default:
            return true;
        }
      });
    }

    // Apply role filter
    if (selectedRole !== 'all') {
      filtered = filtered.filter(item => item.role === selectedRole);
    }

    // Group by role and count applications
    const roleGroups = {};
    filtered.forEach(item => {
      if (!roleGroups[item.role]) {
        roleGroups[item.role] = 0;
      }
      roleGroups[item.role] += 1;
    });

    // Create chart data and sort least to most competitive (ascending)
    const chartData = Object.entries(roleGroups)
      .map(([role, applicationCount]) => ({
        role,
        applications: applicationCount,
        hits: Math.floor(applicationCount * (Math.random() * 10 + 5)), // Simulated hits data
      }))
      .sort((a, b) => a.applications - b.applications);

    return chartData;
  }, [rawData, dateFilter, selectedRole]);

  // Get unique roles for dropdown
  const roles = useMemo(() => {
    const uniqueRoles = [...new Set(rawData.map(item => item.role))];
    return ['all', ...uniqueRoles];
  }, [rawData]);

  const maxApplications = Math.max(...processedData.map(item => item.applications), 10);

  return (
    <div className={styles.jobAnalyticsContainer}>
      {/* Chart Container */}
      <div className={styles.chartContainer}>
        {/* Title */}
        <h2 className={styles.chartTitle}>Least Popular Roles</h2>

        {/* Chart */}
        <div className={styles.chartArea}>
          {processedData.length > 0 ? (
            <>
              {/* Grid Lines */}
              <div className={styles.gridLines} />

              {/* Y-axis (Roles) */}
              <div className={styles.yAxis}>
                {processedData.map(item => (
                  <div key={uuidv4()} className={styles.yAxisLabel}>
                    {item.role}
                  </div>
                ))}
              </div>

              {/* X-axis */}
              <div className={styles.xAxis}>
                {[0, 5, 10, 15, 20, 25].map(tick => (
                  <div
                    key={tick}
                    className={styles.xAxisTick}
                    style={{ left: `${(tick / maxApplications) * 100}%` }}
                  >
                    {tick <= maxApplications ? tick : ''}
                  </div>
                ))}
              </div>

              {/* Bars */}
              <div className={styles.barsContainer}>
                {processedData.map((item, index) => (
                  <div
                    key={uuidv4()}
                    className={styles.barRow}
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <div
                      className={styles.bar}
                      style={{
                        width: `${(item.applications / maxApplications) * 100}%`,
                      }}
                    >
                      {/* Data Label */}
                      <div className={styles.dataLabel}>{item.applications}</div>
                    </div>

                    {/* Hover Tooltip */}
                    {hoveredBar === index && (
                      <div className={styles.tooltip}>
                        <div>
                          <strong>{item.role}</strong>
                        </div>
                        <div>Applications: {item.applications}</div>
                        <div>Hits: {item.hits}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* X-axis Label */}
              <div className={styles.xAxisLabel}>Applications</div>
            </>
          ) : (
            <div className={styles.noData}>No data available for the selected filters</div>
          )}
        </div>

        {/* Summary Info */}
        {processedData.length > 0 && (
          <div className={styles.summaryInfo}>
            <div>
              <strong>Showing:</strong> {processedData.length} role(s)
            </div>
            <div>
              <strong>Least Popular:</strong> {processedData[0]?.role} (
              {processedData[0]?.applications} applications)
            </div>
            <div>
              <strong>Most Popular:</strong> {processedData[processedData.length - 1]?.role} (
              {processedData[processedData.length - 1]?.applications} applications)
            </div>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      <div className={styles.filtersPanel}>
        {/* Dates Filter */}
        <div className={styles.filterGroup}>
          <div className={styles.filterLabel}>Dates</div>
          <select
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className={styles.filterSelectJobAnalytics}
          >
            <option value="all">ALL</option>
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Last 30 Days</option>
            <option value="yearly">Last Year</option>
          </select>
        </div>

        {/* Role Filter */}
        <div className={styles.filterGroup}>
          <div className={styles.filterLabel}>Role</div>
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className={styles.filterSelectJobAnalytics}
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
}

export default JobAnalytics;
