import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PieChart, Pie, Cell, ResponsiveContainer, LabelList } from 'recharts';
import { fetchExperienceBreakdown } from '../../actions/jobAnalytics/jobExperienceBreakdownActions';
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

export default function ExperienceDonutChart() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.jobExperienceBreakdown);
  const darkMode = useSelector(state => state.theme.darkMode);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState({
    startDate: '',
    endDate: '',
    roles: [],
  });

  const total = data?.reduce((sum, item) => sum + item.count, 0) || 0;

  const chartData = EXPERIENCE_LABELS.map((label, index) => {
    const found = data?.find(item => item.experience === label);
    return {
      name: label,
      value: found?.count || 0,
      color: SEGMENT_COLORS[index],
    };
  });

  const filteredChartData = chartData.filter(segment => segment.value > 0);

  const hasFilters = useMemo(
    () =>
      Boolean(appliedFilters.startDate || appliedFilters.endDate || appliedFilters.roles.length),
    [appliedFilters],
  );

  const fetchData = () => {
    const queryParams = new URLSearchParams();
    if (appliedFilters.startDate) queryParams.append('startDate', appliedFilters.startDate);
    if (appliedFilters.endDate) queryParams.append('endDate', appliedFilters.endDate);
    if (appliedFilters.roles.length) queryParams.append('roles', appliedFilters.roles.join(','));

    const token = localStorage.getItem('token');
    if (!token) return;

    dispatch(fetchExperienceBreakdown(queryParams.toString(), token));
  };

  useEffect(() => {
    fetchData();
  }, [appliedFilters]);

  useEffect(() => {
    const handleClickOutside = e => {
      if (!e.target.closest(`.${styles['multi-select-wrapper']}`)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyFilters = () => {
    setAppliedFilters({
      startDate,
      endDate,
      roles: selectedRoles,
    });
    setDropdownOpen(false);
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedRoles([]);
    setAppliedFilters({ startDate: '', endDate: '', roles: [] });
    setDropdownOpen(false);
  };

  const toggleRole = role => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role],
    );
  };

  const removeRole = role => {
    setSelectedRoles(prev => prev.filter(r => r !== role));
    setAppliedFilters(prev => ({
      ...prev,
      roles: prev.roles.filter(r => r !== role),
    }));
  };

  const renderOuterLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    value,
  }) => {
    if (value === 0) return null;

    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const percentValue = (percent * 100).toFixed(0);
    const labelText = `${EXPERIENCE_LABELS[index]} (${percentValue}%)`;

    return (
      <text
        x={x}
        y={y}
        fill={darkMode ? '#fff' : '#000'}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {labelText}
      </text>
    );
  };

  const renderInsideLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, index, value }) => {
    if (value === 0) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) / 2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={darkMode ? '#fff' : '#111010'}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight={600}
      >
        {value}
      </text>
    );
  };

  return (
    <div
      className={`${styles['experience-donut-chart']} ${
        darkMode ? styles['experience-donut-chart-dark-mode'] : ''
      }`}
    >
      <h2>Applicants by Experience</h2>

      {/* FILTERS ROW */}
      <div className={styles['filter-row']}>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className={styles['filter-input']}
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className={styles['filter-input']}
        />

        {/* Multi-select dropdown */}
        <div className={styles['multi-select-wrapper']}>
          <div
            className={styles['multi-select-input']}
            onClick={() => setDropdownOpen(prev => !prev)}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                setDropdownOpen(prev => !prev);
              }
            }}
          >
            <span className={selectedRoles.length === 0 ? styles['placeholder-text'] : ''}>
              {selectedRoles.length === 0 ? 'All Roles' : `${selectedRoles.length} selected`}
            </span>

            <span style={{ marginLeft: 'auto' }}>▾</span>
          </div>
          {dropdownOpen && (
            <div className={styles['multi-select-options']}>
              {ROLE_OPTIONS.map(role => (
                <div
                  key={role}
                  className={styles['multi-select-option']}
                  onClick={() => toggleRole(role)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleRole(role);
                    }
                  }}
                >
                  <input type="checkbox" readOnly checked={selectedRoles.includes(role)} />
                  <span>{role}</span>
                </div>
              ))}
            </div>
          )}
        </div>

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

      {/* DISPLAY SELECTED ROLES AS CHIPS */}
      {selectedRoles.length > 0 && (
        <div className={styles['selected-roles-container']}>
          {selectedRoles.map(role => (
            <div key={role} className={styles['role-chip']}>
              {role}
              <span
                className={styles['role-chip-close']}
                onClick={() => removeRole(role)}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    removeRole(role);
                  }
                }}
              >
                ×
              </span>
            </div>
          ))}
        </div>
      )}

      {/* CHART AND STATES */}
      {loading && <p>Loading...</p>}
      {!loading && error && <p>{error}</p>}
      {!loading && !error && total === 0 && <p>No Data Available</p>}

      {!loading && !error && total > 0 && (
        <div className={styles['chart-wrapper']}>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={filteredChartData}
                dataKey="value"
                nameKey="name"
                innerRadius={80}
                outerRadius={120}
                label={renderOuterLabel}
                labelLine={true}
              >
                {filteredChartData.map((entry, index) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="value"
                  position="inside"
                  formatter={value => (value > 0 ? value : '')}
                  fill={'#fff'}
                  fontSize={14}
                  fontWeight={700}
                />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
