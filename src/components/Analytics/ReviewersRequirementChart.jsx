import React, { useEffect } from 'react';
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
    console.log("reached here")
    const fetchAPIData = async () => {
      try {
        const token = localStorage.getItem('token');
        // console.log(token);
        const res = await fetch(
          `http://localhost:4500/api/analytics/github-reviews`,
          {
            headers: {
              Authorization: `${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message);
        }

        const data = await res.json();
        console.log('API Response:', data); 
      } catch (err) {
        console.error('Error fetching data:', err.message);
      }
    };

    fetchAPIData();
  }, []);

  const processedData = fullSampleData[duration].map(item => ({
    ...item,
    total:
      (item.Exceptional || 0) +
      (item.Sufficient || 0) +
      (item.NeedsChanges || 0) +
      (item.DidNotReview || 0),
  }));

  return (
    <div style={{ width: '100%', height: 500 }}>
      <div style={{ height: '400px', overflowY: 'auto' }}>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            layout="vertical"
            data={processedData}
            margin={{ top: 20, right: 30, left: 100, bottom: 40 }}
          >
            <XAxis type="number" />
            <YAxis dataKey="reviewer" type="category" />
            <Tooltip />
            <Legend />
            <Bar dataKey="Exceptional" stackId="a" fill="#052C65" />
            <Bar dataKey="Sufficient" stackId="a" fill="#4682B4" />
            <Bar dataKey="NeedsChanges" stackId="a" fill="#FF8C00" />
            <Bar dataKey="DidNotReview" stackId="a" fill="#A9A9A9">
              <LabelList
                dataKey="total"
                position="right"
                style={{ fill: 'black', fontSize: 12, fontWeight: 'bold' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReviewersRequirementChart;
