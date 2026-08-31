import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import Select, { components } from 'react-select';
import { getAllApplicantVolunteerRatios } from '../../services/applicantVolunteerRatioService';
import styles from './ApplicantVolunteerRatio.module.css';
import 'react-datepicker/dist/react-datepicker.css';

function LimitedMultiValue(props) {
  const { index, getValue } = props;
  const hiddenValueCount = getValue().length - 2;

  if (index < 2) return <components.MultiValue {...props} />;

  if (index === 2) {
    return (
      <span className={styles.selectedCount} title={`${hiddenValueCount} more selected`}>
        + {hiddenValueCount}
      </span>
    );
  }

  return null;
}

function SelectOption(props) {
  const { children, isSelected } = props;

  return (
    <components.Option {...props}>
      <span className={styles.optionContent}>
        <span>{children}</span>
        {isSelected && (
          <span className={styles.optionCheck} aria-hidden="true">
            ✓
          </span>
        )}
      </span>
    </components.Option>
  );
}

const roleSelectComponents = { MultiValue: LimitedMultiValue, Option: SelectOption };

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
  const [viewMode, setViewMode] = useState('count');

  // Fetch all available roles
  useEffect(() => {
    const fetchAllRoles = async () => {
      try {
        const response = await getAllApplicantVolunteerRatios({});
        const apiData = response?.data ?? [];
        const uniqueRoles = [...new Set(apiData.map(item => item.role))];
        const roleOptions = uniqueRoles.map(role => ({ label: role, value: role }));
        setAllRoles(roleOptions);
        setSelectedRoles(roleOptions);
      } catch (err) {
        setError('Failed to load roles. Please try again.');
      }
    };
    fetchAllRoles();
  }, []);

  // Fetch filtered data
  useEffect(() => {
    const fetchFilteredData = async () => {
      if (startDate && endDate && startDate > endDate) {
        setValidationError('Start date must be earlier than or equal to End date.');
        setData([]);
        setLoading(false);
        return;
      }

      if (validationError) setValidationError('');

      try {
        setLoading(true);
        const filters = {};
        if (startDate) filters.startDate = startDate.toISOString().split('T')[0];
        if (endDate) filters.endDate = endDate.toISOString().split('T')[0];
        if (selectedRoles.length > 0) {
          filters.roles = selectedRoles.map(role => role.value).join(',');
        } else {
          filters.roles = ''; // fetch all roles
        }

        const response = await getAllApplicantVolunteerRatios(filters);
        const apiData = response?.data ?? [];
        const transformedData = apiData.map(item => ({
          role: item.role,
          applicants: item.totalApplicants,
          hired: item.totalHired,
        }));

        setData(transformedData);
      } catch (err) {
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchFilteredData();
  }, [startDate, endDate, selectedRoles]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const filtered = data.filter(d => selectedRoles.map(r => r.value).includes(d.role));

    if (viewMode === 'percentage') {
      return filtered.map(item => {
        const percentage =
          item.applicants > 0 ? Number(((item.hired / item.applicants) * 100).toFixed(1)) : 0;

        return {
          ...item,
          hiredPercentage: percentage,
        };
      });
    }

    return filtered;
  }, [data, selectedRoles, viewMode]);

  // Apply dark mode
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

  const legendTextColor = darkMode ? '#e0e0e0' : '#333';
  const roleSelectStyles = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        backgroundColor: darkMode ? '#243b55' : base.backgroundColor,
        borderColor: state.isFocused ? '#60a5fa' : darkMode ? '#52677d' : base.borderColor,
        boxShadow: state.isFocused ? '0 0 0 1px #60a5fa' : base.boxShadow,
        ':hover': {
          borderColor: darkMode ? '#60a5fa' : '#2684ff',
        },
      }),
      menu: base => ({
        ...base,
        backgroundColor: darkMode ? '#243b55' : base.backgroundColor,
        border: darkMode ? '1px solid #52677d' : base.border,
      }),
      menuPortal: base => ({ ...base, zIndex: 10000 }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? darkMode
            ? '#2563eb'
            : base.backgroundColor
          : state.isFocused && darkMode
          ? '#3a506b'
          : base.backgroundColor,
        color: darkMode ? '#f9fafb' : base.color,
        ':active': {
          backgroundColor: darkMode ? '#1d4ed8' : base[':active']?.backgroundColor,
        },
      }),
      multiValue: base => ({
        ...base,
        backgroundColor: darkMode ? '#3a506b' : base.backgroundColor,
      }),
      multiValueLabel: base => ({
        ...base,
        color: darkMode ? '#f9fafb' : base.color,
      }),
      multiValueRemove: base => ({
        ...base,
        color: darkMode ? '#dbeafe' : base.color,
        ':hover': {
          backgroundColor: darkMode ? '#dc2626' : '#ffbdad',
          color: '#fff',
        },
      }),
      input: base => ({ ...base, color: darkMode ? '#f9fafb' : base.color }),
      placeholder: base => ({ ...base, color: darkMode ? '#9ca3af' : base.color }),
      dropdownIndicator: base => ({ ...base, color: darkMode ? '#cbd5e1' : base.color }),
      indicatorSeparator: base => ({
        ...base,
        backgroundColor: darkMode ? '#52677d' : base.backgroundColor,
      }),
    }),
    [darkMode],
  );

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

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor="start-date" className={styles.label}>
            Date Range:
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
            Role:
          </label>
          <Select
            id="role-select"
            isMulti
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            options={allRoles}
            value={selectedRoles}
            onChange={setSelectedRoles}
            components={roleSelectComponents}
            placeholder="Select roles..."
            classNamePrefix="applicant-role-select"
            styles={roleSelectStyles}
            menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
            menuPosition="fixed"
          />
        </div>
      </div>

      {/* Toggle Buttons */}
      <div style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={() => setViewMode('count')}
          className={`${styles.toggleButton} ${
            viewMode === 'count' ? styles.toggleButtonActive : ''
          }`}
        >
          Count View
        </button>

        <button
          type="button"
          onClick={() => setViewMode('percentage')}
          className={`${styles.toggleButton} ${
            viewMode === 'percentage' ? styles.toggleButtonActive : ''
          }`}
        >
          Percentage View
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingContainer} role="status" aria-label="Loading chart data">
          <div className={styles.loadingSpinner} aria-hidden="true" />
          <span>Loading chart data...</span>
        </div>
      ) : chartData.length > 0 ? (
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 40, left: 80, bottom: 20 }}
              barCategoryGap={24}
              barSize={16}
            >
              <XAxis
                type="number"
                domain={viewMode === 'percentage' ? [0, 100] : ['auto', 'auto']}
                allowDecimals={viewMode === 'percentage'}
              />

              <YAxis
                dataKey="role"
                type="category"
                width={180}
                label={{ value: 'Role', angle: -90, position: 'insideLeft' }}
              />

              <Tooltip />

              {viewMode === 'count' ? (
                <>
                  <Bar dataKey="applicants" fill="#1976d2">
                    <LabelList dataKey="applicants" position="right" />
                  </Bar>

                  <Bar dataKey="hired" fill="#43a047">
                    <LabelList dataKey="hired" position="right" />
                  </Bar>
                </>
              ) : (
                <Bar dataKey="hiredPercentage" fill="#43a047">
                  <LabelList
                    dataKey="hiredPercentage"
                    position="right"
                    formatter={value => `${value}%`}
                  />
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>

          {/* Manual Legend */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              marginTop: '12px',
              fontWeight: 500,
            }}
          >
            {viewMode === 'count' ? (
              <>
                <span
                  style={{
                    color: legendTextColor,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span
                    style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#1976d2',
                      display: 'inline-block',
                      borderRadius: '2px',
                    }}
                  />
                  Total Applications
                </span>

                <span
                  style={{
                    color: legendTextColor,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span
                    style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#43a047',
                      display: 'inline-block',
                      borderRadius: '2px',
                    }}
                  />
                  People Hired
                </span>
              </>
            ) : (
              <span
                style={{
                  color: legendTextColor,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#43a047',
                    display: 'inline-block',
                    borderRadius: '2px',
                  }}
                />
                People Hired (%)
              </span>
            )}
          </div>

          {/* Axis Title */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '10px',
              fontWeight: 500,
            }}
          >
            {viewMode === 'percentage'
              ? 'Percentage of People Hired (%)'
              : 'Number of Applications / Hires'}
          </div>
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
