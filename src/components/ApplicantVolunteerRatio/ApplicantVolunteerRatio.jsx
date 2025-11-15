import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { getAllApplicantVolunteerRatios } from '../../services/applicantVolunteerRatioService';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './ApplicantVolunteerRatio.module.css';

function ApplicantVolunteerRatio() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [data, setData] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    const fetchAllRoles = async () => {
      try {
        const response = await getAllApplicantVolunteerRatios({});
        const apiData = response.data || [];
        const uniqueRoles = [...new Set(apiData.map(item => item.role))];
        const roleOptions = uniqueRoles.map(role => ({ label: role, value: role }));
        setAllRoles(roleOptions);
        setSelectedRoles(roleOptions);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching all roles:', err);
        setError('Failed to load roles. Please try again.');
      }
    };

    fetchAllRoles();
  }, []);

  useEffect(() => {
    const fetchFilteredData = async () => {
      if (startDate && endDate && startDate > endDate) {
        setValidationError('Start date cannot be greater than end date.');
        setData([]);
        setLoading(false);
        return;
      }

      if (validationError) setValidationError('');

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
  }, [startDate, endDate, selectedRoles, validationError]);

  const chartData = useMemo(
    () => data.filter(d => selectedRoles.map(r => r.value).includes(d.role)),
    [data, selectedRoles],
  );

  const handleStartDateChange = date => {
    setStartDate(date);
    if (endDate && date && date > endDate) {
      setValidationError('Start date cannot be greater than end date.');
    } else {
      setValidationError('');
    }
  };

  const handleEndDateChange = date => {
    setEndDate(date);
    if (startDate && date && startDate > date) {
      setValidationError('Start date cannot be greater than end date.');
    } else {
      setValidationError('');
    }
  };

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
        .dark-mode-body,
        .dark-mode-body body,
        .dark-mode-body #root,
        .dark-mode-body .App {
          background-color: #1B2A41 !important;
          color: #e0e0e0 !important;
        }
        .dark-mode-body .header-wrapper,
        .dark-mode-body .content-wrapper,
        .dark-mode-body .page,
        .dark-mode-body .container,
        .dark-mode-body .container-fluid {
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

  const containerClass = `${styles.container} ${darkMode ? styles.containerDark : ''}`;
  const headerClass = `${styles.header} ${darkMode ? styles.headerDark : ''}`;

  if (loading) {
    return (
      <div className={containerClass}>
        <h2 className={headerClass}>Number of People Hired vs. Total Applications</h2>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClass}>
        <h2 className={headerClass}>Number of People Hired vs. Total Applications</h2>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <h2 className={headerClass}>Number of People Hired vs. Total Applications</h2>

      <div className={styles.controls}>
        <div className={styles.dateGroup}>
          <label
            htmlFor="start-date"
            className={`${styles.label} ${darkMode ? styles.labelDark : ''}`}
          >
            Date Range:
          </label>
          <DatePicker
            id="start-date"
            selected={startDate}
            onChange={handleStartDateChange}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            placeholderText="Start Date"
            dateFormat="yyyy/MM/dd"
            className={`${styles.dateInput} ${darkMode ? styles.dateInputDark : ''}`}
          />
          <span className={darkMode ? styles.labelDark : ''}>to</span>
          <DatePicker
            id="end-date"
            selected={endDate}
            onChange={handleEndDateChange}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            placeholderText="End Date"
            dateFormat="yyyy/MM/dd"
            className={`${styles.dateInput} ${darkMode ? styles.dateInputDark : ''}`}
          />
          {validationError && (
            <div className={styles.validationError} role="alert">
              {validationError}
            </div>
          )}
        </div>

        <div className={styles.selectWrapper}>
          <label
            htmlFor="role-select"
            className={`${styles.label} ${darkMode ? styles.labelDark : ''}`}
          >
            Role:
          </label>
          <Select
            id="role-select"
            isMulti
            options={allRoles}
            value={selectedRoles}
            onChange={setSelectedRoles}
            placeholder="Select roles..."
            className={styles.select}
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
        <div className={styles.noData}>
          No data available. Please add some applicant volunteer ratio data.
        </div>
      )}
    </div>
  );
}

export default ApplicantVolunteerRatio;
