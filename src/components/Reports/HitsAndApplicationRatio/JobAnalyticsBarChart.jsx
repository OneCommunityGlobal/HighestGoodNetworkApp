import React from 'react';
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  ResponsiveContainer,
  Label,
} from 'recharts';
import {
  formatInteger,
  formatPercentage,
} from './jobAnalyticsUtils';

function CustomTooltip({
  active,
  payload,
  isDark,
  usePercentage,
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const job = payload[0]?.payload || {};

  return (
    <div
      className={`p-2 rounded shadow ${
        isDark
          ? 'bg-space-cadet border border-yinmn-blue text-gray-100'
          : 'bg-white border border-gray-300 text-gray-900'
      }`}
      style={{ fontSize: '0.875rem' }}
    >
      <p>
        <strong>Role:</strong> {job.title}
      </p>

      <p>
        <strong>Conversion Rate (Applications ÷ Hits):</strong>{' '}
        {formatPercentage(job.conversionRate)}
      </p>

      <p>
        <strong>Hits:</strong> {formatInteger(job.hits)}
      </p>

      <p>
        <strong>Applications:</strong>{' '}
        {formatInteger(job.applications)}
      </p>
    </div>
  );
}

function JobAnalyticsBarChart({
  rows,
  usePercentage,
  isDark,
  dateRange,
  barColor,
  titlePrefix,
  xDomain,
}) {
  const metricKey = usePercentage
    ? 'conversionRate'
    : 'applications';

  const metricLabel = usePercentage
    ? 'Conversion Rate'
    : 'Applications';

  const axisLabel = usePercentage
    ? 'Percentage of hits converted to applications'
    : 'Applications';

  const tickFormatter = usePercentage
    ? formatPercentage
    : formatInteger;

  const axisColor = isDark ? '#e2e8f0' : '#374151';
  const labelColor = isDark ? '#FFFFFF' : '#374151';

  return (
    <div
      className={`rounded-xl p-4 mt-6 ${
        isDark
          ? 'bg-space-cadet text-light boxStyleDark'
          : 'bg-white text-gray-900 boxStyle'
      }`}
    >
      <div className="mb-4">
        <h2
          className={`text-lg font-semibold mb-2 ${
            isDark ? 'text-azure' : ''
          }`}
        >
          {titlePrefix} {metricLabel} ({dateRange})
        </h2>
      </div>

      {!rows.length ? (
        <p>No data available for the selected date range.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            layout="vertical"
            data={rows}
            margin={{
              top: 20,
              right: 90,
              bottom: 40,
              left: 20,
            }}
          >
            <XAxis
              type="number"
              domain={xDomain}
              tickFormatter={tickFormatter}
              stroke={axisColor}
            >
              <Label
                value={axisLabel}
                position="bottom"
                fill={axisColor}
              />
            </XAxis>

            <YAxis
              type="category"
              dataKey="title"
              width={180}
              tick={{ fill: axisColor, fontSize: 12 }}
              stroke={axisColor}
            >
              <Label
                value="Job Role"
                angle={-90}
                position="left"
                fill={axisColor}
              />
            </YAxis>

            <Tooltip
              cursor={{
                fill: isDark
                  ? 'rgba(255, 255, 255, 0.06)'
                  : 'rgba(59, 130, 246, 0.06)',
              }}
              wrapperStyle={{
                backgroundColor: 'transparent',
                border: 'none',
              }}
              content={
                <CustomTooltip
                  isDark={isDark}
                  usePercentage={usePercentage}
                />
              }
            />

            <Bar
              dataKey={metricKey}
              fill={barColor}
              barSize={22}
              radius={[0, 4, 4, 0]}
            >
              <LabelList
                dataKey={metricKey}
                position="right"
                formatter={tickFormatter}
                style={{
                  fill: labelColor,
                  fontWeight: 600,
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(PropTypes.object),
  usePercentage: PropTypes.bool.isRequired,
  isDark: PropTypes.bool.isRequired,
};

JobAnalyticsBarChart.propTypes = {
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      hits: PropTypes.number,
      applications: PropTypes.number,
      conversionRate: PropTypes.number,
    }),
  ).isRequired,
  usePercentage: PropTypes.bool.isRequired,
  isDark: PropTypes.bool.isRequired,
  dateRange: PropTypes.string.isRequired,
  barColor: PropTypes.string.isRequired,
  titlePrefix: PropTypes.string.isRequired,
  xDomain: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
  ).isRequired,
};

export default JobAnalyticsBarChart;