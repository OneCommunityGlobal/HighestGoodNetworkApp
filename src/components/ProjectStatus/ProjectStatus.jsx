import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import styles from './ProjectStatus.module.css';
import { fetchProjectStatusSummary } from '../../services/projectStatusService';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

// custom center text plugin with dark mode support
const centerTextPlugin = {
  id: 'centerText',
  afterDraw(chart) {
    const { ctx } = chart;
    const { width, height } = chart;
    const isDarkMode = chart.options.plugins.centerText?.darkMode || false;

    ctx.save();
    ctx.font = '600 14px Inter, system-ui';
    ctx.fillStyle = isDarkMode ? '#ffffff' : '#222';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const total = chart.options.plugins.centerText?.total ?? 0;
    ctx.fillText('Total Projects', width / 2, height / 2 - 10);
    ctx.font = '700 18px Inter, system-ui';
    ctx.fillText(`${total}`, width / 2, height / 2 + 14);
    ctx.restore();
  },
};
ChartJS.register(centerTextPlugin);

const COLORS = {
  active: '#A78BFA',
  completed: '#5EEAD4',
  delayed: '#FB923C',
};

export default function ProjectStatus() {
  const darkMode = useSelector(state => state.theme?.darkMode || false);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [data, setData] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [dateError, setDateError] = useState('');

  // Secure token retrieval with error handling
  const getToken = () => {
    try {
      return localStorage.getItem('token') || null;
    } catch (e) {
      console.warn('Failed to retrieve token from localStorage:', e);
      return null;
    }
  };

  const load = async (opts = {}) => {
    setPending(true);
    setError('');
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
      const res = await fetchProjectStatusSummary({ ...opts, token });
      setData(res);
    } catch (e) {
      setError(e.message || 'Failed to load project status data');
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    load({});
  }, []);

  const chartData = useMemo(() => {
    return {
      labels: ['Active', 'Completed', 'Delayed'],
      datasets: [
        {
          data: [
            data?.activeProjects ?? 0,
            data?.completedProjects ?? 0,
            data?.delayedProjects ?? 0,
          ],
          backgroundColor: [COLORS.active, COLORS.completed, COLORS.delayed],
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    };
  }, [data]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      cutout: '65%',
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: darkMode ? '#e2e8f0' : '#ffffff',
          borderColor: darkMode ? '#475569' : 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          callbacks: {
            label: ctx => {
              const label = ctx.label || '';
              const value = ctx.formattedValue || '0';

              // use percentages from API
              const pctMap = data?.percentages || {};
              let pct = 0;
              if (ctx.dataIndex === 0) pct = pctMap.active;
              else if (ctx.dataIndex === 1) pct = pctMap.completed;
              else if (ctx.dataIndex === 2) pct = pctMap.delayed;

              return `${label}: ${value} (${pct?.toFixed(1) ?? 0}%)`;
            },
          },
        },
        title: {
          display: true,
          text: 'PROJECT STATUS',
          font: { size: 18, weight: '800' },
          color: darkMode ? '#ffffff' : '#000000',
        },
        centerText: {
          total: data?.totalProjects ?? 0,
          darkMode,
        },
      },
    }),
    [data, darkMode],
  );

  const onApply = () => {
    setDateError('');

    // Validate dates: end date cannot be before start date
    if (from && to && dayjs(to).isBefore(dayjs(from))) {
      setDateError('End date cannot be before start date. Please select a valid date range.');
      return;
    }

    load({ startDate: from, endDate: to });
  };

  return (
    <div className={`${styles.wrapper} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.leftSection}>
        {/* Header + Filters */}
        <div className={styles.header}>
          <div className={styles.title}>PROJECT STATUS</div>
          <div className={styles.controls}>
            <DatePicker
              selected={from}
              onChange={d => setFrom(d)}
              placeholderText="From Date"
              dateFormat="yyyy-MM-dd"
              isClearable
            />
            <DatePicker
              selected={to}
              onChange={d => setTo(d)}
              placeholderText="To Date"
              dateFormat="yyyy-MM-dd"
              isClearable
            />
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onApply}>
              Apply
            </button>
          </div>
        </div>

        {/* Date Validation Error */}
        {dateError && (
          <div className={styles.dateError}>
            <div className={styles.dateErrorText}>{dateError}</div>
          </div>
        )}

        {/* Loading State */}
        {pending && (
          <div className={styles.loading}>
            <div className={styles.loadingText}>Loading project status...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className={styles.error}>
            <div className={styles.errorText}>{error}</div>
            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => load({})}>
              Retry
            </button>
          </div>
        )}

        {/* Chart + Legend */}
        {!pending && !error && data && (
          <>
            <div className={styles.chartWrapper}>
              <Doughnut data={chartData} options={chartOptions} />
            </div>
            <div className={styles.legend}>
              <span className={styles.legendItem}>
                <span className={styles.swatch} style={{ background: COLORS.active }} />
                Active
              </span>
              <span className={styles.legendItem}>
                <span className={styles.swatch} style={{ background: COLORS.completed }} />
                Completed
              </span>
              <span className={styles.legendItem}>
                <span className={styles.swatch} style={{ background: COLORS.delayed }} />
                Delayed
              </span>
            </div>
            <div className={styles.total}>{dayjs().format('dddd, MMMM D, YYYY')}</div>
          </>
        )}
      </div>

      {/* Right stats panel */}
      <aside className={styles.panel}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>ACTIVE PROJECTS</span>
          <span className={styles.statValue}>{data?.activeProjects ?? 0}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>COMPLETED PROJECTS </span>
          <span className={styles.statValue}>{data?.completedProjects ?? 0}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>DELAYED PROJECTS</span>
          <span className={styles.statValue}>{data?.delayedProjects ?? 0}</span>
        </div>
      </aside>
    </div>
  );
}
