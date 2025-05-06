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
import './ResourceUsage.css';

const allData = {
  material: [
    { name: 'Material A', returned: 5, loaned: 3, date: '2025-02-05' },
    { name: 'Material B', returned: 8, loaned: 4, date: '2025-02-06' },
    { name: 'Material C', returned: 12, loaned: 6, date: '2025-02-07' },
    { name: 'Material D', returned: 25, loaned: 8, date: '2025-02-08' },
    { name: 'Material E', returned: 15, loaned: 3, date: '2025-02-09' },
    { name: 'Material F', returned: 4, loaned: 6, date: '2025-02-10' },
    { name: 'Material G', returned: 2, loaned: 1, date: '2025-02-11' },
  ],
  equipment: [
    { name: 'Laptops', returned: 15, loaned: 5, date: '2025-02-05' },
    { name: 'Projectors', returned: 10, loaned: 3, date: '2025-02-06' },
    { name: 'Chairs', returned: 30, loaned: 10, date: '2025-02-07' },
    { name: 'Tables', returned: 20, loaned: 5, date: '2025-02-08' },
    { name: 'Microphones', returned: 8, loaned: 2, date: '2025-02-09' },
  ],
  venue: [
    { name: 'Venue A', returned: 5, loaned: 3, date: '2025-02-05' },
    { name: 'Venue B', returned: 8, loaned: 4, date: '2025-02-06' },
    { name: 'Venue C', returned: 12, loaned: 6, date: '2025-02-07' },
    { name: 'Venue D', returned: 25, loaned: 8, date: '2025-02-08' },
    { name: 'Venue E', returned: 15, loaned: 3, date: '2025-02-09' },
    { name: 'Venue F', returned: 4, loaned: 6, date: '2025-02-10' },
    { name: 'Venue G', returned: 2, loaned: 1, date: '2025-02-11' },
  ],
};

const insights = [
  { title: 'Most waste event type', value: 'Kids event', color: '#dcfce7' },
  { title: 'Most vulnerable materials', value: 'Flower', color: '#f3e8ff' },
  { title: 'Top rated venues', value: 'Kevin building', color: '#dcfce7' },
  { title: 'Lowest rated venues', value: 'Community centers', color: '#ffe4e6' },
  { title: 'Highest cost venues/hr', value: 'Kevin building', color: '#dcfce7' },
  { title: 'Most vulnerable equipment', value: 'Chair', color: '#ffe4e6' },
];

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
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

  const filterDataByDate = (data, period) => {
    const today = new Date();
    const startDate = new Date();

    switch (period) {
      case 'This Week':
        startDate.setDate(today.getDate() - today.getDay());
        break;
      case 'Last Week':
        startDate.setDate(today.getDate() - today.getDay() - 7);
        break;
      case 'This Month':
        startDate.setDate(1);
        break;
      default:
        startDate.setDate(today.getDate() - today.getDay());
    }

    startDate.setHours(0, 0, 0, 0);
    today.setHours(23, 59, 59, 999);

    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= today;
    });
  };

  useEffect(() => {
    const resourceTypeKey = resourceType.toLowerCase();
    const filteredData = filterDataByDate(allData[resourceTypeKey], timePeriod);
    setData(filteredData);
  }, [resourceType, timePeriod, allData]); // Added allData to dependencies

  return (
    <div className="resource-usage-container">
      {/* Left Section - Chart */}
      <div className="chart-section">
        <div className="header-section">
          <h1>Resources usage</h1>
          <div className="filters">
            <Dropdown>
              <Dropdown.Toggle className="custom-dropdown">{resourceType}</Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setResourceType('Material')}>Material</Dropdown.Item>
                <Dropdown.Item onClick={() => setResourceType('Equipment')}>
                  Equipment
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setResourceType('Venue')}>Venue</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown>
              <Dropdown.Toggle className="custom-dropdown">{timePeriod}</Dropdown.Toggle>
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

        <div className="chart-container">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
        </div>
      </div>

      {/* Right Section - Insights */}
      <div className="insights-section">
        <div className="insights-header">
          <h2>Insights</h2>
          <Dropdown>
            <Dropdown.Toggle className="custom-dropdown">{insightsTimePeriod}</Dropdown.Toggle>
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
        <div className="insights-grid">
          {insights.map((insight, index) => (
            <div key={index} className="insight-card">
              <div className="insight-title">{insight.title}</div>
              <div className="insight-badge" style={{ backgroundColor: insight.color }}>
                {insight.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
