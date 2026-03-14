import React, { useMemo } from 'react';
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

const truncate = (str, max = 22) =>
  typeof str === 'string' && str.length > max ? str.slice(0, max) + '…' : str;

const CustomTooltip = ({ active, payload, isDark, usePercentage }) => {
  if (active && payload && payload.length) {
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
        <p><strong>Role:</strong> {job.title}</p>
        <p><strong>Conversion Rate (Applications ÷ Hits):</strong> {usePercentage ? `${job.conversionRate}%` : job.conversionRate}</p>
        <p><strong>Hits:</strong> {job.hits}</p>
        <p><strong>Applications:</strong> {job.applications}</p>
      </div>
    );
  }
  return null;
};

function ConvertedApplicationGraph({ data = [], usePercentage, isDark, dateRange }) {
  const sortedData = useMemo(() => {
    const map = new Map();

    data.forEach((item) => {
      const title = item.title;

      if (!map.has(title)) {
        map.set(title, { ...item });
      } else {
        const existing = map.get(title);

        const hits = (existing.hits || 0) + (item.hits || 0);
        const applications =
          (existing.applications || 0) + (item.applications || 0);

        map.set(title, {
          ...existing,
          hits,
          applications,
          conversionRate: hits ? Number((applications / hits) * 100).toFixed(2) : 0,
        });
      }
    });

    const uniqueRoles = Array.from(map.values());

    const key = usePercentage ? 'conversionRate' : 'applications';

    uniqueRoles.sort((a, b) => (b[key] || 0) - (a[key] || 0));

    return uniqueRoles.slice(0, 10);
  }, [data, usePercentage]);

  return (
    <div
      className={`rounded-xl p-4 mt-6 ${
        isDark ? 'bg-space-cadet text-light boxStyleDark' : 'bg-white text-gray-900 boxStyle'
      }`}
    >
      <div className="mb-4">
        <h2 className={`text-lg font-semibold mb-2 ${isDark ? 'text-azure' : ''}`}>
          Top 10 Job Postings by {usePercentage ? 'Conversion Rate' : 'Applications'} ({dateRange})
        </h2>
      </div>

      {sortedData.length === 0 ? (
        <p>No data available for the selected date range.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart layout="vertical" data={sortedData} margin={{ top: 20, right: 90, bottom: 40, left: 20 }}>
            <XAxis
              type="number"
              domain={usePercentage ? [0, 100] : ['auto', 'auto']}
              stroke={isDark ? '#e2e8f0' : '#374151'}
            >
              <Label
                value={usePercentage ? 'Percentage of hits converted to applications' : 'Applications'}
                position="bottom"
                fill={isDark ? '#e2e8f0' : '#374151'}
              />
            </XAxis>

            <YAxis
              type="category"
              dataKey="title"
              width={180}
              tickFormatter={(v) => v}
              tick={{ fill: isDark ? '#e2e8f0' : '#374151', fontSize: 12 }}
              stroke={isDark ? '#e2e8f0' : '#374151'}
            >
              <Label
                value="Job Role"
                angle={-90}
                position="left"
                fill={isDark ? '#e2e8f0' : '#374151'}
              />
            </YAxis>

            <Tooltip
              wrapperStyle={{
                backgroundColor: isDark ? '#374151' : '#ffffff',
                border: 'none'
              }}
              content={<CustomTooltip isDark={isDark} usePercentage={usePercentage} />} />

            <Bar dataKey={usePercentage ? 'conversionRate' : 'applications'} fill="#4CAF50">
              <LabelList
                dataKey={usePercentage ? 'conversionRate' : 'applications'}
                position="right"
                style={{ fill: isDark ? '#FFFFFF' : '#374151', fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

ConvertedApplicationGraph.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      hits: PropTypes.number,
      applications: PropTypes.number,
      conversionRate: PropTypes.number,
    })
  ),
  usePercentage: PropTypes.bool.isRequired,
  isDark: PropTypes.bool.isRequired,
};

export default ConvertedApplicationGraph;
