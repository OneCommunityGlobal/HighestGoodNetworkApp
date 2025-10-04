'use client';

import { useState, useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import styles from './ResourceUsage.module.css';

const allData = {
  material: [
    { name: 'Material A', returned: 5, loaned: 3, date: '2024-12-05' },
    { name: 'Material B', returned: 8, loaned: 4, date: '2024-12-06' },
    { name: 'Material C', returned: 12, loaned: 6, date: '2024-12-07' },
    { name: 'Material D', returned: 25, loaned: 8, date: '2024-12-08' },
    { name: 'Material E', returned: 15, loaned: 3, date: '2024-12-09' },
    { name: 'Material F', returned: 4, loaned: 6, date: '2024-12-10' },
    { name: 'Material G', returned: 2, loaned: 1, date: '2024-12-11' },
  ],
  equipment: [
    { name: 'Laptops', returned: 15, loaned: 5, date: '2024-12-05' },
    { name: 'Projectors', returned: 10, loaned: 3, date: '2024-12-06' },
    { name: 'Chairs', returned: 30, loaned: 10, date: '2024-12-07' },
    { name: 'Tables', returned: 20, loaned: 5, date: '2024-12-08' },
    { name: 'Microphones', returned: 8, loaned: 2, date: '2024-12-09' },
  ],
  venue: [
    { name: 'Venue A', returned: 5, loaned: 3, date: '2024-12-05' },
    { name: 'Venue B', returned: 8, loaned: 4, date: '2024-12-06' },
    { name: 'Venue C', returned: 12, loaned: 6, date: '2024-12-07' },
    { name: 'Venue D', returned: 25, loaned: 8, date: '2024-12-08' },
    { name: 'Venue E', returned: 15, loaned: 3, date: '2024-12-09' },
    { name: 'Venue F', returned: 4, loaned: 6, date: '2024-12-10' },
    { name: 'Venue G', returned: 2, loaned: 1, date: '2024-12-11' },
  ],
};

const allInsights = {
  'This Week': [
    { title: 'Most waste event type', value: 'Kids event', color: '#dcfce7' },
    { title: 'Most vulnerable materials', value: 'Flower', color: '#f3e8ff' },
    { title: 'Top rated venues', value: 'Kevin building', color: '#dcfce7' },
    { title: 'Lowest rated venues', value: 'Community centers', color: '#ffe4e6' },
    { title: 'Highest cost venues/hr', value: 'Kevin building', color: '#dcfce7' },
    { title: 'Most vulnerable equipment', value: 'Chair', color: '#ffe4e6' },
  ],
  'Last Week': [
    { title: 'Most waste event type', value: 'Sports event', color: '#dcfce7' },
    { title: 'Most vulnerable materials', value: 'Paper', color: '#f3e8ff' },
    { title: 'Top rated venues', value: 'Sports center', color: '#dcfce7' },
    { title: 'Lowest rated venues', value: 'Old hall', color: '#ffe4e6' },
    { title: 'Highest cost venues/hr', value: 'Sports center', color: '#dcfce7' },
    { title: 'Most vulnerable equipment', value: 'Table', color: '#ffe4e6' },
  ],
  'This Month': [
    { title: 'Most waste event type', value: 'Community event', color: '#dcfce7' },
    { title: 'Most vulnerable materials', value: 'Plastic', color: '#f3e8ff' },
    { title: 'Top rated venues', value: 'Community hall', color: '#dcfce7' },
    { title: 'Lowest rated venues', value: 'Small rooms', color: '#ffe4e6' },
    { title: 'Highest cost venues/hr', value: 'Community hall', color: '#dcfce7' },
    { title: 'Most vulnerable equipment', value: 'Microphone', color: '#ffe4e6' },
  ],
};

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className="mb-1">{`${payload[0].payload.name}`}</p>
        <p className="mb-1" style={{ color: '#22c55e' }}>{`Returned: ${payload[0].value}`}</p>
        <p className="mb-0" style={{ color: '#fca5a5' }}>{`Loaned: ${payload[1].value}`}</p>
      </div>
    );
  }
  return null;
}

export default function ResourceUsage() {
  const [resourceType, setResourceType] = useState('Material');
  const [timePeriod, setTimePeriod] = useState('This Week');
  const [insightsTimePeriod, setInsightsTimePeriod] = useState('Last Week');
  const [data, setData] = useState(allData.venue);
  const [insights, setInsights] = useState(allInsights['Last Week']);

  const filterDataByDate = (datas, period) => {
    // Create different datasets for different time periods to demonstrate filtering
    const baseData = [...datas];

    switch (period) {
      case 'This Week':
        // Show first 3 items for this week
        return baseData.slice(0, 3);
      case 'Last Week':
        // Show middle 3 items for last week
        return baseData.slice(2, 5);
      case 'This Month':
        // Show all items for this month
        return baseData;
      default:
        return baseData;
    }
  };

  useEffect(() => {
    const resourceTypeKey = resourceType.toLowerCase();
    const filteredData = filterDataByDate(allData[resourceTypeKey], timePeriod);
    setData(filteredData);
  }, [resourceType, timePeriod, allData]);

  useEffect(() => {
    setInsights(allInsights[insightsTimePeriod] || allInsights['Last Week']);
  }, [insightsTimePeriod]);

  return (
    <div className={styles.resourceUsageContainer}>
      {/* Left Section - Chart */}
      <div className={styles.chartSection}>
        <div className={styles.headerSection}>
          <h1>Resources usage</h1>
          <div className={styles.filters}>
            <Dropdown>
              <Dropdown.Toggle className={styles.customDropdown}>{resourceType}</Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setResourceType('Material')}>Material</Dropdown.Item>
                <Dropdown.Item onClick={() => setResourceType('Equipment')}>
                  Equipment
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setResourceType('Venue')}>Venue</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown>
              <Dropdown.Toggle className={styles.customDropdown}>{timePeriod}</Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setTimePeriod('This Week')}>This Week</Dropdown.Item>
                <Dropdown.Item onClick={() => setTimePeriod('Last Week')}>Last Week</Dropdown.Item>
                <Dropdown.Item onClick={() => setTimePeriod('This Month')}>
                  This Month
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        <div className={styles.chartContainer}>
          {data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#666', fontSize: 12 }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  align="right"
                  verticalAlign="top"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ paddingBottom: '20px' }}
                />
                <Bar
                  dataKey="returned"
                  stackId="a"
                  fill="#22c55e"
                  name="Returned"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="loaned"
                  stackId="a"
                  fill="#fca5a5"
                  name="Loaned"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <p>No data available for the selected time period and resource type.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Section - Insights */}
      <div className={styles.insightsSection}>
        <div className={styles.insightsHeader}>
          <h2>Insights</h2>
          <Dropdown>
            <Dropdown.Toggle className={styles.customDropdown}>
              {insightsTimePeriod}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setInsightsTimePeriod('This Week')}>
                This Week
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setInsightsTimePeriod('Last Week')}>
                Last Week
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setInsightsTimePeriod('This Month')}>
                This Month
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className={styles.insightsGrid}>
          {insights.map((insight, index) => (
            <div key={index} className={styles.insightCard}>
              <div className={styles.insightTitle}>{insight.title}</div>
              <div className={styles.insightBadge} style={{ backgroundColor: insight.color }}>
                {insight.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
