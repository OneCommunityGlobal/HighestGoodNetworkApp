import React, { useState, useMemo, useId } from 'react';
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
import Select from 'react-select';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useSelector } from 'react-redux';
import styles from './EnhancedPopularityTimelineChart.module.css';

/**
 * Enhanced Popularity Timeline Chart Component
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

  const timeRangeId = useId();
  const roleFilterId = useId();

  const [dateRangeOption, setDateRangeOption] = useState('6months');
  const [selectedRoles, setSelectedRoles] = useState(['All Roles']);
  const [highlightedRole, setHighlightedRole] = useState(null);
  const [showLowVolume, setShowLowVolume] = useState(true);
  const [, setError] = useState('');
  const [, setTooltipVisible] = useState(false);

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
          monthEntry[`${roleKey}_applications`] = monthData.applicationsCount;
          monthEntry[`${roleKey}_conversion`] = monthData.conversionRate;

          monthEntry.totalHits += monthData.hitsCount;
          monthEntry.totalApplications += monthData.applicationsCount;

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

  // Enhanced tooltip component
  const EnhancedTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      const monthData = chartData.find(d => d.month === label);
      if (!monthData) return null;

      // Sort roles by hits (descending) and filter by highlighted role if applicable
      let displayRoles = [...(monthData.roles || [])];

      if (highlightedRole) {
        // If a role is highlighted, show only that role
        displayRoles = displayRoles.filter(r => r.role === highlightedRole);
      } else {
        // Otherwise, show top 12 roles
        displayRoles = displayRoles.sort((a, b) => (b.hits || 0) - (a.hits || 0)).slice(0, 12);
      }

      return (
        <div className={styles['ept-tooltip']}>
          <div className={styles['ept-tooltip-header']}>
            <strong>{label}</strong>
          </div>

          {!highlightedRole && (
            <div className={styles['ept-tooltip-totals']}>
              <span>
                Total Hits: <strong>{monthData.totalHits || 0}</strong>
              </span>
              <span>
                Total Apps: <strong>{monthData.totalApplications || 0}</strong>
              </span>
            </div>
          )}

          <div className={styles['ept-tooltip-roles']}>
            {displayRoles.map((roleData, index) => (
              <div
                key={index}
                className={styles['ept-tooltip-role']}
                style={{
                  borderLeftColor: roleData.color,
                }}
              >
                <div className={styles['ept-tooltip-role-header']}>
                  <strong style={{ color: roleData.color }}>{roleData.role}</strong>
                </div>
                <div className={styles['ept-tooltip-role-stats']}>
                  <div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Hits</div>
                    <strong>{roleData.hits || 0}</strong>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Apps</div>
                    <strong>{roleData.applications || 0}</strong>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Conv.</div>
                    <strong>{((roleData.conversionRate || 0) * 100).toFixed(1)}%</strong>
                  </div>
                </div>
              </div>
            ))}

            {!highlightedRole && monthData.roles && monthData.roles.length > 12 && (
              <div className={styles['ept-tooltip-more']}>
                + {monthData.roles.length - 12} more roles (click a role or legend to focus)
              </div>
            )}
          </div>

          {!highlightedRole && monthData.roles && monthData.roles.length > 5 && (
            <div
              style={{
                marginTop: '8px',
                fontSize: '0.75rem',
                opacity: 0.7,
                textAlign: 'center',
                fontStyle: 'italic',
              }}
            >
              Tip: Click any role in the legend to focus
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Interactive legend component
  const InteractiveLegend = ({ payload }) => {
    // Determine which roles to display in the legend
    const rolesForLegend = roleMetrics;

    if (rolesForLegend.length === 0) return null;

    // Only show legend items that match the volume filter if active
    const displayMetrics = roleMetrics.filter(metric => {
      if (!showLowVolume && (metric.totalHits || 0) < 10) return false;
      return true;
    });

    return (
      <div className={styles['ept-legend']} role="list" aria-label="Chart legend">
        {displayMetrics.map(metric => {
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
                <div
                  className={styles['ept-legend-line-dashed']}
                  style={{ borderBottom: `2px dashed ${metric.color}` }}
                />
              </div>
              <span className={styles['ept-legend-text']}>
                {metric.role}
                <span className={styles['ept-legend-count']}>({metric.totalHits || 0})</span>
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Role selection handling
  const handleRoleChange = selectedOptions => {
    if (!selectedOptions || selectedOptions.length === 0) {
      setSelectedRoles(['All Roles']);
      setHighlightedRole(null);
      return;
    }

    const values = selectedOptions.map(option => option.value);
    const hasAllRoles = values.includes('All Roles');
    const hadAllRoles = selectedRoles.includes('All Roles');

    if (hasAllRoles && !hadAllRoles) {
      setSelectedRoles(['All Roles']);
    } else if (hasAllRoles && values.length > 1) {
      setSelectedRoles(values.filter(v => v !== 'All Roles'));
    } else {
      setSelectedRoles(values);
    }

    setHighlightedRole(null);
  };

  const resetFilters = () => {
    setDateRangeOption('6months');
    setSelectedRoles(['All Roles']);
    setHighlightedRole(null);
    setShowLowVolume(true);
    setError('');
  };

  const roleOptions = useMemo(() => {
    if (!rolesData?.data) return [{ value: 'All Roles', label: 'All Roles (Show Everything)' }];

    return [
      { value: 'All Roles', label: '🌐 All Roles (Show Everything)' },
      ...rolesData.data
        .filter(role => role.role !== 'All Roles')
        .map(role => ({
          value: role.role,
          label: `${role.role} (${role.totalHits || 0} hits, ${role.totalApplications || 0} apps)`,
          data: role,
        })),
    ];
  }, [rolesData]);

  const selectedRoleOptions = useMemo(() => {
    return roleOptions.filter(option => selectedRoles.includes(option.value));
  }, [roleOptions, selectedRoles]);

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
            <br />
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: '10px', padding: '5px 10px' }}
            >
              Retry
            </button>
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
            Track job hits (solid line) versus applications (dashed line) over time. Click any role
            to highlight.
          </p>
        </div>

        <div className={styles['ept-controls']}>
          <div className={styles['ept-control-group']}>
            <label className={styles['ept-label']} htmlFor={timeRangeId}>
              Time Range
            </label>
            <select
              id={timeRangeId}
              value={dateRangeOption}
              onChange={e => setDateRangeOption(e.target.value)}
              className={styles['ept-select']}
            >
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="12months">Last 12 Months</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className={styles['ept-control-group']}>
            <label className={styles['ept-label']} htmlFor={roleFilterId}>
              Filter by Role
            </label>
            <Select
              inputId={roleFilterId}
              isMulti
              options={roleOptions}
              value={selectedRoleOptions}
              onChange={handleRoleChange}
              placeholder="Select roles..."
              className={styles['ept-multiselect']}
              classNamePrefix="ept-select"
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
            />
          </div>

          <div className={styles['ept-toggle-group']}>
            <label className={styles['ept-toggle']} title="Show roles with less than 10 total hits">
              <input
                type="checkbox"
                checked={showLowVolume}
                onChange={e => setShowLowVolume(e.target.checked)}
              />
              <span>Show Low Volume</span>
            </label>

            <button
              onClick={() => setHighlightedRole(null)}
              disabled={!highlightedRole}
              className={styles['ept-reset-highlight']}
              title="Clear current role highlight"
            >
              Reset Highlight
            </button>
          </div>

          <button onClick={resetFilters} className={styles['ept-reset-btn']}>
            Reset All Filters
          </button>
        </div>

        {queryError && <div className={styles['ept-error']}>{queryError.message}</div>}

        <div className={styles['ept-chart-section']}>
          <h3 className={styles['ept-chart-title']}>
            Role-Based Popularity Timeline
            <span style={{ fontSize: '14px', marginLeft: '10px', opacity: 0.7 }}>
              ({chartData.length} months, {roleMetrics.length} roles)
              {highlightedRole && (
                <span style={{ color: '#3498db', marginLeft: '10px' }}>
                  • Highlighting: {highlightedRole}
                </span>
              )}
            </span>
          </h3>

          {chartData.length === 0 ? (
            <div className={styles['ept-no-data']}>
              No chart data available. Please check your filters or data source.
              <br />
              <small>Try selecting different roles or time ranges.</small>
            </div>
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
                      value: 'Count',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fill: darkMode ? '#ccc' : '#333' },
                    }}
                  />
                  <Tooltip
                    content={<EnhancedTooltip />}
                    wrapperStyle={{ pointerEvents: 'auto', zIndex: 10002 }}
                    cursor={{ stroke: darkMode ? '#666' : '#ccc', strokeWidth: 2 }}
                    onAnimationStart={() => setTooltipVisible(true)}
                    onAnimationEnd={() => setTooltipVisible(false)}
                  />
                  <Legend content={InteractiveLegend} />

                  {roleMetrics.map(metric => {
                    const isHighlighted = highlightedRole === metric.role || !highlightedRole;
                    const opacity = isHighlighted ? 1 : 0.3;
                    const strokeWidth = isHighlighted ? 3 : 1;

                    if (!showLowVolume && (metric.totalHits || 0) < 10) {
                      return null;
                    }

                    return (
                      <React.Fragment key={metric.role}>
                        <Line
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
                          name={`${metric.role} Hits`}
                        />
                        <Line
                          type="monotone"
                          dataKey={`${metric.roleKey}_applications`}
                          stroke={metric.color}
                          strokeWidth={strokeWidth}
                          strokeOpacity={opacity}
                          strokeDasharray="5 5"
                          dot={{ fill: metric.color, r: isHighlighted ? 3 : 1 }}
                          activeDot={{
                            r: 5,
                            onClick: () => handleRoleHighlight(metric.role),
                          }}
                          name={`${metric.role} Apps`}
                        />
                      </React.Fragment>
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {roleMetrics.length > 0 && (
          <div className={styles['ept-summary']}>
            <h3 className={styles['ept-summary-title']}>
              Role Performance Summary
              <span style={{ fontSize: '14px', marginLeft: '10px', opacity: 0.7 }}>
                (Click to highlight role in chart)
              </span>
            </h3>
            <div className={styles['ept-summary-grid']}>
              {roleMetrics.map((metric, index) => (
                <div
                  key={metric.role}
                  role="button"
                  tabIndex={0}
                  aria-pressed={highlightedRole === metric.role}
                  className={`${styles['ept-summary-card']} ${
                    highlightedRole === metric.role ? styles['ept-summary-card-highlighted'] : ''
                  }`}
                  onClick={() => handleRoleHighlight(metric.role)}
                  onKeyDown={e => handleRoleKeyDown(e, metric.role)}
                  style={{ borderLeftColor: metric.color }}
                >
                  <div className={styles['ept-summary-role']}>{metric.role}</div>
                  <div className={styles['ept-summary-stats']}>
                    <div className={styles['ept-summary-stat']}>
                      <span>Total Hits:</span>
                      <strong>{(metric.totalHits || 0).toLocaleString()}</strong>
                    </div>
                    <div className={styles['ept-summary-stat']}>
                      <span>Total Apps:</span>
                      <strong>{(metric.totalApplications || 0).toLocaleString()}</strong>
                    </div>
                    <div className={styles['ept-summary-stat']}>
                      <span>Conversion Rate:</span>
                      <strong
                        className={
                          (metric.avgConversionRate || 0) > 0.1 ? styles['ept-high-conversion'] : ''
                        }
                      >
                        {((metric.avgConversionRate || 0) * 100).toFixed(1)}%
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedPopularityTimelineChart;
