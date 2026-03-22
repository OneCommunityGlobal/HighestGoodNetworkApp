import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ENDPOINTS } from '../../utils/URL';
import httpService from '../../services/httpService';
import { getAggregatedMockForChart } from './api';
import styles from './ApplicationTimeChart.module.css';

const NO_MATCH_VALUE = '__no_match__';

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
  const darkMode = useSelector(state => state.theme?.darkMode);

  const [dateFilter, setDateFilter] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');

  const [data, setData] = useState([]);
  const [availableRoles, setAvailableRoles] = useState(['all']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetFilters = () => {
    setDateFilter('all');
    setSelectedRole('all');
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      let startDate = null;
      let endDate = null;

      try {
        const now = new Date();

        if (dateFilter !== 'all') {
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
          endDate = now;
        }

        const roleParam =
          selectedRole !== 'all' && selectedRole !== NO_MATCH_VALUE ? [selectedRole] : [];

        const url = ENDPOINTS.APPLICATION_TIME_DATA(
          startDate ? startDate.toISOString() : null,
          endDate ? endDate.toISOString() : null,
          roleParam,
        );

        const response = await httpService.get(url);

        let rows = [];

        if (response.data?.data && Array.isArray(response.data.data)) {
          rows = response.data.data;
        } else if (Array.isArray(response.data)) {
          rows = response.data;
        } else {
          throw new Error('Unexpected data format from server');
        }

        setData(rows);
        setAvailableRoles(prev => mergeRoleOptions(prev, rows));
      } catch (err) {
        console.error('Error fetching application time data:', err);

        const status = err?.response?.status;

        if (status === 404) {
          const rows = getAggregatedMockForChart();
          setData(rows);
          setAvailableRoles(prev => mergeRoleOptions(prev, rows));
        } else {
          setError(err.message || 'Failed to fetch data');
          setData([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateFilter, selectedRole]);

  const processedData = useMemo(() => {
    if (selectedRole === NO_MATCH_VALUE) return [];

    if (!Array.isArray(data) || data.length === 0) return [];

    let rows = data;

    if (selectedRole !== 'all') {
      rows = rows.filter(item => item?.role === selectedRole);
    }

    return rows
      .map(item => ({
        role: item.role,
        avgTime: item.timeToApplyMinutes || (item.timeToApply ? item.timeToApply / 60 : 0),
        count: item.totalApplications || 1,
        formattedTime:
          item.timeToApplyFormatted ||
          `${Math.round((item.timeToApplyMinutes || 0) * 10) / 10} min`,
      }))
      .sort((a, b) => b.avgTime - a.avgTime);
  }, [data, selectedRole]);

  const maxTime = Math.max(...processedData.map(item => item.avgTime), 10);
  const xTickCount = Math.ceil(maxTime / 5);
  const xTicks = Array.from({ length: xTickCount + 1 }, (_, i) => i * 5);

  const fastest = processedData[processedData.length - 1];
  const slowest = processedData[0];

  const showEmptyState = !loading && !error && processedData.length === 0;

  if (loading) {
    return (
      <div className={`${styles.atc} ${darkMode ? styles.dark : ''}`}>
        <div className={styles.atcLoading}>Loading…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.atc} ${darkMode ? styles.dark : ''}`}>
        <div className={styles.atcLoading}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={`${styles.atc} ${darkMode ? styles.dark : ''}`}>
      <div className={styles.atcMain}>
        {/* ── Chart card ── */}
        <div className={styles.atcCard}>
          <h2 className={styles.atcTitle}>
            Comparing the Average Time Taken to Fill an Application by Role
          </h2>

        {/* Chart */}
        <div className={styles.chartArea} ref={chartAreaRef}>
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

              {/* X-axis */}
              <div className={`${styles.xAxis} ${darkMode ? styles.darkMode : ''}`}>
                {(() => {
                  // Generate dynamic ticks based on maxTime
                  const tickCount = 6;
                  const ticks = [];
                  for (let i = 0; i <= tickCount; i++) {
                    const tickValue = Math.round(((maxTime * i) / tickCount) * 10) / 10;
                    ticks.push(tickValue);
                  }
                  return ticks.map(tick => (
                    <div
                      key={tick}
                      className={darkMode ? styles.darkMode : ''}
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
                      onMouseMove={e => handleMouseMove(e, item)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className={`${styles.dataLabel} ${darkMode ? styles.darkMode : ''}`}>
                        {item.formattedTime || `${Math.round(item.avgTime * 10) / 10} min`}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X-axis ticks */}
              <div className={styles.atcXaxis}>
                {xTicks.map(tick => (
                  <span key={tick}>{tick}</span>
                ))}
              </div>

              {/* Tooltip */}
              {tooltip.visible && (
                <div className={styles.tooltip} style={tooltipStyle}>
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

              {/* X-axis Label */}
              <div className={`${styles.xAxisLabel} ${darkMode ? styles.darkMode : ''}`}>
                Average Time taken to fill application (in minutes)
              </div>

              {/* Summary strip */}
              <div className={styles.atcFooter}>
                <div>
                  <strong>Showing:</strong> {processedData.length} role(s)
                </div>
                {fastest && (
                  <div>
                    <strong>Fastest:</strong> {fastest.role} ({fastest.formattedTime})
                  </div>
                )}
                {slowest && (
                  <div>
                    <strong>Slowest:</strong> {slowest.role} ({slowest.formattedTime})
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Filters panel ── */}
        <aside className={styles.atcFilters}>
          {/* Dates */}
          <div className={styles.atcFilter}>
            <div className={styles.atcFilterLabel}>Dates</div>
            <select
              className={styles.atcSelect}
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              aria-label="Filter by date range"
            >
              <option value="all">ALL</option>
              <option value="weekly">Last 7 Days</option>
              <option value="monthly">Last 30 Days</option>
              <option value="yearly">Last Year</option>
            </select>
          </div>

          {/* Role — includes selectable sentinel to demo empty state */}
          <div className={styles.atcFilter}>
            <div className={styles.atcFilterLabel}>Role</div>
            <select
              className={`${styles.atcSelect} ${
                selectedRole === NO_MATCH_VALUE ? styles.atcSelectNoMatch : ''
              }`}
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              aria-label="Filter by role"
            >
              <option value="all">ALL</option>
              <option value={NO_MATCH_VALUE}>-- No Matching Role --</option>
              {availableRoles
                .filter(role => role !== 'all')
                .map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
            </select>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ApplicationTimeChart;
