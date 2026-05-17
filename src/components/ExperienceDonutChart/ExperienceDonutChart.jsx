import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios'; // Added axios import to fix network request errors
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
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

function getContrastColor(hexColor) {
  const hex = hexColor.replace('#', '');
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150 ? '#111827' : '#ffffff';
}

function Spinner() {
  return (
    <div className={styles['spinner-container']} role="status" aria-live="polite" aria-busy="true">
      <div className={styles.spinner} />
      <p>Loading…</p>
    </div>
  );
}

const TODAY = new Date().toISOString().split('T')[0];

const PREFERS_REDUCED_MOTION =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

export default function ExperienceDonutChart() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);

  const [appliedFilters, setAppliedFilters] = useState({ startDate: '', endDate: '', roles: [] });

  const [chartData, setChartData] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setTotal(0);
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

  const visibleChartData = useMemo(() => chartData?.filter(d => d.value > 0) ?? [], [chartData]);

  // Hide counts until the sweep animation finishes so they don't bleed through
  const [animationDone, setAnimationDone] = useState(false);
  useEffect(() => {
    setAnimationDone(PREFERS_REDUCED_MOTION);
  }, [chartData]);

  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Renders the hovered segment with a slightly larger outer radius
  const renderActiveShape = props => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 3}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    );
  };

  // Draws the count at the visual center of each segment — only after animation completes
  const renderInsideCount = ({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
    if (!value || !animationDone) return null;
    const isHovered = index === hoveredIndex;
    const RADIAN = Math.PI / 180;
    // Push centroid outward slightly when hovered to stay centered in the expanded segment
    const expandedOuter = isHovered ? outerRadius + 10 : outerRadius;
    const radius = (innerRadius - (isHovered ? 3 : 0) + expandedOuter) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill={getContrastColor(visibleChartData[index]?.color ?? '#000')}
        style={{
          fontSize: isHovered ? '1.2rem' : '1.05rem',
          fontWeight: 800,
          pointerEvents: 'none',
          transition: 'font-size 0.15s ease',
        }}
      >
        {value.toLocaleString()}
      </text>
    );
  };

  // Draws name on top line, percentage below — outside the segment, only after animation completes
  const renderOutsideLabel = ({ cx, cy, midAngle, outerRadius, name, percent, index }) => {
    if (!animationDone) return null;
    const isHovered = index === hoveredIndex;
    const RADIAN = Math.PI / 180;
    const expandedOuter = isHovered ? outerRadius + 10 : outerRadius;
    const lineStart = expandedOuter + 8;
    const lineEnd = expandedOuter + 50;
    const sx = cx + lineStart * Math.cos(-midAngle * RADIAN);
    const sy = cy + lineStart * Math.sin(-midAngle * RADIAN);
    const ex = cx + lineEnd * Math.cos(-midAngle * RADIAN);
    const ey = cy + lineEnd * Math.sin(-midAngle * RADIAN);
    const isRight = ex > cx;
    const elbowX = ex + (isRight ? 18 : -18);
    const textX = elbowX + (isRight ? 4 : -4);
    const textAnchor = isRight ? 'start' : 'end';
    const pct = `${(percent * 100).toFixed(1)}%`;
    const labelColor = darkMode ? '#f8fafc' : '#0f172a';
    const lineColor = darkMode ? '#94a3b8' : '#64748b';
    const nameFontSize = isHovered ? '1.05rem' : '0.95rem';
    const pctFontSize = isHovered ? '0.95rem' : '0.85rem';
    const strokeWidth = isHovered ? 2.5 : 1.5;

    return (
      <g style={{ transition: 'all 0.15s ease' }}>
        <path
          d={`M${sx},${sy} L${ex},${ey} L${elbowX},${ey}`}
          fill="none"
          stroke={lineColor}
          strokeWidth={strokeWidth}
        />
        <text
          x={textX}
          y={ey}
          textAnchor={textAnchor}
          fill={labelColor}
          style={{ fontWeight: 700 }}
        >
          <tspan x={textX} dy="-0.55em" style={{ fontSize: nameFontSize }}>
            {name}
          </tspan>
          <tspan x={textX} dy="1.2em" style={{ fontSize: pctFontSize, opacity: 0.75 }}>
            {pct}
          </tspan>
        </text>
      </g>
    );
  };

  const onRolesChange = e => {
    setSelectedRoles(Array.from(e.target.selectedOptions, o => o.value));
  };

  const applyFilters = () => {
    if (startDate && startDate > TODAY) {
      setError('Start date cannot be in the future.');
      return;
    }
    if (endDate && endDate > TODAY) {
      setError('End date cannot be in the future.');
      return;
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date.');
      return;
    }
    setError(null);
    setAppliedFilters({ startDate, endDate, roles: selectedRoles });
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedRoles([]);
    setError(null);
    setAppliedFilters({ startDate: '', endDate: '', roles: [] });
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
                max={TODAY}
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
                max={TODAY}
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
              <div className={styles['chart-canvas']}>
                <ResponsiveContainer width="100%" aspect={1}>
                  <PieChart margin={{ top: 50, right: 100, bottom: 50, left: 100 }}>
                    <Pie
                      data={visibleChartData}
                      cx="50%"
                      cy="50%"
                      dataKey="value"
                      innerRadius="42%"
                      outerRadius="78%"
                      stroke={darkMode ? '#1c2441' : '#fff'}
                      strokeWidth={3}
                      labelLine={false}
                      label={renderOutsideLabel}
                      isAnimationActive={!PREFERS_REDUCED_MOTION}
                      onAnimationEnd={() => setAnimationDone(true)}
                      activeIndex={hoveredIndex}
                      activeShape={renderActiveShape}
                      onMouseEnter={(_, index) => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {visibleChartData.map(d => (
                        <Cell key={d.name} fill={d.color} className={styles['pie-cell']} />
                      ))}
                    </Pie>
                    {/* Inside counts rendered as a second label pass — animation disabled to prevent double-sweep */}
                    <Pie
                      data={visibleChartData}
                      cx="50%"
                      cy="50%"
                      dataKey="value"
                      innerRadius="42%"
                      outerRadius="78%"
                      stroke="none"
                      strokeWidth={0}
                      labelLine={false}
                      label={renderInsideCount}
                      isAnimationActive={false}
                      style={{ pointerEvents: 'none' }}
                    >
                      {visibleChartData.map(d => (
                        <Cell key={d.name} fill="transparent" />
                      ))}
                    </Pie>
                    {animationDone && (
                      <text
                        x="50%"
                        y="50%"
                        dominantBaseline="middle"
                        textAnchor="middle"
                        style={{
                          fontWeight: 800,
                          fontSize: '1.1rem',
                          fill: darkMode ? '#f8fafc' : '#0f172a',
                        }}
                      >
                        {total.toLocaleString()}
                      </text>
                    )}
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {!loading && !error && (!chartData || total === 0) && <p>No Data Available 😢</p>}

            {!loading && error && <p className={styles['error-message']}>{error}</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
