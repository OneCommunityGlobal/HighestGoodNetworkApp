import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './ExperienceDonutChart.css';

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

function Spinner() {
  return (
    <div className="spinner-container" role="status" aria-live="polite" aria-busy="true">
      <div className="spinner" />
      <p>Loading…</p>
    </div>
  );
}

export default function ExperienceDonutChart() {
  // filters (unapplied)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);

  // applied filters
  const [appliedFilters, setAppliedFilters] = useState({ startDate: '', endDate: '', roles: [] });

  const [chartData, setChartData] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // hover/active
  const [activeIndex, setActiveIndex] = useState(null);
  const pieRef = useRef(null);

  const darkMode = useSelector(state => state.theme.darkMode);

  const baseURL =
    import.meta?.env?.VITE_API_BASE_URL ||
    process.env?.REACT_APP_API_BASE_URL ||
    'http://localhost:4500';

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

      const params = {};
      if (appliedFilters.startDate) params.startDate = appliedFilters.startDate;
      if (appliedFilters.endDate) params.endDate = appliedFilters.endDate;
      if (appliedFilters.roles?.length) params.roles = appliedFilters.roles.join(',');

      const res = await axios.get(`${baseURL}/api/experience-breakdown`, {
        headers: { Authorization: token },
        params,
      });

      const data = Array.isArray(res.data) ? res.data : [];
      // normalize & order by labels
      const normalized = EXPERIENCE_LABELS.map((label, i) => {
        const found = data.find(d => (d.experience ?? d.Experience ?? d.name) === label);
        const count = found ? Number(found.count ?? found.value ?? 0) : 0;
        return { name: label, value: count, color: SEGMENT_COLORS[i % SEGMENT_COLORS.length] };
      });

      const filtered = normalized.filter(d => d.value > 0);
      const totalCount = filtered.reduce((s, d) => s + d.value, 0);

      setChartData(filtered.length ? filtered : null);
      setTotal(totalCount);
    } catch (e) {
      console.error(e);
      setChartData(null);
      setTotal(0);
      setError(e?.response?.data?.message || e?.message || 'Error fetching data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters.startDate, appliedFilters.endDate, JSON.stringify(appliedFilters.roles)]);

  // handlers
  const onRolesChange = e => {
    const next = Array.from(e.target.selectedOptions, o => o.value);
    setSelectedRoles(next);
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

  // Always-visible details
  const DetailsPanel = () => {
    if (!chartData || total === 0) return null;
    return (
      <div className="chart-details" aria-label="Breakdown details">
        {chartData.map((d, idx) => {
          const pct = total ? ((d.value / total) * 100).toFixed(1) : '0.0';
          const isActive = activeIndex === idx;
          return (
            <div
              key={d.name}
              className={`detail-item ${isActive ? 'active' : ''}`}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
              role="listitem"
            >
              <span className="detail-dot" style={{ backgroundColor: d.color }} />
              <span className="detail-name">{d.name}</span>
              <span className="detail-sep">•</span>
              <span className="detail-count">{d.value.toLocaleString()}</span>
              <span className="detail-sub">applicants</span>
              <span className="detail-pct">{pct}%</span>
            </div>
          );
        })}
      </div>
    );
  };

  // custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    const pct = total ? ((d.value / total) * 100).toFixed(1) : '0.0';
    return (
      <div className="custom-tooltip" role="dialog" aria-live="polite">
        <p className="tooltip-content">
          <strong>{d.name}</strong>
          <br />
          Count: {d.value.toLocaleString()}
          <br />
          Percentage: {pct}%
        </p>
      </div>
    );
  };

  return (
    <div className={`experience-donut-chart ${darkMode ? 'experience-donut-chart-dark-mode' : ''}`}>
      <div className="experience-chart-container">
        <div className="chart-header">
          <h2 className="chart-title">Applicants by Experience</h2>
        </div>

        <section className="filter-section" aria-label="Filters">
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="startDate" className="filter-label">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                className="filter-input"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                max={endDate || undefined}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="endDate" className="filter-label">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                className="filter-input"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                min={startDate || undefined}
              />
            </div>

            <div className="filter-group">
              <label htmlFor="roles" className="filter-label">
                Roles
              </label>
              <select
                id="roles"
                className="filter-select"
                multiple
                size={5}
                aria-describedby="roles-hint"
                value={selectedRoles}
                onChange={onRolesChange}
              >
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Junior Developer">Junior Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
              </select>
              <small id="roles-hint" className="filter-hint">
                Hold Ctrl/Cmd to select multiple
              </small>
            </div>
          </div>

          <div className="filter-actions">
            <button
              type="button"
              className="btn primary"
              onClick={applyFilters}
              aria-label="Apply filters"
            >
              Apply
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={resetFilters}
              aria-label="Reset filters"
              disabled={!hasFilters && !startDate && !endDate && selectedRoles.length === 0}
            >
              Reset
            </button>
          </div>
        </section>

        <section className="chart-section">
          <div className="chart-area">
            {loading && <Spinner />}

            {!loading && error && (
              <div className="error-container" role="alert">
                <p className="error-message">{error}</p>
              </div>
            )}

            {!loading && !error && (!chartData || total === 0) && (
              <div className="no-data-container">
                <p className="no-data-message">No Data Available</p>
                <p className="no-data-subtitle">Try adjusting your filters and click Apply.</p>
              </div>
            )}

            {!loading && !error && chartData && total > 0 && (
              <>
                <div className="chart-canvas">
                  <ResponsiveContainer width="100%" aspect={1} minWidth={240}>
                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        dataKey="value"
                        nameKey="name"
                        innerRadius="55%"
                        outerRadius="82%"
                        paddingAngle={1.5}
                        stroke={darkMode ? '#1c2441' : '#fff'}
                        strokeWidth={3}
                        onMouseEnter={(_, idx) => setActiveIndex(idx)}
                        onMouseLeave={() => setActiveIndex(null)}
                        onClick={(_, idx) => setActiveIndex(activeIndex === idx ? null : idx)}
                      >
                        {chartData.map((d, i) => (
                          <Cell
                            key={d.name}
                            className="pie-cell"
                            fill={d.color}
                            opacity={activeIndex == null || activeIndex === i ? 1 : 0.45}
                          />
                        ))}
                        <text
                          x="50%"
                          y="50%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          style={{
                            fontWeight: 800,
                            fontSize: '1rem',
                            fill: darkMode ? '#f8fafc' : '#0f172a',
                          }}
                        >
                          {total.toLocaleString()}
                        </text>
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <DetailsPanel />
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
