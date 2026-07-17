/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/no-unescaped-entities */
import React, { useState, useMemo, useEffect, useCallback, useId } from 'react';
import { connect, useSelector } from 'react-redux';
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
  Monitor,
  Smartphone,
  Tablet,
  Info,
  X,
} from 'lucide-react';
import styles from './JobAnalytics.module.css';
import hasPermission from '../../../utils/permissions';
import { ENDPOINTS } from '../../../utils/URL';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import clsx from 'clsx';

const ROLE_OPTIONS = [
  'All Roles',
  'Frontend Developer',
  'Backend Developer',
  'Data Analyst',
  'Product Manager',
  'UX Designer',
];

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

// Device multipliers for generating device-specific mock data
const DEVICE_MULTIPLIERS = {
  Desktop: { users: 0.45, pageViews: 0.5, sessions: 0.45, bounceRate: 0.85, avgDuration: 1.2 },
  Mobile: { users: 0.38, pageViews: 0.35, sessions: 0.38, bounceRate: 1.15, avgDuration: 0.75 },
  Tablet: { users: 0.17, pageViews: 0.15, sessions: 0.17, bounceRate: 1.0, avgDuration: 1.0 },
};

const DEVICE_ICONS = { Desktop: Monitor, Mobile: Smartphone, Tablet };

const METRIC_TOOLTIPS = {
  users: 'Total number of unique visitors who accessed the site in the selected period.',
  pageViews: 'Total number of pages viewed. Repeated views of a single page are counted.',
  sessions:
    'A session is a group of user interactions within a given time frame (30 min idle = new session).',
  bounceRate:
    'Percentage of sessions where the user left without interacting further. Lower is better.',
  avgEngagementTime: 'Average time (in seconds) a user actively engaged with the page per session.',
};

// ======================== SHARED CONSTANTS ========================
const AXIS_TICK = { fontSize: 12 };

const CHART_MARGIN = { top: 10, right: 10, left: 0, bottom: 10 };

const GRID_PROPS = {
  strokeDasharray: '3 3',
};

const getTooltipStyles = darkMode => ({
  contentStyle: {
    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
    borderColor: darkMode ? '#374151' : '#e5e7eb',
    color: darkMode ? '#f9fafb' : '#111827',
  },
  itemStyle: {
    color: darkMode ? '#f9fafb' : '#111827',
  },
});

const getCursorStyle = darkMode => ({
  fill: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
});

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
    m.addListener?.(listener);
    return () => {
      m.removeEventListener?.('change', listener);
      m.removeListener?.(listener);
    };
  }, [query]);
  return matches;
}

const toIsoDate = d => {
  if (!d) return '';
  if (typeof d === 'string') return d.split('T')[0];
  return d.toISOString().split('T')[0];
};

// ======================== API SERVICE ========================
class AnalyticsService {
  static getAuthToken() {
    return localStorage.getItem('token') || '';
  }

  static simulateApiDelay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async fetchData(dateRange, comparisonPeriod, role) {
    try {
      // Replace with real API when ready
      // const response = await fetch(`${CONFIG.API.ENDPOINTS.ANALYTICS}`, { ... });
      // if (!response.ok) throw new Error('Failed to fetch analytics data');
      // return await response.json();

      await this.simulateApiDelay();
      return this.generateMockAnalyticsData(dateRange, comparisonPeriod, role);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Analytics fetch error:', err);
      throw err;
    }
  }

  // Secure pseudo-random helper for UI demo analytics data only.
  // Secure pseudo-random helper for UI demo analytics data only.
  // NOTE: Not used for authentication, cryptography, or access control.
  static secureRandom(min, max) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return min + (array[0] % (max - min + 1));
  }

  static generateMockAnalyticsData(dateRange, comparisonPeriod, role = 'All Roles') {
    const genSeries = (startDate, endDate, offset = 0) => {
      const data = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
      for (let i = 0; i <= diffDays; i += 1) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        const baseUsers = this.secureRandom(700 + offset, 1000 + offset);
        const basePageViews = this.secureRandom(4000 + offset * 5, 6000 + offset * 5);
        const baseSessions = this.secureRandom(
          Math.floor(600 + offset * 0.8),
          Math.floor(1000 + offset * 0.8),
        );
        const baseBounceRate = this.secureRandom(35, 55);
        const baseAvgDuration = this.secureRandom(180, 300);

        const deviceData = {};
        ['Desktop', 'Mobile', 'Tablet'].forEach(device => {
          const m = DEVICE_MULTIPLIERS[device];
          deviceData[device] = {
            users: Math.round(baseUsers * m.users),
            pageViews: Math.round(basePageViews * m.pageViews),
            sessions: Math.round(baseSessions * m.sessions),
            bounceRate: Math.round(baseBounceRate * m.bounceRate),
            avgDuration: Math.round(baseAvgDuration * m.avgDuration),
          };
        });

        data.push({
          date: date.toISOString().split('T')[0],
          displayDate: date.toLocaleDateString('en-US', CONFIG.DATE_FORMAT.display),
          users: baseUsers,
          pageViews: basePageViews,
          sessions: baseSessions,
          bounceRate: baseBounceRate,
          avgDuration: baseAvgDuration,
          deviceData,
        });
      }
      return data;
    };

    const isValidRange = dateRange && dateRange.start && dateRange.end;
    const { start, end } = isValidRange
      ? dateRange
      : (() => {
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
          totalUsers: 23456 + (role === 'All Roles' ? 0 : this.secureRandom(1000, 3000)),
          totalPageViews: 145678 + (role === 'All Roles' ? 0 : this.secureRandom(5000, 15000)),
          totalSessions: 18934 + (role === 'All Roles' ? 0 : this.secureRandom(800, 2000)),
          avgBounceRate: 42.3 + (role === 'All Roles' ? 0 : this.secureRandom(-5, 5)),
          avgSessionDuration: 245 + (role === 'All Roles' ? 0 : this.secureRandom(-30, 30)),
        },
        previous: {
          totalUsers: 21234 + (role === 'All Roles' ? 0 : this.secureRandom(1000, 3000)),
          totalPageViews: 132456 + (role === 'All Roles' ? 0 : this.secureRandom(5000, 15000)),
          totalSessions: 17123 + (role === 'All Roles' ? 0 : this.secureRandom(800, 2000)),
          avgBounceRate: 45.7 + (role === 'All Roles' ? 0 : this.secureRandom(-5, 5)),
          avgSessionDuration: 220 + (role === 'All Roles' ? 0 : this.secureRandom(-30, 30)),
        },
      },
      deviceBreakdown: [
        {
          name: 'Desktop',
          value: 45,
          previousValue: 42,
          sessions: 8520,
          bounceRate: 36.0,
          avgEngagementTime: 294,
        },
        {
          name: 'Mobile',
          value: 38,
          previousValue: 40,
          sessions: 7195,
          bounceRate: 48.6,
          avgEngagementTime: 184,
        },
        {
          name: 'Tablet',
          value: 17,
          previousValue: 18,
          sessions: 3219,
          bounceRate: 42.3,
          avgEngagementTime: 245,
        },
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
function useAnalyticsData(dateRange, comparisonPeriod, selectedRole) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiDateRange =
        dateRange && (dateRange.start || dateRange.end)
          ? {
              start: dateRange.start ? toIsoDate(dateRange.start) : '',
              end: dateRange.end ? toIsoDate(dateRange.end) : '',
            }
          : dateRange;
      const res = await AnalyticsService.fetchData(apiDateRange, comparisonPeriod, selectedRole);
      setData(res);
    } catch (e) {
      setError(e.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [dateRange, comparisonPeriod, selectedRole]);

  // FIX: trigger fetch whenever dependencies (dateRange, role, period) change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ======================== SMALL REUSABLE UIs ========================
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
        <button className={styles.buttonDanger} onClick={onRetry}>
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

function MetricTooltip({ text }) {
  const [visible, setVisible] = useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <span className={clsx(styles.tooltipWrap, darkMode && styles.darkMode)}>
      <Info
        size={13}
        className={styles.tooltipIcon}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      />
      {visible && (
        <span className={clsx(styles.tooltipBox, darkMode && styles.darkMode)}>{text}</span>
      )}
    </span>
  );
}

function MetricCard({ icon: Icon, title, value, change, tooltipText }) {
  const isPositive = change?.isPositive ?? false;
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div className={clsx(styles.metricCard, darkMode && styles.darkMode)}>
      <div className={styles.metricTop}>
        <div className={clsx(styles.metricIconWrap, darkMode && styles.darkMode)}>
          <Icon className={styles.metricIcon} />
        </div>
        {change && change.formatted !== '0%' && (
          <div className={clsx(styles.change, isPositive ? styles.positive : styles.negative)}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{change.formatted}</span>
          </div>
        )}
      </div>
      <div className={styles.metricValue}>
        {typeof value === 'string' ? value : formatNumber(value)}
      </div>
      <div className={styles.metricTitle}>
        {title}
        {tooltipText && <MetricTooltip text={tooltipText} />}
      </div>
    </div>
  );
}

function ChartCard({ title, icon: Icon, children, className }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div className={clsx(styles.chartCard, darkMode && styles.darkMode)}>
      <div className={styles.chartHeader}>
        {Icon && (
          <div className={clsx(styles.chartIconWrap, darkMode && styles.darkMode)}>
            <Icon className={styles.chartIcon} />
          </div>
        )}
        <h3 className={styles.chartTitle}>{title}</h3>
      </div>
      <div className={styles.chartBody}>{children}</div>
    </div>
  );
}

// ======================== DEVICE FILTER BANNER ========================
function DeviceFilterBanner({ selectedDevice, onClear }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  if (!selectedDevice) return null;
  const DevIcon = DEVICE_ICONS[selectedDevice] || Monitor;
  return (
    <div className={clsx(styles.deviceBanner, darkMode && styles.darkMode)}>
      <DevIcon size={16} />
      <p className={clsx(styles.description, darkMode && styles.darkMode)}>
        Showing data for <span>{selectedDevice}</span> only
      </p>
      <button className={styles.deviceBannerClear} onClick={onClear} title="Clear device filter">
        <X size={14} />
        Clear filter
      </button>
    </div>
  );
}

// ======================== DEVICE ENGAGEMENT PANEL ========================
function DeviceEngagementPanel({ device, darkMode }) {
  if (!device) return null;
  const DevIcon = DEVICE_ICONS[device.name] || Monitor;
  const colors = darkMode ? CONFIG.CHART_COLORS.dark : CONFIG.CHART_COLORS;

  const engagementItems = [
    {
      label: 'Sessions',
      value: formatNumber(device.sessions),
      tooltip: METRIC_TOOLTIPS.sessions,
      color: colors.primary,
    },
    {
      label: 'Bounce Rate',
      value: `${device.bounceRate.toFixed(1)}%`,
      tooltip: METRIC_TOOLTIPS.bounceRate,
      color: colors.danger,
    },
    {
      label: 'Avg. Engagement Time',
      value: `${Math.floor(device.avgEngagementTime / 60)}m ${device.avgEngagementTime % 60}s`,
      tooltip: METRIC_TOOLTIPS.avgEngagementTime,
      color: colors.success,
    },
    {
      label: 'Traffic Share',
      value: `${device.value}%`,
      tooltip: 'Percentage of total traffic from this device type.',
      color: colors.purple,
    },
  ];

  return (
    <div className={clsx(styles.engagementPanel, darkMode && styles.darkMode)}>
      <div className={styles.engagementHeader}>
        <div className={styles.engagementDeviceLabel}>
          <DevIcon size={18} />
          <span>{device.name} Engagement</span>
        </div>
        <span className={styles.engagementSubtitle}>Detailed metrics for selected device</span>
      </div>
      <div className={styles.engagementGrid}>
        {engagementItems.map(item => (
          <div
            key={item.label}
            className={clsx(styles.engagementItem, darkMode && styles.darkMode)}
          >
            <div className={styles.engagementValue} style={{ color: item.color }}>
              {item.value}
            </div>
            <div className={styles.engagementLabel}>
              {item.label}
              <MetricTooltip text={item.tooltip} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ======================== CUSTOM PIE LABEL ========================
function DevicePieLabel({ cx, cy, midAngle, outerRadius, name, value, previousValue }) {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 28;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const change = calculatePercentageChange(value, previousValue);
  const darkMode = useSelector(state => state.theme.darkMode);

  const labelColor = darkMode ? '#f9fafb' : '#111827';
  const positiveColor = darkMode ? '#34d399' : '#10b981';
  const negativeColor = darkMode ? '#f87171' : '#ef4444';

  return (
    <text
      x={x}
      y={y}
      fill={labelColor}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
    >
      {`${name}: ${value}%`}
      <tspan fill={change.isPositive ? positiveColor : negativeColor} fontSize={11}>
        {` (${change.formatted})`}
      </tspan>
    </text>
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
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    if (!dateRange) {
      setDateRange(DATE_RANGE_PRESETS.last30Days.getValue());
    }
  }, [dateRange, setDateRange]);

  return (
    <div className={clsx(styles.filters, darkMode && styles.darkMode)}>
      <div className={styles.filtersRow}>
        <div>
          <p className={styles.label}>Quick Select</p>
          <div className={styles.quickSelectButtonList}>
            {Object.entries(DATE_RANGE_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                className={clsx(styles.quickSelectButton, active === key && styles.active)}
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

        <div>
          <p className={styles.label}>Custom Date Range</p>
          <div className={styles.dateRange}>
            <DatePicker
              selected={dateRange?.start ? new Date(dateRange.start) : null}
              onChange={date => {
                setDateRange({
                  ...dateRange,
                  start: date,
                });
                setActive(null);
              }}
              selectsStart
              startDate={dateRange.start}
              endDate={dateRange.end}
              dateFormat="yyyy-MM-dd"
              isClearable={dateRange.start !== null}
              placeholderText="Start date"
              className={styles.input}
              calendarClassName={clsx(
                'job-analytics-datepicker',
                darkMode ? 'job-analytics-datepicker-dark' : 'job-analytics-datepicker-light',
              )}
            />
            <span className={styles.to}>to</span>
            <DatePicker
              selected={dateRange?.end ? new Date(dateRange.end) : null}
              onChange={date => {
                setDateRange({
                  ...dateRange,
                  end: date,
                });
                setActive(null);
              }}
              selectsEnd
              startDate={dateRange.start}
              endDate={dateRange.end}
              dateFormat="yyyy-MM-dd"
              minDate={dateRange?.start ? new Date(dateRange.start) : undefined}
              isClearable={dateRange.end !== null}
              placeholderText="End date"
              className={styles.input}
              calendarClassName={clsx(
                'job-analytics-datepicker',
                darkMode ? 'job-analytics-datepicker-dark' : 'job-analytics-datepicker-light',
              )}
            />
          </div>
        </div>

        <div>
          <p className={styles.label}>Compare with</p>
          <select
            className={clsx(styles.input)}
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
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.dataset.theme = darkMode ? 'dark' : 'light';

    if (darkMode) {
      body.classList.add('dark-mode', 'bm-dashboard-dark');
    } else {
      body.classList.remove('dark-mode', 'bm-dashboard-dark');
    }

    return () => {
      body.classList.remove('dark-mode', 'bm-dashboard-dark');
    };
  }, [darkMode]);

  const canViewAnalytics = hasPerm('getJobReports');

  if (!canViewAnalytics) {
    return <AccessDenied />;
  }

  const isMobile = useMediaQuery('(max-width: 640px)');

  const [dateRange, setDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return { start, end };
  });
  const [comparisonPeriod, setComparisonPeriod] = useState('previous-month');
  const [selectedDevice, setSelectedDevice] = useState(null);

  const { data: analyticsData, loading, error, refetch: originalRefetch } = useAnalyticsData(
    dateRange,
    comparisonPeriod,
    'All Roles',
  );

  const handleRefresh = useCallback(() => {
    setSelectedDevice(null);
    originalRefetch();
  }, [originalRefetch]);

  const selectedDeviceData = useMemo(() => {
    if (!selectedDevice || !analyticsData?.deviceBreakdown) return null;
    return analyticsData.deviceBreakdown.find(d => d.name === selectedDevice) || null;
  }, [selectedDevice, analyticsData]);

  const filteredCurrentPeriod = useMemo(() => {
    if (!analyticsData?.currentPeriod) return [];
    if (!selectedDevice) return analyticsData.currentPeriod;
    return analyticsData.currentPeriod.map(d => ({
      ...d,
      users: d.deviceData?.[selectedDevice]?.users ?? d.users,
      pageViews: d.deviceData?.[selectedDevice]?.pageViews ?? d.pageViews,
      sessions: d.deviceData?.[selectedDevice]?.sessions ?? d.sessions,
      bounceRate: d.deviceData?.[selectedDevice]?.bounceRate ?? d.bounceRate,
      avgDuration: d.deviceData?.[selectedDevice]?.avgDuration ?? d.avgDuration,
    }));
  }, [analyticsData, selectedDevice]);

  const mergedData = useMemo(() => {
    if (!filteredCurrentPeriod.length || !analyticsData?.previousPeriod) return [];
    return filteredCurrentPeriod.map((d, i) => {
      const prevBase = analyticsData.previousPeriod[i];
      const prevUsers = selectedDevice
        ? prevBase?.deviceData?.[selectedDevice]?.users ?? null
        : prevBase?.users ?? null;
      return { ...d, prevUsers };
    });
  }, [filteredCurrentPeriod, analyticsData, selectedDevice]);

  const metrics = useMemo(() => {
    if (!analyticsData) return null;
    const { current, previous } = analyticsData.metrics;
    const m = selectedDevice ? DEVICE_MULTIPLIERS[selectedDevice] : null;

    const scale = (val, key) => (m ? Math.round(val * m[key]) : val);
    const scaleRate = (val, key) => (m ? parseFloat((val * m[key]).toFixed(1)) : val);

    const curUsers = scale(current.totalUsers, 'users');
    const prevUsers = scale(previous.totalUsers, 'users');
    const curViews = scale(current.totalPageViews, 'pageViews');
    const prevViews = scale(previous.totalPageViews, 'pageViews');
    const curSessions = scale(current.totalSessions, 'sessions');
    const prevSessions = scale(previous.totalSessions, 'sessions');
    const curBounce = scaleRate(current.avgBounceRate, 'bounceRate');
    const prevBounce = scaleRate(previous.avgBounceRate, 'bounceRate');

    return {
      users: { value: curUsers, change: calculatePercentageChange(curUsers, prevUsers) },
      pageViews: { value: curViews, change: calculatePercentageChange(curViews, prevViews) },
      sessions: {
        value: curSessions,
        change: calculatePercentageChange(curSessions, prevSessions),
      },
      bounceRate: {
        value: `${curBounce.toFixed(1)}%`,
        change: calculatePercentageChange(curBounce, prevBounce),
      },
    };
  }, [analyticsData, selectedDevice]);

  const colors = darkMode ? CONFIG.CHART_COLORS.dark : CONFIG.CHART_COLORS;

  // Recharts injects inline styles into its tooltip, so CSS classes have no effect.
  // Pass these props to every <Tooltip> so it respects dark mode.
  const handlePieClick = useCallback(
    (_, index) => {
      const clicked = analyticsData?.deviceBreakdown?.[index]?.name;
      if (!clicked) return;
      setSelectedDevice(prev => (prev === clicked ? null : clicked));
    },
    [analyticsData],
  );

  return (
    <div
      className={clsx(
        styles.bmDashboardJobAnalytics,
        styles.jobAnalytics,
        darkMode && styles.darkMode,
      )}
    >
      <header className={clsx(styles.header, darkMode && styles.darkMode)}>
        <h2 className={styles.title}>
          Job Analytics
          {selectedDevice && (
            <span className={styles.deviceBadge}>
              {React.createElement(DEVICE_ICONS[selectedDevice] || Monitor, { size: 16 })}
              {selectedDevice}
            </span>
          )}
        </h2>
        <button
          className={styles.refreshButton}
          onClick={handleRefresh}
          disabled={loading}
          title="Refresh data and reset device filter"
        >
          <RefreshCw className={loading ? styles.refreshLoader : ''} size={16} />
          <span>Refresh</span>
        </button>
      </header>

      <DateRangeSelector
        dateRange={dateRange}
        setDateRange={setDateRange}
        comparisonPeriod={comparisonPeriod}
        setComparisonPeriod={setComparisonPeriod}
      />

      <DeviceFilterBanner selectedDevice={selectedDevice} onClear={() => setSelectedDevice(null)} />

      {error && <ErrorMessage error={error} onRetry={handleRefresh} />}

      {loading && !analyticsData ? (
        <LoadingSpinner message="Loading analytics data..." />
      ) : (
        <>
          {selectedDeviceData && (
            <DeviceEngagementPanel device={selectedDeviceData} darkMode={darkMode} />
          )}

          <section className={styles.metricsGrid}>
            <MetricCard
              icon={Users}
              title="Total Users"
              value={metrics?.users.value || 0}
              change={metrics?.users.change}
              tooltipText={METRIC_TOOLTIPS.users}
            />
            <MetricCard
              icon={Eye}
              title="Page Views"
              value={metrics?.pageViews.value || 0}
              change={metrics?.pageViews.change}
              tooltipText={METRIC_TOOLTIPS.pageViews}
            />
            <MetricCard
              icon={Activity}
              title="Sessions"
              value={metrics?.sessions.value || 0}
              change={metrics?.sessions.change}
              tooltipText={METRIC_TOOLTIPS.sessions}
            />
            <MetricCard
              icon={ChevronDown}
              title="Bounce Rate"
              value={metrics?.bounceRate.value || '0.0%'}
              change={metrics?.bounceRate.change}
              tooltipText={METRIC_TOOLTIPS.bounceRate}
            />
          </section>

          <section className={styles.chartsGrid} data-mobile={isMobile ? '1' : '0'}>
            <ChartCard title="User Trend Comparison" icon={TrendingUp}>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={mergedData} margin={CHART_MARGIN}>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="displayDate" tick={AXIS_TICK} />
                  <YAxis tick={AXIS_TICK} domain={['dataMin - 100', 'dataMax + 100']} />
                  <Tooltip {...getTooltipStyles(darkMode)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke={colors.primary}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                    name={selectedDevice ? `${selectedDevice} — Current` : 'Current Period'}
                  />
                  <Line
                    type="monotone"
                    dataKey="prevUsers"
                    stroke={colors.gray}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name={selectedDevice ? `${selectedDevice} — Previous` : 'Previous Period'}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Page Views Over Time" icon={Eye}>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart
                  data={filteredCurrentPeriod}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.success} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={colors.success} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="displayDate" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={['dataMin - 500', 'dataMax + 500']} />
                  <Tooltip {...getTooltipStyles(darkMode)} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="pageViews"
                    stroke={colors.success}
                    fill="url(#colorPageViews)"
                    strokeWidth={3}
                    activeDot={{ r: 6 }}
                    name={selectedDevice ? `${selectedDevice} Page Views` : 'Page Views'}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Traffic Sources" icon={BarChart3}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={analyticsData?.trafficSources ?? []}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="source"
                    tick={{ fontSize: 12 }}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 'dataMax + 500']} />
                  <Tooltip cursor={getCursorStyle(darkMode)} {...getTooltipStyles(darkMode)} />
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

            <ChartCard
              title={
                selectedDevice
                  ? `Device Breakdown — ${selectedDevice} selected`
                  : 'Device Breakdown (click a slice to filter)'
              }
              icon={PieChartIcon}
            >
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={analyticsData?.deviceBreakdown ?? []}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    dataKey="value"
                    labelLine={false}
                    label={<DevicePieLabel />}
                    onClick={handlePieClick}
                    cursor="pointer"
                  >
                    {(analyticsData?.deviceBreakdown || []).map((entry, i) => {
                      const isSelected = selectedDevice === entry.name;
                      const isAnySelected = !!selectedDevice;
                      const baseColor = [colors.primary, colors.success, colors.warning][i];
                      return (
                        <Cell
                          key={`c-${i}`}
                          fill={baseColor}
                          opacity={isAnySelected && !isSelected ? 0.3 : 1}
                          stroke={isSelected ? '#ffffff' : 'none'}
                          strokeWidth={isSelected ? 3 : 0}
                          style={{
                            filter: isSelected ? 'drop-shadow(0 0 6px rgb(0 0 0 / 30%))' : 'none',
                          }}
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip {...getTooltipStyles(darkMode)} />
                </PieChart>
              </ResponsiveContainer>
              <p className={styles.pieHint}>
                {selectedDevice
                  ? `Click the ${selectedDevice} slice again or another slice to change filter`
                  : 'Click a slice to filter all charts by device type'}
              </p>
            </ChartCard>

            <ChartCard
              title={
                selectedDevice
                  ? `Sessions & Bounce Rate — ${selectedDevice}`
                  : 'Sessions & Bounce Rate Analysis'
              }
              icon={Activity}
            >
              <ResponsiveContainer width="100%" height={380}>
                <LineChart
                  data={filteredCurrentPeriod}
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
                  <Tooltip {...getTooltipStyles(darkMode)} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="sessions"
                    stroke={colors.purple}
                    strokeWidth={3}
                    name={selectedDevice ? `${selectedDevice} Sessions` : 'Sessions'}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="bounceRate"
                    stroke={colors.danger}
                    strokeWidth={3}
                    name={selectedDevice ? `${selectedDevice} Bounce Rate (%)` : 'Bounce Rate (%)'}
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
