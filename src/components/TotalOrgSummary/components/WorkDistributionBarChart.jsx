import * as React from 'react';
import { useState, useEffect } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import './chart.css';

export default function WorkDistributionBarChart({ volunteerstats }){
  const testData = [
    { label: 'Food', value: 249 },
    { label: 'Energy', value: 89 },
    { label: 'Housing', value: 234 },
    { label: 'Society', value: 432 },
    { label: 'Economics', value: 109 },
    { label: 'Stewardship', value: 211 },
    { label: 'Other', value: 108 },
  ];
  const sum = testData.map(item => item.value).reduce((prev, curr) => prev + curr, 0);

  const labels = testData.map(item => item.label);
  const values = testData.map(item => item.value);
  const barColors = ['#1BC590', '#F2AB53', '#1B6DDF', '#C92929', '#F285BB', '#77A9EE', '#98FB98'];

  return (
    <div>
      <h3 className="roleChartTitle">Work Distribution</h3>
      <BarChart
        xAxis={[
          {
            scaleType: 'band',
            data: labels,
            colorMap: {
              type: 'ordinal',
              values: labels,
              colors: barColors,
            },
            categoryGapRatio: 0.4,
          },
        ]}
        barLabel={item => `${item.value} (${((item.value / sum) * 100).toFixed(0)}%)`}
        series={[{ data: values }]}
        width={700}
        height={300}
      />
    </div>
  );
}
