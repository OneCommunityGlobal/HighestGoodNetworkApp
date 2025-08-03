import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

const ExperienceBreakdownChart = () => {
  const [data, setData] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setNoData(false);

    try {
      const params = {};
      if (startDate) params.startDate = startDate.toISOString().split('T')[0];
      if (endDate) params.endDate = endDate.toISOString().split('T')[0];
      if (selectedRoles.length > 0) params.roles = selectedRoles.map(r => r.value).join(',');

      const res = await axios.get('/api/applicants/experience-breakdown', { params });
      setData(res.data);
      if (res.data.length === 0) setNoData(true);
    } catch (error) {
      if (error.response?.status === 404) {
        setData([]);
        setNoData(true);
      } else {
        console.error('Error fetching chart data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRoles = async () => {
    try {
      const res = await axios.get('/api/applicants/experience-roles');
      const options = res.data.map(role => ({ value: role, label: role }));
      setRoles(options);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchAllRoles();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      {/* Filter Navbar */}
      <div
        style={{
          background: '#fff',
          padding: '15px 20px',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          alignItems: 'flex-end',
          marginBottom: '30px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="startDate" style={{ fontSize: 14, fontWeight: 600, marginBottom: 5 }}>
            Start Date
          </label>
          <DatePicker
            selected={startDate}
            onChange={setStartDate}
            placeholderText="Select start date"
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="endDate" style={{ fontSize: 14, fontWeight: 600, marginBottom: 5 }}>
            End Date
          </label>
          <DatePicker selected={endDate} onChange={setEndDate} placeholderText="Select end date" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 250 }}>
          <label htmlFor="roles" style={{ fontSize: 14, fontWeight: 600, marginBottom: 5 }}>
            Roles
          </label>
          <Select
            isMulti
            options={roles}
            value={selectedRoles}
            onChange={setSelectedRoles}
            placeholder="Select roles"
          />
        </div>

        <button
          onClick={fetchData}
          style={{
            marginLeft: 'auto',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: 4,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Apply Filters
        </button>
      </div>

      {/* Chart or Message */}
      {loading && <p style={{ textAlign: 'center', color: '#555' }}>Loading...</p>}

      {noData && !loading && (
        <div style={{ textAlign: 'center', marginTop: 40, color: '#777' }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: 60, height: 60, marginBottom: 10, color: '#ccc' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 13h6m2 0a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v4a2 2 0 002 2m2 0v5a2 2 0 004 0v-5"
            />
          </svg>
          <p style={{ fontSize: 18 }}>No data available for the selected filters.</p>
        </div>
      )}

      {!loading && !noData && data.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="experience"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ experience, count, percentage }) =>
                `${experience} - ${count} (${percentage}%)`
              }
            >
              {data.map((entry, index) => (
                <Cell key={entry.experience} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value}`, 'Applicants']}
              labelFormatter={() => `Experience`}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ExperienceBreakdownChart;
