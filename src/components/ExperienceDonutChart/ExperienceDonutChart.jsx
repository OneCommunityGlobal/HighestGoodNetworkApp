import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
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

      const url = `${process.env.REACT_APP_APIENDPOINT}/experience-breakdown`;
      const params = {};

      if (filterStartDate && filterEndDate) {
        params.startDate = filterStartDate;
        params.endDate = filterEndDate;
      } else if (filterRoles && filterRoles.length > 0) {
        params.roles = filterRoles.join(',');
      }

      // const response = await axios.get(url, { params });
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

      const counts = experienceLabels.map(label => {
        const found = data.find(d => d.experience === label);
        return found ? found.count : 0;
      });

      const totalCount = counts.reduce((a, b) => a + b, 0);

      const chart = {
        labels: experienceLabels,
        datasets: [
          {
            data: counts,
            backgroundColor: segmentColors,
            hoverOffset: 20,
          },
        ],
      };

      setChartData({ chart, totalCount });
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

  const onRolesChange = e => {
    setSelectedRoles(Array.from(e.target.selectedOptions, o => o.value));
  };

  const applyFilters = () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date.');
      return;
    }
    setAppliedFilters({ startDate, endDate, roles: selectedRoles });
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
          const pct = ((d.value / total) * 100).toFixed(1);
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
    const pct = ((d.value / total) * 100).toFixed(1);

    return (
      <div className={styles['custom-tooltip']}>
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
              <select
                id="roles"
                className={styles['filter-select']}
                multiple
                value={selectedRoles}
                onChange={onRolesChange}
              >
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Junior Developer">Junior Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
              </select>
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
