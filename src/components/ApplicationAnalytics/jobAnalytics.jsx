import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import getJobAnalyticsData from './api';
import styles from './jobAnalytics.module.css';
import { useSelector } from 'react-redux';

function JobAnalytics() {
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [hoveredBar, setHoveredBar] = useState(null);
  const darkMode = useSelector(state => state.theme.darkMode);
  const rawData = getJobAnalyticsData();
  const processedData = useMemo(() => {
    let filtered = [...rawData];
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.timestamp);
        const daysAgo = Math.floor((now - itemDate) / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case 'weekly':
            if (daysAgo <= 7) {
              return true;
            }
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
    if (selectedRole !== 'all') {
      filtered = filtered.filter(item => item.role === selectedRole);
    }
    const roleGroups = {};
    filtered.forEach(item => {
      if (!roleGroups[item.role]) {
        roleGroups[item.role] = 0;
      }
      roleGroups[item.role] += 1;
    });
    const chartData = Object.entries(roleGroups)
      .map(([role, applicationCount]) => ({
        role,
        applications: applicationCount,
        hits: Math.floor(applicationCount * (Math.random() * 10 + 5)),
      }))
      .sort((a, b) => a.applications - b.applications);
    return chartData;
  }, [rawData, dateFilter, selectedRole]);
  const roles = useMemo(() => {
    const uniqueRoles = [...new Set(rawData.map(item => item.role))];
    return ['all', ...uniqueRoles];
  }, [rawData]);

  const maxApplications = Math.max(...processedData.map(item => item.applications), 10);

  return (
    <div className={`${darkMode ? styles.jobAnalyticsContainerDarkMode : ''}`}>
      <div className={`${styles.jobAnalyticsContainer}`}>
        <div className={`${styles.chartContainer}`}>
          <h2 className={`${styles.chartTitle}`}>Least Popular Roles</h2>
          <div className={`${styles.chartArea}`}>
            {processedData.length > 0 ? (
              <>
                <div className={`${styles.gridLines}`} />
                <div className={`${styles.yAxis}`}>
                  {processedData.map(item => (
                    <div key={uuidv4()} className={`${styles.yAxisLabel}`}>
                      {item.role}
                    </div>
                  ))}
                </div>
                <div className={`${styles.xAxis}`}>
                  {[0, 5, 10, 15, 20, 25].map(tick => (
                    <div
                      key={tick}
                      className={`{${styles.xAxisTick}`}
                      style={{ left: `${(tick / maxApplications) * 100}%` }}
                    >
                      {tick <= maxApplications ? tick : ''}
                    </div>
                  ))}
                </div>
                <div className={`${styles.barsContainer}`}>
                  {processedData.map((item, index) => (
                    <div
                      key={uuidv4()}
                      className={`${styles.barRow}`}
                      onMouseEnter={() => setHoveredBar(index)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      <div
                        className={`${styles.bar}`}
                        style={{
                          width: `${(item.applications / maxApplications) * 100}%`,
                        }}
                      >
                        <div className={`${styles.dataLabel}`}>{item.applications}</div>
                      </div>

                      {hoveredBar === index && (
                        <div className={`${styles.tooltip}`}>
                          <div className={`${styles.tooltipTitle}`}>
                            <strong>{item.role}</strong>
                          </div>
                          <div>Applications: {item.applications}</div>
                          <div>Hits: {item.hits}</div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div className={`${styles.xAxisLabel}`}>Applications</div>
                </div>
              </>
            ) : (
              <div className={`${styles.noData}`}>No data available for the selected filters</div>
            )}
          </div>
          {processedData.length > 0 && (
            <div className={`${styles.summaryInfo}`}>
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
        <div className={`${styles.filtersPanel}`}>
          <div className={`${styles.filterGroup}`}>
            <div className={`${styles.filterLabel}`}>Dates</div>
            <select
              value={dateFilter}
              onChange={e => {
                setDateFilter(e.target.value);
              }}
              className={`${styles.filterSelectJobAnalytics}`}
            >
              <option value="all">ALL</option>
              <option value="weekly">Last 7 Days</option>
              <option value="monthly">Last 30 Days</option>
              <option value="yearly">Last Year</option>
            </select>
          </div>
          <div className={`${styles.filterGroup}`}>
            <div className={`${styles.filterLabel}`}>Role</div>
            <select
              value={selectedRole}
              onChange={e => {
                setSelectedRole(e.target.value);
              }}
              className={`${styles.filterSelectJobAnalytics}`}
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
    </div>
  );
}

export default JobAnalytics;
