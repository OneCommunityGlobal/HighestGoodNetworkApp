import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import getJobAnalyticsData from './api';
import styles from './jobAnalytics.module.css';

function JobAnalytics() {
  const { darkMode } = useSelector(state => state.theme);

  // Date range (new)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Role filter
  const [selectedRole, setSelectedRole] = useState('all');
  const rawData = getJobAnalyticsData();

  // Roles list for the dropdown (includes "all")
  const roles = useMemo(() => {
    const r = Array.from(new Set(rawData.map(r => r.role))).sort((a, b) => a.localeCompare(b));
    return ['all', ...r];
  }, [rawData]);

  const invalidRange = useMemo(() => {
    if (startDate && endDate) return new Date(startDate) > new Date(endDate);
    return false;
  }, [startDate, endDate]);

  const { chartData, maxApplications } = useMemo(() => {
    let filtered = [...rawData];

    // Date range filter (range-first)
    if (startDate || endDate) {
      const start = startDate ? new Date(`${startDate}T00:00:00`) : new Date('1970-01-01T00:00:00');
      const end = endDate ? new Date(`${endDate}T23:59:59`) : new Date();
      filtered = filtered.filter(row => {
        const d = new Date(row.timestamp);
        return d >= start && d <= end;
      });
    }

    // Role filter
    if (selectedRole !== 'all') {
      filtered = filtered.filter(row => row.role === selectedRole);
    }

    // Group counts per role
    const counts = new Map();
    for (const row of filtered) {
      counts.set(row.role, (counts.get(row.role) || 0) + 1);
    }

    // Build rows and sort least -> most popular
    const rows = Array.from(counts.entries())
      .map(([role, applications]) => ({ role, applications }))
      .sort((a, b) => a.applications - b.applications);

    const max = rows.length ? Math.max(...rows.map(r => r.applications)) : 0;
    return { chartData: rows, maxApplications: max };
  }, [rawData, startDate, endDate, selectedRole]);

  const showingCount = chartData.length;
  const least = showingCount ? chartData[0] : null;
  const most = showingCount ? chartData[chartData.length - 1] : null;

  const ticks = useMemo(() => {
    const m = maxApplications || 0;
    if (m === 0) return [0];

    // Choose a base step aiming for ~4 intervals, but round to friendly numbers
    let base = Math.ceil(m / 4);
    // If base is at least 5, snap it to nearest multiple of 5 for nicer ticks
    if (base >= 5) {
      base = Math.max(5, Math.round(base / 5) * 5);
    }

    // Build ticks from 0 up to the next multiple of base that covers m
    const maxTick = Math.ceil(m / base) * base;
    const ticksOut = [];
    for (let v = 0; v <= maxTick; v += base) ticksOut.push(v);
    return ticksOut;
  }, [maxApplications]);

  return (
    <div className={`${styles.ja} ${darkMode ? styles.dark : ''}`} style={{ minHeight: '105vh' }}>
      <div className={styles.jaMain}>
        {/* Left: Chart card */}
        <section className={styles.jaCard}>
          <h2 className={styles.jaTitle}>Least popular roles</h2>

          {invalidRange && (
            <div className={styles.jaWarning} role="alert">
              Start date cannot be after end date.
            </div>
          )}

          {showingCount ? (
            <>
              <div className={styles.jaChart}>
                <div className={styles.jaGrid} aria-hidden="true" />
                <div className={styles.jaBars}>
                  {chartData.map(row => {
                    const pct =
                      maxApplications > 0
                        ? Math.max(2, (row.applications / maxApplications) * 100)
                        : 0;
                    return (
                      <div className={styles.jaRow} key={row.role}>
                        <div className={styles.jaLabel} title={row.role}>
                          {row.role}
                        </div>
                        <div className={styles.jaTrack}>
                          <div className={styles.jaBar} style={{ width: `${pct}%` }}>
                            <span className={styles.jaValue}>{row.applications}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={styles.jaXaxis}>
                {ticks.map(t => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className={styles.jaXaxisLabel}>Applications</div>
            </>
          ) : (
            <div className={styles.jaNoData}>No data for the selected filters.</div>
          )}

          <div className={styles.jaFooter}>
            <div>
              <strong>Showing:</strong> {showingCount} role(s)
            </div>
            <div>
              <strong>Least Popular:</strong>{' '}
              {least ? `${least.role} (${least.applications} applications)` : '—'}
            </div>
            <div>
              <strong>Most Popular:</strong>{' '}
              {most ? `${most.role} (${most.applications} applications)` : '—'}
            </div>
          </div>
        </section>

        {/* Right: Filters */}
        <aside className={styles.jaFilters}>
          <div className={styles.jaFilter}>
            <div className={styles.jaFilterLabel}>Dates</div>
            <div className={styles.jaDateRange}>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                aria-label="Start date"
              />
              <span className={styles.jaDateDash}>–</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                aria-label="End date"
              />
              {(startDate || endDate) && (
                <button
                  type="button"
                  className={styles.jaClear}
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className={styles.jaFilter}>
            <div className={styles.jaFilterLabel}>Role</div>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              aria-label="Filter by role"
            >
              {roles.map(role => (
                <option key={role} value={role}>
                  {role === 'all' ? 'ALL' : role}
                </option>
              ))}
            </select>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default JobAnalytics;
