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

function CustomTooltip({ active, payload, darkMode }) {
  if (active && payload && payload.length) {
    const tooltipData = payload[0].payload;
    return (
      <div className={`${styles['custom-tooltip']} ${darkMode ? styles.dark : ''}`}>
        <div className={styles['tooltip-header']}>
          <h4>{tooltipData.prNumber}</h4>
        </div>
        <p className={styles['tooltip-title']}>{tooltipData.title}</p>
        <div className={styles['tooltip-details']}>
          <p>
            <strong>Reviews:</strong> {tooltipData.reviewCount}
          </p>
        </div>
      </div>
    );
  }
  return null;
}

function PRReviewTeamAnalytics({ darkMode }) {
  const [duration, setDuration] = useState(DURATION_OPTIONS[0].value);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dm = darkMode ? styles.dark : '';

  useEffect(() => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        const today = new Date();
        let cutoffDate;

        switch (duration) {
          case 'last_week':
            cutoffDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'last_2_weeks':
            cutoffDate = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
            break;
          case 'last_month':
            cutoffDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case 'all_time':
          default:
            cutoffDate = new Date(0);
            break;
        }

        const filtered = PRData.filter(pr => pr.createdDate >= cutoffDate);
        const sorted = [...filtered].sort((a, b) => b.reviewCount - a.reviewCount);
        setData(sorted.slice(0, 20));
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

  const totalPRs = data.length;
  const totalReviews = data.reduce((sum, pr) => sum + pr.reviewCount, 0);
  const avgReviews = totalPRs > 0 ? (totalReviews / totalPRs).toFixed(1) : 0;
  const mostReviewedPR = data.length > 0 ? data[0] : null;

  // Recharts SVG props must stay as JS values — CSS cannot target SVG attributes
  const barColor = darkMode ? '#4a9eff' : '#052C65';
  const axisLineColor = darkMode ? '#4a5568' : '#bfc7d1';
  const tickColor = darkMode ? '#f8fafc' : '#052C65';

  let content;
  if (loading) {
    content = (
      <div className={`${styles['pr-review-analytics-loading']} ${dm}`}>
        <div className={`${styles['loading-spinner']} ${dm}`} />
        <p>Loading PR Analytics...</p>
      </div>
    );
  } else if (error) {
    content = (
      <div className={`${styles['pr-review-analytics-error']} ${dm}`}>
        <div className={styles['error-icon']}>⚠️</div>
        <p>{error}</p>
        <button
          type="button"
          className={styles['retry-button']}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  } else if (data.length === 0) {
    content = (
      <div className={`${styles['pr-review-analytics-empty']} ${dm}`}>
        <div className={styles['empty-icon']}>📊</div>
        <p>No PR data available</p>
      </div>
    );
  } else {
    content = (
      <div className={styles['pr-review-analytics-fixed-labels-layout']}>
        <div className={`${styles['pr-review-analytics-yaxis-fixed-label']} ${dm}`}>
          <span>Top 20 Most Popular PRs</span>
        </div>
        <div className={`${styles['pr-review-analytics-bars-scrollable-area']} ${dm}`}>
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
              <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
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
        <div className={`${styles['pr-review-analytics-xaxis-fixed-label']} ${dm}`}>
          <span>No of Reviews</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles['pr-review-analytics-container']} ${styles['pr-review-analytics-bg']} ${dm}`}
      style={darkMode ? boxStyleDark : boxStyle}
    >
      <div className={styles['pr-review-analytics-header']}>
        <h2 className={`${styles['pr-review-analytics-title']} ${dm}`}>Top 20 Most Popular PRs</h2>
        <div className={styles['pr-review-analytics-dropdown-wrapper']}>
          <span className={`${styles['pr-review-analytics-dropdown-label']} ${dm}`}>Duration</span>
          <div className={`${styles['pr-review-analytics-dropdown-value']} ${dm}`}>
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
      {!loading && !error && data.length > 0 && (
        <div className={`${styles['pr-insights-panel']} ${dm}`}>
          <div className={styles['pr-insights-item']}>
            <div className={`${styles['pr-insights-label']} ${dm}`}>Total PRs</div>
            <div className={`${styles['pr-insights-value']} ${dm}`}>{totalPRs}</div>
          </div>
          <div className={styles['pr-insights-item']}>
            <div className={`${styles['pr-insights-label']} ${dm}`}>Avg Reviews/PR</div>
            <div className={`${styles['pr-insights-value']} ${dm}`}>{avgReviews}</div>
          </div>
          <div
            className={`${styles['pr-insights-item']} ${styles['pr-insights-item-highlight']} ${dm}`}
          >
            <div className={`${styles['pr-insights-label']} ${dm}`}>Most Reviewed PR</div>
            <div className={`${styles['pr-insights-value-highlight']} ${dm}`}>
              {mostReviewedPR?.prNumber}
            </div>
            <div className={`${styles['pr-insights-subtext']} ${dm}`}>
              {mostReviewedPR?.reviewCount} reviews
            </div>
          </div>
        </div>
      )}
      <div className={styles['pr-review-analytics-chart-wrapper']}>{content}</div>
    </div>
  );
}

const mapStateToProps = state => ({ darkMode: state.theme.darkMode });

export default connect(mapStateToProps)(PRReviewTeamAnalytics);
