import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const job = payload[0].payload;
    return (
      <div className="bg-white border border-gray-300 p-2 rounded shadow text-sm">
        <p><strong>Role:</strong> {job.title}</p>
        <p><strong>Conversion Rate:</strong> {job.conversionRate}%</p>
        <p><strong>Hits:</strong> {job.hits}</p>
        <p><strong>Applications:</strong> {job.applications}</p>
      </div>
    );
  }
  return null;
};

function ConvertedApplicationGraph({ data, usePercentage }) {
  const sortedData = useMemo(() => {
    const key = usePercentage ? 'conversionRate' : 'applications';
    const toNum = (val) => (val == null ? 0 : Number(val));
    
    // Sort in descending order and take only top 10
    return [...data]
      .sort((a, b) => toNum(b[key]) - toNum(a[key]))
      .slice(0, 10);
  }, [data, usePercentage]);

  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <h2 className="text-lg font-semibold mb-2">
        Top 10 Job Postings by {usePercentage ? 'Conversion Rate' : 'Applications'}
      </h2>
      {sortedData.length === 0 ? (
        <p>No data available for the selected date range.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            layout="vertical"
            data={sortedData}
            margin={{ top: 20, right: 20, bottom: 20, left: 150 }}
          >
            <XAxis
              type="number"
              domain={usePercentage ? [0, 100] : ['auto', 'auto']}
              unit={usePercentage ? '%' : ''}
            />
            <YAxis type="category" dataKey="title" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={usePercentage ? 'conversionRate' : 'applications'} fill="#4CAF50">
              <LabelList
                dataKey={usePercentage ? 'conversionRate' : 'applications'}
                position="right"
                formatter={(value) => `${value}${usePercentage ? '%' : ''}`}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default ConvertedApplicationGraph;
