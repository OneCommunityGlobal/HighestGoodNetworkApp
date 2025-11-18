import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSelector } from 'react-redux';
import styles from './EnhancedPopularityTimelineChart.module.css';

/**
 * Enhanced Popularity Timeline Chart Component
 * Version: 2.1 - Core Chart and Data Processing Implemented
 */

// --- Data Fetching Functions ---
const fetchEnhancedPopularityData = async ({ range, roles = [], includeLowVolume }) => {
  const params = {
    groupByRole: 'true',
    includeLowVolume: includeLowVolume.toString(),
  };

  if (roles.length > 0 && !roles.includes('All Roles')) {
    params.roles = roles.join(',');
  }

  if (range && range !== 'all') {
    params.range = range;
  }

  const { data } = await axios.get('http://localhost:4500/api/popularity-enhanced/timeline', {
    params,
  });
  return data;
};

const fetchEnhancedRoles = async () => {
  const { data } = await axios.get('http://localhost:4500/api/popularity-enhanced/roles-enhanced');
  return data;
};

// --- Helper Functions ---
const getRoleColor = (role, index) => {
  const colors = [
    '#3366cc',
    '#dc3912',
    '#ff9900',
    '#109618',
    '#990099',
    '#0099c6',
    '#dd4477',
    '#66aa00',
    '#b82e2e',
    '#316395',
    '#994499',
    '#22aa99',
    '#aaaa11',
    '#6633cc',
    '#e67300',
    '#8b0707',
    '#651067',
    '#329262',
  ];
  return colors[index % colors.length];
};

const EnhancedPopularityTimelineChart = () => {
  const darkMode = useSelector(state => state.theme.darkMode);

  const dateRangeOption = '6months';
  const selectedRoles = ['All Roles'];
  const showLowVolume = true;

  const [highlightedRole, setHighlightedRole] = useState(null);

  // Fetch enhanced roles data
  const { data: rolesData, isLoading: rolesLoading, error: rolesError } = useQuery({
    queryKey: ['enhancedRoles'],
    queryFn: fetchEnhancedRoles,
  });

  // Fetch enhanced popularity data
  const { data: popularityData, isLoading: dataLoading, error: queryError } = useQuery({
    queryKey: ['enhancedPopularityData', dateRangeOption, selectedRoles.join(','), showLowVolume],
    queryFn: () =>
      fetchEnhancedPopularityData({
        range: dateRangeOption.replace('months', ''),
        roles: selectedRoles,
        includeLowVolume: showLowVolume,
      }),
  });

  // Process chart data for Recharts
  const { chartData, roleMetrics } = useMemo(() => {
    if (!popularityData?.data || !Array.isArray(popularityData.data)) {
      return { chartData: [], roleMetrics: [] };
    }

    const monthMap = new Map();
    const metrics = [];

    try {
      popularityData.data.forEach(roleGroup => {
        if (!roleGroup.data || !Array.isArray(roleGroup.data)) return;
        roleGroup.data?.forEach(monthData => {
          if (!monthMap.has(monthData.month)) {
            monthMap.set(monthData.month, {
              month: monthData.month,
              timestamp: monthData.timestamp,
              roles: [],
              totalHits: 0,
              totalApplications: 0,
            });
          }
        });
      });

      popularityData.data.forEach((roleGroup, index) => {
        if (!roleGroup.data || !Array.isArray(roleGroup.data)) return;

        const roleColor = getRoleColor(roleGroup.role, index);
        const roleKey = roleGroup.role.replace(/\s+/g, '_');

        metrics.push({
          role: roleGroup.role,
          roleKey: roleKey,
          ...roleGroup.summary,
          color: roleColor,
        });

        roleGroup.data?.forEach(monthData => {
          const monthEntry = monthMap.get(monthData.month);
          if (!monthEntry) return;

          monthEntry[`${roleKey}_hits`] = monthData.hitsCount;

          monthEntry.totalHits += monthData.hitsCount;

          monthEntry.roles.push({
            role: roleGroup.role,
            roleKey: roleKey,
            hits: monthData.hitsCount,
            applications: monthData.applicationsCount,
            conversionRate: monthData.conversionRate,
            color: roleColor,
          });
        });
      });

      const sortedData = Array.from(monthMap.values()).sort(
        (a, b) => new Date(a.timestamp || a.month) - new Date(b.timestamp || b.month),
      );

      return {
        chartData: sortedData,
        roleMetrics: metrics.sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0)),
      };
    } catch (error) {
      console.error('Error processing chart data:', error);
      return { chartData: [], roleMetrics: [] };
    }
  }, [popularityData]);

  // Handler for role highlighting
  const handleRoleHighlight = role => {
    setHighlightedRole(highlightedRole === role ? null : role);
  };

  const handleRoleKeyDown = (e, role) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRoleHighlight(role);
    }
  };

  // Simplified Tooltip component
  const EnhancedTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      const monthData = chartData.find(d => d.month === label);
      if (!monthData) return null;

      return (
        <div className={styles['ept-tooltip']}>
          <div className={styles['ept-tooltip-header']}>
            <strong>{label}</strong>
          </div>
          <div className={styles['ept-tooltip-totals']}>
            <span>
              Total Hits: <strong>{monthData.totalHits || 0}</strong>
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Simplified Interactive legend component
  const InteractiveLegend = () => {
    if (roleMetrics.length === 0) return null;

    return (
      <div className={styles['ept-legend']} role="list" aria-label="Chart legend">
        {roleMetrics.map(metric => {
          const isHighlighted = highlightedRole === metric.role || !highlightedRole;
          return (
            <div
              key={metric.role}
              role="button"
              tabIndex={0}
              aria-pressed={highlightedRole === metric.role}
              className={`${styles['ept-legend-item']} ${
                highlightedRole === metric.role
                  ? styles['ept-legend-item-highlighted']
                  : isHighlighted
                  ? ''
                  : styles['ept-legend-item-dimmed']
              }`}
              onClick={() => handleRoleHighlight(metric.role)}
              onKeyDown={e => handleRoleKeyDown(e, metric.role)}
            >
              <div className={styles['ept-legend-color']}>
                <div
                  className={styles['ept-legend-line-solid']}
                  style={{ backgroundColor: metric.color }}
                />
              </div>
              <span className={styles['ept-legend-text']}>{metric.role}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // --- Loading and Error States ---
  if (rolesLoading || dataLoading) {
    return (
      <div className={darkMode ? styles['dark-screen'] : styles['light-screen']}>
        <div className={`${styles['ept-container']} ${darkMode ? styles['dark-theme'] : ''}`}>
          <div className={styles['ept-loading']}>Loading enhanced analytics data...</div>
        </div>
      </div>
    );
  }

  if (queryError || rolesError) {
    const errorObj = queryError || rolesError;
    return (
      <div className={darkMode ? styles['dark-screen'] : styles['light-screen']}>
        <div className={`${styles['ept-container']} ${darkMode ? styles['dark-theme'] : ''}`}>
          <div className={styles['ept-error']}>
            Error loading enhanced analytics data: {errorObj.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? styles['dark-screen'] : styles['light-screen']}>
      <div className={`${styles['ept-container']} ${darkMode ? styles['dark-theme'] : ''}`}>
        <div className={styles['ept-header']}>
          <h2 className={styles['ept-title']}>Enhanced Role-Based Popularity Analytics</h2>
          <p className={styles['ept-subtitle']}>
            Core chart rendering: Showing Hits timeline for all roles.
          </p>
        </div>

        <div className={styles['ept-chart-section']}>
          <h3 className={styles['ept-chart-title']}>Role-Based Popularity Timeline</h3>

          {chartData.length === 0 ? (
            <div className={styles['ept-no-data']}>No chart data available.</div>
          ) : (
            <div className={styles['ept-chart-wrapper']}>
              <ResponsiveContainer width="100%" height={500}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#f0f0f0'} />
                  <XAxis
                    dataKey="month"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    tick={{ fontSize: 12, fill: darkMode ? '#ccc' : '#333' }}
                  />
                  <YAxis
                    domain={[0, 'auto']}
                    tick={{ fontSize: 12, fill: darkMode ? '#ccc' : '#333' }}
                    label={{
                      value: 'Hits Count',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fill: darkMode ? '#ccc' : '#333' },
                    }}
                  />
                  <Tooltip
                    content={<EnhancedTooltip />}
                    wrapperStyle={{ pointerEvents: 'auto', zIndex: 10002 }}
                    cursor={{ stroke: darkMode ? '#666' : '#ccc', strokeWidth: 2 }}
                  />
                  <Legend content={InteractiveLegend} />

                  {roleMetrics.map(metric => {
                    const isHighlighted = highlightedRole === metric.role || !highlightedRole;
                    const opacity = isHighlighted ? 1 : 0.3;
                    const strokeWidth = isHighlighted ? 3 : 1;

                    return (
                      <Line
                        key={`${metric.role}_hits`}
                        type="monotone"
                        dataKey={`${metric.roleKey}_hits`}
                        stroke={metric.color}
                        strokeWidth={strokeWidth}
                        strokeOpacity={opacity}
                        dot={{ fill: metric.color, r: isHighlighted ? 4 : 2 }}
                        activeDot={{
                          r: 6,
                          onClick: () => handleRoleHighlight(metric.role),
                        }}
                        name={metric.role}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedPopularityTimelineChart;
