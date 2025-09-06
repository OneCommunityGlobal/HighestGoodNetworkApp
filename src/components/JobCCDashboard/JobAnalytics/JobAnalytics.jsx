/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-unused-vars */
/* eslint-disable react/button-has-type */
/* eslint-disable no-return-assign */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import EditableInfoModal from '../../UserProfile/EditableModal/EditableInfoModal';
// import hasPermission from 'utils/permissions';
import hasPermission from '../../../utils/permissions';
import { ENDPOINTS } from '../../../utils/URL';

// ======================== CONFIGURATION ========================
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
    // Enhanced color palette
    secondary: '#6366f1',
    tertiary: '#14b8a6',
    quaternary: '#f97316',
    dark: {
      primary: '#60a5fa',
      success: '#34d399',
      warning: '#fbbf24',
      danger: '#f87171',
      purple: '#a78bfa',
      gray: '#cbd5e1',
      secondary: '#818cf8',
      tertiary: '#2dd4bf',
      quaternary: '#fb923c',
    },
  },
  REFRESH_INTERVAL: 300000, // 5 minutes
  DATE_FORMAT: {
    display: { month: 'short', day: 'numeric' },
    api: 'YYYY-MM-DD',
  },
};

// ======================== ENHANCED STYLES ========================
const styles = {
  container: {
    minHeight: '100vh',
    padding: '24px',
    transition: 'background-color 0.3s ease',
  },
  header: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '4px',
    letterSpacing: '-0.025em',
  },
  titleLight: {
    color: '#111827',
  },
  titleDark: {
    color: '#f9fafb',
  },
  subtitle: {
    marginTop: '4px',
    fontSize: '0.875rem',
    fontWeight: '400',
  },
  subtitleLight: {
    color: '#6b7280',
  },
  subtitleDark: {
    color: '#9ca3af',
  },
  card: {
    padding: '24px',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    border: '1px solid transparent',
  },
  cardLight: {
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  },
  cardDark: {
    backgroundColor: '#1f2937',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    borderColor: '#374151',
  },
  cardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  cardHoverDark: {
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    borderColor: '#4b5563',
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '0.875rem',
    fontWeight: '500',
    border: '1px solid transparent',
  },
  buttonLight: {
    backgroundColor: '#ffffff',
    color: '#374151',
    border: '1px solid #e5e7eb',
  },
  buttonDark: {
    backgroundColor: '#374151',
    color: '#f3f4f6',
    border: '1px solid #4b5563',
  },
  buttonHoverLight: {
    backgroundColor: '#f9fafb',
    borderColor: '#d1d5db',
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  },
  buttonHoverDark: {
    backgroundColor: '#4b5563',
    borderColor: '#6b7280',
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: '1px solid #3b82f6',
  },
  primaryButtonHover: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontWeight: '400',
  },
  inputLight: {
    backgroundColor: '#ffffff',
    color: '#111827',
    border: '1px solid #e5e7eb',
  },
  inputDark: {
    backgroundColor: '#374151',
    color: '#f3f4f6',
    border: '1px solid #4b5563',
  },
  inputFocus: {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
  },
  inputFocusDark: {
    borderColor: '#60a5fa',
    boxShadow: '0 0 0 3px rgba(96, 165, 250, 0.2)',
  },
  metric: {
    fontSize: '2rem',
    fontWeight: '700',
    marginTop: '12px',
    marginBottom: '4px',
    letterSpacing: '-0.025em',
  },
  metricLight: {
    color: '#111827',
  },
  metricDark: {
    color: '#f9fafb',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  badgeLight: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
  },
  badgeDark: {
    backgroundColor: '#064e3b',
    color: '#d1fae5',
    border: '1px solid #065f46',
  },
  grid: {
    display: 'grid',
    gap: '24px',
  },
  flexBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flexGap: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  errorBox: {
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  errorBoxLight: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#991b1b',
  },
  errorBoxDark: {
    backgroundColor: '#7f1d1d',
    border: '1px solid #991b1b',
    color: '#fecaca',
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartContainer: {
    padding: '24px',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
  },
  chartContainerLight: {
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  },
  chartContainerDark: {
    backgroundColor: '#1f2937',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)',
    border: '1px solid #374151',
  },
};

// ======================== API SERVICE ========================
class AnalyticsService {
  static async fetchData(dateRange, comparisonPeriod) {
    try {
      // TODO: Uncomment when backend is ready
      // const response = await fetch(`${CONFIG.API.ENDPOINTS.ANALYTICS}`, {
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

  static getAuthToken() {
    return localStorage.getItem('token') || '';
  }

  static simulateApiDelay(ms = 500) {
    // eslint-disable-next-line no-promise-executor-return
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // eslint-disable-next-line no-unused-vars
  static generateMockAnalyticsData(dateRange, comparisonPeriod) {
    const generateTimeSeriesData = (startDate, endDate, offset = 0) => {
      const data = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      for (let i = 0; i <= diffDays; i += 1) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);

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
      currentPeriod: generateTimeSeriesData(dateRange.start, dateRange.end, 100),
      previousPeriod: generateTimeSeriesData(dateRange.start, dateRange.end, 0),
      // ... rest of the data
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

// ======================== COMPONENTS ========================
function LoadingSpinner({ message = 'Loading...', darkMode }) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}
    >
      <div style={{ textAlign: 'center' }}>
        <RefreshCw
          className="animate-spin"
          style={{
            width: '3rem',
            height: '3rem',
            color: darkMode ? '#60a5fa' : '#3b82f6',
            margin: '0 auto 1.5rem',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p style={{ color: darkMode ? '#9ca3af' : '#6b7280', fontSize: '1.125rem' }}>{message}</p>
      </div>
    </div>
  );
}

function ErrorMessage({ error, onRetry, darkMode }) {
  return (
    <div
      style={{
        ...styles.errorBox,
        ...(darkMode ? styles.errorBoxDark : styles.errorBoxLight),
      }}
    >
      <p style={{ margin: 0, fontWeight: '500' }}>{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            alignSelf: 'flex-start',
            fontSize: '0.875rem',
            color: darkMode ? '#fca5a5' : '#dc2626',
            textDecoration: 'underline',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => (e.target.style.opacity = '0.8')}
          onMouseLeave={e => (e.target.style.opacity = '1')}
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
          ...styles.cardLight,
          textAlign: 'center',
          maxWidth: '32rem',
          padding: '3rem',
        }}
      >
        <Lock
          style={{
            width: '5rem',
            height: '5rem',
            color: '#ef4444',
            margin: '0 auto 1.5rem',
          }}
        />
        <h2 style={{ ...styles.title, ...styles.titleLight, marginBottom: '1rem' }}>
          Access Restricted
        </h2>
        <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
          You don't have permission to view analytics. Only owners, administrators, and users with
          analytics permissions can access this page.
        </p>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, title, value, change = {}, colorClass, darkMode }) {
  const [isHovered, setIsHovered] = useState(false);
  const changeFormatted = change.formatted || '0%';
  const isPositive = change.isPositive || false;
  const colors = darkMode ? CONFIG.CHART_COLORS.dark : CONFIG.CHART_COLORS;

  return (
    <div
      style={{
        ...styles.card,
        ...(darkMode ? styles.cardDark : styles.cardLight),
        ...(isHovered && (darkMode ? styles.cardHoverDark : styles.cardHover)),
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: `linear-gradient(135deg, ${colorClass}15 0%, ${colorClass}05 100%)`,
          borderRadius: '50%',
          transform: 'translate(30px, -30px)',
        }}
      />
      <div style={styles.flexBetween}>
        <div
          style={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: `${colorClass}15`,
            display: 'inline-flex',
          }}
        >
          <Icon style={{ width: '1.5rem', height: '1.5rem', color: colorClass }} />
        </div>
        {changeFormatted !== '0%' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: isPositive ? colors.success : colors.danger,
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
      <h3
        style={{
          ...styles.metric,
          ...(darkMode ? styles.metricDark : styles.metricLight),
        }}
      >
        {typeof value === 'string' ? value : formatNumber(value)}
      </h3>
      <p
        style={{
          color: darkMode ? '#9ca3af' : '#6b7280',
          fontSize: '0.875rem',
          fontWeight: '400',
        }}
      >
        {title}
      </p>
    </div>
  );
}

function ChartCard({ title, children, icon: Icon, darkMode }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.chartContainer,
        ...(darkMode ? styles.chartContainerDark : styles.chartContainerLight),
        ...(isHovered && {
          transform: 'translateY(-4px)',
          boxShadow: darkMode
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)'
            : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          borderColor: darkMode ? '#4b5563' : '#e5e7eb',
        }),
        padding: '28px',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle gradient overlay on hover */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: darkMode
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
          transform: `translate(50px, -50px) scale(${isHovered ? 1.2 : 0.8})`,
          transition: 'transform 0.6s ease',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {Icon && (
          <div
            style={{
              padding: '10px',
              borderRadius: '10px',
              backgroundColor: darkMode ? '#374151' : '#f3f4f6',
              display: 'inline-flex',
              transition: 'all 0.3s ease',
              ...(isHovered && {
                backgroundColor: darkMode ? '#4b5563' : '#e5e7eb',
                transform: 'rotate(-5deg)',
              }),
            }}
          >
            <Icon
              style={{
                width: '1.25rem',
                height: '1.25rem',
                color: darkMode ? '#9ca3af' : '#6b7280',
                transition: 'color 0.3s ease',
                ...(isHovered && {
                  color: darkMode ? '#60a5fa' : '#3b82f6',
                }),
              }}
            />
          </div>
        )}
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: darkMode ? '#f3f4f6' : '#111827',
            margin: 0,
            transition: 'color 0.3s ease',
            letterSpacing: '-0.025em',
          }}
        >
          {title}
        </h3>
      </div>

      {/* Chart container with proper padding */}
      <div
        style={{
          margin: '0 -8px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function DateRangeSelector({
  dateRange,
  setDateRange,
  comparisonPeriod,
  setComparisonPeriod,
  darkMode,
}) {
  const [activePreset, setActivePreset] = useState('last30Days');

  return (
    <div
      style={{
        ...styles.card,
        ...(darkMode ? styles.cardDark : styles.cardLight),
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: darkMode ? '#d1d5db' : '#374151',
              marginBottom: '8px',
            }}
          >
            Quick Select
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.entries(DATE_RANGE_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => {
                  setDateRange(preset.getValue());
                  setActivePreset(key);
                }}
                style={{
                  ...styles.button,
                  ...(activePreset === key
                    ? styles.primaryButton
                    : darkMode
                    ? styles.buttonDark
                    : styles.buttonLight),
                  padding: '8px 16px',
                }}
                onMouseEnter={e => {
                  if (activePreset !== key) {
                    Object.assign(
                      e.target.style,
                      darkMode ? styles.buttonHoverDark : styles.buttonHoverLight,
                    );
                  }
                }}
                onMouseLeave={e => {
                  if (activePreset !== key) {
                    Object.assign(
                      e.target.style,
                      darkMode ? styles.buttonDark : styles.buttonLight,
                    );
                  }
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ minWidth: '280px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: darkMode ? '#d1d5db' : '#374151',
              marginBottom: '8px',
            }}
          >
            Custom Date Range
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="date"
              value={dateRange.start}
              onChange={e => {
                setDateRange({ ...dateRange, start: e.target.value });
                setActivePreset(null);
              }}
              style={{
                ...styles.input,
                ...(darkMode ? styles.inputDark : styles.inputLight),
              }}
              onFocus={e =>
                Object.assign(e.target.style, darkMode ? styles.inputFocusDark : styles.inputFocus)
              }
              onBlur={e =>
                Object.assign(e.target.style, darkMode ? styles.inputDark : styles.inputLight)
              }
            />
            <span
              style={{
                color: darkMode ? '#9ca3af' : '#6b7280',
                fontSize: '0.875rem',
              }}
            >
              to
            </span>
            <input
              type="date"
              value={dateRange.end}
              onChange={e => {
                setDateRange({ ...dateRange, end: e.target.value });
                setActivePreset(null);
              }}
              style={{
                ...styles.input,
                ...(darkMode ? styles.inputDark : styles.inputLight),
              }}
              onFocus={e =>
                Object.assign(e.target.style, darkMode ? styles.inputFocusDark : styles.inputFocus)
              }
              onBlur={e =>
                Object.assign(e.target.style, darkMode ? styles.inputDark : styles.inputLight)
              }
            />
          </div>
        </div>

        <div style={{ minWidth: '200px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: darkMode ? '#d1d5db' : '#374151',
              marginBottom: '8px',
            }}
          >
            Compare with
          </label>
          <select
            value={comparisonPeriod}
            onChange={e => setComparisonPeriod(e.target.value)}
            style={{
              ...styles.input,
              ...(darkMode ? styles.inputDark : styles.inputLight),
              cursor: 'pointer',
              width: '100%',
            }}
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
function JobAnalytics(props) {
  // eslint-disable-next-line no-shadow
  const { darkMode, role, hasPermission } = props;

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

  // Check permissions using hasPermission utility
  const canViewAnalytics = hasPermission('getJobReports');

  if (!canViewAnalytics) {
    return <AccessDenied />;
  }

  const colors = darkMode ? CONFIG.CHART_COLORS.dark : CONFIG.CHART_COLORS;

  return (
    <div
      style={{
        ...styles.container,
        backgroundColor: darkMode ? '#111827' : '#f9fafb',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <header style={styles.header}>
          <div style={{ ...styles.flexBetween, marginBottom: '24px' }}>
            <div className="d-flex justify-content-start align-items-center">
              <h2
                style={{
                  ...styles.title,
                  ...(darkMode ? styles.titleDark : styles.titleLight),
                  margin: 0,
                  marginRight: '12px',
                }}
              >
                Job Analytics
              </h2>
              <EditableInfoModal
                areaName="JobAnalytics"
                areaTitle="Job Analytics"
                fontSize={24}
                isPermissionPage
                role={role}
                darkMode={darkMode}
              />
            </div>
            <div style={styles.flexGap}>
              <button
                onClick={handleRefresh}
                disabled={refreshing || dataLoading}
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                  opacity: refreshing || dataLoading ? 0.6 : 1,
                  cursor: refreshing || dataLoading ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={e =>
                  !refreshing &&
                  !dataLoading &&
                  Object.assign(e.target.style, styles.primaryButtonHover)
                }
                onMouseLeave={e => Object.assign(e.target.style, styles.primaryButton)}
              >
                <RefreshCw
                  className={refreshing ? 'animate-spin' : ''}
                  style={{ width: '1rem', height: '1rem' }}
                />
                Refresh
              </button>
              <div
                style={{
                  ...styles.badge,
                  ...(darkMode ? styles.badgeDark : styles.badgeLight),
                }}
              >
                <Shield style={{ width: '1.25rem', height: '1.25rem' }} />
                <span>
                  {role === 'Owner' ? 'Owner' : role === 'Administrator' ? 'Admin' : 'Authorized'}{' '}
                  Access
                </span>
              </div>
            </div>
          </div>

          <DateRangeSelector
            dateRange={dateRange}
            setDateRange={setDateRange}
            comparisonPeriod={comparisonPeriod}
            setComparisonPeriod={setComparisonPeriod}
            darkMode={darkMode}
          />
        </header>

        {/* Error State */}
        {dataError && <ErrorMessage error={dataError} onRetry={refetch} darkMode={darkMode} />}

        {/* Loading State */}
        {dataLoading && !analyticsData ? (
          <LoadingSpinner message="Loading analytics data..." darkMode={darkMode} />
        ) : (
          <>
            {/* Key Metrics */}
            <section
              style={{
                ...styles.grid,
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                marginBottom: '32px',
              }}
            >
              <MetricCard
                icon={Users}
                title="Total Users"
                value={metrics?.users.value || 0}
                change={metrics?.users.change || { formatted: '0%', isPositive: false }}
                colorClass={colors.primary}
                darkMode={darkMode}
              />
              <MetricCard
                icon={Eye}
                title="Page Views"
                value={metrics?.pageViews.value || 0}
                change={metrics?.pageViews.change || { formatted: '0%', isPositive: false }}
                colorClass={colors.success}
                darkMode={darkMode}
              />
              <MetricCard
                icon={Activity}
                title="Sessions"
                value={metrics?.sessions.value || 0}
                change={metrics?.sessions.change || { formatted: '0%', isPositive: false }}
                colorClass={colors.purple}
                darkMode={darkMode}
              />
              <MetricCard
                icon={ChevronDown}
                title="Bounce Rate"
                value={metrics?.bounceRate ? `${metrics.bounceRate.value.toFixed(1)}%` : '0.0%'}
                change={metrics?.bounceRate?.change || { formatted: '0%', isPositive: false }}
                colorClass={colors.warning}
                darkMode={darkMode}
              />
            </section>

            {/* Charts */}
            <section
              style={{
                ...styles.grid,
                gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                marginBottom: '32px',
              }}
            >
              {/* User Trend Chart */}
              <ChartCard title="User Trend Comparison" icon={TrendingUp} darkMode={darkMode}>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart
                    data={analyticsData?.currentPeriod || []}
                    margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={darkMode ? '#374151' : '#e5e7eb'}
                      strokeOpacity={0.5}
                    />
                    <XAxis
                      dataKey="displayDate"
                      tick={{ fontSize: 12, fill: darkMode ? '#9ca3af' : '#6b7280' }}
                      tickLine={{ stroke: darkMode ? '#374151' : '#e5e7eb' }}
                      label={{
                        value: 'Date',
                        position: 'insideBottom',
                        offset: -10,
                        style: { fill: darkMode ? '#9ca3af' : '#6b7280' },
                      }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: darkMode ? '#9ca3af' : '#6b7280' }}
                      tickLine={{ stroke: darkMode ? '#374151' : '#e5e7eb' }}
                      domain={['dataMin - 100', 'dataMax + 100']}
                      label={{
                        value: 'Number of Users',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fill: darkMode ? '#9ca3af' : '#6b7280' },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                        border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                      labelStyle={{ color: darkMode ? '#f3f4f6' : '#111827' }}
                      cursor={{ stroke: darkMode ? '#60a5fa' : '#3b82f6', strokeWidth: 1 }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="line" />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke={colors.primary}
                      strokeWidth={3}
                      name="Current Period"
                      dot={false}
                      activeDot={{ r: 6, stroke: colors.primary, strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      data={analyticsData?.previousPeriod || []}
                      stroke={colors.gray}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Previous Period"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Page Views Area Chart */}
              <ChartCard title="Page Views Over Time" icon={Eye} darkMode={darkMode}>
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
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={darkMode ? '#374151' : '#e5e7eb'}
                      strokeOpacity={0.5}
                    />
                    <XAxis
                      dataKey="displayDate"
                      tick={{ fontSize: 12, fill: darkMode ? '#9ca3af' : '#6b7280' }}
                      tickLine={{ stroke: darkMode ? '#374151' : '#e5e7eb' }}
                      label={{
                        value: 'Date',
                        position: 'insideBottom',
                        offset: -10,
                        style: { fill: darkMode ? '#9ca3af' : '#6b7280' },
                      }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: darkMode ? '#9ca3af' : '#6b7280' }}
                      tickLine={{ stroke: darkMode ? '#374151' : '#e5e7eb' }}
                      domain={['dataMin - 500', 'dataMax + 500']}
                      label={{
                        value: 'Page Views',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fill: darkMode ? '#9ca3af' : '#6b7280' },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                        border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                      labelStyle={{ color: darkMode ? '#f3f4f6' : '#111827' }}
                      cursor={{ stroke: colors.success, strokeWidth: 1, strokeOpacity: 0.5 }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="rect" />
                    <Area
                      type="monotone"
                      dataKey="pageViews"
                      stroke={colors.success}
                      fillOpacity={1}
                      fill="url(#colorPageViews)"
                      strokeWidth={3}
                      activeDot={{ r: 6, stroke: colors.success, strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Traffic Sources Bar Chart */}
              <ChartCard title="Traffic Sources" icon={BarChart3} darkMode={darkMode}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={analyticsData?.trafficSources || []}
                    margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={darkMode ? '#374151' : '#e5e7eb'}
                      strokeOpacity={0.5}
                    />
                    <XAxis
                      dataKey="source"
                      tick={{ fontSize: 12, fill: darkMode ? '#9ca3af' : '#6b7280' }}
                      tickLine={{ stroke: darkMode ? '#374151' : '#e5e7eb' }}
                      angle={-15}
                      textAnchor="end"
                      height={60}
                      label={{
                        value: 'Traffic Source',
                        position: 'insideBottom',
                        offset: -5,
                        style: { fill: darkMode ? '#9ca3af' : '#6b7280' },
                      }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: darkMode ? '#9ca3af' : '#6b7280' }}
                      tickLine={{ stroke: darkMode ? '#374151' : '#e5e7eb' }}
                      domain={[0, 'dataMax + 500']}
                      label={{
                        value: 'Number of Visits',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fill: darkMode ? '#9ca3af' : '#6b7280' },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                        border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                      labelStyle={{ color: darkMode ? '#f3f4f6' : '#111827' }}
                      cursor={{
                        fill: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="rect" />
                    <Bar
                      dataKey="current"
                      fill={colors.primary}
                      name="Current Period"
                      radius={[8, 8, 0, 0]}
                      animationDuration={1000}
                    />
                    <Bar
                      dataKey="previous"
                      fill={colors.gray}
                      name="Previous Period"
                      radius={[8, 8, 0, 0]}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Device Breakdown Pie Chart */}
              <ChartCard title="Device Breakdown" icon={PieChartIcon} darkMode={darkMode}>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <Pie
                      data={analyticsData?.deviceBreakdown || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, previousValue }) => {
                        const change = calculatePercentageChange(value, previousValue);
                        return `${name}: ${value}% (${change.formatted})`;
                      }}
                      outerRadius={110}
                      fill="#8884d8"
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {analyticsData?.deviceBreakdown.map((entry, index) => (
                        <Cell
                          // eslint-disable-next-line react/no-array-index-key
                          key={`cell-${index}`}
                          fill={[colors.primary, colors.success, colors.warning][index]}
                          style={{ filter: 'brightness(1)', transition: 'filter 0.3s' }}
                          onMouseEnter={e => (e.target.style.filter = 'brightness(1.1)')}
                          onMouseLeave={e => (e.target.style.filter = 'brightness(1)')}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                        border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                      labelStyle={{ color: darkMode ? '#f3f4f6' : '#111827' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </section>

            {/* Sessions & Bounce Rate Combined Chart */}
            <section>
              <ChartCard
                title="Sessions & Bounce Rate Analysis"
                icon={Activity}
                darkMode={darkMode}
              >
                <ResponsiveContainer width="100%" height={380}>
                  <LineChart
                    data={analyticsData?.currentPeriod || []}
                    margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={darkMode ? '#374151' : '#e5e7eb'}
                      strokeOpacity={0.5}
                    />
                    <XAxis
                      dataKey="displayDate"
                      tick={{ fontSize: 12, fill: darkMode ? '#9ca3af' : '#6b7280' }}
                      tickLine={{ stroke: darkMode ? '#374151' : '#e5e7eb' }}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 12, fill: darkMode ? '#9ca3af' : '#6b7280' }}
                      tickLine={{ stroke: darkMode ? '#374151' : '#e5e7eb' }}
                      domain={['dataMin - 50', 'dataMax + 50']}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 12, fill: darkMode ? '#9ca3af' : '#6b7280' }}
                      tickLine={{ stroke: darkMode ? '#374151' : '#e5e7eb' }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                        border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                      labelStyle={{ color: darkMode ? '#f3f4f6' : '#111827' }}
                      cursor={{ stroke: darkMode ? '#60a5fa' : '#3b82f6', strokeWidth: 1 }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="line" />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="sessions"
                      stroke={colors.purple}
                      strokeWidth={3}
                      name="Sessions"
                      dot={false}
                      activeDot={{ r: 6, stroke: colors.purple, strokeWidth: 2 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="bounceRate"
                      stroke={colors.danger}
                      strokeWidth={3}
                      name="Bounce Rate (%)"
                      dot={false}
                      activeDot={{ r: 6, stroke: colors.danger, strokeWidth: 2 }}
                      strokeDasharray="3 3"
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

const mapStateToProps = state => ({
  role: state.userProfile.role,
  darkMode: state.theme.darkMode,
});

const mapDispatchToProps = dispatch => ({
  hasPermission: action => dispatch(hasPermission(action)),
});

export default connect(mapStateToProps, mapDispatchToProps)(JobAnalytics);
