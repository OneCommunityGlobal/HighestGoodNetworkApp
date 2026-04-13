import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { ENDPOINTS } from '../../utils/URL';
import httpService from '../../services/httpService';
import { getAggregatedMockForChart } from './api';
import styles from './ApplicationTimeChart.module.css';

function uniqueRolesFromRows(rows) {
  return [...new Set((rows || []).map(r => r?.role).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );
}

function mergeRoleOptions(prev, rows) {
  const fromData = uniqueRolesFromRows(rows);
  const fromPrev = prev.filter(r => r !== 'all');
  const combined = new Set([...fromPrev, ...fromData]);
  return ['all', ...Array.from(combined).sort((a, b) => a.localeCompare(b))];
}

function ApplicationTimeChart() {
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [data, setData] = useState([]);
  const [availableRoles, setAvailableRoles] = useState(['all']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    role: '',
    avgTime: 0,
    count: 0,
  });

  const hideTimerRef = useRef(null);

  // Get dark mode state from Redux
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  // Fetch available roles from backend
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const baseUrl = ENDPOINTS.APPLICATION_TIME_DATA('', '', []);
        const rolesUrl = baseUrl.split('?')[0] + '/roles';
        const response = await httpService.get(rolesUrl);
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          const apiRoles = response.data.data.filter(Boolean).sort((a, b) => a.localeCompare(b));
          setAvailableRoles(['all', ...apiRoles]);
        } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
          const apiRoles = response.data.data.filter(Boolean).sort((a, b) => a.localeCompare(b));
          setAvailableRoles(['all', ...apiRoles]);
        } else {
          setAvailableRoles(mergeRoleOptions(['all'], getAggregatedMockForChart()));
        }
      } catch (err) {
        console.error('Error fetching available roles:', err);
        setAvailableRoles(mergeRoleOptions(['all'], getAggregatedMockForChart()));
      }
    };

    fetchRoles();
  }, []);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        let startDate = null;
        let endDate = null;

        if (dateFilter !== 'all') {
          const now = new Date();

          switch (dateFilter) {
            case 'weekly':
              startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              break;
            case 'monthly':
              startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              break;
            case 'yearly':
              startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
              break;
            default:
              break;
          }

          if (startDate) {
            endDate = now;
          }
        }

        const url = ENDPOINTS.APPLICATION_TIME_DATA(
          startDate ? startDate.toISOString() : null,
          endDate ? endDate.toISOString() : null,
          selectedRole !== 'all' ? [selectedRole] : [],
        );

        const response = await httpService.get(url);

        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          const rows = response.data.data;
          setData(rows);
          setAvailableRoles(prev => mergeRoleOptions(prev, rows));
        } else if (response.data && Array.isArray(response.data)) {
          const rows = response.data;
          setData(rows);
          setAvailableRoles(prev => mergeRoleOptions(prev, rows));
        } else {
          console.error('Backend returned unexpected data format:', response.data);
          setError('Unexpected data format from server');
          setData([]);
        }
      } catch (err) {
        console.error('Error fetching application time data:', err);
        const status = err?.response?.status;
        if (status === 404) {
          const rows = getAggregatedMockForChart();
          setData(rows);
          setAvailableRoles(prev => mergeRoleOptions(prev, rows));
          setError(null);
        } else {
          setError(err.message || 'Failed to fetch data from server');
          setData([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateFilter, selectedRole]);

  const processedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    let rows = data;
    if (selectedRole !== 'all') {
      rows = data.filter(item => item && item.role === selectedRole);
    }

    const chartData = rows
      .map(item => ({
        role: item.role,
        avgTime: item.timeToApplyMinutes || (item.timeToApply ? item.timeToApply / 60 : 0),
        count: item.totalApplications || 1,
        formattedTime:
          item.timeToApplyFormatted ||
          `${Math.round((item.timeToApplyMinutes || 0) * 10) / 10} min`,
      }))
      .sort((a, b) => b.avgTime - a.avgTime);

    return chartData;
  }, [data, selectedRole]);

  const maxTime = Math.max(...processedData.map(item => item.avgTime), 10);

  // ── Tooltip handlers ──────────────────────────────────────────────────────
  // Uses fixed positioning from clientX/Y so the tooltip is never clipped
  // by overflow:visible parents or chart boundaries.

  const handleMouseEnter = useCallback((e, item) => {
    clearTimeout(hideTimerRef.current);
    setTooltip({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      role: item.role,
      avgTime: Math.round(item.avgTime * 10) / 10,
      count: item.count,
    });
  }, []);

  const handleMouseMove = useCallback(e => {
    setTooltip(prev => ({
      ...prev,
      x: e.clientX,
      y: e.clientY,
    }));
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Short delay prevents flicker when cursor passes between bar and label
    hideTimerRef.current = setTimeout(() => {
      setTooltip(prev => ({ ...prev, visible: false }));
    }, 80);
  }, []);

  // Tooltip position — keep inside viewport
  const TOOLTIP_WIDTH = 200;
  const TOOLTIP_HEIGHT = 90;
  const OFFSET = 14;
  const tooltipLeft =
    tooltip.x + TOOLTIP_WIDTH + OFFSET > window.innerWidth
      ? tooltip.x - TOOLTIP_WIDTH - OFFSET
      : tooltip.x + OFFSET;
  const tooltipTop = Math.min(
    Math.max(tooltip.y - TOOLTIP_HEIGHT / 2, 8),
    window.innerHeight - TOOLTIP_HEIGHT - 8,
  );

  // ── Loading / Error states ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
        <div className={`${styles.chartCard} ${darkMode ? styles.darkMode : ''}`}>
          <h2 className={`${styles.title} ${darkMode ? styles.darkMode : ''}`}>
            Comparing the Average Time Taken to Fill an Application by Role
          </h2>
          <div className={`${styles.noData} ${darkMode ? styles.darkMode : ''}`}>
            Loading application time data...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
        <div className={`${styles.chartCard} ${darkMode ? styles.darkMode : ''}`}>
          <h2 className={`${styles.title} ${darkMode ? styles.darkMode : ''}`}>
            Comparing the Average Time Taken to Fill an Application by Role
          </h2>
          <div className={`${styles.noData} ${darkMode ? styles.darkMode : ''}`}>
            Error loading data: {error}. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Global tooltip — rendered via a portal-like fixed element ── */}
      {tooltip.visible && (
        <div
          className={`${styles.tooltip} ${styles.tooltipVisible}`}
          style={{ left: tooltipLeft, top: tooltipTop }}
        >
          <div className={styles.tooltipRole}>{tooltip.role}</div>
          <div className={styles.tooltipDivider} />
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipLabel}>Avg. Time</span>
            <span className={styles.tooltipValue}>{tooltip.avgTime} min</span>
          </div>
          <div className={styles.tooltipRow}>
            <span className={styles.tooltipLabel}>Applications</span>
            <span className={styles.tooltipValue}>{tooltip.count}</span>
          </div>
        </div>
      )}

      <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
        {/* Chart Container */}
        <div className={`${styles.chartCard} ${darkMode ? styles.darkMode : ''}`}>
          <h2 className={`${styles.title} ${darkMode ? styles.darkMode : ''}`}>
            Comparing the Average Time Taken to Fill an Application by Role
          </h2>

          {/* Chart */}
          <div className={styles.chartArea}>
            {processedData.length > 0 ? (
              <>
                {/* Grid Lines */}
                <div
                  className={`${styles.grid} ${darkMode ? styles.darkMode : ''}`}
                  style={{
                    backgroundSize: `${100 / 6}% ${100 / processedData.length}%`,
                  }}
                />

                {/* Y-axis (Roles) */}
                <div className={styles.yAxis}>
                  {processedData.map(item => (
                    <div
                      key={uuidv4()}
                      className={`${styles.yAxisItem} ${darkMode ? styles.darkMode : ''}`}
                      style={{ height: `${100 / processedData.length}%` }}
                    >
                      {item.role}
                    </div>
                  ))}
                </div>

                {/* X-axis ticks */}
                <div className={`${styles.xAxis} ${darkMode ? styles.darkMode : ''}`}>
                  {(() => {
                    const tickCount = 6;
                    const ticks = [];
                    for (let i = 0; i <= tickCount; i++) {
                      const tickValue = Math.round(((maxTime * i) / tickCount) * 10) / 10;
                      ticks.push(tickValue);
                    }
                    return ticks.map(tick => (
                      <div
                        key={tick}
                        style={{
                          position: 'absolute',
                          left: `${(tick / maxTime) * 100}%`,
                          fontSize: '12px',
                          color: darkMode ? '#e0e0e0' : '#5f6368',
                          transform: 'translateX(-50%)',
                        }}
                      >
                        {tick}
                      </div>
                    ));
                  })()}
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
                        className={`${styles.bar} ${darkMode ? styles.darkMode : ''}`}
                        style={{ width: `${(item.avgTime / maxTime) * 100}%` }}
                        onMouseEnter={e => handleMouseEnter(e, item)}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className={`${styles.dataLabel} ${darkMode ? styles.darkMode : ''}`}>
                          {item.formattedTime || `${Math.round(item.avgTime * 10) / 10} min`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* X-axis Label */}
                <div className={`${styles.xAxisLabel} ${darkMode ? styles.darkMode : ''}`}>
                  Average Time taken to fill application (in minutes)
                </div>
              </>
            ) : (
              <div className={`${styles.noData} ${darkMode ? styles.darkMode : ''}`}>
                No data available for the selected filters
              </div>
            )}
          </div>

          {/* Summary Info */}
          {processedData.length > 0 && (
            <div className={`${styles.summary} ${darkMode ? styles.darkMode : ''}`}>
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
          <div className={`${styles.filterCard} ${darkMode ? styles.darkMode : ''}`}>
            <div className={`${styles.filterTitle} ${darkMode ? styles.darkMode : ''}`}>Dates</div>
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className={`${styles.select} ${darkMode ? styles.darkMode : ''}`}
            >
              <option value="all">ALL</option>
              <option value="weekly">Last 7 Days</option>
              <option value="monthly">Last 30 Days</option>
              <option value="yearly">Last Year</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className={`${styles.filterCard} ${darkMode ? styles.darkMode : ''}`}>
            <div className={`${styles.filterTitle} ${darkMode ? styles.darkMode : ''}`}>Role</div>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className={`${styles.select} ${darkMode ? styles.darkMode : ''}`}
            >
              {availableRoles.map(role => (
                <option key={role} value={role}>
                  {role === 'all' ? 'ALL' : role}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
}

export default ApplicationTimeChart;
