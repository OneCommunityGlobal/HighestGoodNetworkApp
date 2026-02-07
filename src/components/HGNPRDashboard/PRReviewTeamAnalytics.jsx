import { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  CartesianGrid,
} from 'recharts';
import { boxStyle, boxStyleDark } from '~/styles';
import DurationFilter from './DurationFilter';
import styles from './PRReviewTeamAnalytics.module.css';
import PRData from './PRData';
import '../Header/index.css';

const DURATION_OPTIONS = [
  { label: 'Last Week', value: 'last_week' },
  { label: 'Last 2 weeks', value: 'last_2_weeks' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'All Time', value: 'all_time' },
];

function getXTicksAndDomain(data) {
  const max = Math.max(...data.map(d => d.reviewCount), 0);
  const upper = Math.ceil(max / 10) * 10;
  const ticks = [];
  for (let i = 0; i <= upper; i += 10) {
    ticks.push(i);
  }
  return { domain: [0, upper], ticks };
}

function CustomTooltip({ active, payload, tooltipBg, tooltipText }) {
  if (active && payload && payload.length) {
    const tooltipData = payload[0].payload;
    const tooltipLabel = tooltipText; // Use tooltipText for the label color
    return (
      <div
        className={styles['custom-tooltip']}
        style={{ background: tooltipBg, color: tooltipText }}
      >
        <div className={styles['tooltip-header']}>
          <h4 style={{ color: tooltipText }}>{tooltipData.prNumber}</h4>
        </div>
        <p className={styles['tooltip-title']} style={{ color: tooltipText }}>
          {tooltipData.title}
        </p>
        <div className={styles['tooltip-details']}>
          <p style={{ color: tooltipText }}>
            <strong style={{ color: tooltipLabel, fontSize: '0.9em' }}>Reviews:</strong>{' '}
            {tooltipData.reviewCount}
          </p>
        </div>
      </div>
    );
  }
  return null;
}

function PRReviewTeamAnalytics({ state }) {
  const [duration, setDuration] = useState(DURATION_OPTIONS[0].value);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get dark mode from global Redux state
  const { darkMode } = state.theme;

  useEffect(() => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        const sorted = [...PRData].sort((a, b) => b.reviewCount - a.reviewCount);
        setData(sorted.slice(0, 20)); // Get Top 20 PRs based on review count
        setLoading(false);
      } catch (err) {
        setError('Failed to load PR data');
        setLoading(false);
      }
    }, 800);
  }, [duration]);

  const selectedDurationLabel =
    DURATION_OPTIONS.find(opt => opt.value === duration)?.label.toUpperCase() || '';

  const { domain, ticks } = getXTicksAndDomain(data);

  // Theme-based color scheme using global dark mode
  const chartBg = darkMode ? '#1b2a42' : '#f8fafc';
  const labelColor = darkMode ? '#f8fafc' : '#052C65';
  const barColor = darkMode ? '#4a9eff' : '#052C65';
  const axisLineColor = darkMode ? '#4a5568' : '#bfc7d1';
  const tickColor = darkMode ? '#f8fafc' : '#052C65';
  const tooltipBg = darkMode ? '#2d3748' : 'rgba(255,255,255,0.95)';
  const tooltipText = darkMode ? '#f8fafc' : '#052C65';
  const containerBg = darkMode ? '#1b2a42' : '#e0e3ea';
  const boxStyling = darkMode ? boxStyleDark : boxStyle;

  let content;
  if (loading) {
    content = (
      <div className={styles['pr-review-analytics-loading']} style={{ color: labelColor }}>
        <div
          className={styles['loading-spinner']}
          style={darkMode ? { borderTop: '4px solid #f8fafc' } : {}}
        />
        <p style={{ color: labelColor }}>Loading PR Analytics...</p>
      </div>
    );
  } else if (error) {
    content = (
      <div className={styles['pr-review-analytics-error']} style={{ color: labelColor }}>
        <div className={styles['error-icon']}>⚠️</div>
        <p style={{ color: labelColor }}>{error}</p>
        <button
          type="button"
          className={styles['retry-button']}
          style={{ color: labelColor }}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  } else if (data.length === 0) {
    content = (
      <div className={styles['pr-review-analytics-empty']} style={{ color: labelColor }}>
        <div className={styles['empty-icon']}>📊</div>
        <p style={{ color: labelColor }}>No PR data available</p>
      </div>
    );
  } else {
    content = (
      <div className={styles['pr-review-analytics-fixed-labels-layout']}>
        <div
          className={styles['pr-review-analytics-yaxis-fixed-label']}
          style={{ color: labelColor, background: containerBg }}
        >
          <span style={{ color: labelColor }}>Top 20 Most Popular PRs</span>
        </div>
        <div
          className={styles['pr-review-analytics-bars-scrollable-area']}
          style={{
            '--chart-bg': chartBg,
            background: 'var(--chart-bg)',
          }}
        >
          <ResponsiveContainer width="100%" height={Math.max(400, data.length * 28)}>
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 20, right: 40, left: 0, bottom: 20 }}
            >
              <CartesianGrid
                vertical
                horizontal={false}
                stroke={axisLineColor}
                strokeDasharray="3 3"
              />
              <YAxis
                type="category"
                dataKey="prNumber"
                tick={{ fill: tickColor }}
                width={160}
                axisLine={false}
                tickLine={false}
                label={null}
                interval={0}
              />
              <XAxis
                type="number"
                dataKey="reviewCount"
                tick={{ fill: tickColor }}
                axisLine={false}
                tickLine={false}
                label={null}
                domain={domain}
                ticks={ticks}
              />
              <Tooltip
                content={<CustomTooltip tooltipBg={tooltipBg} tooltipText={tooltipText} />}
              />
              <Bar
                dataKey="reviewCount"
                fill={barColor}
                radius={[0, 8, 8, 0]}
                animationDuration={1000}
                animationBegin={0}
              >
                <LabelList dataKey="reviewCount" position="right" fill={tickColor} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div
          className={styles['pr-review-analytics-xaxis-fixed-label']}
          style={{ color: labelColor, background: containerBg }}
        >
          <span style={{ color: labelColor }}>No of Reviews</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles['pr-review-analytics-container']} ${styles['pr-review-analytics-bg']} ${
        darkMode ? 'dark-mode' : ''
      }`}
      style={{
        background: containerBg,
        color: labelColor,
        ...boxStyling,
      }}
    >
      <div
        className={styles['pr-review-analytics-header']}
        style={{
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <h2 className={styles['pr-review-analytics-title']} style={{ color: labelColor }}>
          Top 20 Most Popular PRs
        </h2>
        <div className={styles['pr-review-analytics-dropdown-wrapper']}>
          <span
            className={styles['pr-review-analytics-dropdown-label']}
            style={{ color: labelColor }}
          >
            Duration
          </span>
          <div
            className={styles['pr-review-analytics-dropdown-value']}
            style={{ color: labelColor }}
          >
            {selectedDurationLabel}
          </div>
          <DurationFilter
            options={DURATION_OPTIONS}
            value={duration}
            onChange={setDuration}
            darkMode={darkMode}
          />
        </div>
      </div>
      <div className={styles['pr-review-analytics-chart-wrapper']}>{content}</div>
    </div>
  );
}

const mapStateToProps = state => ({ state });

export default connect(mapStateToProps)(PRReviewTeamAnalytics);
