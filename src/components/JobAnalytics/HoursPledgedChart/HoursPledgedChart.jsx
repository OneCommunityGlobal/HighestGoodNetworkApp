import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from 'recharts';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { fetchHoursPledged } from '../../../actions/jobAnalytics/hoursPledgedActions';
import 'react-datepicker/dist/react-datepicker.css';
import './HoursPledgedChart.css';

function HoursPledgedChart() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const dispatch = useDispatch();

  const { loading, data: rawData, error } = useSelector(state => state.hoursPledged);
  const darkMode = useSelector((state) => state.theme.darkMode);
  const token = localStorage.getItem('token');

  const roleOptions = [
    { value: 'Developer', label: 'Developer' },
    { value: 'Designer', label: 'Designer' },
    { value: 'Manager', label: 'Manager' },
    { value: 'Tester', label: 'Tester' },
  ];

  const [chartData, setChartData] = useState([]);

  const handleStartDateChange = (date) => {
    if (endDate && date > endDate) {
      setEndDate(date);
    }
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    if (startDate && date < startDate) {
      setStartDate(date); 
    }
    setEndDate(date);
  };

  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate.toISOString());
    if (endDate) queryParams.append('endDate', endDate.toISOString());
    if (selectedRoles.length > 0) {
      const roles = selectedRoles.map((role) => role.value).join(',');
      queryParams.append('roles', roles);
    }
    dispatch(fetchHoursPledged(queryParams.toString(), token));
  }, [startDate, endDate, selectedRoles, dispatch, token]);

  useEffect(() => {
    if (!rawData || rawData.length === 0) {
      setChartData([]);
      return;
    }

    let filteredData = rawData;
    if (startDate) {
      filteredData = filteredData.filter(
        (item) => new Date(item.pledge_date) >= new Date(startDate)
      );
    }
    if (endDate) {
      filteredData = filteredData.filter(
        (item) => new Date(item.pledge_date) <= new Date(endDate)
      );
    }

    if (selectedRoles.length > 0) {
      const selectedRoleValues = selectedRoles.map((role) => role.value);
      filteredData = filteredData.filter((item) => selectedRoleValues.includes(item.role));
    }

    const roleMap = {};
    filteredData.forEach((item) => {
      if (!roleMap[item.role]) {
        roleMap[item.role] = { role: item.role, totalHours: 0, count: 0 };
      }
      roleMap[item.role].totalHours += item.hrsPerRole;
      roleMap[item.role].count += 1;
    });

    const processedData = Object.values(roleMap).map((roleData) => ({
      role: roleData.role,
      avgHours: roleData.totalHours / roleData.count,
    }));

    processedData.sort((a, b) => b.avgHours - a.avgHours);
    setChartData(processedData);
  }, [rawData, startDate, endDate, selectedRoles]);

  return (
    <div className={`hours-pledged-chart ${darkMode ? 'dark-mode' : ''}`}>
      <h2>Average Number of Hours/Week Pledged by Role</h2>

      <div className="hp-filters">
        <div className="hp-date-filter">
          <label htmlFor="start-date">Date Range:</label>
          <DatePicker
            id="start-date"
            selected={startDate}
            onChange={handleStartDateChange}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="Start Date"
          />
          <DatePicker
            id="end-date"
            selected={endDate}
            onChange={handleEndDateChange}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            placeholderText="End Date"
          />
        </div>

        <div className="hp-role-filter">
          <label htmlFor="role-select">Roles:</label>
          <Select
            id="role-select"
            isMulti
            options={roleOptions}
            onChange={setSelectedRoles}
            placeholder="Select Roles"
          />
        </div>
      </div>

      <div className="hp-chart-container">
        {loading && <div className="hp-spinner">Loading...</div>}
        {error && <div className="hp-error-message">{error}</div>}
        {!loading && !error && chartData.length === 0 && (
          <div className="empty-message">No data available for the selected filters.</div>
        )}
        {!loading && !error && chartData.length > 0 && (
          <BarChart
            width={600}
            height={400}
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="avgHours" />
            <YAxis type="category" dataKey="role" />
            <Tooltip />
            <Bar dataKey="avgHours" fill={darkMode ? '#225163' : '#8884d8'}>
              <LabelList dataKey="avgHours" position="right" />
            </Bar>
          </BarChart>
        )}
      </div>
    </div>
  );
}

export default HoursPledgedChart;