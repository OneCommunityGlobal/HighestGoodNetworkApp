import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import { ApiEndpoint } from '~/utils/URL';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

const ExperienceDonutChart = () => {
  const [data, setData] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);

  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect?.width || 0;
      setContainerWidth(w);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const isNarrow = containerWidth && containerWidth < 520;

  const fontSizeFor = percent => {
    if (containerWidth < 320) return percent < 0.12 ? 9 : 10;
    if (containerWidth < 400) return percent < 0.12 ? 10 : 11;
    if (containerWidth < 520) return percent < 0.12 ? 11 : 12;
    return 13;
  };

  const renderInsideLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, payload }) => {
    const radius = innerRadius + (outerRadius - innerRadius) / 2;
    const rad = (-midAngle * Math.PI) / 180;
    const x = cx + radius * Math.cos(rad);
    const y = cy + radius * Math.sin(rad);
    const txt = `${payload.experience} (${payload.count})`;
    return (
      <text
        x={x}
        y={y}
        fill={darkMode ? '#fff' : '#000'}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSizeFor(percent)}
        style={{ pointerEvents: 'none' }}
      >
        {txt}
      </text>
    );
  };

  const renderOutsideLabel = ({ experience, count, percentage }) =>
    `${experience} - ${count} (${percentage}%)`;

  const fetchData = async () => {
    setLoading(true);
    setNoData(false);
    try {
      const params = {};
      if (startDate) params.startDate = startDate.toISOString().split('T')[0];
      if (endDate) params.endDate = endDate.toISOString().split('T')[0];
      if (selectedRoles.length > 0) params.roles = selectedRoles.map(r => r.value).join(',');
      const res = await axios.get(`${ApiEndpoint}/applicants/experience-breakdown`, {
        params,
      });
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
      const res = await axios.get(`${ApiEndpoint}/applicants/experience-roles`);
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
    <div
      ref={containerRef}
      className={`${darkMode ? 'bg-oxford-blue text-light' : ''}`}
      style={{
        padding: '20px',
        width: '100%',
        minHeight: '100vh',
      }}
    >
      {/* Filters */}
      <div
        className={`mb-6 rounded-lg shadow ${darkMode ? 'bg-space-cadet text-light' : 'bg-white'}`}
        style={{
          padding: '15px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 30,
          alignItems: 'flex-end',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label
            htmlFor="startDate"
            style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 5,
              color: darkMode ? '#fff' : '#000',
            }}
          >
            Start Date
          </label>
          <DatePicker
            selected={startDate}
            onChange={setStartDate}
            placeholderText="Select start date"
            className={darkMode ? 'bg-space-cadet text-light dark-mode-placeholder' : ''}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label
            htmlFor="endDate"
            style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 5,
              color: darkMode ? '#fff' : '#000',
            }}
          >
            End Date
          </label>
          <DatePicker
            selected={endDate}
            onChange={setEndDate}
            placeholderText="Select end date"
            className={darkMode ? 'bg-space-cadet text-light dark-mode-placeholder' : ''}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 250 }}>
          <label
            htmlFor="roles"
            style={{
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 5,
              color: darkMode ? '#fff' : '#000',
            }}
          >
            Roles
          </label>
          <Select
            isMulti
            options={roles}
            value={selectedRoles}
            onChange={setSelectedRoles}
            placeholder="Select roles"
            classNamePrefix={darkMode ? 'react-select-dark' : 'react-select'}
            styles={{
              control: base => ({
                ...base,
                backgroundColor: darkMode ? '#1b1f3b' : '#fff',
                color: darkMode ? '#fff' : '#000',
              }),
              menu: base => ({
                ...base,
                backgroundColor: darkMode ? '#1b1f3b' : '#fff',
                color: darkMode ? '#fff' : '#000',
              }),
              option: (base, { isFocused, isSelected }) => ({
                ...base,
                backgroundColor: isSelected
                  ? darkMode
                    ? '#4a4f74'
                    : '#d1d1d1'
                  : isFocused
                  ? darkMode
                    ? '#2c2f4a'
                    : '#eee'
                  : 'transparent',
                color: isSelected ? (darkMode ? '#fff' : '#000') : darkMode ? '#fff' : '#000',
              }),
              singleValue: base => ({
                ...base,
                color: darkMode ? '#fff' : '#000',
              }),
              multiValueLabel: base => ({
                ...base,
                color: darkMode ? 'red' : '#000',
              }),
            }}
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
      {loading && <p style={{ textAlign: 'center' }}>Loading...</p>}

      {noData && !loading && (
        <div style={{ textAlign: 'center', marginTop: 40, color: darkMode ? '#ccc' : '#777' }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: 60, height: 60, marginBottom: 10 }}
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
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="experience"
              cx="50%"
              cy="50%"
              innerRadius={isNarrow ? 40 : 0}
              outerRadius={Math.max(90, Math.min(130, Math.floor(containerWidth / 3)))}
              labelLine={!isNarrow}
              label={isNarrow ? renderInsideLabel : renderOutsideLabel}
            >
              {data.map((entry, index) => (
                <Cell key={entry.experience} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={value => [`${value}`, 'Applicants']}
              labelFormatter={() => 'Experience'}
              contentStyle={{
                backgroundColor: darkMode ? '#1b1f3b' : '#fff',
                color: darkMode ? '#fff' : '#000',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ExperienceDonutChart;
