import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ENDPOINTS } from '../../utils/URL';

const getCount = (counts, key) => counts?.[key] || 0;

const normalizeReviewCounts = item => {
  const counts = item.counts || {};
  const exceptional = getCount(counts, 'Exceptional');
  const sufficient = getCount(counts, 'Sufficient');
  const needsChanges = getCount(counts, 'Needs Changes');
  const didNotReview = getCount(counts, 'Did Not Review');

  return {
    reviewer: item.reviewer,
    exceptional,
    sufficient,
    needsChanges,
    didNotReview,
    total: exceptional + sufficient + needsChanges + didNotReview,
  };
};

const ReviewersRequirementChart = ({ duration }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchAPIData = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const token = window.localStorage.getItem('token');
        const response = await axios.get(ENDPOINTS.GITHUB_REVIEW_SUMMARY(duration), {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        });

        setData(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setData([]);
        setErrorMessage('Unable to load GitHub review data for the selected duration.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAPIData();
  }, [duration]);

  const sortedData = data
    .map(normalizeReviewCounts)
    .filter(item => item.reviewer)
    .sort((a, b) => b.total - a.total);

  if (isLoading) {
    return <p>Loading review data...</p>;
  }

  if (errorMessage) {
    return <p>{errorMessage}</p>;
  }

  if (!sortedData.length) {
    return <p>No review data found for this duration.</p>;
  }

  const rowHeight = 34;
  const chartHeight = Math.max(sortedData.length * rowHeight, 360);

  return (
    <div style={{ width: '100%', height: chartHeight + 80 }}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          layout="vertical"
          data={sortedData}
          margin={{ top: 20, right: 48, left: 20, bottom: 40 }}
          barSize={22}
        >
          <XAxis type="number" allowDecimals={false} />
          <YAxis
            dataKey="reviewer"
            type="category"
            interval={0}
            width={190}
            tick={{ fontSize: 12 }}
          />
          <Tooltip />
          <Legend />

          <Bar dataKey="exceptional" name="Exceptional" stackId="reviews" fill="#052C65" />
          <Bar dataKey="sufficient" name="Sufficient" stackId="reviews" fill="#4682B4" />
          <Bar dataKey="needsChanges" name="Needs Changes" stackId="reviews" fill="#FF8C00" />
          <Bar dataKey="didNotReview" name="Did Not Review" stackId="reviews" fill="#A9A9A9">
            <LabelList
              dataKey="total"
              position="right"
              style={{ fill: 'black', fontSize: 12, fontWeight: 'bold' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReviewersRequirementChart;
