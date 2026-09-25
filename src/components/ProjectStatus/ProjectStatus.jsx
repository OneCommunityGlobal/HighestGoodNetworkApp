import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import styles from './ProjectStatus.module.css';
import { fetchProjectStatusSummary } from '../../services/projectStatusService';

// Register only core elements globally
ChartJS.register(ArcElement, Tooltip, Legend);

// Center text plugin scoped specifically to this chart
const centerTextPlugin = {
  id: 'centerText',
  afterDraw(chart) {
    if (chart.options.plugins?.centerText === false) return;

    const pluginOpts = chart.options.plugins?.centerText;
    const { ctx, width, height } = chart;
    const isDarkMode = pluginOpts?.darkMode || false;
    const total = pluginOpts?.total ?? 0;

    ctx.save();
    ctx.font = '600 14px Inter, system-ui';
    ctx.fillStyle = isDarkMode ? '#ffffff' : '#222';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Total Projects', width / 2, height / 2 - 10);

    ctx.font = '700 18px Inter, system-ui';
    ctx.fillText(`${total}`, width / 2, height / 2 + 14);
    ctx.restore();
  },
};

const COLORS = {
  active: '#A78BFA',
  completed: '#5EEAD4',
  delayed: '#FB923C',
};

const getTooltipTransform = deg => {
  if (deg >= -45 && deg <= 45) {
    return 'translate(10px, -50%)';
  }
  if (deg > 45 && deg <= 135) {
    return 'translate(-50%, 10px)';
  }
  if (deg > 135 || deg < -135) {
    return 'translate(calc(-100% - 10px), -50%)';
  }
  return 'translate(-50%, calc(-100% - 10px))';
};

const getTooltipBoxBounds = (deg, estW, estH) => {
  let left = -estW / 2;
  let right = estW / 2;
  let top = -estH / 2;
  let bottom = estH / 2;

  if (deg > 135 || deg < -135) {
    left = -10 - estW;
    right = -10;
  } else if (deg >= -45 && deg <= 45) {
    left = 10;
    right = 10 + estW;
  }

  if (deg > 45 && deg <= 135) {
    top = 10;
    bottom = 10 + estH;
  } else if (deg < -45 && deg > -135) {
    top = -10 - estH;
    bottom = -10;
  }

  return { left, right, top, bottom };
};

const clampTooltipCoordinates = (initialX, initialY, box, margin = 8) => {
  let x = initialX;
  let y = initialY;

  if (x + box.left < margin) {
    x += margin - (x + box.left);
  } else if (x + box.right > window.innerWidth - margin) {
    x -= x + box.right - (window.innerWidth - margin);
  }

  if (y + box.top < margin) {
    y += margin - (y + box.top);
  } else if (y + box.bottom > window.innerHeight - margin) {
    y -= y + box.bottom - (window.innerHeight - margin);
  }

  return { x, y };
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
    const canvasRect = chart.canvas.getBoundingClientRect();
    const rawX = canvasRect.left + el.x + Math.cos(angle) * (el.outerRadius + gap);
    const rawY = canvasRect.top + el.y + Math.sin(angle) * (el.outerRadius + gap);

    const deg = (angle * 180) / Math.PI;
    const EST_W = 180;
    const EST_H = 64;

    const transform = getTooltipTransform(deg);
    const box = getTooltipBoxBounds(deg, EST_W, EST_H);
    const { x, y } = clampTooltipCoordinates(rawX, rawY, box);

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
      layout: { padding: 12 },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: false,
          external: externalTooltipHandler,
        },
        title: { display: false },
        centerText: {
          display: true,
          total: data?.totalProjects ?? 0,
          darkMode,
        },
        datalabels: { display: false },
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
        {!pending && !error && !dateError && data && (
          <>
            {hasData ? (
              <>
                <div className={styles.chartWrapper}>
                  <Doughnut data={chartData} options={chartOptions} plugins={[centerTextPlugin]} />
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
      {!dateError && (
        <aside className={styles.panel}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>ACTIVE PROJECTS</span>
            <span className={styles.statValue}>{data?.activeProjects ?? 0}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>COMPLETED PROJECTS</span>
            <span className={styles.statValue}>{data?.completedProjects ?? 0}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>DELAYED PROJECTS</span>
            <span className={styles.statValue}>{data?.delayedProjects ?? 0}</span>
          </div>
        </aside>
      )}
    </div>
  );
}