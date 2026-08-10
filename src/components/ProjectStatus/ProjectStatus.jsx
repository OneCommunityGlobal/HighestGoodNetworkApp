import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import styles from './ProjectStatus.module.css';
import { fetchProjectStatusSummary } from '../../services/projectStatusService';

ChartJS.register(ArcElement, Tooltip, Legend);

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
  const [hoverInfo, setHoverInfo] = useState(null);

  const load = async (opts = {}) => {
    setPending(true);
    setError('');
    try {
      const res = await fetchProjectStatusSummary(opts);
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

  // Chart.js's built-in tooltip anchors to the arc's mid-radius point and then
  // clamps itself to stay within the canvas, which on a doughnut keeps pulling
  // it back in toward the cutout hole. Rendering our own HTML tooltip (via the
  // `external` callback) instead lets us place it fully outside the ring, with
  // no canvas clamping to fight.
  const externalTooltipHandler = context => {
    const { chart, tooltip: tooltipModel } = context;

    if (!tooltipModel || tooltipModel.opacity === 0 || !tooltipModel.dataPoints?.length) {
      setHoverInfo(null);
      return;
    }

    const dp = tooltipModel.dataPoints[0];
    const el = chart.getDatasetMeta(dp.datasetIndex).data[dp.dataIndex];
    if (!el) {
      setHoverInfo(null);
      return;
    }

    const angle = (el.startAngle + el.endAngle) / 2;
    const gap = 14;
    const x = el.x + Math.cos(angle) * (el.outerRadius + gap);
    const y = el.y + Math.sin(angle) * (el.outerRadius + gap);

    // Anchor the box away from the point based on which side of the ring
    // it's on, so the box itself never overlaps the slice.
    const deg = (angle * 180) / Math.PI;
    let transform;
    if (deg >= -45 && deg <= 45) {
      transform = 'translate(10px, -50%)'; // right
    } else if (deg > 45 && deg <= 135) {
      transform = 'translate(-50%, 10px)'; // bottom
    } else if (deg > 135 || deg < -135) {
      transform = 'translate(calc(-100% - 10px), -50%)'; // left
    } else {
      transform = 'translate(-50%, calc(-100% - 10px))'; // top
    }

    const pctMap = data?.percentages || {};
    const keys = ['active', 'completed', 'delayed'];
    const pct = Number(pctMap[keys[dp.dataIndex]] ?? 0);

    setHoverInfo({
      x,
      y,
      transform,
      label: dp.label || '',
      value: dp.formattedValue || '0',
      pct: pct.toFixed(1),
      color: dp.dataset.backgroundColor[dp.dataIndex],
    });
  };

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      cutout: '65%',
      // The resting outer radius fills the canvas edge-to-edge with no margin, so
      // without this the hoverOffset (8px) push on hover clips the arc against the
      // canvas boundary on the left/right edges.
      layout: { padding: 8 },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: false,
          external: externalTooltipHandler,
        },
        title: { display: false },
        centerText: {
          total: data?.totalProjects ?? 0,
          darkMode,
        },
        // Explicitly disabled: OptStatusPieChart registers chartjs-plugin-datalabels
        // globally, which otherwise leaks into this chart and draws unwanted value
        // labels on the donut segments.
        datalabels: { display: false },
        // OptStatusPieChart also globally registers a custom 'leaderLines' plugin
        // (ctx.stroke from every arc's outer edge) with no per-chart opt-out inside
        // its own code, so it silently draws on every other chart too, including
        // this one. Chart.js skips a plugin's hooks entirely when its options key is
        // literally `false` (not `{ display: false }`), which is the only way to
        // opt this chart out short of editing OptStatusPieChart itself.
        leaderLines: false,
      },
    }),
    [data, darkMode],
  );

  const hasData = (data?.totalProjects ?? 0) > 0;

  const onApply = () => {
    setDateError('');

    const today = dayjs().endOf('day');
    if (from && dayjs(from).isAfter(today)) {
      setDateError('From date cannot be in the future.');
      return;
    }
    if (to && dayjs(to).isAfter(today)) {
      setDateError('To date cannot be in the future.');
      return;
    }

    // Validate dates: end date cannot be before start date
    if (from && to && dayjs(to).isBefore(dayjs(from))) {
      setDateError('End date cannot be before start date. Please select a valid date range.');
      return;
    }

    load({ startDate: from, endDate: to });
  };

  const onReset = () => {
    setFrom(null);
    setTo(null);
    setDateError('');
    load({});
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
              maxDate={new Date()}
              isClearable
            />
            <DatePicker
              selected={to}
              onChange={d => setTo(d)}
              placeholderText="To Date"
              dateFormat="yyyy-MM-dd"
              maxDate={new Date()}
              isClearable
            />
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={onApply}
            >
              Apply
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={onReset}
            >
              Reset
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
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={() => load({})}
            >
              Retry
            </button>
          </div>
        )}

        {/* Chart + Legend */}
        {!pending && !error && data && (
          <>
            {hasData ? (
              <>
                <div className={styles.chartWrapper}>
                  <Doughnut data={chartData} options={chartOptions} />
                  {hoverInfo && (
                    <div
                      className={styles.customTooltip}
                      style={{
                        transform: `translate(${hoverInfo.x}px, ${hoverInfo.y}px) ${hoverInfo.transform}`,
                      }}
                    >
                      <div className={styles.tooltipTitle}>{hoverInfo.label}</div>
                      <div>
                        <span
                          className={styles.tooltipSwatch}
                          style={{ background: hoverInfo.color }}
                        />
                        {hoverInfo.value} ({hoverInfo.pct}%)
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.legend}>
                  <span className={styles.legendItem}>
                    <span className={styles.swatch} style={{ background: COLORS.active }} />
                    <span>Active</span>
                  </span>
                  <span className={styles.legendItem}>
                    <span className={styles.swatch} style={{ background: COLORS.completed }} />
                    <span>Completed</span>
                  </span>
                  <span className={styles.legendItem}>
                    <span className={styles.swatch} style={{ background: COLORS.delayed }} />
                    <span>Delayed</span>
                  </span>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateText}>
                  No project data available for the selected date range.
                </div>
              </div>
            )}
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
