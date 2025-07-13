import { useState, useEffect } from 'react';
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
import DurationFilter from './DurationFilter';
import './PRReviewTeamAnalytics.css';
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

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <div className="tooltip-header">
          <h4>{data.prNumber}</h4>
        </div>
        <p className="tooltip-title">{data.title}</p>
        <div className="tooltip-details">
          <p>
            <strong>Reviews:</strong> {data.reviewCount}
          </p>
        </div>
      </div>
    );
  }
  return null;
}

function PRReviewTeamAnalytics() {
  const [duration, setDuration] = useState(DURATION_OPTIONS[0].value);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  let content;
  if (loading) {
    content = (
      <div className="pr-review-analytics-loading">
        <div className="loading-spinner" />
        <p>Loading PR Analytics...</p>
      </div>
    );
  } else if (error) {
    content = (
      <div className="pr-review-analytics-error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button type="button" className="retry-button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  } else if (data.length === 0) {
    content = (
      <div className="pr-review-analytics-empty">
        <div className="empty-icon">📊</div>
        <p>No PR data available</p>
      </div>
    );
  } else {
    content = (
      <div className="pr-review-analytics-fixed-labels-layout">
        <div className="pr-review-analytics-yaxis-fixed-label">
          <span>Top 20 Most Popular PRs</span>
        </div>
        <div className="pr-review-analytics-bars-scrollable-area">
          <ResponsiveContainer width="100%" height={Math.max(400, data.length * 28)}>
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 20, right: 40, left: 0, bottom: 20 }}
            >
              <CartesianGrid vertical horizontal={false} stroke="#bfc7d1" strokeDasharray="3 3" />
              <YAxis
                type="category"
                dataKey="prNumber"
                tick={{ fill: '#052C65' }}
                width={160}
                axisLine={false}
                tickLine={false}
                label={null}
                interval={0}
              />
              <XAxis
                type="number"
                dataKey="reviewCount"
                tick={{ fill: '#052C65' }}
                axisLine={false}
                tickLine={false}
                label={null}
                domain={domain}
                ticks={ticks}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="reviewCount"
                fill="#052C65"
                radius={[0, 8, 8, 0]}
                animationDuration={1000}
                animationBegin={0}
              >
                <LabelList dataKey="reviewCount" position="right" fill="#052C65" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="pr-review-analytics-xaxis-fixed-label">
          <span>No of Reviews</span>
        </div>
      </div>
    );
  }

  return (
    <div className="pr-review-analytics-container pr-review-analytics-bg">
      <div
        className="pr-review-analytics-header"
        style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <h2 className="pr-review-analytics-title">Top 20 Most Popular PRs</h2>
        <div className="pr-review-analytics-dropdown-wrapper">
          <span className="pr-review-analytics-dropdown-label">Duration</span>
          <div className="pr-review-analytics-dropdown-value">{selectedDurationLabel}</div>
          <DurationFilter options={DURATION_OPTIONS} value={duration} onChange={setDuration} />
        </div>
      </div>
      <div className="pr-review-analytics-chart-wrapper">{content}</div>
    </div>
  );
}

export default PRReviewTeamAnalytics;
