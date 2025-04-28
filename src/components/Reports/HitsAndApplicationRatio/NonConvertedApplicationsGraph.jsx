import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LabelList } from 'recharts';

function NonConvertedApplicationsGraph({ data, viewOption }) {
  // Sort the data in ascending order based on conversion rate (non-converted applications)
  const sortedData = data.sort((a, b) => a.conversionRate - b.conversionRate).slice(0, 10);

  // Determine the value to display based on viewOption (conversion rate or applications)
  const getBarData = (item) => {
    if (viewOption === 'conversion') {
      return item.conversionRate * 100; // Conversion Rate in percentage
    }
    return item.applications; // Actual Applications
  };

  return (
    <BarChart width={500} height={300} data={sortedData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="jobTitle" />
      <YAxis />
      <Tooltip formatter={(value) => `${value}%`} />
      <Legend />
      <Bar dataKey="conversionRate" fill="#82ca9d">
        <LabelList dataKey="conversionRate" position="top" />
      </Bar>
    </BarChart>
  );
}

export default NonConvertedApplicationsGraph;
