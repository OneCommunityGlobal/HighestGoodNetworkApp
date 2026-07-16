import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios'; // Added axios import to fix network request errors
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Select, { components } from 'react-select';
import DatePicker from 'react-datepicker';
import clsx from 'clsx';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './ExperienceDonutChart.module.css';

const SEGMENT_COLORS = [
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#4BC0C0',
  '#FF9F40',
  '#8B5CF6',
  '#10B981',
];

const EXPERIENCE_LABELS = ['0-1 years', '1-3 years', '3-5 years', '5+ years'];

const AVAILABLE_ROLES = [
  { value: 'Frontend Developer', label: 'Frontend Developer' },
  { value: 'DevOps Engineer', label: 'DevOps Engineer' },
  { value: 'Project Manager', label: 'Project Manager' },
  { value: 'Junior Developer', label: 'Junior Developer' },
  { value: 'Full Stack Developer', label: 'Full Stack Developer' },
];

// ✅ Crypto-based RNG (safer than Math.random)
function secureRandomInt(min, max) {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return min + (array[0] % (max - min + 1));
}

function Spinner() {
  return (
    <div className={styles['spinner-container']} role="status" aria-live="polite" aria-busy="true">
      <div className={styles.spinner} />
      <p>Loading…</p>
    </div>
  );
}

export default function ExperienceDonutChart() {
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null,
  });
  const [selectedRoles, setSelectedRoles] = useState([]);

  const [appliedFilters, setAppliedFilters] = useState({ startDate: '', endDate: '', roles: [] });

  const [chartData, setChartData] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeIndex, setActiveIndex] = useState(null);
  const darkMode = useSelector(state => state.theme.darkMode);

  const hasFilters = useMemo(
    () =>
      Boolean(
        appliedFilters.startDate ||
          appliedFilters.endDate ||
          (appliedFilters.roles?.length ?? 0) > 0,
      ),
    [appliedFilters],
  );

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setActiveIndex(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');

      // Fixed API endpoint path to include /applicant-analytics
      const url = `${process.env.REACT_APP_APIENDPOINT}/applicant-analytics/experience-breakdown`;
      const params = {};

      // Replaced undefined filter variables with correctly scoped appliedFilters
      if (appliedFilters.startDate && appliedFilters.endDate) {
        params.startDate = appliedFilters.startDate;
        params.endDate = appliedFilters.endDate;
      }
      if (appliedFilters.roles && appliedFilters.roles.length > 0) {
        params.roles = appliedFilters.roles.join(',');
      }

      const response = await axios.get(url, {
        headers: { Authorization: token },
        params,
      });

      const { data } = response;

      if (!data || data.length === 0) {
        setChartData(null);
        setLoading(false);
        return;
      }

      // Re-formatted chart data as an array of objects for Recharts compatibility
      const formattedData = EXPERIENCE_LABELS.map((label, index) => {
        const found = data.find(d => d.experience === label);
        return {
          name: label,
          value: found ? found.count : 0,
          color: SEGMENT_COLORS[index % SEGMENT_COLORS.length], // Fixed case sensitivity for constants
        };
      });

      const totalCount = formattedData.reduce((a, b) => a + b.value, 0);

      setChartData(formattedData);
      setTotal(totalCount); // Added state update for chart center total
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error fetching data.');
      setChartData(null);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = selectedOptions => {
    setSelectedRoles(selectedOptions || []);
  };

  const applyFilters = () => {
    setAppliedFilters({
      startDate: dateRange.start,
      endDate: dateRange.end,
      roles: selectedRoles.map(r => r.value),
    });
  };

  const resetFilters = () => {
    setDateRange({
      start: null,
      end: null,
    });
    setSelectedRoles([]);
    setAppliedFilters({ startDate: '', endDate: '', roles: [] });
  };

  const DetailsPanel = () => {
    if (!chartData || total === 0) return null;

    return (
      <div className={styles['chart-details']}>
        {chartData.map((d, idx) => {
          const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0;
          return (
            <div
              key={d.name}
              className={`${styles['detail-item']} ${activeIndex === idx ? styles.active : ''}`}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className={styles['detail-header']}>
                <span className={styles['detail-dot']} style={{ backgroundColor: d.color }} />
                <span className={styles['detail-name']}>{d.name}</span>
              </div>
              <div className={styles['detail-stats']}>
                <div className={styles['detail-stats-count']}>
                  <span className={styles['detail-count']}>{d.value.toLocaleString()}</span>
                  <span className={styles['detail-applicant-label']}> applicants</span>
                </div>
                <span className={styles['detail-pct']}>{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0;

    return (
      <div className={styles['custom-tooltip']}>
        {/* Corrected tooltip to use name and value from payload for visibility */}
        <strong>{d.name}</strong>
        <br />
        Count: {d.value}
        <br />
        {pct}% of applicants
      </div>
    );
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters]);

  return (
    <div
      className={`${styles['experience-donut-chart']} ${darkMode &&
        styles['experience-donut-chart-dark-mode']}`}
    >
      <div className={styles['experience-chart-container']}>
        <div className={styles['chart-header']}>
          <h2 className={styles['chart-title']}>Applicants by Experience</h2>
        </div>

        <section className={styles['filter-section']}>
          <div className={styles['filter-row']}>
            <div className={clsx(styles['filter-group'], styles['filter-group-date'])}>
              <label className={styles['filter-label']} htmlFor="startDate">
                Start Date
              </label>
              <DatePicker
                selected={dateRange?.start ? new Date(dateRange.start) : null}
                onChange={date => {
                  const newEnd =
                    dateRange.end && date && new Date(date) > new Date(dateRange.end)
                      ? null
                      : dateRange.end;
                  setDateRange({
                    ...dateRange,
                    start: date,
                    end: newEnd,
                  });
                }}
                selectsStart
                startDate={dateRange.start}
                endDate={dateRange.end}
                dateFormat="yyyy-MM-dd"
                isClearable={dateRange.start}
                placeholderText="Start date"
                className={styles['experience-date-input']}
                calendarClassName={clsx(
                  'experience-datepicker',
                  darkMode ? 'experience-datepicker-dark' : 'experience-datepicker-light',
                )}
              />
            </div>

            <div className={clsx(styles['filter-group'], styles['filter-group-date'])}>
              <label className={styles['filter-label']} htmlFor="endDate">
                End Date
              </label>
              <DatePicker
                selected={dateRange?.end ? new Date(dateRange.end) : null}
                onChange={date => {
                  setDateRange({
                    ...dateRange,
                    end: date,
                  });
                }}
                selectsEnd
                startDate={dateRange.start}
                endDate={dateRange.end}
                dateFormat="yyyy-MM-dd"
                minDate={dateRange?.start ? new Date(dateRange.start) : undefined}
                isClearable={dateRange.end}
                placeholderText="End date"
                className={styles['experience-date-input']}
                calendarClassName={clsx(
                  'experience-datepicker',
                  darkMode ? 'experience-datepicker-dark' : 'experience-datepicker-light',
                )}
              />
            </div>

            <div className={clsx(styles['filter-group'], styles['filter-group-role'])}>
              <label className={styles['filter-label']} htmlFor="roles">
                Roles
              </label>
              <Select
                isMulti
                options={AVAILABLE_ROLES}
                value={selectedRoles}
                onChange={handleRoleChange}
                placeholder="Select roles"
                className={styles['experience-role-multi-select']}
                classNamePrefix="experience-role-multi-select"
                isDisabled={AVAILABLE_ROLES.length === 0}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                menuPlacement="auto"
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

          <div className={styles['filter-actions']}>
            <button
              className={clsx(styles['filter-button'], styles['filter-button-apply'])}
              onClick={applyFilters}
            >
              Apply
            </button>
            <button
              className={clsx(styles['filter-button'], styles['filter-button-clear-all'])}
              onClick={resetFilters}
              disabled={!hasFilters}
            >
              Clear all
            </button>
          </div>
        </section>

        <section className={styles['chart-section']}>
          <div className={styles['chart-area']}>
            {loading && <Spinner />}

            {!loading && !error && chartData && total > 0 && (
              <>
                <div className={styles['chart-canvas']}>
                  <ResponsiveContainer width="100%" aspect={1}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        dataKey="value"
                        innerRadius="55%"
                        outerRadius="82%"
                        stroke={darkMode ? '#1c2441' : '#fff'}
                        strokeWidth={3}
                        onMouseEnter={(_, i) => setActiveIndex(i)}
                        onMouseLeave={() => setActiveIndex(null)}
                      >
                        {chartData.map((d, i) => (
                          <Cell
                            key={d.name}
                            fill={d.color}
                            className={styles['pie-cell']}
                            opacity={activeIndex == null || activeIndex === i ? 1 : 0.45}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <text
                        x="50%"
                        y="50%"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        style={{
                          fontWeight: 800,
                          fontSize: '1rem',
                          fill: darkMode ? '#f8fafc' : '#0f172a',
                        }}
                      >
                        {total.toLocaleString()}
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <DetailsPanel />
              </>
            )}

            {!loading && !error && (!chartData || total === 0) && <p>No Data Available 😢</p>}

            {!loading && error && <p className={styles['error-message']}>{error}</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
