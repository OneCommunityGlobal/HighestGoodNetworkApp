import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);

  const [appliedFilters, setAppliedFilters] = useState({
    startDate: '',
    endDate: '',
    roles: [],
  });

  const [chartData, setChartData] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeIndex, setActiveIndex] = useState(null);
  const pieRef = useRef(null);

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
      // ✅ Generate dynamic dummy values based on filters
      const randomMultiplier =
        (appliedFilters.roles?.length || 1) +
        (appliedFilters.startDate ? 1 : 0) +
        (appliedFilters.endDate ? 1 : 0);

      const dummy = EXPERIENCE_LABELS.map((label, idx) => ({
        name: label,
        value: Math.floor(Math.random() * 50 * randomMultiplier) + 5, // 5 to 200-ish range
        color: SEGMENT_COLORS[idx % SEGMENT_COLORS.length],
      }));

      const filtered = dummy.filter(d => d.value > 0);
      const totalCount = filtered.reduce((sum, d) => sum + d.value, 0);

      setChartData(filtered);
      setTotal(totalCount);
    } catch {
      setError('Failed to load dummy data');
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

  const DetailsPanel = () => {
    if (!chartData || total === 0) return null;
    return (
      <div className="chart-details" aria-label="Breakdown details">
        {chartData.map((d, idx) => {
          const pct = ((d.value / total) * 100).toFixed(1);
          const isActive = activeIndex === idx;
          return (
            <div
              key={d.name}
              className={`detail-item ${isActive ? 'active' : ''}`}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
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

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const item = payload[0]?.payload;
    const pct = ((item.value / total) * 100).toFixed(1);
    return (
      <div className="custom-tooltip">
        <strong>{item.name}</strong>
        <br />
        Count: {item.value}
        <br />
        {pct}% of applicants
      </div>
    );
  };

  return (
    <div className={`experience-donut-chart ${darkMode ? 'experience-donut-chart-dark-mode' : ''}`}>
      <div className="experience-chart-container">
        <div className="chart-header">
          <h2 className="chart-title">Applicants by Experience</h2>
        </div>

        <section className="filter-section">
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
                multiple
                size={5}
                className="filter-select"
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

          <div className="filter-actions">
            <button className="btn primary" onClick={applyFilters}>
              Apply
            </button>
            <button className="btn ghost" onClick={resetFilters} disabled={!hasFilters}>
              Reset
            </button>
          </div>
        </section>

        <section className="chart-section">
          <div className="chart-area">
            {loading && <Spinner />}

            {!loading && !error && chartData && total > 0 && (
              <>
                <div className="chart-canvas">
                  <ResponsiveContainer width="100%" aspect={1}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        dataKey="value"
                        nameKey="name"
                        innerRadius="55%"
                        outerRadius="82%"
                        stroke={darkMode ? '#1c2441' : '#fff'}
                        strokeWidth={3}
                        onMouseEnter={(_, idx) => setActiveIndex(idx)}
                        onMouseLeave={() => setActiveIndex(null)}
                      >
                        {chartData.map((item, idx) => (
                          <Cell
                            key={item.name}
                            fill={item.color}
                            opacity={activeIndex == null || activeIndex === idx ? 1 : 0.45}
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

            {!loading && !error && (!chartData || total === 0) && <p>No Data Available</p>}

            {!loading && error && <p className="error-message">{error}</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
