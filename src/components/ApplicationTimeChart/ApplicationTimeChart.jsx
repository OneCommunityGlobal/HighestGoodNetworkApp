import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import getApplicationData from './api';
import styles from './ApplicationTimeChart.module.css';

function ApplicationTimeChart() {
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');

  const rawData = getApplicationData();

  const processedData = useMemo(() => {
    let filtered = [...rawData];

    filtered = filtered.filter(item => item.timeToApply <= 30);

    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.timestamp);
        const daysAgo = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case 'weekly':
            return daysAgo <= 7;
          case 'monthly':
            return daysAgo <= 30;
          case 'yearly':
            return daysAgo <= 365;
          default:
            return true;
        }
      });
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(item => item.role === selectedRole);
    }

    const roleGroups = {};
    filtered.forEach(item => {
      if (!roleGroups[item.role]) roleGroups[item.role] = [];
      roleGroups[item.role].push(item.timeToApply);
    });

    const chartData = Object.entries(roleGroups)
      .map(([role, times]) => {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        return {
          role,
          avgTime: Math.round(avg * 10) / 10,
          count: times.length,
        };
      })
      .sort((a, b) => b.avgTime - a.avgTime);

    return chartData;
  }, [rawData, dateFilter, selectedRole]);

  const roles = useMemo(() => {
    const uniqueRoles = [...new Set(rawData.map(item => item.role))];
    return ['all', ...uniqueRoles];
  }, [rawData]);

  const maxTime = Math.max(...processedData.map(item => item.avgTime), 10);

  return (
    <div className={styles.container}>
      {/* Chart Container */}
      <div className={styles.chartCard}>
        <h2 className={styles.title}>
          Comparing the Average Time Taken to Fill an Application by Role
        </h2>

        {/* Chart */}
        <div className={styles.chartArea}>
          {processedData.length > 0 ? (
            <>
              {/* Grid Lines */}
              <div
                className={styles.grid}
                style={{
                  backgroundSize: `${100 / 6}% ${100 / processedData.length}%`,
                }}
              />

              {/* Y-axis (Roles) */}
              <div className={styles.yAxis}>
                {processedData.map(item => (
                  <div
                    key={uuidv4()}
                    className={styles.yAxisItem}
                    style={{ height: `${100 / processedData.length}%` }}
                  >
                    {item.role}
                  </div>
                ))}
              </div>

              {/* X-axis */}
              <div className={styles.xAxis}>
                {[0, 5, 10, 15, 20, 25, 30].map(tick => (
                  <div
                    key={tick}
                    style={{
                      position: 'absolute',
                      left: `${(tick / maxTime) * 100}%`,
                      fontSize: '12px',
                      color: '#5f6368',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    {tick <= maxTime ? tick : ''}
                  </div>
                ))}
              </div>

              {/* Bars */}
              <div className={styles.bars}>
                {processedData.map(item => (
                  <div
                    key={uuidv4()}
                    className={styles.barRow}
                    style={{ height: `${100 / processedData.length}%` }}
                  >
                    <div
                      className={styles.bar}
                      style={{ width: `${(item.avgTime / maxTime) * 100}%` }}
                    >
                      <div className={styles.dataLabel}>{item.avgTime} min</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* X-axis Label */}
              <div className={styles.xAxisLabel}>
                Average Time taken to fill application (in minutes)
              </div>
            </>
          ) : (
            <div className={styles.noData}>No data available for the selected filters</div>
          )}
        </div>

        {/* Summary Info */}
        {processedData.length > 0 && (
          <div className={styles.summary}>
            <div>
              <strong>Showing:</strong> {processedData.length} role(s)
            </div>
            <div>
              <strong>Fastest:</strong> {processedData[processedData.length - 1]?.role} (
              {processedData[processedData.length - 1]?.avgTime} min)
            </div>
            <div>
              <strong>Slowest:</strong> {processedData[0]?.role} ({processedData[0]?.avgTime} min)
            </div>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      <div className={styles.filters}>
        {/* Dates Filter */}
        <div className={styles.filterCard}>
          <div className={styles.filterTitle}>Dates</div>
          <select
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className={styles.select}
          >
            <option value="all">ALL</option>
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Last 30 Days</option>
            <option value="yearly">Last Year</option>
          </select>
        </div>

        {/* Role Filter */}
        <div className={styles.filterCard}>
          <div className={styles.filterTitle}>Role</div>
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className={styles.select}
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

export default ApplicationTimeChart;
