import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, Label } from 'recharts';
import DatePicker from 'react-datepicker';
import styles from './HoursPledgedChart.module.css';
import Select from 'react-select';
import { fetchHoursPledged } from '../../../actions/jobAnalytics/hoursPledgedActions';
import 'react-datepicker/dist/react-datepicker.css';

function HoursPledgedChart() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const dispatch = useDispatch();

  const { loading, data: rawData, error } = useSelector(state => state.hoursPledged);
  const darkMode = useSelector(state => state.theme.darkMode);
  const token = localStorage.getItem('token');

  const roleOptions = [
    { value: 'Developer', label: 'Developer' },
    { value: 'Designer', label: 'Designer' },
    { value: 'Manager', label: 'Manager' },
    { value: 'Tester', label: 'Tester' },
  ];

  const [chartData, setChartData] = useState([]);

  const handleStartDateChange = date => {
    if (endDate && date > endDate) {
      setEndDate(date);
    }
    setStartDate(date);
  };

  const handleEndDateChange = date => {
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
      const roles = selectedRoles.map(role => role.value).join(',');
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
      filteredData = filteredData.filter(item => new Date(item.pledge_date) >= new Date(startDate));
    }
    if (endDate) {
      filteredData = filteredData.filter(item => new Date(item.pledge_date) <= new Date(endDate));
    }

    if (selectedRoles.length > 0) {
      const selectedRoleValues = selectedRoles.map(role => role.value);
      filteredData = filteredData.filter(item => selectedRoleValues.includes(item.role));
    }

    const roleMap = {};
    filteredData.forEach(item => {
      if (!roleMap[item.role]) {
        roleMap[item.role] = { role: item.role, totalHours: 0, count: 0 };
      }
      roleMap[item.role].totalHours += item.hrsPerRole;
      roleMap[item.role].count += 1;
    });

    const processedData = Object.values(roleMap).map(roleData => ({
      role: roleData.role,
      avgHours: roleData.totalHours / roleData.count,
    }));

    processedData.sort((a, b) => b.avgHours - a.avgHours);
    setChartData(processedData);
  }, [rawData, startDate, endDate, selectedRoles]);

  return (
    <div className={`${styles.hoursPledgedChart} ${darkMode ? styles.darkMode : ''}`}>
      <h2>Average Number of Hours/Week Pledged by Role</h2>

      <div className={`${styles.hpFilters}`}>
        <div className={styles.hpDateFilter}>
          <label htmlFor="start-date">Date Range:</label>
          <div className={styles.hpDateInputs}>
            <DatePicker
              id="start-date"
              selected={startDate}
              onChange={handleStartDateChange}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Start Date"
              className={styles.hpDatePicker}
            />
            <DatePicker
              id="end-date"
              selected={endDate}
              onChange={handleEndDateChange}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              placeholderText="End Date"
              className={styles.hpDatePicker}
            />
          </div>
        </div>

        <div className={styles.hpRoleFilter}>
          <label htmlFor="role-select">Roles:</label>
          <Select
            id="role-select"
            className={styles.hpRoleSelect}
            classNamePrefix="hpRoleSelect"
            isMulti
            options={roleOptions}
            onChange={setSelectedRoles}
            placeholder="Select Roles"
            styles={{
              container: base => ({
                ...base,
                width: '100%',
              }),
              control: base => ({
                ...base,
                minHeight: '42px',
                backgroundColor: darkMode ? '#334155' : '#fff',
                borderColor: darkMode ? '#475569' : '#cbd5e1',
                boxShadow: 'none',
              }),
              input: base => ({
                ...base,
                color: darkMode ? '#f8fafc' : '#111827',
              }),
              placeholder: base => ({
                ...base,
                color: darkMode ? '#cbd5e1' : '#64748b',
              }),
              menu: base => ({
                ...base,
                zIndex: 10,
                backgroundColor: darkMode ? '#1e293b' : '#fff',
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused
                  ? darkMode
                    ? '#334155'
                    : '#e2e8f0'
                  : darkMode
                  ? '#1e293b'
                  : '#fff',
                color: darkMode ? '#f8fafc' : '#111827',
              }),
              multiValue: base => ({
                ...base,
                backgroundColor: darkMode ? '#475569' : '#e2e8f0',
              }),
              multiValueLabel: base => ({
                ...base,
                color: darkMode ? '#f8fafc' : '#1e293b',
              }),
            }}
          />
        </div>
      </div>

      <div className={`${styles.hpChartContainer}`}>
        {loading && <div className={`${styles.hpSpinner}`}>Loading...</div>}
        {error && <div className={`${styles.hpErrorMessage}`}>Issue getting the data</div>}
        {!loading && !error && chartData.length === 0 && (
          <div className={`${styles.hpEmptyMessage}`}>
            No data available for the selected filters.
          </div>
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
            <XAxis type="number" dataKey="avgHours">
              <Label value="Average Hours Pledged" position="insideBottom" offset={-10} />
            </XAxis>
            <YAxis type="category" dataKey="role">
              <Label
                value="Name of Role"
                angle={-90}
                position="outsideCenter"
                offset={-20}
                dx={-50}
              />
            </YAxis>
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
