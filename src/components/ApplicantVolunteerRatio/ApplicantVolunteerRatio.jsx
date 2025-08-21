import { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { getAllApplicantVolunteerRatios } from '../../services/applicantVolunteerRatioService';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './ApplicantVolunteerRatio.module.css';

function ApplicantVolunteerRatio() {
  const [data, setData] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Fetch all available roles
  useEffect(() => {
    const fetchAllRoles = async () => {
      try {
        const response = await getAllApplicantVolunteerRatios({});
        const apiData = response.data || [];
        const uniqueRoles = [...new Set(apiData.map(item => item.role))];
        const roleOptions = uniqueRoles.map(role => ({ label: role, value: role }));
        setAllRoles(roleOptions);
        setSelectedRoles(roleOptions);
      } catch {
        setError('Failed to load roles. Please try again.');
      }
    };
    fetchAllRoles();
  }, []);

  // Fetch filtered data based on selected roles and date range
  useEffect(() => {
    const fetchFilteredData = async () => {
      if (selectedRoles.length === 0) {
        setData([]);
        return;
      }
      try {
        setLoading(true);
        const filters = {};
        if (startDate) filters.startDate = startDate.toISOString().split('T')[0];
        if (endDate) filters.endDate = endDate.toISOString().split('T')[0];
        if (selectedRoles.length > 0) filters.roles = selectedRoles.map(r => r.value).join(',');

        const response = await getAllApplicantVolunteerRatios(filters);
        const apiData = response?.data || [];
        const transformed = apiData.map(item => ({
          role: item.role,
          applicants: item.totalApplicants,
          hired: item.totalHired,
        }));
        setData(transformed);
      } catch {
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchFilteredData();
  }, [startDate, endDate, selectedRoles]);

  const chartData = useMemo(
    () => data.filter(d => selectedRoles.map(r => r.value).includes(d.role)),
    [data, selectedRoles],
  );

  if (loading) {
    return (
      <div className={styles.container}>
        <h2 className={styles.header}>Number of People Hired vs. Total Applications</h2>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h2 className={styles.header}>Number of People Hired vs. Total Applications</h2>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Number of People Hired vs. Total Applications</h2>

      <div className={styles.controls}>
        <div className={styles.dateGroup}>
          <label htmlFor="start-date" className={styles.label}>
            Date Range:
          </label>
          <DatePicker
            id="start-date"
            selected={startDate}
            onChange={date => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="Start Date"
            dateFormat="yyyy/MM/dd"
          />
          <span>to</span>
          <DatePicker
            id="end-date"
            selected={endDate}
            onChange={date => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            placeholderText="End Date"
            dateFormat="yyyy/MM/dd"
          />
        </div>

        <div className={styles.selectWrapper}>
          <label htmlFor="role-select" className={styles.label}>
            Role:
          </label>
          <Select
            id="role-select"
            isMulti
            options={allRoles}
            value={selectedRoles}
            onChange={setSelectedRoles}
            placeholder="Select roles..."
          />
        </div>
      </div>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 40, left: 80, bottom: 20 }}
            barCategoryGap={24}
          >
            <XAxis
              type="number"
              label={{
                value: 'Percentage of People Hired vs. Total Applications',
                position: 'insideBottom',
                offset: -5,
              }}
              allowDecimals={false}
            />
            <YAxis
              dataKey="role"
              type="category"
              width={180}
              label={{ value: 'Name of Role', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Bar dataKey="applicants" fill="#1976d2" name="Total Applicants">
              <LabelList dataKey="applicants" position="right" />
            </Bar>
            <Bar dataKey="hired" fill="#43a047" name="Total Hired">
              <LabelList dataKey="hired" position="right" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className={styles.noData}>
          No data available. Please add some applicant volunteer ratio data.
        </div>
      )}
    </div>
  );
}

export default ApplicantVolunteerRatio;
