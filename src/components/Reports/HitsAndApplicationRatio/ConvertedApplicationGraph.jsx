// eslint-disable-next-line no-unused-vars
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer } from 'recharts';

function ConvertedApplicationGraph({ data, usePercentage }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <h2 className="text-lg font-semibold mb-2">Top 10 Job Postings by Conversion Rate</h2>
      {data.length === 0 ? (
        <p>No data available for the selected date range.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart layout="vertical" data={data} margin={{ top: 20, right: 20, bottom: 20, left: 150 }}>
            <XAxis type="number" domain={[0, 100]} unit={usePercentage ? '%' : ''} />
            <YAxis type="category" dataKey="title" />
            <Tooltip formatter={(value, name) => {
              return [value + (usePercentage ? '%' : ''), name];
            }} />
            <Bar dataKey={usePercentage ? 'conversionRate' : 'applications'} fill="#4CAF50">
              <LabelList dataKey={usePercentage ? 'conversionRate' : 'applications'} position="right" formatter={(value) => `${value}${usePercentage ? '%' : ''}`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default ConvertedApplicationGraph;