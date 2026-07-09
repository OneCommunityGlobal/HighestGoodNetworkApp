import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios'; // Added axios import to fix network request errors
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Select, { components } from 'react-select';
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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters]);

  const handleRoleChange = selectedOptions => {
    setSelectedRoles(selectedOptions || []);
  };

  const applyFilters = () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError(null);
      setChartData(null);
      setTotal(0);
      setLoading(false);
      return;
    }
    setAppliedFilters({
      startDate,
      endDate,
      roles: selectedRoles.map(r => r.value),
    });
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
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
              <span className={styles['detail-dot']} style={{ backgroundColor: d.color }} />
              <span className={styles['detail-name']}>{d.name}</span>
              <span className={styles['detail-count']}>{d.value.toLocaleString()}</span>
              <span className={styles['detail-pct']}>{pct}%</span>
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
            <div className={styles['filter-group']}>
              <label className={styles['filter-label']} htmlFor="startDate">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                className={styles['filter-input']}
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>

            <div className={styles['filter-group']}>
              <label className={styles['filter-label']} htmlFor="endDate">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                className={styles['filter-input']}
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>

            <div className={styles['filter-group']}>
              <label className={styles['filter-label']} htmlFor="roles">
                Roles
              </label>
              <Select
                isMulti
                options={AVAILABLE_ROLES}
                value={selectedRoles}
                onChange={handleRoleChange}
                placeholder="Select roles…"
                className={`${styles.ExperienceRoleMultiSelect} ${
                  darkMode ? styles.selectDark : ''
                }`}
                classNamePrefix="experience-role-multi-select"
                isDisabled={AVAILABLE_ROLES.length === 0}
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

          <div className={styles['filter-actions']}>
            <button className={`${styles.btn} ${styles.primary}`} onClick={applyFilters}>
              Apply
            </button>
            <button
              className={`${styles.btn} ${styles.ghost}`}
              onClick={resetFilters}
              disabled={!hasFilters}
            >
              Reset
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
