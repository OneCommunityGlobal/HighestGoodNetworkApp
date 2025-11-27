import React, { useMemo } from 'react';
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
  str.length > max ? str.slice(0, max) + '…' : str;

const CustomTooltip = ({ active, payload, isDark, usePercentage }) => {
  if (active && payload && payload.length) {
    const job = payload[0].payload;
    return (
      <div
        className={`p-2 rounded shadow ${
          isDark
            ? 'bg-space-cadet border border-yinmn-blue text-gray-100'
            : 'bg-white border border-gray-300 text-gray-900'
        }`}
        style={{ fontSize: '0.875rem' }}
      >
        <p><span style={{ fontWeight: 900 }}>Role:</span> {job.title}</p>
        <p><span style={{ fontWeight: 900 }}>Conversion Rate:</span> {usePercentage ? `${job.conversionRate}%` : job.conversionRate}</p>
        <p><span style={{ fontWeight: 900 }}>Hits:</span> {job.hits}</p>
        <p><span style={{ fontWeight: 900 }}>Applications:</span> {job.applications}</p>
      </div>
    );
  }
  return null;
};

function ConvertedApplicationGraph({ data, usePercentage, isDark }) {
  const sortedData = useMemo(() => {
    const key = usePercentage ? 'conversionRate' : 'applications';
    const toNum = (val) => (val == null ? 0 : Number(val));

    return [...data]
      .sort((a, b) => toNum(b[key]) - toNum(a[key]))
      .slice(0, 10);
  }, [data, usePercentage]);

  return (
    <div
      className={`rounded-xl p-4 mt-6 ${
        isDark ? 'bg-space-cadet text-light boxStyleDark' : 'bg-white text-gray-900 boxStyle'
      }`}
    >
      <h2 className={`text-lg font-semibold mb-2 ${isDark ? 'text-azure' : ''}`}>
        Top 10 Job Postings by {usePercentage ? 'Conversion Rate' : 'Applications'}
      </h2>

      {sortedData.length === 0 ? (
        <p>No data available for the selected date range.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            layout="vertical"
            data={sortedData}
            margin={{ top: 20, right: 90, bottom: 40, left: 180 }}
          >
            <XAxis
              type="number"
              domain={usePercentage ? [0, 100] : ['auto', 'auto']}
              unit={usePercentage ? '%' : ''}
              stroke={isDark ? '#e2e8f0' : '#374151'}
            >
              <Label
                value={
                  usePercentage
                    ? 'Percentage of hits converted to applications'
                    : 'Applications'
                }
                position="bottom"
                offset={0}
                fill={isDark ? '#e2e8f0' : '#374151'}
              />
            </XAxis>

            <YAxis
              type="category"
              dataKey="title"
              width={180}
              tickFormatter={(v) => truncate(v)}
              tick={{ fill: isDark ? '#e2e8f0' : '#374151', fontSize: 12 }}
              stroke={isDark ? '#e2e8f0' : '#374151'}
            >
              <Label
                value="Job Role"
                angle={-90}
                position="left"
                offset={-5}
                fill={isDark ? '#e2e8f0' : '#374151'}
              />
            </YAxis>

            <Tooltip content={<CustomTooltip isDark={isDark} usePercentage={usePercentage} />} />

            <Bar dataKey={usePercentage ? 'conversionRate' : 'applications'} fill="#4CAF50">
              <LabelList
                dataKey={usePercentage ? 'conversionRate' : 'applications'}
                position="right"
                formatter={(value) => `${value}${usePercentage ? '%' : ''}`}
                style={{
                  fill: isDark ? '#FFFFFF' : '#374151',
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

export default ConvertedApplicationGraph;
