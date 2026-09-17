import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, Tooltip, LabelList, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import Select from 'react-select';

import { getAllApplicantVolunteerRatios } from '../../services/applicantVolunteerRatioService';
import styles from './ApplicantVolunteerRatio.module.css';
import 'react-datepicker/dist/react-datepicker.css';

const ALL_ROLES_OPTION = {
  label: 'All Roles',
  value: '__all__',
};

function ApplicantVolunteerRatio() {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [data, setData] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedRoles, setSelectedRoles] = useState([ALL_ROLES_OPTION]);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [viewMode, setViewMode] = useState('count');

  const isAllRolesSelected = selectedRoles.some(role => role.value === ALL_ROLES_OPTION.value);

  /*
   * Highlight the currently hovered role row.
   *
   * Dark mode:
   * subtle light overlay
   *
   * Light mode:
   * subtle blue overlay
   */
  const hoverCursor = {
    fill: darkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(25, 118, 210, 0.08)',
  };

  /*
   * Fetch available roles.
   */
  useEffect(() => {
    const fetchAllRoles = async () => {
      try {
        const response = await getAllApplicantVolunteerRatios({});
        const apiData = response?.data ?? [];

        const uniqueRoles = [...new Set(apiData.map(item => item.role).filter(Boolean))];

        const roleOptions = uniqueRoles.map(role => ({
          label: role,
          value: role,
        }));

        setAllRoles([ALL_ROLES_OPTION, ...roleOptions]);
      } catch (err) {
        setError('Failed to load roles. Please try again.');
      }
    };

    fetchAllRoles();
  }, []);

  /*
   * Handle role selection.
   *
   * Selecting All Roles removes individual role selections.
   *
   * Selecting an individual role while All Roles is active
   * removes All Roles automatically.
   */
  const handleRoleChange = (newValue, actionMeta) => {
    const updatedRoles = newValue || [];
    const selectedOption = actionMeta?.option;

    if (selectedOption?.value === ALL_ROLES_OPTION.value) {
      setSelectedRoles([ALL_ROLES_OPTION]);
      return;
    }

    const individualRoles = updatedRoles.filter(role => role.value !== ALL_ROLES_OPTION.value);

    setSelectedRoles(individualRoles);
  };

  /*
   * Fetch filtered analytics data.
   */
  useEffect(() => {
    const fetchFilteredData = async () => {
      if (startDate && endDate && startDate > endDate) {
        setValidationError('Start date must be earlier than or equal to End date.');
        setData([]);
        setLoading(false);
        return;
      }

      setValidationError('');

      try {
        setLoading(true);
        setError(null);

        const filters = {};

        if (startDate) {
          filters.startDate = startDate.toISOString().split('T')[0];
        }

        if (endDate) {
          filters.endDate = endDate.toISOString().split('T')[0];
        }

        /*
         * An empty roles filter means all roles.
         */
        if (!isAllRolesSelected && selectedRoles.length > 0) {
          filters.roles = selectedRoles.map(role => role.value).join(',');
        } else {
          filters.roles = '';
        }

        const response = await getAllApplicantVolunteerRatios(filters);

        const apiData = response?.data ?? [];

        const transformedData = apiData.map(item => ({
          role: item.role,
          applicants: Number(item.totalApplicants) || 0,
          hired: Number(item.totalHired) || 0,
        }));

        setData(transformedData);
      } catch (err) {
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredData();
  }, [startDate, endDate, selectedRoles, isAllRolesSelected]);

  /*
   * Prepare chart data.
   */
  const chartData = useMemo(() => {
    let filteredData = data;

    /*
     * All Roles displays everything.
     *
     * Otherwise only display the individually selected roles.
     */
    if (!isAllRolesSelected) {
      const selectedRoleValues = selectedRoles.map(role => role.value);

      filteredData = data.filter(item => selectedRoleValues.includes(item.role));
    }

    /*
     * Percentage view = hires / applicants * 100.
     */
    if (viewMode === 'percentage') {
      return filteredData.map(item => {
        const hiredPercentage =
          item.applicants > 0 ? Number(((item.hired / item.applicants) * 100).toFixed(1)) : 0;

        return {
          ...item,
          hiredPercentage,
        };
      });
    }

    return filteredData;
  }, [data, selectedRoles, isAllRolesSelected, viewMode]);

  /*
   * Apply global dark mode styling.
   */
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

  /*
   * Count View tooltip.
   */
  const renderCountTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) {
      return null;
    }

    const item = payload[0]?.payload;

    if (!item) {
      return null;
    }

    return (
      <div className={styles.customTooltip}>
        <strong>{label || item.role}</strong>

        <div>Total Applications: {item.applicants}</div>

        <div>People Hired: {item.hired}</div>
      </div>
    );
  };

  /*
   * Percentage View tooltip.
   */
  const renderPercentageTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) {
      return null;
    }

    const item = payload[0]?.payload;

    if (!item) {
      return null;
    }

    return (
      <div className={styles.customTooltip}>
        <strong>{item.role}</strong>

        <div>Total Applications: {item.applicants}</div>

        <div>People Hired: {item.hired}</div>

        <div>Hire Rate: {item.hiredPercentage}%</div>
      </div>
    );
  };

  /*
   * Loading state.
   */
  if (loading) {
    return (
      <div className={`${styles.page} ${darkMode ? styles.dark : ''}`}>
        <h2 className={styles.heading}>Number of People Hired vs. Total Applications</h2>

        <div className={styles.statusMessage}>Loading...</div>
      </div>
    );
  }

  /*
   * Error state.
   */
  if (error) {
    return (
      <div className={`${styles.page} ${darkMode ? styles.dark : ''}`}>
        <h2 className={styles.heading}>Number of People Hired vs. Total Applications</h2>

        <div className={`${styles.statusMessage} ${styles.errorMessage}`} role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.page} ${darkMode ? styles.dark : ''}`}>
      <h2 className={styles.heading}>Number of People Hired vs. Total Applications</h2>

      {/* =========================
          Filters
      ========================== */}

      <div className={styles.filters}>
        {/* Date Range */}

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
              maxDate={endDate || undefined}
              placeholderText="Start Date"
              dateFormat="MM/dd/yyyy"
            />

            <span className={styles.dateSeparator}>to</span>

            <DatePicker
              id="end-date"
              selected={endDate}
              onChange={date => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="End Date"
              dateFormat="MM/dd/yyyy"
            />
          </div>

          {validationError && (
            <div className={styles.validationError} role="alert">
              {validationError}
            </div>
          )}
        </div>

        {/* Role Selector */}

        <div className={styles.filterGroupInline}>
          <label htmlFor="role-select" className={styles.label}>
            Role:
          </label>

          <Select
            inputId="role-select"
            isMulti
            options={allRoles}
            value={selectedRoles}
            onChange={handleRoleChange}
            placeholder="Select roles..."
            classNamePrefix="custom-select"
            closeMenuOnSelect={false}
            hideSelectedOptions={false}
            menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
          />
        </div>
      </div>

      {/* =========================
          Chart Controls
      ========================== */}

      <div className={styles.chartControls}>
        {/* Count / Percentage Toggle */}

        <div className={styles.viewToggle} role="group" aria-label="Chart display mode">
          <button
            type="button"
            onClick={() => setViewMode('count')}
            className={`${styles.toggleButton} ${
              viewMode === 'count' ? styles.toggleButtonActive : ''
            }`}
            aria-pressed={viewMode === 'count'}
          >
            Count
          </button>

          <button
            type="button"
            onClick={() => setViewMode('percentage')}
            className={`${styles.toggleButton} ${
              viewMode === 'percentage' ? styles.toggleButtonActive : ''
            }`}
            aria-pressed={viewMode === 'percentage'}
          >
            Percentage
          </button>
        </div>

        {/* Legend */}

        <div className={styles.legend}>
          {viewMode === 'count' ? (
            <>
              <span className={styles.legendItem}>
                <span
                  className={`${styles.legendMarker} ${styles.applicationMarker}`}
                  aria-hidden="true"
                />
                Total Applications
              </span>

              <span className={styles.legendItem}>
                <span
                  className={`${styles.legendMarker} ${styles.hiredMarker}`}
                  aria-hidden="true"
                />
                People Hired
              </span>
            </>
          ) : (
            <span className={styles.legendItem}>
              <span className={`${styles.legendMarker} ${styles.hiredMarker}`} aria-hidden="true" />
              Hire Rate
            </span>
          )}
        </div>
      </div>

      {/* =========================
          Chart
      ========================== */}

      {chartData.length > 0 ? (
        <div className={styles.chartContainer}>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{
                  top: 8,
                  right: 55,
                  left: 70,
                  bottom: 10,
                }}
                barCategoryGap={20}
                barSize={16}
              >
                <XAxis
                  type="number"
                  domain={viewMode === 'percentage' ? [0, 100] : [0, 'auto']}
                  allowDecimals={viewMode === 'percentage'}
                  tickFormatter={viewMode === 'percentage' ? value => `${value}%` : undefined}
                />

                <YAxis
                  dataKey="role"
                  type="category"
                  width={180}
                  label={{
                    value: 'Role',
                    angle: -90,
                    position: 'insideLeft',
                  }}
                />

                {/* 
                  The cursor highlights the entire
                  hovered role/category.

                  Light mode:
                  subtle blue background.

                  Dark mode:
                  subtle light overlay.
                */}

                {viewMode === 'percentage' ? (
                  <Tooltip content={renderPercentageTooltip} cursor={hoverCursor} />
                ) : (
                  <Tooltip content={renderCountTooltip} cursor={hoverCursor} />
                )}

                {viewMode === 'count' ? (
                  <>
                    <Bar dataKey="applicants" fill="#1976d2" name="Total Applications">
                      <LabelList dataKey="applicants" position="right" />
                    </Bar>

                    <Bar dataKey="hired" fill="#43a047" name="People Hired">
                      <LabelList dataKey="hired" position="right" />
                    </Bar>
                  </>
                ) : (
                  <Bar dataKey="hiredPercentage" fill="#43a047" name="Hire Rate">
                    <LabelList
                      dataKey="hiredPercentage"
                      position="right"
                      formatter={value => `${value}%`}
                    />
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>

            {/* X Axis Title */}

            <div className={styles.axisTitle}>
              {viewMode === 'percentage' ? 'Hire Rate (%)' : 'Number of Applications and Hires'}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.noData}>
          <p className={styles.noDataTitle}>No data available</p>

          <p className={styles.noDataText}>
            {selectedRoles.length === 0
              ? 'Select at least one role or choose All Roles to view hiring data.'
              : 'No application or hiring data is available for the selected roles and date range.'}
          </p>
        </div>
      )}
    </div>
  );
}

export default ApplicantVolunteerRatio;
