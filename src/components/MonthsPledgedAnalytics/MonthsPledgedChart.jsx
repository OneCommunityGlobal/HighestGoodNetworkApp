import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import './MonthsPledgedChart.css';
import { ENDPOINTS } from '../../utils/URL';
import httpService from '../../services/httpService';

const MonthsPledgedChart = () => {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allRoles, setAllRoles] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = ENDPOINTS.MONTHS_PLEDGED(
        startDate?.toISOString().split('T')[0],
        endDate?.toISOString().split('T')[0],
        selectedRoles.map(r => r.value),
      );

      const response = await httpService.get(url);
      const result = response.data;

      if (Array.isArray(result)) {
        const sortedData = [...result].sort((a, b) => b.avgMonthsPledged - a.avgMonthsPledged);
        setData(sortedData);

        if (allRoles.length === 0) {
          const roles = [...new Set(result.map(item => item.role))];
          setAllRoles(roles.map(role => ({ value: role, label: role })));
        }
      } else {
        // console.error('Expected array but got:', result);
        setData([]);
      }
    } catch (error) {
      // console.error('Error fetching data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, selectedRoles]);

  const resetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedRoles([]);
  };

  const maxValue = Math.max(...data.map(item => item.avgMonthsPledged), 10);

  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        margin: '20px',
      }}
    >
      <h2
        style={{
          color: 'black',
          marginBottom: '24px',
          fontSize: '20px',
          fontWeight: '600',
          textAlign: 'center',
        }}
      >
        Average Number of Months Pledged by Role
      </h2>

      <div
        style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: '300px' }}>
          <label htmlFor="startDate" style={{ color: 'black', fontWeight: '500' }}>
            Date Range
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <DatePicker
              id="startDate"
              selected={startDate}
              onChange={date => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Start Date"
              dateFormat="yyyy-MM-dd"
              isClearable
              className="date-picker"
            />
            <label
              htmlFor="endDate"
              style={{
                position: 'absolute',
                width: 1,
                height: 1,
                padding: 0,
                overflow: 'hidden',
                clip: 'rect(0,0,0,0)',
                whiteSpace: 'nowrap',
                border: 0,
              }}
            >
              End Date
            </label>
            <DatePicker
              id="endDate"
              selected={endDate}
              onChange={date => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="End Date"
              dateFormat="yyyy-MM-dd"
              isClearable
              className="date-picker"
            />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }}>
          <label htmlFor="filterRoles" style={{ color: 'black', fontWeight: '500' }}>
            Filter Roles
          </label>
          <Select
            inputId="filterRoles"
            isMulti
            options={allRoles}
            value={selectedRoles}
            onChange={setSelectedRoles}
            placeholder="All Roles"
            styles={{
              control: base => ({
                ...base,
                border: '1px solid #ddd',
                minHeight: '38px',
              }),
            }}
          />
        </div>

        <button
          onClick={resetFilters}
          style={{
            alignSelf: 'flex-end',
            padding: '8px 16px',
            backgroundColor: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            color: 'black',
          }}
        >
          Reset Filters
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'black' }}>Loading data...</div>
      ) : data.length > 0 ? (
        <div style={{ height: '500px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 20, right: 30, left: 150, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                type="number"
                domain={[0, maxValue * 1.1]}
                stroke="black"
                tick={{ fill: 'black' }}
                label={{
                  value: 'Average Months Pledged',
                  position: 'bottom',
                  offset: 0,
                  fill: 'black',
                  fontSize: 14,
                  fontWeight: '500',
                }}
              />
              <YAxis
                dataKey="role"
                type="category"
                stroke="black"
                tick={{ fill: 'black' }}
                width={150}
                label={{
                  value: 'Roles',
                  angle: -90,
                  position: 'left',
                  fill: 'black',
                  fontSize: 14,
                  fontWeight: '500',
                }}
              />
              <Tooltip
                formatter={value => [`${value} months`, 'Average']}
                labelFormatter={label => `Role: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  color: 'black',
                  borderRadius: '4px',
                }}
              />
              <Bar dataKey="avgMonthsPledged" fill="#FFD700" barSize={30} radius={[0, 4, 4, 0]}>
                <LabelList
                  dataKey="avgMonthsPledged"
                  position="right"
                  formatter={value => `${value.toFixed(1)}`}
                  fill="black"
                  style={{ fontWeight: '500' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: 'black' }}>
          No data available for selected filters
        </div>
      )}
    </div>
  );
};

export default MonthsPledgedChart;
