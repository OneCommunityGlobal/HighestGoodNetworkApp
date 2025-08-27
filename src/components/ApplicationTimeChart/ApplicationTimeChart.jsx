import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import getApplicationData from './api';

function ApplicationTimeChart() {
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');

  // Get raw data
  const rawData = getApplicationData();

  // Process data with filters and outlier removal
  const processedData = useMemo(() => {
    let filtered = [...rawData];

    // Remove outliers (applications taking more than 30 minutes)
    filtered = filtered.filter(item => item.timeToApply <= 30);

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.timestamp);
        const daysAgo = Math.floor((now - itemDate) / (1000 * 60 * 60 * 24));

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
  }, [rawData, dateFilter, selectedRole]);

  // Get unique roles for dropdown
  const roles = useMemo(() => {
    const uniqueRoles = [...new Set(rawData.map(item => item.role))];
    return ['all', ...uniqueRoles];
  }, [rawData]);

  const maxTime = Math.max(...processedData.map(item => item.avgTime), 10);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '20px',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
      }}
    >
      {/* Chart Container */}
      <div
        style={{
          flex: 1,
          border: '2px solid #4285f4',
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          padding: '20px',
        }}
      >
        {/* Title */}
        <h2
          style={{
            fontSize: '20px',
            fontWeight: '400',
            color: '#5f6368',
            margin: '0 0 30px 0',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          Comparing the Average Time Taken to Fill an Application by Role
        </h2>

        {/* Chart */}
        <div
          style={{
            minHeight: '400px',
            position: 'relative',
            paddingLeft: '140px',
            paddingRight: '60px',
            paddingTop: '20px',
            paddingBottom: '40px',
          }}
        >
          {processedData.length > 0 ? (
            <>
              {/* Grid Lines */}
              <div
                style={{
                  position: 'absolute',
                  left: '140px',
                  right: '60px',
                  top: '20px',
                  bottom: '40px',
                  backgroundImage: `
                  linear-gradient(to right, #e0e0e0 1px, transparent 1px),
                  linear-gradient(to bottom, #e0e0e0 1px, transparent 1px)
                `,
                  backgroundSize: `${100 / 6}% ${100 / processedData.length}%`,
                  opacity: 0.5,
                }}
              />

              {/* Y-axis (Roles) */}
              <div
                style={{
                  position: 'absolute',
                  left: '0',
                  top: '20px',
                  bottom: '40px',
                  width: '130px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                {processedData.map(item => (
                  <div
                    key={uuidv4()}
                    style={{
                      height: `${100 / processedData.length}%`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: '10px',
                      fontSize: '12px',
                      color: '#5f6368',
                      borderRight: '1px solid #9aa0a6',
                    }}
                  >
                    {item.role}
                  </div>
                ))}
              </div>

              {/* X-axis */}
              <div
                style={{
                  position: 'absolute',
                  left: '140px',
                  right: '60px',
                  bottom: '0',
                  height: '40px',
                  borderTop: '1px solid #9aa0a6',
                  display: 'flex',
                  alignItems: 'flex-start',
                  paddingTop: '5px',
                }}
              >
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
              <div
                style={{
                  position: 'absolute',
                  left: '140px',
                  right: '60px',
                  top: '20px',
                  bottom: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                {processedData.map(item => (
                  <div
                    key={uuidv4()}
                    style={{
                      height: `${100 / processedData.length}%`,
                      display: 'flex',
                      alignItems: 'center',
                      paddingTop: '10px',
                      paddingBottom: '10px',
                    }}
                  >
                    <div
                      style={{
                        width: `${(item.avgTime / maxTime) * 100}%`,
                        height: '60%',
                        backgroundColor: '#93c47d',
                        border: '1px solid #6aa84f',
                        borderRadius: '0 4px 4px 0',
                        position: 'relative',
                        minWidth: '2px',
                      }}
                    >
                      {/* Data Label */}
                      <div
                        style={{
                          position: 'absolute',
                          right: '-35px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#2d5016',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.avgTime} min
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* X-axis Label */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-25px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '12px',
                  color: '#5f6368',
                }}
              >
                Average Time taken to fill application (in minutes)
              </div>
            </>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '400px',
                color: '#5f6368',
                fontSize: '16px',
              }}
            >
              No data available for the selected filters
            </div>
          )}
        </div>

        {/* Summary Info */}
        {processedData.length > 0 && (
          <div
            style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              fontSize: '14px',
              color: '#5f6368',
            }}
          >
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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          minWidth: '150px',
        }}
      >
        {/* Dates Filter */}
        <div
          style={{
            border: '1px solid #dadce0',
            borderRadius: '4px',
            padding: '12px',
            backgroundColor: '#ffffff',
          }}
        >
          <div
            style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#3c4043',
              marginBottom: '8px',
            }}
          >
            Dates
          </div>
          <select
            value={dateFilter}
            onChange={e => {
              setDateFilter(e.target.value);
            }}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #dadce0',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: '#ffffff',
              color: '#3c4043',
            }}
          >
            <option value="all">ALL</option>
            <option value="weekly">Last 7 Days</option>
            <option value="monthly">Last 30 Days</option>
            <option value="yearly">Last Year</option>
          </select>
        </div>

        {/* Role Filter */}
        <div
          style={{
            border: '1px solid #dadce0',
            borderRadius: '4px',
            padding: '12px',
            backgroundColor: '#ffffff',
          }}
        >
          <div
            style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#3c4043',
              marginBottom: '8px',
            }}
          >
            Role
          </div>
          <select
            value={selectedRole}
            onChange={e => {
              setSelectedRole(e.target.value);
            }}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #dadce0',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: '#ffffff',
              color: '#3c4043',
            }}
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
