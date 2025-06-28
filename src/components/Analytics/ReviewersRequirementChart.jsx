import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList
} from 'recharts';

const durationOptions = [
  { label: 'Last Week', value: 'lastWeek' },
  { label: 'Last 2 weeks', value: 'last2weeks' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'All Time', value: 'allTime' },
];

// Sample data
const fullSampleData = {
  lastWeek: [
    { reviewer: 'Alice', Exceptional: 2, Sufficient: 1, NeedsChanges: 1, DidNotReview: 0 },
    { reviewer: 'Bob', Exceptional: 1, Sufficient: 2, NeedsChanges: 0, DidNotReview: 1 },
  ],
  last2weeks: [
    { reviewer: 'Alice', Exceptional: 3, Sufficient: 2, NeedsChanges: 1, DidNotReview: 0 },
    { reviewer: 'Bob', Exceptional: 2, Sufficient: 3, NeedsChanges: 1, DidNotReview: 1 },
    { reviewer: 'Carol', Exceptional: 4, Sufficient: 2, NeedsChanges: 0, DidNotReview: 0 },
  ],
  lastMonth: [
    { reviewer: 'Alice', Exceptional: 5, Sufficient: 3, NeedsChanges: 2, DidNotReview: 0 },
    { reviewer: 'Bob', Exceptional: 2, Sufficient: 4, NeedsChanges: 1, DidNotReview: 1 },
    { reviewer: 'Carol', Exceptional: 6, Sufficient: 2, NeedsChanges: 0, DidNotReview: 0 },
    { reviewer: 'David', Exceptional: 1, Sufficient: 2, NeedsChanges: 3, DidNotReview: 4 },
  ],
  allTime: [
    { reviewer: 'Alice', Exceptional: 5, Sufficient: 3, NeedsChanges: 2, DidNotReview: 0 },
    { reviewer: 'Bob', Exceptional: 2, Sufficient: 4, NeedsChanges: 1, DidNotReview: 1 },
    { reviewer: 'Carol', Exceptional: 6, Sufficient: 2, NeedsChanges: 0, DidNotReview: 0 },
    { reviewer: 'David', Exceptional: 1, Sufficient: 2, NeedsChanges: 3, DidNotReview: 4 },
    { reviewer: 'Eve', Exceptional: 3, Sufficient: 3, NeedsChanges: 2, DidNotReview: 1 }
  ]
};

const ReviewersRequirementChart = ({ duration }) => {
   useEffect(() => {
    const fetchAPIData = async () => {
      try {
        const res = await fetch(`http://localhost:4500/api/analytics/review-summary?duration=${duration}`);
        const data = await res.json();
        console.log('API Response:', data); 
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchAPIData();
  }, [duration]);
  return (
    <div style={{ width: '100%', height: 500 }}>

      <div style={{ height: '400px', overflowY: 'auto' }}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            layout="vertical"
            data={fullSampleData[duration]}
            margin={{ top: 20, right: 30, left: 100, bottom: 40 }}
          >
            <XAxis
              type="number"
              label={{ value: 'Number of Reviews', position: 'insideBottom', offset: -5 }}
              width={100}
            />
            <YAxis
              dataKey="reviewer"
              type="category"
              label={{ value: 'Reviewers', angle: -90, position: 'insideLeft', offset: 10 }}
              width={100}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="Exceptional" stackId="a" fill="#052C65">
              <LabelList dataKey="Exceptional" position="right" />
            </Bar>
            <Bar dataKey="Sufficient" stackId="a" fill="#4682B4">
              <LabelList dataKey="Sufficient" position="right" />
            </Bar>
            <Bar dataKey="NeedsChanges" stackId="a" fill="#FF8C00">
              <LabelList dataKey="NeedsChanges" position="right" />
            </Bar>
            <Bar dataKey="DidNotReview" stackId="a" fill="#A9A9A9">
              <LabelList dataKey="DidNotReview" position="right" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


export default ReviewersRequirementChart;
