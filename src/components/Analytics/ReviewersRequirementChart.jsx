import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const durationOptions = [
  { label: 'Last Week', value: 'lastWeek' },
  { label: 'Last 2 weeks', value: 'last2weeks' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'All Time', value: 'allTime' },
];

const sampleData = [
  {
    reviewer: 'Alice',
    team: 'Team A',
    isMentor: true,
    Exceptional: 5,
    Sufficient: 3,
    NeedsChanges: 2,
    DidNotReview: 0
  },
  {
    reviewer: 'Bob',
    team: 'Team B',
    isMentor: false,
    Exceptional: 2,
    Sufficient: 4,
    NeedsChanges: 1,
    DidNotReview: 1
  },
  {
    reviewer: 'Carol',
    team: 'Team C',
    isMentor: true,
    Exceptional: 6,
    Sufficient: 2,
    NeedsChanges: 0,
    DidNotReview: 0
  },
  {
    reviewer: 'David',
    team: 'Team A',
    isMentor: false,
    Exceptional: 1,
    Sufficient: 2,
    NeedsChanges: 3,
    DidNotReview: 4
  },
  {
    reviewer: 'Eve',
    team: 'Team B',
    isMentor: true,
    Exceptional: 3,
    Sufficient: 3,
    NeedsChanges: 2,
    DidNotReview: 1
  }
];


const ReviewersRequirementChart = () => {
  const [duration, setDuration] = useState('lastWeek');

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
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="duration">Duration: </label>
        <select
          id="duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        >
          {durationOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          layout="vertical"
          data={sampleData}
          margin={{ top: 20, right: 30, left: 100, bottom: 40 }}
        >
          <XAxis type="number" />
          <YAxis dataKey="reviewer" type="category" />
          <Tooltip />
          <Legend />
          <Bar dataKey="Exceptional" stackId="a" fill="#052C65" />
          <Bar dataKey="Sufficient" stackId="a" fill="#4682B4" />
          <Bar dataKey="NeedsChanges" stackId="a" fill="#FF8C00" />
          <Bar dataKey="DidNotReview" stackId="a" fill="#A9A9A9" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReviewersRequirementChart;
