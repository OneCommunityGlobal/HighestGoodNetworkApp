import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { getAllApplicantVolunteerRatios } from '../../services/applicantVolunteerRatioService';
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
        // eslint-disable-next-line no-console
        console.error('Error fetching all roles:', err);
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
        // eslint-disable-next-line no-console
        console.error('Error fetching applicant volunteer ratio data:', err);
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

  // Inline styles for react-select to guarantee contrast in dark mode (overrides other CSS)
  const selectStyles = useMemo(() => {
    if (!darkMode) return undefined;

    return {
      control: provided => ({
        ...provided,
        backgroundColor: '#0b2434',
        borderColor: '#2b4a6b',
        boxShadow: 'none',
        color: '#ffffff',
      }),
      valueContainer: provided => ({ ...provided, color: '#ffffff' }),
      singleValue: provided => ({ ...provided, color: '#ffffff' }),
      placeholder: provided => ({ ...provided, color: 'rgba(224,224,224,0.9)' }),
      menu: provided => ({ ...provided, backgroundColor: '#0b2434', color: '#ffffff' }),
      menuPortal: provided => ({ ...provided, zIndex: 9999 }),
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected
          ? 'rgba(67,160,71,0.22)'
          : state.isFocused
          ? 'rgba(255,255,255,0.06)'
          : 'transparent',
        color: '#ffffff',
      }),
      multiValue: provided => ({
        ...provided,
        backgroundColor: 'rgba(255,255,255,0.06)',
        color: '#ffffff',
      }),
      multiValueLabel: provided => ({ ...provided, color: '#ffffff' }),
      dropdownIndicator: provided => ({ ...provided, color: '#ffffff' }),
      indicatorSeparator: provided => ({ ...provided, backgroundColor: 'rgba(255,255,255,0.06)' }),
    };
  }, [darkMode]);

  // Apply dark mode to document body and inject page-specific dark styles
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode-body');
    } else {
      document.body.classList.remove('dark-mode-body');
    }

    if (!document.getElementById('applicant-volunteer-dark-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'applicant-volunteer-dark-styles';
      styleElement.innerHTML = `
        /* Page-level dark background to cover gutters and root */
        .dark-mode-body, .dark-mode-body body, .dark-mode-body #root, .dark-mode-body .App {
          background-color: #1B2A41 !important;
          color: #e0e0e0 !important;
        }
        /* Common layout wrappers that might enforce white background */
        .dark-mode-body .header-wrapper,
        .dark-mode-body .content-wrapper,
        .dark-mode-body .page,
        .dark-mode-body .container,
        .dark-mode-body .container-fluid {
          background-color: #1B2A41 !important;
          color: #e0e0e0 !important;
        }
        .dark-mode-body .applicant-volunteer-page {
          background-color: #1B2A41 !important;
          color: #e0e0e0 !important;
        }
        .dark-mode-body .applicant-volunteer-content {
          background-color: #1B2A41 !important;
          color: #e0e0e0 !important;
        }
        .dark-mode-body .recharts-wrapper,
        .dark-mode-body .recharts-surface {
          background-color: #1B2A41 !important;
        }
      `;
      document.head.appendChild(styleElement);
    }

    return () => {
      document.body.classList.remove('dark-mode-body');
    };
  }, [darkMode]);

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
        <h2>Number of People Hired vs. Total Applications</h2>
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
        <h2>Number of People Hired vs. Total Applications</h2>
        <div style={{ color: 'red' }}>{error}</div>
      </div>
    );
  }

  const darkModeStyles = darkMode
    ? {
        backgroundColor: '#1B2A41',
        color: '#e0e0e0',
      }
    : {};

  return (
    <div
      className={`applicant-volunteer-page ${darkMode ? 'dark-mode' : ''}`}
      style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}
    >
      <div className="applicant-volunteer-content" style={darkMode ? darkModeStyles : {}}>
        <h2 className={darkMode ? 'text-light' : ''}>
          Number of People Hired vs. Total Applications
        </h2>
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div>
            <label
              htmlFor="start-date"
              style={{ fontWeight: 500 }}
              className={darkMode ? 'text-light' : ''}
            >
              Date Range:{' '}
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
              style={{ marginRight: 8 }}
            />
            <span> to </span>
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
            {validationError && (
              <div style={{ color: '#ffcc00', marginTop: 8, fontWeight: 'bold' }} role="alert">
                {validationError}
              </div>
            )}
          </div>
          <div style={{ minWidth: 220 }}>
            <label
              htmlFor="role-select"
              style={{ fontWeight: 500 }}
              className={darkMode ? 'text-light' : ''}
            >
              Role:{' '}
            </label>
            <Select
              id="role-select"
              isMulti
              options={allRoles} // Use allRoles for the dropdown
              value={selectedRoles}
              onChange={setSelectedRoles}
              placeholder="Select roles..."
              className={darkMode ? 'dark-select' : ''}
              classNamePrefix="custom-select"
              styles={selectStyles}
              menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
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
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            No data available. Please add some applicant volunteer ratio data.
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicantVolunteerRatio;
