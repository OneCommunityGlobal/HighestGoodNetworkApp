import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import axios from 'axios';
import styles from './ExperienceDonutChart.module.css';

const EXPERIENCE_LABELS = ['0-1 years', '1-3 years', '3-5 years', '5+ years'];

const SEGMENT_COLORS = ['#36A2EB', '#FF6384', '#FFCE56', '#10B981'];

const ROLE_OPTIONS = [
  'Frontend Developer',
  'DevOps Engineer',
  'Project Manager',
  'Junior Developer',
  'Full Stack Developer',
];

function Spinner() {
  return (
    <div className={styles['spinner-container']}>
      <div className={styles.spinner} />
      <p>Loading…</p>
    </div>
  );
}

export default function ExperienceDonutChart() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: '',
    endDate: '',
    roles: ROLE_OPTIONS,
  });

  const [chartData, setChartData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);

  const darkMode = useSelector(state => state.theme.darkMode);

  const hasFilters = useMemo(
    () => Boolean(appliedFilters.startDate || appliedFilters.endDate || selectedRole !== 'ALL'),
    [appliedFilters, selectedRole],
  );

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      if (selectedRole !== 'All') queryParams.append('roles', selectedRole);

      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      dispatchEvent(fetchExperienceBreakdown(queryParams.toString(), token));
      setChartData(formattedData);
      setTotal(totalCount);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching data');
      setChartData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [appliedFilters]);

  const applyFilters = () => {
    const rolesToApply = selectedRole === 'All' ? ROLE_OPTIONS : [selectedRole];

    setAppliedFilters({
      startDate,
      endDate,
      roles: rolesToApply,
    });
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedRole('ALL');
    setAppliedFilters({
      startDate: '',
      endDate: '',
      roles: ROLE_OPTIONS,
    });
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const pct = total ? ((d.value / total) * 100).toFixed(1) : 0;

    return (
      <div className={styles['custom-tooltip']}>
        <strong>{d.name}</strong>
        <br />
        Count: {d.value}
        <br />
        {pct}%
      </div>
    );
  };

  return (
    <div
      className={`${styles['experience-donut-chart']} ${darkMode &&
        styles['experience-donut-chart-dark-mode']}`}
    >
      <h2>Applicants by Experience</h2>

      {/* Filters */}
      <div className={styles['filter-row']}>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}>
          <option value="ALL">All Roles</option>
          {ROLE_OPTIONS.map(role => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <button onClick={applyFilters}>Apply</button>
        <button onClick={resetFilters} disabled={!hasFilters}>
          Reset
        </button>
      </div>

      {/* Chart */}
      {loading && <Spinner />}
      {!loading && error && <p>{error}</p>}
      {!loading && !error && total === 0 && <p>No Data Available 😢</p>}

      {!loading && !error && total > 0 && (
        <ResponsiveContainer width="100%" aspect={1}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius="60%"
              outerRadius="85%"
              onMouseEnter={(_, i) => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                  opacity={activeIndex == null || activeIndex === index ? 1 : 0.4}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontWeight: 700,
                fontSize: '1rem',
                fill: darkMode ? '#fff' : '#000',
              }}
            >
              {total}
            </text>
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
