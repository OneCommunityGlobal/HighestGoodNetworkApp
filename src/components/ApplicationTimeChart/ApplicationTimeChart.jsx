import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { ENDPOINTS } from '../../utils/URL';
import httpService from '../../services/httpService';
import styles from './ApplicationTimeChart.module.css';

function ApplicationTimeChart() {
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get dark mode state from Redux
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Prepare query parameters
        const params = new URLSearchParams();

        if (dateFilter !== 'all') {
          const now = new Date();
          let startDate;

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
            params.append('startDate', startDate.toISOString());
            params.append('endDate', now.toISOString());
          }
        }

        if (selectedRole !== 'all') {
          params.append('roles', selectedRole);
        }

        const url = ENDPOINTS.APPLICATION_TIME_DATA(
          params.get('startDate'),
          params.get('endDate'),
          selectedRole !== 'all' ? [selectedRole] : [],
        );

        const response = await httpService.get(url);

        // Backend returns { data: [], message: "", summary: {} }
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          setData(response.data.data);
        } else if (response.data && Array.isArray(response.data)) {
          // Fallback for direct array response
          setData(response.data);
        } else {
          // Fallback to mock data if backend doesn't return expected format
          console.warn('Backend returned unexpected data format, using mock data');
          setData(getMockData());
        }
      } catch (err) {
        console.error('Error fetching application time data:', err);
        setError(err.message);
        // Fallback to mock data on error
        setData(getMockData());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateFilter, selectedRole]);

  // Mock data fallback function
  const getMockData = () => {
    const sampleData = [
      {
        role: 'Software Developer',
        timeToApply: 8,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        role: 'Software Developer',
        timeToApply: 12,
        timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
      },
      {
        role: 'Software Developer',
        timeToApply: 9,
        timestamp: new Date(Date.now() - 51 * 60 * 60 * 1000).toISOString(),
      },
      {
        role: 'Architect',
        timeToApply: 15,
        timestamp: new Date(Date.now() - 29 * 60 * 60 * 1000).toISOString(),
      },
      {
        role: 'Architect',
        timeToApply: 18,
        timestamp: new Date(Date.now() - 74 * 60 * 60 * 1000).toISOString(),
      },
      {
        role: 'Master Electrician',
        timeToApply: 25,
        timestamp: new Date(Date.now() - 56 * 60 * 60 * 1000).toISOString(),
      },
      {
        role: 'Master Electrician',
        timeToApply: 22,
        timestamp: new Date(Date.now() - 97 * 60 * 60 * 1000).toISOString(),
      },
      {
        role: 'Product Manager',
        timeToApply: 6,
        timestamp: new Date(Date.now() - 76 * 60 * 60 * 1000).toISOString(),
      },
      {
        role: 'Product Manager',
        timeToApply: 9,
        timestamp: new Date(Date.now() - 122 * 60 * 60 * 1000).toISOString(),
      },
      {
        role: 'Data Scientist',
        timeToApply: 13,
        timestamp: new Date(Date.now() - 102 * 60 * 60 * 1000).toISOString(),
      },
      {
        role: 'Data Scientist',
        timeToApply: 11,
        timestamp: new Date(Date.now() - 147 * 60 * 60 * 1000).toISOString(),
      },
      {
        role: 'UX Designer',
        timeToApply: 14,
        timestamp: new Date(Date.now() - 127 * 60 * 60 * 1000).toISOString(),
      },
      {
        role: 'UX Designer',
        timeToApply: 16,
        timestamp: new Date(Date.now() - 172 * 60 * 60 * 1000).toISOString(),
      },
    ];
    return sampleData;
  };

  const processedData = useMemo(() => {
    let filtered = [...data];

    // Remove outliers (applications taking more than 30 minutes)
    filtered = filtered.filter(item => item.timeToApply <= 30);

    // Apply date filter
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

    // Apply role filter
    if (selectedRole !== 'all') {
      filtered = filtered.filter(item => item.role === selectedRole);
    }

    // Group by role and calculate averages
    const roleGroups = {};
    filtered.forEach(item => {
      if (!roleGroups[item.role]) {
        roleGroups[item.role] = [];
      }
      roleGroups[item.role].push(item.timeToApply);
    });

    // Calculate averages and create chart data
    const chartData = Object.entries(roleGroups)
      .map(([role, times]) => {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        return {
          role,
          avgTime: Math.round(avg * 10) / 10, // Round to 1 decimal place
          count: times.length,
        };
      })
      .sort((a, b) => b.avgTime - a.avgTime); // Sort highest to lowest

    return chartData;
  }, [data, dateFilter, selectedRole]);

  // Get unique roles for dropdown
  const roles = useMemo(() => {
    const uniqueRoles = [...new Set(data.map(item => item.role))];
    return ['all', ...uniqueRoles];
  }, [data]);

  const maxTime = Math.max(...processedData.map(item => item.avgTime), 10);

  // Show loading state
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

  // Show error state
  if (error) {
    return (
      <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
        <div className={`${styles.chartCard} ${darkMode ? styles.darkMode : ''}`}>
          <h2 className={`${styles.title} ${darkMode ? styles.darkMode : ''}`}>
            Comparing the Average Time Taken to Fill an Application by Role
          </h2>
          <div className={`${styles.noData} ${darkMode ? styles.darkMode : ''}`}>
            Error loading data: {error}. Using sample data.
          </div>
        </div>
      </div>
    );
  }

  return (
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

              {/* X-axis */}
              <div className={`${styles.xAxis} ${darkMode ? styles.darkMode : ''}`}>
                {[0, 5, 10, 15, 20, 25, 30].map(tick => (
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
                      className={`${styles.bar} ${darkMode ? styles.darkMode : ''}`}
                      style={{ width: `${(item.avgTime / maxTime) * 100}%` }}
                    >
                      <div className={`${styles.dataLabel} ${darkMode ? styles.darkMode : ''}`}>
                        {item.avgTime} min
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
