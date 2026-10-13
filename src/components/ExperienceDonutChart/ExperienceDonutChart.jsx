import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios'; // Added axios import to fix network request errors
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Select, { components } from 'react-select';
import DatePicker from 'react-datepicker';
import clsx from 'clsx';
import { endOfDay, startOfDay } from 'date-fns';
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

const API_BASE = `${process.env.REACT_APP_APIENDPOINT}/applicant-analytics`;

const pluralizeApplicants = count => `applicant${count === 1 ? '' : 's'}`;

// Phones need a smaller donut so the percentage labels outside it are not cut off
const NARROW_QUERY = '(max-width: 640px)';
// Wider than tall on desktop so the group cards sit close under the donut
const WIDE_CHART_ASPECT = 1.8;
function useIsNarrow() {
  const [isNarrow, setIsNarrow] = useState(
    () => typeof window !== 'undefined' && Boolean(window.matchMedia?.(NARROW_QUERY).matches),
  );
  useEffect(() => {
    const query = window.matchMedia?.(NARROW_QUERY);
    if (!query) return undefined;
    const onChange = e => setIsNarrow(e.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return isNarrow;
}

// Count inside each segment, percentage outside on a leader line (category names are in the list below).
// Slivers drop the count (it won't fit) and tiny ones drop both, so neighbouring labels don't overlap.
const RADIAN = Math.PI / 180;
const MIN_PERCENT_FOR_COUNT = 0.05;
const MIN_PERCENT_FOR_LABELS = 0.02;
export function renderSegmentLabel({ cx, cy, midAngle, innerRadius, outerRadius, value, percent }) {
  if (!value || percent < MIN_PERCENT_FOR_LABELS) return null;
  const sin = Math.sin(-midAngle * RADIAN);
  const cos = Math.cos(-midAngle * RADIAN);
  const inside = innerRadius + (outerRadius - innerRadius) / 2;
  const outside = outerRadius + 22;
  const outsideX = cx + outside * cos;
  return (
    <g>
      {percent >= MIN_PERCENT_FOR_COUNT && (
        <text
          x={cx + inside * cos}
          y={cy + inside * sin}
          className={styles['segment-count']}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {value}
        </text>
      )}
      <text
        x={outsideX + (cos >= 0 ? 4 : -4)}
        y={cy + outside * sin}
        className={styles['segment-percent']}
        textAnchor={cos >= 0 ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  );
}

// Leader lines follow the same rule as the percentage, so empty or tiny groups get no stray tick
function renderSegmentLabelLine({ points, stroke, value, percent }) {
  if (!value || percent < MIN_PERCENT_FOR_LABELS || !points?.length) return null;
  const [from, to] = points;
  return <path d={`M${from.x},${from.y}L${to.x},${to.y}`} stroke={stroke} fill="none" />;
}

function rolesPlaceholderFor(status, optionCount) {
  if (status === 'loading') return 'Loading roles…';
  if (status === 'unavailable') return 'Roles unavailable';
  return optionCount === 0 ? 'No roles yet' : 'Select roles';
}

function emptyMessageFor(notReported, hasFilters) {
  if (notReported > 0) {
    return `None of the ${notReported} ${pluralizeApplicants(
      notReported,
    )} here reported years of experience.`;
  }
  if (hasFilters)
    return 'No applicants match these filters. Try a wider date range or fewer roles.';
  return 'No applicants yet.';
}

function Spinner() {
  return (
    <div className={styles['spinner-container']} role="status" aria-live="polite" aria-busy="true">
      <div className={styles.spinner} />
      <p>Loading…</p>
    </div>
  );
}

function DetailsPanel({ chartData, total, activeIndex }) {
  if (!chartData || total === 0) return null;

  return (
    <ul className={styles['chart-details']} aria-label="Applicants by experience">
      {chartData.map((d, idx) => {
        const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0;
        return (
          <li
            key={d.name}
            className={`${styles['detail-item']} ${activeIndex === idx ? styles.active : ''}`}
          >
            <div className={styles['detail-header']}>
              <span className={styles['detail-dot']} style={{ backgroundColor: d.color }} />
              <span className={styles['detail-name']}>{d.name}</span>
            </div>
            <div className={styles['detail-stats']}>
              <div className={styles['detail-stats-count']}>
                <span className={styles['detail-count']}>{d.value.toLocaleString()}</span>
                <span className={styles['detail-applicant-label']}>
                  {' '}
                  {pluralizeApplicants(d.value)}
                </span>
              </div>
              <span className={styles['detail-pct']}>{pct}%</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function CustomTooltip({ active, payload, total }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0;

  return (
    <div className={styles['custom-tooltip']}>
      <div className={styles['custom-tooltip-name']}>{d.name}</div>
      <div className={styles['custom-tooltip-stats']}>
        <div className={styles['custom-tooltip-applicant']}>
          <span>Applicants:</span> <strong>{d.value}</strong>
        </div>
        <div className={styles['custom-tooltip-percentage']}>
          <span>% of applicants:</span> <strong>{pct}%</strong>
        </div>
      </div>
    </div>
  );
}

function SelectedRoleValue(props) {
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
}

function SelectedRoleRemove(props) {
  const { index, getValue } = props;
  if (index === 0 && getValue().length > 1) return null;
  return <components.MultiValueRemove {...props} />;
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
  const [notReported, setNotReported] = useState(0);
  const [roleOptions, setRoleOptions] = useState([]);
  const [rolesStatus, setRolesStatus] = useState('loading'); // loading | ready | unavailable
  const isNarrow = useIsNarrow();
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

  const fetchData = async signal => {
    setLoading(true);
    setError(null);
    setActiveIndex(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in.');

      const params = {};
      // Send the viewer's local day bounds as instants; either end of the range may be left open
      if (appliedFilters.startDate) {
        params.startDate = startOfDay(appliedFilters.startDate).toISOString();
      }
      if (appliedFilters.endDate) params.endDate = endOfDay(appliedFilters.endDate).toISOString();
      // A list (roles[]=...) keeps job titles that contain commas intact
      if (appliedFilters.roles && appliedFilters.roles.length > 0) {
        params.roles = appliedFilters.roles;
      }

      const { data } = await axios.get(`${API_BASE}/experience-breakdown`, {
        headers: { Authorization: token },
        params,
        signal,
      });
      // A newer filter was applied while this request was in flight
      if (signal?.aborted) return;

      const breakdown = data?.breakdown || [];
      setNotReported(data?.notReported || 0);

      if (breakdown.length === 0) {
        setChartData(null);
        setTotal(0);
        return;
      }

      const formattedData = EXPERIENCE_LABELS.map((label, index) => {
        const found = breakdown.find(d => d.experience === label);
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
      if (signal?.aborted) return;
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          'Error fetching data.',
      );
      setChartData(null);
      setTotal(0);
      setNotReported(0);
    } finally {
      if (!signal?.aborted) setLoading(false);
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
    setError(null);
    setAppliedFilters({ startDate: '', endDate: '', roles: [] });
  };

  useEffect(() => {
    const controller = new AbortController();
    // fetchData handles its own errors and loading state
    void fetchData(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters]);

  // Role filter options are the job titles people actually applied for
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return undefined;
    const controller = new AbortController();
    axios
      .get(`${API_BASE}/experience-roles`, {
        headers: { Authorization: token },
        signal: controller.signal,
      })
      .then(({ data }) => {
        setRoleOptions(
          (Array.isArray(data) ? data : []).map(role => ({ value: role, label: role })),
        );
        setRolesStatus('ready');
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setRoleOptions([]);
        setRolesStatus('unavailable');
      });
    return () => controller.abort();
  }, []);

  const rolesPlaceholder = rolesPlaceholderFor(rolesStatus, roleOptions.length);
  const emptyMessage = emptyMessageFor(notReported, hasFilters);
  const hasChart = Boolean(chartData) && total > 0;

  return (
    <div
      className={`${styles['experience-donut-chart']} ${darkMode &&
        styles['experience-donut-chart-dark-mode']}`}
    >
      <div className={styles['experience-chart-container']}>
        <div className={styles['chart-header']}>
          <h2 className={styles['chart-title']}>Breakdown of Applicants by Experience</h2>
        </div>

        <section className={styles['filter-section']}>
          <div className={styles['filter-row']}>
            <div className={clsx(styles['filter-group'], styles['filter-group-date'])}>
              <label className={styles['filter-label']} htmlFor="startDate">
                Start Date
              </label>
              <DatePicker
                id="startDate"
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
                id="endDate"
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
                inputId="roles"
                isMulti
                options={roleOptions}
                value={selectedRoles}
                onChange={handleRoleChange}
                placeholder={rolesPlaceholder}
                className={styles['experience-role-multi-select']}
                classNamePrefix="experience-role-multi-select"
                isDisabled={roleOptions.length === 0}
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                menuPlacement="auto"
                components={{
                  MultiValue: SelectedRoleValue,
                  MultiValueRemove: SelectedRoleRemove,
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

            {!loading && !error && hasChart && (
              <>
                {/* Screen readers get the same numbers, with group names, from the list below */}
                <div className={styles['chart-canvas']} aria-hidden="true">
                  <ResponsiveContainer width="100%" aspect={isNarrow ? 1 : WIDE_CHART_ASPECT}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        dataKey="value"
                        innerRadius={isNarrow ? '38%' : '58%'}
                        outerRadius={isNarrow ? '56%' : '84%'}
                        label={renderSegmentLabel}
                        labelLine={renderSegmentLabelLine}
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
                      <Tooltip content={<CustomTooltip total={total} />} />
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
                <DetailsPanel chartData={chartData} total={total} activeIndex={activeIndex} />
              </>
            )}

            {!loading && !error && !hasChart && (
              <p className={styles['no-data-message']}>{emptyMessage}</p>
            )}

            {!loading && !error && hasChart && notReported > 0 && (
              <p className={styles['not-reported-note']}>
                {`${notReported} more ${pluralizeApplicants(
                  notReported,
                )} didn't report years of experience and aren't counted above.`}
              </p>
            )}

            {!loading && error && (
              <p className={styles['error-message']} role="alert">
                {error}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
