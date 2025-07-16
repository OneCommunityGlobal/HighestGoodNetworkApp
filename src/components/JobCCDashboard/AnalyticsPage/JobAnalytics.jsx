/* eslint-disable no-unused-vars */
/* eslint-disable react/button-has-type */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Clock,
  ChevronDown,
  Shield,
  Lock,
  RefreshCw,
  Activity,
  BarChart3,
  PieChartIcon,
} from 'lucide-react';

// ======================== CONFIGURATION ========================
const CONFIG = {
  API: {
    BASE_URL: 'https://api.example.com', // TODO: Replace with your actual API URL
    ENDPOINTS: {
      ANALYTICS: '/analytics/data',
      PERMISSIONS: '/user/permissions',
      REALTIME: '/analytics/realtime',
    },
  },
  CHART_COLORS: {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    gray: '#94a3b8',
  },
  REFRESH_INTERVAL: 300000, // 5 minutes
  DATE_FORMAT: {
    display: { month: 'short', day: 'numeric' },
    api: 'YYYY-MM-DD',
  },
};

// ======================== STYLES ========================
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '1.5rem',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '0.25rem',
  },
  subtitle: {
    color: '#6b7280',
    marginTop: '0.25rem',
  },
  card: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    transition: 'box-shadow 0.3s',
    cursor: 'pointer',
  },
  cardHover: {
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontSize: '0.875rem',
  },
  buttonHover: {
    backgroundColor: '#f9fafb',
  },
  input: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  inputFocus: {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },
  metric: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#111827',
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#d1fae5',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#065f46',
  },
  grid: {
    display: 'grid',
    gap: '1.5rem',
  },
  flexBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flexGap: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '1rem',
    color: '#991b1b',
  },
  loadingContainer: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

// ======================== API SERVICE ========================
class AnalyticsService {
  static async fetchData(dateRange, comparisonPeriod) {
    try {
      // TODO: Uncomment when backend is ready
      // const response = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.ANALYTICS}`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.getAuthToken()}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ dateRange, comparisonPeriod })
      // });
      //
      // if (!response.ok) throw new Error('Failed to fetch analytics data');
      // return await response.json();

      // Mock data - Remove when backend is connected
      await this.simulateApiDelay();
      return this.generateMockAnalyticsData(dateRange, comparisonPeriod);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Analytics fetch error:', error);
      throw error;
    }
  }

  static async fetchPermissions() {
    try {
      // TODO: Uncomment when backend is ready
      // const response = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.PERMISSIONS}`, {
      //   headers: {
      //     'Authorization': `Bearer ${this.getAuthToken()}`
      //   }
      // });
      //
      // if (!response.ok) throw new Error('Failed to fetch permissions');
      // return await response.json();

      // Mock data - Remove when backend is connected
      await this.simulateApiDelay(200);
      return {
        role: 'admin',
        permissions: {
          viewAnalytics: true,
          editSettings: true,
          exportData: true,
          manageUsers: false,
        },
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Permissions fetch error:', error);
      throw error;
    }
  }

  static getAuthToken() {
    return localStorage.getItem('authToken') || '';
  }

  static simulateApiDelay(ms = 500) {
    // eslint-disable-next-line no-promise-executor-return
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // eslint-disable-next-line no-unused-vars
  static generateMockAnalyticsData(dateRange, comparisonPeriod) {
    const generateTimeSeriesData = (days, offset) => {
      const data = [];
      const today = new Date();

      // eslint-disable-next-line no-plusplus
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        data.push({
          date: date.toISOString().split('T')[0],
          displayDate: date.toLocaleDateString('en-US', CONFIG.DATE_FORMAT.display),
          users: Math.floor(Math.random() * 300) + 700 + offset,
          pageViews: Math.floor(Math.random() * 2000) + 4000 + offset * 5,
          sessions: Math.floor(Math.random() * 400) + 600 + offset * 0.8,
          bounceRate: Math.floor(Math.random() * 20) + 35,
          avgDuration: Math.floor(Math.random() * 120) + 180,
        });
      }
      return data;
    };

    return {
      currentPeriod: generateTimeSeriesData(30, 100),
      previousPeriod: generateTimeSeriesData(30, 0),
      metrics: {
        current: {
          totalUsers: 23456,
          totalPageViews: 145678,
          totalSessions: 18934,
          avgBounceRate: 42.3,
          avgSessionDuration: 245,
        },
        previous: {
          totalUsers: 21234,
          totalPageViews: 132456,
          totalSessions: 17123,
          avgBounceRate: 45.7,
          avgSessionDuration: 220,
        },
      },
      deviceBreakdown: [
        { name: 'Desktop', value: 45, previousValue: 42, sessions: 8520 },
        { name: 'Mobile', value: 38, previousValue: 40, sessions: 7195 },
        { name: 'Tablet', value: 17, previousValue: 18, sessions: 3219 },
      ],
      trafficSources: [
        { source: 'Organic Search', current: 3500, previous: 3200 },
        { source: 'Direct', current: 2800, previous: 2900 },
        { source: 'Social Media', current: 1200, previous: 1000 },
        { source: 'Referral', current: 800, previous: 750 },
        { source: 'Email', current: 600, previous: 650 },
      ],
    };
  }
}

// ======================== UTILITY FUNCTIONS ========================
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return { value: 100, isPositive: true, formatted: '+100%' };
  const change = ((current - previous) / previous) * 100;
  return {
    value: change,
    isPositive: change > 0,
    formatted: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
  };
};

const formatNumber = num => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

// ======================== DATE RANGE PRESETS ========================
const DATE_RANGE_PRESETS = {
  last7Days: {
    label: 'Last 7 Days',
    getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      };
    },
  },
  last30Days: {
    label: 'Last 30 Days',
    getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      };
    },
  },
  thisMonth: {
    label: 'This Month',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      };
    },
  },
  lastMonth: {
    label: 'Last Month',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      };
    },
  },
};

// ======================== CUSTOM HOOKS ========================
const useAnalyticsData = (dateRange, comparisonPeriod) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const analyticsData = await AnalyticsService.fetchData(dateRange, comparisonPeriod);
      setData(analyticsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dateRange, comparisonPeriod]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

const useUserPermissions = () => {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const userPermissions = await AnalyticsService.fetchPermissions();
        setPermissions(userPermissions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  return { permissions, loading, error };
};

// ======================== COMPONENTS ========================
function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
    >
      <div style={{ textAlign: 'center' }}>
        <RefreshCw
          className="animate-spin"
          style={{
            width: '2rem',
            height: '2rem',
            color: '#3b82f6',
            margin: '0 auto 1rem',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p style={{ color: '#6b7280' }}>{message}</p>
      </div>
    </div>
  );
}

function ErrorMessage({ error, onRetry }) {
  return (
    <div style={styles.errorBox}>
      <p>{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: '0.5rem',
            fontSize: '0.875rem',
            color: '#dc2626',
            textDecoration: 'underline',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      )}
    </div>
  );
}

function AccessDenied() {
  return (
    <div style={styles.loadingContainer}>
      <div
        style={{
          ...styles.card,
          textAlign: 'center',
          maxWidth: '28rem',
          padding: '2rem',
        }}
      >
        <Lock
          style={{
            width: '4rem',
            height: '4rem',
            color: '#9ca3af',
            margin: '0 auto 1rem',
          }}
        />
        <h2 style={{ ...styles.title, marginBottom: '0.5rem' }}>Access Restricted</h2>
        <p style={{ color: '#6b7280' }}>Only owners and administrators can view analytics.</p>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, title, value, change = {}, colorClass }) {
  const [isHovered, setIsHovered] = useState(false);
  const changeFormatted = change.formatted || '0%';
  const isPositive = change.isPositive || false;

  return (
    <div
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHover : {}),
        cursor: 'default',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.flexBetween}>
        <Icon style={{ width: '2rem', height: '2rem', color: colorClass }} />
        {changeFormatted !== '0%' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.875rem',
              color: isPositive ? '#16a34a' : '#dc2626',
            }}
          >
            {isPositive ? (
              <TrendingUp style={{ width: '1rem', height: '1rem' }} />
            ) : (
              <TrendingDown style={{ width: '1rem', height: '1rem' }} />
            )}
            {changeFormatted}
          </div>
        )}
      </div>
      <h3 style={styles.metric}>{typeof value === 'string' ? value : formatNumber(value)}</h3>
      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{title}</p>
    </div>
  );
}

function ChartCard({ title, children, icon: Icon }) {
  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        {Icon && <Icon style={{ width: '1.25rem', height: '1.25rem', color: '#6b7280' }} />}
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function DateRangeSelector({ dateRange, setDateRange, comparisonPeriod, setComparisonPeriod }) {
  return (
    <div style={styles.card}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.25rem',
            }}
          >
            Quick Select
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {Object.entries(DATE_RANGE_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => setDateRange(preset.getValue())}
                style={{
                  ...styles.button,
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  fontSize: '0.875rem',
                }}
                onMouseEnter={e => (e.target.style.backgroundColor = '#e5e7eb')}
                onMouseLeave={e => (e.target.style.backgroundColor = '#f3f4f6')}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.25rem',
            }}
          >
            Custom Date Range
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="date"
              value={dateRange.start}
              onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
              style={styles.input}
            />
            <span style={{ color: '#6b7280' }}>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
              style={styles.input}
            />
          </div>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.25rem',
            }}
          >
            Compare with
          </label>
          <select
            value={comparisonPeriod}
            onChange={e => setComparisonPeriod(e.target.value)}
            style={{ ...styles.input, cursor: 'pointer' }}
          >
            <option value="previous-week">Previous Week</option>
            <option value="previous-month">Previous Month</option>
            <option value="previous-year">Same Period Last Year</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ======================== MAIN COMPONENT ========================
function AnalyticsDashboard() {
  // Add CSS animation for spinner
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .animate-spin {
        animation: spin 1s linear infinite;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const [dateRange, setDateRange] = useState(DATE_RANGE_PRESETS.last30Days.getValue());
  const [comparisonPeriod, setComparisonPeriod] = useState('previous-month');

  const {
    permissions,
    loading: permissionsLoading,
    error: permissionsError,
  } = useUserPermissions();
  const { data: analyticsData, loading: dataLoading, error: dataError, refetch } = useAnalyticsData(
    dateRange,
    comparisonPeriod,
  );

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const metrics = useMemo(() => {
    if (!analyticsData) return null;

    const { current, previous } = analyticsData.metrics;

    return {
      users: {
        value: current.totalUsers,
        change: calculatePercentageChange(current.totalUsers, previous.totalUsers),
      },
      pageViews: {
        value: current.totalPageViews,
        change: calculatePercentageChange(current.totalPageViews, previous.totalPageViews),
      },
      sessions: {
        value: current.totalSessions,
        change: calculatePercentageChange(current.totalSessions, previous.totalSessions),
      },
      bounceRate: {
        value: current.avgBounceRate,
        change: calculatePercentageChange(current.avgBounceRate, previous.avgBounceRate),
      },
    };
  }, [analyticsData]);

  // Check permissions
  const hasAccess = permissions?.role === 'owner' || permissions?.role === 'admin';

  if (permissionsLoading) {
    return (
      <div style={styles.loadingContainer}>
        <LoadingSpinner message="Checking permissions..." />
      </div>
    );
  }

  if (permissionsError) {
    return (
      <div style={{ ...styles.loadingContainer, padding: '1.5rem' }}>
        <ErrorMessage error={permissionsError} />
      </div>
    );
  }

  if (!hasAccess) {
    return <AccessDenied />;
  }

  return (
    <div style={styles.container}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        {/* Header */}
        <header style={styles.header}>
          <div style={{ ...styles.flexBetween, marginBottom: '1.5rem' }}>
            <div>
              <h1 style={styles.title}>Analytics Dashboard</h1>
              <p style={styles.subtitle}>Monitor your website performance and user engagement</p>
            </div>
            <div style={styles.flexGap}>
              <button
                onClick={handleRefresh}
                disabled={refreshing || dataLoading}
                style={{
                  ...styles.button,
                  opacity: refreshing || dataLoading ? 0.5 : 1,
                  cursor: refreshing || dataLoading ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={e =>
                  !refreshing && !dataLoading && (e.target.style.backgroundColor = '#f9fafb')
                }
                onMouseLeave={e => (e.target.style.backgroundColor = 'white')}
              >
                <RefreshCw
                  className={refreshing ? 'animate-spin' : ''}
                  style={{ width: '1rem', height: '1rem' }}
                />
                Refresh
              </button>
              <div style={styles.badge}>
                <Shield style={{ width: '1.25rem', height: '1.25rem', color: '#059669' }} />
                <span>{permissions.role === 'owner' ? 'Owner' : 'Admin'} Access</span>
              </div>
            </div>
          </div>

          <DateRangeSelector
            dateRange={dateRange}
            setDateRange={setDateRange}
            comparisonPeriod={comparisonPeriod}
            setComparisonPeriod={setComparisonPeriod}
          />
        </header>

        {/* Error State */}
        {dataError && <ErrorMessage error={dataError} onRetry={refetch} />}

        {/* Loading State */}
        {dataLoading && !analyticsData ? (
          <LoadingSpinner message="Loading analytics data..." />
        ) : (
          <>
            {/* Key Metrics */}
            <section
              style={{
                ...styles.grid,
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                marginBottom: '2rem',
              }}
            >
              <MetricCard
                icon={Users}
                title="Total Users"
                value={metrics?.users.value || 0}
                change={metrics?.users.change || { formatted: '0%', isPositive: false }}
                colorClass={CONFIG.CHART_COLORS.primary}
              />
              <MetricCard
                icon={Eye}
                title="Page Views"
                value={metrics?.pageViews.value || 0}
                change={metrics?.pageViews.change || { formatted: '0%', isPositive: false }}
                colorClass={CONFIG.CHART_COLORS.success}
              />
              <MetricCard
                icon={Activity}
                title="Sessions"
                value={metrics?.sessions.value || 0}
                change={metrics?.sessions.change || { formatted: '0%', isPositive: false }}
                colorClass={CONFIG.CHART_COLORS.purple}
              />
              <MetricCard
                icon={ChevronDown}
                title="Bounce Rate"
                value={metrics?.bounceRate ? `${metrics.bounceRate.value.toFixed(1)}%` : '0.0%'}
                change={metrics?.bounceRate?.change || { formatted: '0%', isPositive: false }}
                colorClass={CONFIG.CHART_COLORS.warning}
              />
            </section>

            {/* Charts */}
            <section
              style={{
                ...styles.grid,
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                marginBottom: '2rem',
              }}
            >
              {/* User Trend Chart */}
              <ChartCard title="User Trend Comparison" icon={TrendingUp}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData?.currentPeriod || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke={CONFIG.CHART_COLORS.primary}
                      strokeWidth={2}
                      name="Current Period"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      data={analyticsData?.previousPeriod || []}
                      stroke={CONFIG.CHART_COLORS.gray}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Previous Period"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Page Views Area Chart */}
              <ChartCard title="Page Views Over Time" icon={Eye}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData?.currentPeriod || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="pageViews"
                      stroke={CONFIG.CHART_COLORS.success}
                      fill={CONFIG.CHART_COLORS.success}
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Traffic Sources Bar Chart */}
              <ChartCard title="Traffic Sources" icon={BarChart3}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData?.trafficSources || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="source" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="current"
                      fill={CONFIG.CHART_COLORS.primary}
                      name="Current Period"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="previous"
                      fill={CONFIG.CHART_COLORS.gray}
                      name="Previous Period"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Device Breakdown Pie Chart */}
              <ChartCard title="Device Breakdown" icon={PieChartIcon}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData?.deviceBreakdown || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, previousValue }) => {
                        const change = calculatePercentageChange(value, previousValue);
                        return `${name}: ${value}% (${change.formatted})`;
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData?.deviceBreakdown.map((entry, index) => (
                        <Cell
                          // eslint-disable-next-line react/no-array-index-key
                          key={`cell-${index}`}
                          fill={
                            Object.values(CONFIG.CHART_COLORS)[
                              index % Object.values(CONFIG.CHART_COLORS).length
                            ]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </section>

            {/* Sessions & Bounce Rate Combined Chart */}
            <section>
              <ChartCard title="Sessions & Bounce Rate Analysis" icon={Activity}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData?.currentPeriod || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="sessions"
                      stroke={CONFIG.CHART_COLORS.purple}
                      strokeWidth={2}
                      name="Sessions"
                      dot={false}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="bounceRate"
                      stroke={CONFIG.CHART_COLORS.danger}
                      strokeWidth={2}
                      name="Bounce Rate (%)"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
