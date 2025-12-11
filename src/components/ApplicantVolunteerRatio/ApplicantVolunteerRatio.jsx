import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { getAllApplicantVolunteerRatios } from '../../services/applicantVolunteerRatioService';
import styles from './ApplicantVolunteerRatio.module.css';
import 'react-datepicker/dist/react-datepicker.css';

function ApplicantVolunteerRatio() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [data, setData] = useState([]);
  const [allRoles, setAllRoles] = useState([]); // Store all available roles
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Fetch all available roles (without filtering)
  useEffect(() => {
    const fetchAllRoles = async () => {
      try {
        const response = await getAllApplicantVolunteerRatios({});
        const apiData = response.data;

        // Get all unique roles
        const uniqueRoles = [...new Set(apiData.map(item => item.role))];
        const roleOptions = uniqueRoles.map(role => ({ label: role, value: role }));

        setAllRoles(roleOptions);

        // Set all roles as selected by default
        setSelectedRoles(roleOptions);
      } catch (err) {
        // Error fetching all roles
        setError('Failed to load roles. Please try again.');
      }
    };

    fetchAllRoles();
  }, []);

  // Fetch filtered data based on selected roles and date range
  useEffect(() => {
    const fetchFilteredData = async () => {
      // Validate date range: start must be before or equal to end
      if (startDate && endDate && startDate > endDate) {
        setValidationError('Start date must be earlier than or equal to End date.');
        setData([]);
        setLoading(false);
        return;
      }

      // clear previous validation error when dates are valid
      if (validationError) setValidationError('');

      if (selectedRoles.length === 0) {
        setData([]);
        return;
      }

      try {
        setLoading(true);

        // Prepare filters
        const filters = {};
        if (startDate) {
          filters.startDate = startDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        }
        if (endDate) {
          filters.endDate = endDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        }
        if (selectedRoles.length > 0) {
          filters.roles = selectedRoles.map(role => role.value).join(',');
        }

        const response = await getAllApplicantVolunteerRatios(filters);
        const apiData = response.data;

        // Transform API data to match chart format
        const transformedData = apiData.map(item => ({
          role: item.role,
          applicants: item.totalApplicants,
          hired: item.totalHired,
        }));

        setData(transformedData);
      } catch (err) {
        // Error fetching applicant volunteer ratio data
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredData();
  }, [startDate, endDate, selectedRoles]); // Re-fetch when date range or selected roles change

  // Filter and transform data for chart
  const chartData = useMemo(
    () => data.filter(d => selectedRoles.map(r => r.value).includes(d.role)),
    [data, selectedRoles],
  );

  // Apply dark mode to document body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode-body');
    } else {
      document.body.classList.remove('dark-mode-body');
    }

    return () => {
      document.body.classList.remove('dark-mode-body');
    };
  }, [darkMode]);

  if (loading) {
    return (
      <div className={`${styles.page} ${darkMode ? styles.dark : ''}`}>
        <h2 className={styles.heading}>Number of People Hired vs. Total Applications</h2>
        <div className={styles.statusMessage}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.page} ${darkMode ? styles.dark : ''}`}>
        <h2 className={styles.heading}>Number of People Hired vs. Total Applications</h2>
        <div className={`${styles.statusMessage} ${styles.errorMessage}`}>{error}</div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} ${darkMode ? styles.dark : ''}`}>
      <h2 className={styles.heading}>Number of People Hired vs. Total Applications</h2>
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor="start-date" className={styles.label}>
            Date Range:{' '}
          </label>
          <div className={styles.dateInputWrapper}>
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
          {validationError && (
            <div className={styles.validationError} role="alert">
              {validationError}
            </div>
          )}
        </div>
        <div className={styles.filterGroupInline}>
          <label htmlFor="role-select" className={styles.label}>
            Role:{' '}
          </label>
          <Select
            id="role-select"
            isMulti
            options={allRoles}
            value={selectedRoles}
            onChange={setSelectedRoles}
            placeholder="Select roles..."
            classNamePrefix="custom-select"
            menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
          />
        </div>
      </div>
      {chartData.length > 0 ? (
        <div className={styles.chartContainer}>
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
        </div>
      ) : (
        <div className={styles.noData}>
          No data available. Please add some applicant volunteer ratio data.
        </div>
      )}
    </div>
  );
}

export default ApplicantVolunteerRatio;
