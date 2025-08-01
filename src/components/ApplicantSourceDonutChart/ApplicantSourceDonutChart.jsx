import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, Label, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import 'react-datepicker/dist/react-datepicker.css';
import './ApplicantSourceDonutChart.css';

const COLORS = ['#FF4D4F', '#FFC107', '#1890FF', '#00C49F', '#8884D8'];
const toDateOnlyString = date => (date ? date.toISOString().split('T')[0] : null);

const ApplicantSourceDonutChart = () => {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [comparisonText, setComparisonText] = useState('');
  const [comparisonType, setComparisonType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDataWithFilters = async ({
    startDate: filterStartDate,
    endDate: filterEndDate,
    roles: filterRoles,
    comparisonType: filterComparisonType,
  }) => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');

      const url = 'http://localhost:4500/api/analytics/applicant-sources';
      const params = {};

      if (filterStartDate) params.startDate = toDateOnlyString(filterStartDate);
      if (filterEndDate) params.endDate = toDateOnlyString(filterEndDate);
      if (filterRoles?.length > 0) {
        const roleValues = filterRoles.map(r => (typeof r === 'object' ? r.value : r));
        params.roles = roleValues.join(',');
      }
      if (filterComparisonType && filterComparisonType !== '') {
        params.comparisonType = filterComparisonType;
      }

      const response = await axios.get(url, {
        headers: { Authorization: token },
        params,
      });

      const result = response.data;
      setData(result.sources || []);
      setComparisonText(result.comparisonText || '');
      console.log('Comparison Text from backend:', result.comparisonText);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || err.message || 'Error fetching data.');
      setData([]);
      setComparisonText('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataWithFilters({ startDate: null, endDate: null, roles: [], comparisonType: '' });
  }, []);

  const handleStartDateChange = date => {
    setStartDate(date);
    if (comparisonType === '') {
      fetchDataWithFilters({ startDate: date, endDate, roles: selectedRoles, comparisonType });
    }
  };

  const handleEndDateChange = date => {
    setEndDate(date);
    if (comparisonType === '') {
      fetchDataWithFilters({ startDate, endDate: date, roles: selectedRoles, comparisonType });
    }
  };

  const handleRoleChange = roles => {
    setSelectedRoles(roles);
    fetchDataWithFilters({ startDate, endDate, roles, comparisonType });
  };

  const handleComparisonTypeChange = option => {
    const newComparisonType = option ? option.value : '';
    setComparisonType(newComparisonType);

    if (newComparisonType !== '') {
      const today = new Date();
      const pastDate = new Date(today);

      if (newComparisonType === 'week') {
        pastDate.setDate(today.getDate() - 7);
      } else if (newComparisonType === 'month') {
        pastDate.setMonth(today.getMonth() - 1);
      } else if (newComparisonType === 'year') {
        pastDate.setFullYear(today.getFullYear() - 1);
      }

      fetchDataWithFilters({
        startDate: pastDate,
        endDate: today,
        roles: selectedRoles,
        comparisonType: newComparisonType,
      });
    } else {
      fetchDataWithFilters({
        startDate,
        endDate,
        roles: selectedRoles,
        comparisonType: '',
      });
    }
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const renderCenterText = ({ viewBox }) => {
    const { cx, cy } = viewBox;
    return (
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={16}
        fontWeight="bold"
        fill="#333"
      >
        {comparisonText}
      </text>
    );
  };

  return (
    <div className="applicant-chart-container">
      <h2 style={{ textAlign: 'center', color: '#3977FF' }}>Source of Applicants</h2>

      {/* Filters */}
      <div className="filter-row">
        {comparisonType === '' && (
          <>
            <div className="filter-input">
              <DatePicker
                selected={startDate}
                onChange={handleStartDateChange}
                placeholderText="Start Date"
                className="filter-date"
              />
            </div>
            <div className="filter-input">
              <DatePicker
                selected={endDate}
                onChange={handleEndDateChange}
                placeholderText="End Date"
                className="filter-date"
                minDate={startDate}
              />
            </div>
          </>
        )}
        <div className="filter-input">
          <Select
            isMulti
            value={selectedRoles}
            onChange={handleRoleChange}
            options={[
              'Project Manager',
              'Frontend Developer',
              'Backend Developer',
              'Full Stack Developer',
              'DevOps Engineer',
              'API Engineer',
              'QA Engineer',
              'Test Analyst',
              'Support Engineer',
              'Tech Lead',
              'Architect',
              'Junior Developer',
              'Intern',
            ].map(label => ({ label, value: label }))}
            placeholder="Select Roles"
          />
        </div>
        <div className="filter-input">
          <Select
            options={[
              { label: 'This same week last year', value: 'week' },
              { label: 'This same month last year', value: 'month' },
              { label: 'This same year', value: 'year' },
              { label: 'Custom Dates (no comparison)', value: '' },
            ]}
            value={
              comparisonType
                ? [
                    { label: 'This same week last year', value: 'week' },
                    { label: 'This same month last year', value: 'month' },
                    { label: 'This same year', value: 'year' },
                    { label: 'Custom Dates (no comparison)', value: '' },
                  ].find(opt => opt.value === comparisonType)
                : null
            }
            onChange={handleComparisonTypeChange}
            placeholder="Comparison Type"
          />
        </div>
      </div>

      {/* Chart */}
      <div className="chart-wrapper">
        {loading && <p style={{ textAlign: 'center' }}>Loading data...</p>}
        {!loading && error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}
        {!loading && !error && data.length === 0 && (
          <p style={{ textAlign: 'center' }}>No data available for selected filters.</p>
        )}
        {!loading && !error && data.length > 0 && (
          <ResponsiveContainer width="100%" height={500}>
            <PieChart margin={{ top: 40, right: 40, left: 40, bottom: 40 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={100}
                outerRadius={160}
                dataKey="value"
                label={({ name, value }) =>
                  `${name}: ${((value / total) * 100).toFixed(1)}% (${value})`
                }
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                {comparisonText && <Label content={renderCenterText} />}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default ApplicantSourceDonutChart;
