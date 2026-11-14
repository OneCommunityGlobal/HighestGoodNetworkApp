import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import { fetchProjectStatusSummary } from '../../../services/projectStatusService';
import styles from './ProjectStatusDonutChart.module.css';
import PropTypes from 'prop-types';
import {
  readStatusDates,
  STATUS_END_PARAM,
  STATUS_START_PARAM,
  updateDashboardQuery,
} from '../dashboardQuery';

const COLORS = ['#B39DDB', '#80DEEA', '#FFABAB'];

function CustomTooltip({ active, payload, darkMode }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  const total = payload[0]?.payload?.total || 0;
  const pct = total ? Number(((value / total) * 100).toFixed(1)) : 0;

  return (
    <div
      className={styles.tooltip}
      style={
        darkMode
          ? { backgroundColor: '#1b2a41', color: '#fff', border: '1px solid #4a6a8a' }
          : { backgroundColor: '#fff', color: '#333', border: '1px solid #d1d5db' }
      }
    >
      <p className={styles.tooltipName}>{name}</p>
      <p className={styles.tooltipValue}>
        Count: <strong>{value}</strong>
      </p>
      <p className={styles.tooltipValue}>
        Share: <strong>{pct}%</strong>
      </p>
    </div>
  );
}
CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.number,
      payload: PropTypes.shape({
        total: PropTypes.number,
      }),
    }),
  ),
  darkMode: PropTypes.bool,
};

CustomTooltip.defaultProps = {
  active: false,
  payload: [],
  darkMode: false,
};

export default function ProjectStatusDonutChart() {
  const darkMode = useSelector(state => state.theme?.darkMode || false);
  const history = useHistory();
  const { search } = useLocation();
  const { start: appliedStart, end: appliedEnd } = readStatusDates(search);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const [startDate, setStartDate] = useState(appliedStart);
  const [endDate, setEndDate] = useState(appliedEnd);
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    let active = true;
    setStartDate(appliedStart);
    setEndDate(appliedEnd);
    setDateError('');
    const fetchStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchProjectStatusSummary({
          startDate: appliedStart || undefined,
          endDate: appliedEnd || undefined,
        });
        if (active) setStatusData(data);
      } catch (err) {
        if (active) setError('Unable to load project status.');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchStatus();
    return () => {
      active = false;
    };
  }, [appliedStart, appliedEnd, retryCount]);

  const applyDates = () => {
    const params = new URLSearchParams();
    if (startDate) params.set(STATUS_START_PARAM, startDate);
    if (endDate) params.set(STATUS_END_PARAM, endDate);
    const parsed = readStatusDates(params.toString());
    if (parsed.start !== startDate || parsed.end !== endDate) {
      setDateError('Enter valid dates with the start date on or before the end date.');
      return;
    }
    setDateError('');
    if (startDate === appliedStart && endDate === appliedEnd) {
      if (error) setRetryCount(count => count + 1);
      return;
    }
    updateDashboardQuery(history, {
      [STATUS_START_PARAM]: startDate ? [startDate] : [],
      [STATUS_END_PARAM]: endDate ? [endDate] : [],
    });
  };

  if (loading) return <p>Loading project status...</p>;
  const total = statusData
    ? statusData.activeProjects + statusData.completedProjects + statusData.delayedProjects
    : 0;
  const pieData = [
    { name: 'Active Projects', value: statusData?.activeProjects, total },
    { name: 'Completed Projects', value: statusData?.completedProjects, total },
    { name: 'Delayed Projects', value: statusData?.delayedProjects, total },
  ];

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const allZero =
    statusData &&
    !statusData.activeProjects &&
    !statusData.completedProjects &&
    !statusData.delayedProjects;

  return (
    <div className={`${styles.container} ${darkMode ? styles.dark : ''}`}>
      <h2 className={styles.title}>PROJECT STATUS</h2>

      <div className={styles.filterRow}>
        <input
          type="date"
          aria-label="Project status start date"
          value={startDate}
          max={endDate || undefined}
          onChange={e => setStartDate(e.target.value)}
        />

        <input
          type="date"
          aria-label="Project status end date"
          value={endDate}
          min={startDate || undefined}
          onChange={e => setEndDate(e.target.value)}
        />

        <button type="button" onClick={applyDates} className={styles.applyBtn}>
          Apply
        </button>
      </div>
      {dateError && <p role="alert">{dateError}</p>}
      {error ? (
        <p role="alert">{error}</p>
      ) : !statusData ? (
        <p>No data available.</p>
      ) : allZero ? (
        <p className={styles.noDataMessage}>No project status data available.</p>
      ) : (
        <div className={styles.chartWrapper}>
          {/* Only draw the ring if at least one status has data */}
          {!allZero && (
            <ResponsiveContainer width="100%" aspect={1}>
              <PieChart margin={{ top: 10, right: 10, bottom: 40, left: 10 }}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="85%"
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                  <Label
                    position="center"
                    content={({ viewBox }) => {
                      const { cx, cy } = viewBox;
                      return (
                        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
                          <tspan x={cx} dy="-10" className={styles.centerLabel}>
                            Total Projects
                          </tspan>
                          <tspan x={cx} dy="24" className={styles.centerValue}>
                            {statusData.totalProjects}
                          </tspan>
                        </text>
                      );
                    }}
                  />
                </Pie>

                <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
                <Legend verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          )}

          <div className={styles.summaryBox}>
            <h3>{today}</h3>

            <p className={styles.label}>ACTIVE PROJECTS</p>
            <span className={styles.value}>{statusData.activeProjects}</span>

            <p className={styles.label}>COMPLETED PROJECTS</p>
            <span className={styles.value}>{statusData.completedProjects}</span>

            <p className={styles.label}>DELAYED PROJECTS</p>
            <span className={styles.value}>{statusData.delayedProjects}</span>
          </div>
        </div>
      )}
    </div>
  );
}
