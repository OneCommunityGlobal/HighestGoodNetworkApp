// src/pages/JobAnalytics.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
} from 'recharts';
import './JobAnalytics.css';

function JobAnalytics() {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [granularity, setGranularity] = useState('weekly');
  const [metric, setMetric] = useState('hits');

  const fetchData = async () => {
    try {
      const query = new URLSearchParams();
      if (startDate) query.append('startDate', startDate);
      if (endDate) query.append('endDate', endDate);
      if (selectedRoles.length) query.append('roles', selectedRoles.join(','));
      if (granularity) query.append('granularity', granularity);
      if (metric) query.append('metric', metric);

      const res = await axios.get(
        `${process.env.REACT_APP_APIENDPOINT}/job-analytics?${query.toString()}`,
      );
      setData(res.data);
    } catch (error) {
      // console.error('Error fetching analytics:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, selectedRoles, granularity, metric]);

  const title = metric === 'applications' ? 'Most Competitive Roles' : 'Most Popular Roles';

  const renderCustomLabel = props => {
    const { x, y, width, value } = props;
    const labelX = x + width + 5;
    return (
      <text x={labelX} y={y + 5} fill="#666" textAnchor="start" fontSize={12}>
        {value}
      </text>
    );
  };

  const getLabelDy = () => {
    return data.length <= 2 ? 65 : 60;
  };

  return (
    <div className="job-analytics-container">
      <h2 className="job-analytics-title">{title}</h2>

      <div className="job-analytics-filters">
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        <select
          multiple
          value={selectedRoles}
          onChange={e =>
            setSelectedRoles(Array.from(e.target.selectedOptions, option => option.value))
          }
        >
          <option value="Master Electrician">Master Electrician</option>
          <option value="Surveyor">Surveyor</option>
          <option value="Video Producer">Video Producer</option>
          <option value="Food Specialist">Food Specialist</option>
          <option value="Graphic Designer">Graphic Designer</option>
          <option value="Software Engineer">Software Engineer</option>
        </select>
        <select value={granularity} onChange={e => setGranularity(e.target.value)}>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="annual">Annual</option>
        </select>
        <select value={metric} onChange={e => setMetric(e.target.value)}>
          <option value="applications">Competitiveness</option>
          <option value="hits">Popularity</option>
        </select>
      </div>

      {data.length === 0 ? (
        <div className="no-data-message">
          No data available for the selected filters. Please adjust your date range, roles, or
          granularity.
        </div>
      ) : (
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={Math.max(data.length * 70, 200)}>
            {' '}
            {/* Minimum height of 200px */}
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 20, right: 50, bottom: 20, left: 150 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                label={{ value: 'Number of Applications', position: 'bottom' }}
              />
              <YAxis
                dataKey="role"
                type="category"
                width={180}
                label={{
                  value: 'Name of Role',
                  angle: -90,
                  position: 'outsideLeft',
                  dx: -100,
                  dy: getLabelDy(),
                  style: { textAnchor: 'middle' },
                }}
              />
              <Tooltip />
              <Bar dataKey={metric} fill="#4285F4">
                <LabelList content={renderCustomLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default JobAnalytics;
