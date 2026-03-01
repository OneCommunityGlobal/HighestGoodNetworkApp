/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
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
  RefreshCw,
  Users,
  Eye,
  Activity,
  ChevronDown,
  TrendingUp,
  BarChart3,
  PieChartIcon,
  Lock,
  TrendingDown,
} from 'lucide-react';
import styles from './JobAnalytics.module.css';
import hasPermission from '../../../utils/permissions';
import { ENDPOINTS } from '../../../utils/URL';

// ======================== CONFIG ========================
const CONFIG = {
  API: {
    ENDPOINTS: {
      ANALYTICS: `${ENDPOINTS.JOB_ANALYTICS}`,
      REALTIME: `${ENDPOINTS.JOB_ANALYTICS_REALTIME}`,
    },
  },
  CHART_COLORS: {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    gray: '#94a3b8',
    dark: {
      primary: '#60a5fa',
      success: '#34d399',
      warning: '#fbbf24',
      danger: '#f87171',
      purple: '#a78bfa',
      gray: '#cbd5e1',
    },
  },
  DATE_FORMAT: {
    display: { month: 'short', day: 'numeric' },
    api: 'YYYY-MM-DD',
  },
};

// ======================== UTILITIES ========================
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return { value: 100, isPositive: true, formatted: '+100%' };
  const change = ((current - previous) / previous) * 100;
  return {
    value: change,
    isPositive: change > 0,
    formatted: `${change > 0 ? '+' : ''}${change.toFixed(1)}%`,
  };
};

const formatNumber = n => new Intl.NumberFormat('en-US').format(n ?? 0);

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const listener = () => setMatches(m.matches);
    m.addEventListener?.('change', listener);
    // fallback for older
    m.addListener?.(listener);
    return () => {
      m.removeEventListener?.('change', listener);
      m.removeListener?.(listener);
    };
  }, [query]);
  return matches;
}

// ======================== API SERVICE (Mock + Secure RNG) ========================
class AnalyticsService {
  static getAuthToken() {
    return localStorage.getItem('token') || '';
  }

  static simulateApiDelay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async fetchData(dateRange, comparisonPeriod) {
    try {
      // TODO: Replace with real API when ready
      // const response = await fetch(`${CONFIG.API.ENDPOINTS.ANALYTICS}`, { ... });
      // if (!response.ok) throw new Error('Failed to fetch analytics data');
      // return await response.json();

      await this.simulateApiDelay();
      return this.generateMockAnalyticsData(dateRange, comparisonPeriod);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Analytics fetch error:', err);
      throw err;
    }
  }

  // ✅ Secure pseudo-random helper for UI demo analytics data only.
  // NOTE: Not used for authentication, cryptography, or access control.
  static secureRandom(min, max) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return min + (array[0] % (max - min + 1));
  }

  static generateMockAnalyticsData(dateRange, comparisonPeriod) {
    const genSeries = (startDate, endDate, offset = 0) => {
      const data = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
      for (let i = 0; i <= diffDays; i += 1) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        data.push({
          date: date.toISOString().split('T')[0],
          displayDate: date.toLocaleDateString('en-US', CONFIG.DATE_FORMAT.display),

          // ✅ Secure dummy simulation values:
          users: this.secureRandom(700 + offset, 1000 + offset),
          pageViews: this.secureRandom(4000 + offset * 5, 6000 + offset * 5),
          sessions: this.secureRandom(
            Math.floor(600 + offset * 0.8),
            Math.floor(1000 + offset * 0.8),
          ),
          bounceRate: this.secureRandom(35, 55),
          avgDuration: this.secureRandom(180, 300),
        });
      }
      return data;
    };

    const { start, end } =
      dateRange ??
      (() => {
        const e = new Date();
        const s = new Date();
        s.setDate(e.getDate() - 30);
        return { start: s.toISOString().split('T')[0], end: e.toISOString().split('T')[0] };
      })();

    return {
      currentPeriod: genSeries(start, end, 100),
      previousPeriod: genSeries(start, end, 0),
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

// ======================== HOOKS ========================
function useAnalyticsData(dateRange, comparisonPeriod) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AnalyticsService.fetchData(dateRange, comparisonPeriod);
      setData(res);
    } catch (e) {
      setError(e.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [dateRange, comparisonPeriod]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ======================== SMALL REUSABLE UIs (Module CSS) ========================
function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      <p className={styles.loadingText}>{message}</p>
    </div>
  );
}

function ErrorMessage({ error, onRetry }) {
  return (
    <div className={styles.errorBox}>
      <p className={styles.errorText}>{error}</p>
      {onRetry && (
        <button className={`${styles.btn} ${styles.btnLink}`} onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

function AccessDenied() {
  return (
    <div className={styles.accessWrapper}>
      <div className={styles.accessCard}>
        <Lock className={styles.accessIcon} />
        <h2 className={styles.accessTitle}>Access Restricted</h2>
        <p className={styles.accessMessage}>
          You don't have permission to view analytics. Only owners, administrators, and users with
          analytics permissions can access this page.
        </p>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, title, value, change }) {
  const isPositive = change?.isPositive ?? false;
  return (
    <div className={styles.metricCard}>
      <div className={styles.metricTop}>
        <div className={styles.metricIconWrap}>
          <Icon className={styles.metricIcon} />
        </div>
        {change && change.formatted !== '0%' && (
          <div className={`${styles.change} ${isPositive ? styles.positive : styles.negative}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{change.formatted}</span>
          </div>
        )}
      </div>
      <div className={styles.metricValue}>
        {typeof value === 'string' ? value : formatNumber(value)}
      </div>
      <div className={styles.metricTitle}>{title}</div>
    </div>
  );
}

function ChartCard({ title, icon: Icon, children, className }) {
  return (
    <div className={`${styles.chartCard} ${className || ''}`}>
      <div className={styles.chartHeader}>
        {Icon && (
          <div className={styles.chartIconWrap}>
            <Icon className={styles.chartIcon} />
          </div>
        )}
        <h3 className={styles.chartTitle}>{title}</h3>
      </div>
      <div className={styles.chartBody}>{children}</div>
    </div>
  );
}

const DATE_RANGE_PRESETS = {
  last7Days: {
    label: 'Last 7 Days',
    getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    },
  },
  last30Days: {
    label: 'Last 30 Days',
    getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    },
  },
  thisMonth: {
    label: 'This Month',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    },
  },
  lastMonth: {
    label: 'Last Month',
    getValue: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    },
  },
};

function DateRangeSelector({ dateRange, setDateRange, comparisonPeriod, setComparisonPeriod }) {
  const [active, setActive] = useState('last30Days');
  useEffect(() => {
    if (!dateRange) {
      const preset = DATE_RANGE_PRESETS.last30Days.getValue();
      setDateRange(preset);
    }
  }, [dateRange, setDateRange]);

  return (
    <div className={styles.selectorCard}>
      <div className={styles.selectorRow}>
        <div className={styles.selectorCol}>
          <label className={styles.label}>Quick Select</label>
          <div className={styles.quickRow}>
            {Object.entries(DATE_RANGE_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                className={`${styles.btn} ${active === key ? styles.btnPrimary : styles.btnGhost}`}
                onClick={() => {
                  setDateRange(preset.getValue());
                  setActive(key);
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.selectorCol}>
          <label className={styles.label}>Custom Date Range</label>
          <div className={styles.datesRow}>
            <input
              type="date"
              className={styles.input}
              value={dateRange?.start || ''}
              onChange={e => {
                setDateRange({ ...dateRange, start: e.target.value });
                setActive(null);
              }}
            />
            <span className={styles.to}>to</span>
            <input
              type="date"
              className={styles.input}
              value={dateRange?.end || ''}
              onChange={e => {
                setDateRange({ ...dateRange, end: e.target.value });
                setActive(null);
              }}
            />
          </div>
        </div>

        <div className={styles.selectorColNarrow}>
          <label className={styles.label}>Compare with</label>
          <select
            className={`${styles.input} ${styles.select}`}
            value={comparisonPeriod}
            onChange={e => setComparisonPeriod(e.target.value)}
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

// ======================== MAIN ========================
function JobAnalytics({ darkMode, role, hasPermission: hasPerm }) {
  // Theme attribute for global CSS
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const canViewAnalytics = hasPerm('getJobReports');
  if (!canViewAnalytics) return <AccessDenied />;

  const isMobile = useMediaQuery('(max-width: 640px)');

  const [dateRange, setDateRange] = useState(null);
  const [comparisonPeriod, setComparisonPeriod] = useState('previous-month');

  const { data: analyticsData, loading, error, refetch } = useAnalyticsData(
    dateRange,
    comparisonPeriod,
  );

  const mergedData = useMemo(() => {
    if (!analyticsData?.currentPeriod || !analyticsData?.previousPeriod) return [];
    return analyticsData.currentPeriod.map((d, i) => ({
      ...d,
      prevUsers: analyticsData.previousPeriod[i]?.users ?? null,
    }));
  }, [analyticsData]);

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
        value: `${current.avgBounceRate.toFixed(1)}%`,
        change: calculatePercentageChange(current.avgBounceRate, previous.avgBounceRate),
      },
    };
  }, [analyticsData]);

  const colors = darkMode ? CONFIG.CHART_COLORS.dark : CONFIG.CHART_COLORS;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h2 className={styles.title}>Job Analytics</h2>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={refetch}
          disabled={loading}
        >
          <RefreshCw className={loading ? styles.spin : ''} size={16} />
          <span>Refresh</span>
        </button>
      </header>

      <DateRangeSelector
        dateRange={dateRange}
        setDateRange={setDateRange}
        comparisonPeriod={comparisonPeriod}
        setComparisonPeriod={setComparisonPeriod}
      />

      {error && <ErrorMessage error={error} onRetry={refetch} />}

      {loading && !analyticsData ? (
        <LoadingSpinner message="Loading analytics data..." />
      ) : (
        <>
          {/* Metrics */}
          <section className={styles.metricsGrid}>
            <MetricCard
              icon={Users}
              title="Total Users"
              value={metrics?.users.value || 0}
              change={metrics?.users.change}
            />
            <MetricCard
              icon={Eye}
              title="Page Views"
              value={metrics?.pageViews.value || 0}
              change={metrics?.pageViews.change}
            />
            <MetricCard
              icon={Activity}
              title="Sessions"
              value={metrics?.sessions.value || 0}
              change={metrics?.sessions.change}
            />
            <MetricCard
              icon={ChevronDown}
              title="Bounce Rate"
              value={metrics?.bounceRate.value || '0.0%'}
              change={metrics?.bounceRate.change}
            />
          </section>

          {/* Charts */}
          <section className={styles.chartsGrid} data-mobile={isMobile ? '1' : '0'}>
            <ChartCard title="User Trend Comparison" icon={TrendingUp}>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={mergedData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className={styles.gridStroke} />
                  <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={['dataMin - 100', 'dataMax + 100']} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke={colors.primary}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                    name="Current Period"
                  />
                  <Line
                    type="monotone"
                    dataKey="prevUsers"
                    stroke={colors.gray}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Previous Period"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Page Views Over Time" icon={Eye}>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart
                  data={analyticsData?.currentPeriod || []}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.success} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={colors.success} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className={styles.gridStroke} />
                  <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={['dataMin - 500', 'dataMax + 500']} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="pageViews"
                    stroke={colors.success}
                    fill="url(#colorPageViews)"
                    strokeWidth={3}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Traffic Sources" icon={BarChart3}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={analyticsData?.trafficSources || []}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className={styles.gridStroke} />
                  <XAxis
                    dataKey="source"
                    tick={{ fontSize: 12 }}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 'dataMax + 500']} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="current"
                    fill={colors.primary}
                    name="Current Period"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="previous"
                    fill={colors.gray}
                    name="Previous Period"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Device Breakdown" icon={PieChartIcon}>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={analyticsData?.deviceBreakdown || []}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, value, previousValue }) => {
                      const change = calculatePercentageChange(value, previousValue);
                      return `${name}: ${value}% (${change.formatted})`;
                    }}
                  >
                    {(analyticsData?.deviceBreakdown || []).map((_, i) => (
                      <Cell
                        key={`c-${i}`}
                        fill={[colors.primary, colors.success, colors.warning][i]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            {/* Sessions & Bounce Rate Combined Chart */}
            <ChartCard
              title="Sessions & Bounce Rate Analysis"
              icon={Activity}
              className={styles.fullWidth}
            >
              <ResponsiveContainer width="100%" height={380}>
                <LineChart
                  data={analyticsData?.currentPeriod || []}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className={styles.gridStroke} />
                  <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    domain={['dataMin - 50', 'dataMax + 50']}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    domain={[0, 100]}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="sessions"
                    stroke={colors.purple}
                    strokeWidth={3}
                    name="Sessions"
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="bounceRate"
                    stroke={colors.danger}
                    strokeWidth={3}
                    name="Bounce Rate (%)"
                    dot={false}
                    strokeDasharray="3 3"
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </section>
        </>
      )}
    </div>
  );
}

const mapStateToProps = state => ({
  role: state.userProfile.role,
  darkMode: state.theme.darkMode,
});

const mapDispatchToProps = dispatch => ({
  hasPermission: action => dispatch(hasPermission(action)),
});

export default connect(mapStateToProps, mapDispatchToProps)(JobAnalytics);
