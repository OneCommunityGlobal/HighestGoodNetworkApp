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
import { useSelector } from 'react-redux';

const allData = {
  material: [
    { name: 'Material A', returned: 5, loaned: 3 },
    { name: 'Material B', returned: 8, loaned: 4 },
    { name: 'Material C', returned: 12, loaned: 6 },
    { name: 'Material D', returned: 25, loaned: 8 },
    { name: 'Material E', returned: 15, loaned: 3 },
    { name: 'Material F', returned: 4, loaned: 6 },
    { name: 'Material G', returned: 2, loaned: 1 },
  ],
  equipment: [
    { name: 'Laptops', returned: 15, loaned: 5 },
    { name: 'Projectors', returned: 10, loaned: 3 },
    { name: 'Chairs', returned: 30, loaned: 10 },
    { name: 'Tables', returned: 20, loaned: 5 },
    { name: 'Microphones', returned: 8, loaned: 2 },
  ],
  venue: [
    { name: 'Venue A', returned: 5, loaned: 3 },
    { name: 'Venue B', returned: 8, loaned: 4 },
    { name: 'Venue C', returned: 12, loaned: 6 },
    { name: 'Venue D', returned: 25, loaned: 8 },
    { name: 'Venue E', returned: 15, loaned: 3 },
    { name: 'Venue F', returned: 4, loaned: 6 },
    { name: 'Venue G', returned: 2, loaned: 1 },
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

function CustomTooltip({ active, payload, darkMode }) {
  if (!active || !payload || !payload.length) return null;

  const bg = darkMode ? '#1C2541' : '#ffffff';
  const txt = darkMode ? '#ffffff' : '#000000';

  return (
    <div className={styles.customTooltip} style={{ background: bg, color: txt }}>
      <p>{payload[0].payload.name}</p>
      <p style={{ color: '#22c55e' }}>Returned: {payload[0].value}</p>
      <p style={{ color: '#fca5a5' }}>Loaned: {payload[1].value}</p>
    </div>
  );
}

export default function ResourceUsage() {
  const [resourceType, setResourceType] = useState('Material');
  const [timePeriod, setTimePeriod] = useState('This Week');
  const [insightsTimePeriod, setInsightsTimePeriod] = useState('Last Week');
  const [data, setData] = useState(allData.material);
  const [insights, setInsights] = useState(allInsights['Last Week']);

  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    setData(allData[resourceType.toLowerCase()]);
  }, [resourceType]);

  useEffect(() => {
    setInsights(allInsights[insightsTimePeriod]);
  }, [insightsTimePeriod]);

  return (
    <div
      data-testid="resource-usage-container"
      className={`${styles.resourceUsageContainer} ${
        darkMode ? 'dark-mode bg-oxford-blue text-light' : ''
      }`}
    >
      {/* LEFT SECTION */}
      <div className={`${styles.chartSection} ${darkMode ? 'bg-space-cadet' : ''}`}>
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

        {/* CHART */}
        <div className={styles.chartContainer}>
          <div className={styles.yAxisLabel} style={{ color: darkMode ? '#ffffff' : '#666' }}>
            Amount
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 30, bottom: 80 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={darkMode ? '#3A506B' : '#eee'}
                vertical={false}
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: darkMode ? '#ffffff' : '#666',
                  fontWeight: 700,
                  fontSize: 12,
                }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: darkMode ? '#ffffff' : '#666',
                  fontWeight: 700,
                  fontSize: 12,
                }}
              />

              <Tooltip content={<CustomTooltip darkMode={darkMode} />} />

              <Legend
                align="right"
                verticalAlign="top"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  color: darkMode ? '#ffffff' : '#666',
                }}
              />

              <Bar dataKey="returned" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="loaned" stackId="a" fill="#fca5a5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className={`${styles.insightsSection} ${darkMode ? 'bg-space-cadet text-light' : ''}`}>
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
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className={`${styles.insightCard} ${darkMode ? 'bg-yinmn-blue text-light' : ''}`}
            >
              <div className={styles.insightTitle}>{insight.title}</div>
              <div
                className={`${styles.insightBadge} ${darkMode ? 'text-dark' : ''}`}
                style={{ backgroundColor: insight.color }}
              >
                {insight.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
