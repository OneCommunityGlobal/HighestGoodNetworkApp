import { useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import styles from './ProjectStatus.module.css';
import { fetchProjectStatusSummary } from '../../services/projectStatusService';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

// custom center text
const centerTextPlugin = {
  id: 'centerText',
  afterDraw(chart) {
    const { ctx } = chart;
    const { width, height } = chart;
    ctx.save();
    ctx.font = '600 14px Inter, system-ui';
    ctx.fillStyle = '#222';
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
  const token = localStorage.getItem('token') || null;

  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [data, setData] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const load = async (opts = {}) => {
    setPending(true);
    setError('');
    try {
      const res = await fetchProjectStatusSummary({ ...opts, token });
      setData(res);
    } catch (e) {
      setError(e.message || 'Failed to load');
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
        },
        centerText: {
          total: data?.totalProjects ?? 0,
        },
      },
    }),
    [data],
  );

  const onApply = () => {
    load({ startDate: from, endDate: to });
  };

  return (
    <div className={styles.wrapper}>
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

        {/* Chart + Legend */}
        {!pending && !error && (
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
