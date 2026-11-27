import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import Select, { components } from 'react-select';
import { ENDPOINTS } from '../../utils/URL';
import httpService from '../../services/httpService';
import styles from './ApplicationTimeChart.module.css';

const DATE_FILTER_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'Weekly', label: 'Last 7 Days' },
  { value: 'Monthly', label: 'Last 30 Days' },
  { value: 'Yearly', label: 'Last Year' },
];

function getStartDate(selectedValue, now = new Date()) {
  const DAY_IN_MS = 24 * 60 * 60 * 1000;
  switch (selectedValue) {
    case 'Weekly':
      return new Date(now.getTime() - 7 * DAY_IN_MS).toISOString();
    case 'Monthly':
      return new Date(now.getTime() - 30 * DAY_IN_MS).toISOString();
    case 'Yearly':
      return new Date(now.getTime() - 365 * DAY_IN_MS).toISOString();
    default:
      return null;
  }
}

function ApplicationTimeChart() {
  const [selectedDate, setSelectedDate] = useState({ label: 'All', value: 'All' });
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [data, setData] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get dark mode state from Redux
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  const handleDateChange = selectedOption => {
    if (selectedOption) setSelectedDate(selectedOption);
  };

  const handleRoleChange = selectedOptions => {
    setSelectedRoles(selectedOptions || []);
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await httpService.get(ENDPOINTS.APPLICATION_TIME_DATA_ROLES);

        const options = response.data.data
          .sort((a, b) => a.localeCompare(b))
          .map(role => ({ label: role, value: role }));

        setAvailableRoles(options);
        setError(null);
      } catch (error) {
        setError('Failed to fetch roles');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    const fetchApplicationTimes = async () => {
      try {
        const roles = selectedRoles.length > 0 ? selectedRoles.map(role => role.value) : [];

        const startDate = getStartDate(selectedDate.value);
        const url = ENDPOINTS.APPLICATION_TIME_DATA(startDate, roles);
        const response = await httpService.get(url);
        setData(response.data.data || []);
        setError(null);
      } catch (error) {
        setError('Failed to fetch application times data');
      } finally {
        setInitialLoading(false);
      }
    };

    // Run only after roles have loaded
    if (availableRoles.length > 0) {
      fetchApplicationTimes();
    }
  }, [selectedRoles, selectedDate, availableRoles]);

  const processedData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    const selectedRoleValues = selectedRoles.map(r => r.value);
    const rows =
      selectedRoleValues.length === 0
        ? data
        : data.filter(item => item && selectedRoleValues.includes(item.role));

    // Group data by role
    const grouped = new Map();
    for (const item of rows) {
      const role = item.role;
      const minutes = item.timeTaken / 60;
      const existing = grouped.get(role);
      if (existing) {
        existing.totalMinutes += minutes;
        existing.count += 1;
      } else {
        grouped.set(role, { totalMinutes: minutes, count: 1 });
      }
    }

    return Array.from(grouped, ([role, { totalMinutes, count }]) => {
      const avgTime = totalMinutes / count;
      return {
        role,
        avgTime,
        count,
        formattedTime: `${Math.round(avgTime * 10) / 10} min`,
      };
    }).sort((a, b) => b.avgTime - a.avgTime);
  }, [data, selectedRoles]);

  const maxTime = Math.max(...processedData.map(item => item.avgTime), 10);

  useEffect(() => {
    const t = setTimeout(() => ReactTooltip.rebuild(), 0);
    return () => clearTimeout(t);
  }, [processedData]);

  // ── Loading / Error states ────────────────────────────────────────────────

  if (initialLoading) {
    return (
      <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
        <div className={`${styles.chartCard} ${darkMode ? styles.darkMode : ''}`}>
          <h2 className={`${styles.title} ${darkMode ? styles.darkMode : ''}`}>
            Comparing the Average Time Taken to Fill an Application by Role
          </h2>
          <div className={`${styles.noData} ${darkMode ? styles.darkMode : ''}`}>
            Loading application time data...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
        <div className={`${styles.chartCard} ${darkMode ? styles.darkMode : ''}`}>
          <h2 className={`${styles.title} ${darkMode ? styles.darkMode : ''}`}>
            Comparing the Average Time Taken to Fill an Application by Role
          </h2>
          <div className={`${styles.noData} ${darkMode ? styles.darkMode : ''}`}>
            Error loading data: {error}. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  // Stable, unique id for this chart's tooltip (used for data-for on bars)
  const tooltipId = 'application-time-chart-tooltip';

  return (
    <>
      <ReactTooltip
        id={tooltipId}
        type={darkMode ? 'dark' : 'light'}
        effect="float"
        border
        borderColor={darkMode ? '#ffffff' : 'rgba(0, 0, 0, 0.12)'}
        className={styles.tooltipOpaque}
        getContent={dataTip => {
          if (!dataTip) return null;
          const { role, avgTime, count } = JSON.parse(dataTip) || {};
          return (
            <div className={styles.tooltipContent}>
              <div className={styles.tooltipRole}>{role}</div>
              <div
                className={styles.tooltipDivider}
                style={{
                  backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.12)',
                }}
              />
              <div className={styles.tooltipRow}>
                <span
                  className={styles.tooltipLabel}
                  style={{ color: darkMode ? '#9ab0bb' : '#5f6368' }}
                >
                  Avg. Time
                </span>
                <span className={styles.tooltipValue}>{avgTime} min</span>
              </div>
              <div className={styles.tooltipRow}>
                <span
                  className={styles.tooltipLabel}
                  style={{ color: darkMode ? '#9ab0bb' : '#5f6368' }}
                >
                  Total Applications
                </span>
                <span className={styles.tooltipValue}>{count}</span>
              </div>
            </div>
          );
        }}
      />

      <div className={`${styles.container} ${darkMode ? styles.darkMode : ''}`}>
        {/* Filters Panel */}
        <div className={`${styles.filters} ${darkMode ? styles.darkMode : ''}`}>
          {/* Dates Filter */}
          <div className={`${styles.dateFilter} ${darkMode ? styles.darkMode : ''}`}>
            <div className={`${styles.filterTitle} ${darkMode ? styles.darkMode : ''}`}>Date</div>
            <Select
              options={DATE_FILTER_OPTIONS}
              value={selectedDate}
              onChange={handleDateChange}
              placeholder="Select date range…"
              className={`${styles.applicationTimesDateSelect} ${
                darkMode ? styles.selectDark : ''
              }`}
              classNamePrefix="application-times-date-select"
              isSearchable={false}
            />
          </div>

          {/* Role Filter */}
          <div className={`${styles.roleFilter} ${darkMode ? styles.darkMode : ''}`}>
            <div className={`${styles.filterTitle} ${darkMode ? styles.darkMode : ''}`}>Role</div>
            <Select
              isMulti
              options={availableRoles}
              value={selectedRoles}
              onChange={handleRoleChange}
              placeholder="Select roles…"
              className={`${styles.applicationTimesRoleMultiSelect} ${
                darkMode ? styles.selectDark : ''
              }`}
              classNamePrefix="application-times-multi-select"
              isDisabled={availableRoles.length === 0}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              components={{
                MultiValue: props => {
                  const { index, getValue, children, ...rest } = props;
                  const allSelected = getValue();
                  const isOverflowPill = index === 1 && allSelected.length > 1;
                  if (!isOverflowPill && index > 0) return null;
                  const pillClasses = `${styles.selectedPill}`;
                  if (isOverflowPill) {
                    const overflowCount = allSelected.length - 1;
                    return (
                      <div className={pillClasses}>
                        + {overflowCount} role{overflowCount === 1 ? '' : 's'} selected
                      </div>
                    );
                  }
                  return (
                    <div className={pillClasses} {...rest}>
                      {children}
                    </div>
                  );
                },
                MultiValueRemove: props => {
                  const { index, getValue } = props;
                  if (index === 0 && getValue().length > 1) return null;
                  return <components.MultiValueRemove {...props} />;
                },
              }}
            />
          </div>
        </div>

        {/* Chart Container */}
        <div className={`${styles.chartCard} ${darkMode ? styles.darkMode : ''}`}>
          <h2 className={`${styles.title} ${darkMode ? styles.darkMode : ''}`}>
            Comparing the Average Time Taken to Fill an Application by Role
          </h2>

          {/* Chart */}
          <div className={styles.chartArea}>
            {processedData.length > 0 ? (
              <>
                {/* Grid Lines */}
                <div
                  className={`${styles.grid} ${darkMode ? styles.darkMode : ''}`}
                  style={{
                    backgroundSize: `${100 / 6}% ${100 / processedData.length}%`,
                  }}
                />

                {/* Y-axis (Roles) */}
                <div className={styles.yAxis}>
                  {processedData.map(item => (
                    <div
                      key={item.role}
                      className={`${styles.yAxisItem} ${darkMode ? styles.darkMode : ''}`}
                      style={{ height: `${100 / processedData.length}%` }}
                    >
                      {item.role}
                    </div>
                  ))}
                </div>

                {/* X-axis ticks */}
                <div className={`${styles.xAxis} ${darkMode ? styles.darkMode : ''}`}>
                  {(() => {
                    const tickCount = 6;
                    const ticks = [];
                    for (let i = 0; i <= tickCount; i++) {
                      const tickValue = Math.round(((maxTime * i) / tickCount) * 10) / 10;
                      ticks.push(tickValue);
                    }
                    return ticks.map(tick => (
                      <div
                        key={tick}
                        style={{
                          position: 'absolute',
                          left: `${(tick / maxTime) * 100}%`,
                          fontSize: '12px',
                          color: darkMode ? '#e0e0e0' : '#5f6368',
                          transform: 'translateX(-50%)',
                        }}
                      >
                        {tick}
                      </div>
                    ));
                  })()}
                </div>

                {/* Bars */}
                <div className={styles.bars}>
                  {processedData.map(item => {
                    const avgTimeRounded = Math.round(item.avgTime * 10) / 10;
                    const tooltipContent = JSON.stringify({
                      role: item.role,
                      avgTime: avgTimeRounded,
                      count: item.count,
                    });
                    return (
                      <div
                        key={item.role}
                        className={styles.barRow}
                        style={{ height: `${100 / processedData.length}%` }}
                        data-for={tooltipId}
                        data-tip={tooltipContent}
                      >
                        <div
                          className={`${styles.bar} ${darkMode ? styles.darkMode : ''}`}
                          style={{ width: `${(item.avgTime / maxTime) * 100}%` }}
                        >
                          <div className={`${styles.dataLabel} ${darkMode ? styles.darkMode : ''}`}>
                            {item.formattedTime || `${avgTimeRounded} min`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* X-axis Label */}
                <div className={`${styles.xAxisLabel} ${darkMode ? styles.darkMode : ''}`}>
                  Average Time taken to fill application (in minutes)
                </div>
              </>
            ) : (
              <div className={`${styles.noData} ${darkMode ? styles.darkMode : ''}`}>
                No data available for the selected filters
              </div>
            )}
          </div>

          {/* Summary Info */}
          {processedData.length > 0 && (
            <div className={`${styles.summary} ${darkMode ? styles.darkMode : ''}`}>
              <div>
                <strong>Showing:</strong> {processedData.length} role(s)
              </div>
              <div>
                <strong>Fastest:</strong> {processedData[processedData.length - 1]?.role} (
                {processedData[processedData.length - 1]?.formattedTime})
              </div>
              <div>
                <strong>Slowest:</strong> {processedData[0]?.role} (
                {processedData[0]?.formattedTime})
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ApplicationTimeChart;
