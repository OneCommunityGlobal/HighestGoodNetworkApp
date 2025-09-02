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
import { useSelector } from 'react-redux';

const MonthsPledgedChart = () => {
  const darkMode = useSelector(state => state.theme.darkMode); // true or false
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
        setData([]);
      }
    } catch (error) {
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

  // Colors based on theme
  const bgColor = darkMode ? '#1e1e2f' : 'white';
  const textColor = darkMode ? 'white' : 'black';
  const gridColor = darkMode ? '#444' : '#e0e0e0';
  const tooltipBg = darkMode ? '#2a2a3b' : 'white';
  const tooltipText = darkMode ? 'white' : 'black';
  const barColor = '#FFD700'; // keep same for light/dark

  return (
    <div
      style={{
        backgroundColor: bgColor,
        padding: '24px',
        borderRadius: '8px',
        boxShadow: darkMode ? '0 2px 10px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.1)',
        margin: '20px',
      }}
    >
      <h2
        style={{
          color: textColor,
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
          <label htmlFor="startDate" style={{ color: textColor, fontWeight: '500' }}>
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
              className={`date-picker ${darkMode ? 'dark' : ''}`}
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
              className={`date-picker ${darkMode ? 'dark' : ''}`}
            />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '300px' }}>
          <label htmlFor="filterRoles" style={{ color: textColor, fontWeight: '500' }}>
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
                backgroundColor: darkMode ? '#2a2a3b' : '#FFF8DC',
                color: textColor,
              }),
              singleValue: base => ({ ...base, color: textColor }),
              multiValue: base => ({
                ...base,
                backgroundColor: darkMode ? '#444' : '#DAA520',
              }),
              multiValueLabel: base => ({ ...base, color: darkMode ? 'white' : 'white' }),
            }}
          />
        </div>

        <button
          onClick={resetFilters}
          style={{
            alignSelf: 'flex-end',
            padding: '8px 16px',
            backgroundColor: darkMode ? '#2a2a3b' : '#f5f5f5',
            border: `1px solid ${darkMode ? '#444' : '#ddd'}`,
            borderRadius: '4px',
            cursor: 'pointer',
            color: textColor,
          }}
        >
          Reset Filters
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: textColor }}>
          Loading data...
        </div>
      ) : data.length > 0 ? (
        <div style={{ height: '500px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 20, right: 30, left: 150, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                type="number"
                domain={[0, maxValue * 1.1]}
                stroke={textColor} // axis line
                tick={props => {
                  const { x, y, payload } = props;
                  return (
                    <text
                      x={x}
                      y={y + 5} // adjust vertical alignment
                      textAnchor="middle"
                      fill={textColor}
                      fontWeight="500"
                      fontSize="12"
                    >
                      {payload.value}
                    </text>
                  );
                }}
                label={{
                  value: 'Average Months Pledged',
                  position: 'bottom',
                  offset: 0,
                  fill: textColor,
                  fontSize: 14,
                  fontWeight: '500',
                }}
              />

              <YAxis
                dataKey="role"
                type="category"
                stroke={textColor} // axis line
                width={150}
                tick={props => {
                  const { x, y, payload } = props;
                  return (
                    <text
                      x={x - 10} // shift left a bit
                      y={y + 5} // adjust vertical alignment
                      textAnchor="end"
                      fill={textColor}
                      fontWeight="500"
                      fontSize="12"
                    >
                      {payload.value}
                    </text>
                  );
                }}
                label={{
                  value: 'Roles',
                  angle: -90,
                  position: 'left',
                  fill: textColor,
                  fontSize: 14,
                  fontWeight: '500',
                }}
              />

              <Tooltip
                content={({ payload, label, active }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div
                        style={{
                          backgroundColor: tooltipBg,
                          border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
                          padding: '8px 12px',
                          borderRadius: '4px',
                          color: tooltipText,
                          minWidth: '120px',
                        }}
                      >
                        <div style={{ fontWeight: '600', color: tooltipText }}>Role: {label}</div>
                        <div style={{ color: tooltipText }}>Average: {payload[0].value} months</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Bar dataKey="avgMonthsPledged" fill={barColor} barSize={30} radius={[0, 4, 4, 0]}>
                <LabelList
                  dataKey="avgMonthsPledged"
                  position="right"
                  formatter={value => `${value.toFixed(1)}`}
                  fill={textColor} // bar labels color
                  style={{ fontWeight: '500' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: textColor }}>
          No data available for selected filters
        </div>
      )}
    </div>
  );
};

export default MonthsPledgedChart;
