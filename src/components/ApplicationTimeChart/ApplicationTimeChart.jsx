import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import getApplicationData from './api';
import './ApplicationTimeChart.css';

function ApplicationTimeChart() {
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');

  const darkMode = useSelector(state => state.theme.darkMode);

  const palette = useMemo(() => {
    if (darkMode) {
      return {
        cardBg: '#0b1324',
        pageBgClass: 'bg-oxford-blue text-light',
        panelBg: '#0e1a33',
        border: '#314163',
        gridLine: '#243556',
        axis: '#3a4f75',
        textMuted: '#c7d0e0',
        textDefault: '#e8eef9',
        barFill: '#5fa862',
        barStroke: '#4e8c52',
        barLabel: '#d9f3d0',
        summaryBg: '#101a2c',
      };
    }
    return {
      cardBg: '#ffffff',
      pageBgClass: '',
      panelBg: '#ffffff',
      border: '#dadce0',
      gridLine: '#e0e0e0',
      axis: '#9aa0a6',
      textMuted: '#5f6368',
      textDefault: '#3c4043',
      barFill: '#93c47d',
      barStroke: '#6aa84f',
      barLabel: '#2d5016',
      summaryBg: '#f8f9fa',
    };
  }, [darkMode]);

  const rawData = getApplicationData();

  const processedData = useMemo(() => {
    let filtered = [...rawData];
    filtered = filtered.filter(item => item.timeToApply <= 30);

    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.timestamp);
        const daysAgo = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dateFilter === 'weekly') return daysAgo <= 7;
        if (dateFilter === 'monthly') return daysAgo <= 30;
        if (dateFilter === 'yearly') return daysAgo <= 365;
        return true;
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

    return Object.entries(roleGroups)
      .map(([role, times]) => {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        return { role, avgTime: Math.round(avg * 10) / 10, count: times.length };
      })
      .sort((a, b) => b.avgTime - a.avgTime);
  }, [rawData, dateFilter, selectedRole]);

  const roles = useMemo(() => {
    const uniqueRoles = [...new Set(rawData.map(item => item.role))];
    return ['all', ...uniqueRoles];
  }, [rawData]);

  const maxTime = Math.max(...processedData.map(item => item.avgTime), 10);

  // helper to decide if the label should be inside the bar (on small screens or wide bars)
  const getLabelPlacement = pct => {
    // If the bar is wide (>= 22% of width), put label inside; else outside
    return pct >= 22 ? 'inside' : 'outside';
  };

  return (
    <div className={`chart-page ${palette.pageBgClass}`}>
      {/* Chart Container */}
      <div
        className={`chart-main ${darkMode ? 'boxStyleDark' : ''}`}
        style={{
          border: `2px solid ${darkMode ? '#2a3a5a' : '#4285f4'}`,
          borderRadius: '8px',
          backgroundColor: palette.cardBg,
          padding: '20px',
        }}
      >
        {/* Title */}
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 400,
            color: palette.textMuted,
            margin: '0 0 30px 0',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          Comparing the Average Time Taken to Fill an Application by Role
        </h2>

        {/* Chart */}
        <div className="chart-stage">
          {processedData.length > 0 ? (
            <>
              {/* Grid Lines */}
              <div
                style={{
                  position: 'absolute',
                  left: 'var(--yAxisWidth)',
                  right: 'var(--rightPad)',
                  top: '20px',
                  bottom: '40px',
                  backgroundImage: `
                    linear-gradient(to right, ${palette.gridLine} 1px, transparent 1px),
                    linear-gradient(to bottom, ${palette.gridLine} 1px, transparent 1px)
                  `,
                  backgroundSize: `${100 / 6}% ${100 / processedData.length}%`,
                  opacity: darkMode ? 0.6 : 0.5,
                }}
              />

              {/* Y-axis (Roles) */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '20px',
                  bottom: '40px',
                  width: 'var(--yAxisWidth)',
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
                      fontSize: 'var(--yAxisFontSize)',
                      color: palette.textMuted,
                      borderRight: `1px solid ${palette.axis}`,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={item.role}
                  >
                    {item.role}
                  </div>
                ))}
              </div>

              {/* X-axis */}
              <div
                style={{
                  position: 'absolute',
                  left: 'var(--yAxisWidth)',
                  right: 'var(--rightPad)',
                  bottom: 0,
                  height: '40px',
                  borderTop: `1px solid ${palette.axis}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  paddingTop: '5px',
                  fontSize: 'var(--xAxisFontSize)',
                }}
              >
                {[0, 5, 10, 15, 20, 25, 30].map(tick => (
                  <div
                    key={tick}
                    style={{
                      position: 'absolute',
                      left: `${(tick / maxTime) * 100}%`,
                      color: palette.textMuted,
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
                  left: 'var(--yAxisWidth)',
                  right: 'var(--rightPad)',
                  top: '20px',
                  bottom: '40px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                {processedData.map(item => {
                  const pct = (item.avgTime / maxTime) * 100;
                  const labelPlacement = getLabelPlacement(pct);
                  const labelInside = labelPlacement === 'inside';
                  return (
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
                          width: `${pct}%`,
                          height: '60%',
                          backgroundColor: palette.barFill,
                          border: `1px solid ${palette.barStroke}`,
                          borderRadius: '0 4px 4px 0',
                          position: 'relative',
                          minWidth: '2px',
                          boxShadow: darkMode ? '0 0 8px rgba(95,168,98,0.25)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: labelInside ? 'flex-end' : 'flex-start',
                          paddingRight: labelInside ? 8 : 0,
                        }}
                      >
                        {/* Data Label */}
                        <div
                          style={{
                            position: labelInside ? 'static' : 'absolute',
                            right: labelInside ? 'auto' : '-35px',
                            top: labelInside ? 'auto' : '50%',
                            transform: labelInside ? 'none' : 'translateY(-50%)',
                            fontSize: 'var(--barLabelFont)',
                            fontWeight: 600,
                            color: labelInside
                              ? darkMode
                                ? '#0b1324'
                                : '#1a2a1a'
                              : palette.barLabel,
                            whiteSpace: 'nowrap',
                            filter:
                              darkMode && !labelInside
                                ? 'drop-shadow(0 1px 0 rgba(0,0,0,0.5))'
                                : 'none',
                          }}
                        >
                          {item.avgTime} min
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* X-axis Label */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-25px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 12,
                  color: palette.textMuted,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                Average Time taken to fill application (in minutes)
              </div>
            </>
          ) : (
            <div
              className={darkMode ? 'text-light' : ''}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'var(--minChartHeight)',
                color: palette.textMuted,
                fontSize: '16px',
                textAlign: 'center',
                padding: '0 12px',
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
              backgroundColor: palette.summaryBg,
              borderRadius: '4px',
              fontSize: '14px',
              border: `1px solid ${palette.border}`,
            }}
          >
            <div>
              <strong style={{ color: darkMode ? '#ffffff' : '#000000' }}>Showing:</strong>{' '}
              <span style={{ color: darkMode ? '#ffffff' : '#000000' }}>
                {processedData.length} role(s)
              </span>
            </div>
            <div>
              <strong style={{ color: darkMode ? '#ffffff' : '#000000' }}>Fastest:</strong>{' '}
              <span style={{ color: darkMode ? '#ffffff' : '#000000' }}>
                {processedData[processedData.length - 1]?.role} (
                {processedData[processedData.length - 1]?.avgTime} min)
              </span>
            </div>
            <div>
              <strong style={{ color: darkMode ? '#ffffff' : '#000000' }}>Slowest:</strong>{' '}
              <span style={{ color: darkMode ? '#ffffff' : '#000000' }}>
                {processedData[0]?.role} ({processedData[0]?.avgTime} min)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      <div className="chart-sidepanel">
        {/* Dates Filter */}
        <div
          style={{
            border: `1px solid ${palette.border}`,
            borderRadius: '4px',
            padding: '12px',
            backgroundColor: palette.panelBg,
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: palette.textDefault,
              marginBottom: '8px',
            }}
          >
            Dates
          </div>
          <select
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className={darkMode ? 'bg-space-cadet text-light' : ''}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: `1px solid ${palette.border}`,
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: darkMode ? '#0e1a33' : '#ffffff',
              color: darkMode ? '#e8eef9' : '#3c4043',
              outline: 'none',
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
            border: `1px solid ${palette.border}`,
            borderRadius: '4px',
            padding: '12px',
            backgroundColor: palette.panelBg,
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: palette.textDefault,
              marginBottom: '8px',
            }}
          >
            Role
          </div>
          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className={darkMode ? 'bg-space-cadet text-light' : ''}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: `1px solid ${palette.border}`,
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: darkMode ? '#0e1a33' : '#ffffff',
              color: darkMode ? '#e8eef9' : '#3c4043',
              outline: 'none',
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
