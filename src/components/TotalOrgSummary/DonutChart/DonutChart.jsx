import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { clsx } from 'clsx';
import externalLabelGuidesPlugin from '../VolunteerStatus/externalLabelGuidesPlugin';
import styles from './DonutChart.module.css';

Chart.register(ArcElement, Tooltip, ChartDataLabels);

// ─── Chart size constants (matches Role Distribution footprint) ────────────
export const DONUT_CHART_HEIGHT = 430;
export const DONUT_CHART_MIN_WIDTH = 500;

// With 500×430 canvas, padding 60px on each side:
//   Drawing area height = 430 − 120 = 310 px → outer radius ≈ 155 px
//   cutout 50 % → hole radius ≈ 77.5 px → hole diameter ≈ 155 px
//   CENTER_SIZE must be < 155 px so the white circle stays inside the hole.
const CHART_PADDING = 60;
export const CENTER_SIZE_PX = 120; // px — safe inside ~155 px hole

// ─── Pure helpers (exported for unit tests) ──────────────────────────────
const calcPct = (value, total) => (Number.isFinite(total) && total > 0 ? (value / total) * 100 : 0);

export const formatLegendLabel = ({ label, value }, total) =>
  `${label}: ${value} (${calcPct(value, total).toFixed(1)}%)`;

export const formatCalloutLines = (value, total) => [
  `${value}`,
  `(${calcPct(value, total).toFixed(1)}%)`,
];

export const resolveDisplayTotalCount = (totalCount, data) => {
  const sum = data.reduce((acc, item) => acc + (item.value ?? 0), 0);
  return sum > 0 ? sum : Number.isFinite(totalCount) ? totalCount : 0;
};

export const buildChartItems = (data, colors) =>
  data.map((item, i) => ({ ...item, color: colors[i] })).filter(item => item.value > 0);

export const buildDonutTooltipOptions = (total, darkMode) => ({
  enabled: false,
  backgroundColor: darkMode ? '#222' : '#fff',
  titleColor: darkMode ? '#fff' : '#222',
  bodyColor: darkMode ? '#90cdf4' : '#444',
  borderColor: '#ccc',
  borderWidth: 1,
  cornerRadius: 6,
  padding: 10,
  displayColors: false,
  callbacks: {
    title: items => items?.[0]?.label || '',
    label: ctx => {
      const count = Number.isFinite(ctx.raw) ? ctx.raw : 0;
      return [`Count: ${count}`, `Percentage: ${calcPct(count, total).toFixed(1)}%`];
    },
  },
});

export const buildExternalLabelGuidesOptions = (total, darkMode) => ({
  display: true,
  placement: 'outside',
  hideOverlappingLabels: true,
  total,
  minPercentageForLabel: 2,
  formatter: ({ value }) => formatCalloutLines(value, total),
  fontSize: 13,
  lineHeight: 16,
  outsideGap: 10,
  minimumLabelSpacing: 8,
  containmentPadding: 6,
  connectorRadialOffset: 8,
  markerRadius: 0,
  lineColor: darkMode ? '#cbd5e1' : '#6b7280',
  backgroundColor: 'transparent',
  borderWidth: 0,
  padding: { x: 2, y: 2 },
});

// ─── Component ────────────────────────────────────────────────────────────
function DonutChart({
  title,
  totalCount,
  percentageChange,
  data,
  colors,
  comparisonType,
  darkMode,
}) {
  const displayTotal = resolveDisplayTotalCount(totalCount, data);
  const chartItems = buildChartItems(data, colors);
  const legendItems = data.map((item, i) => ({ ...item, color: colors[i] }));
  const titleLines = title === 'TOTAL BLUE SQUARES' ? ['TOTAL', 'BLUE SQUARES'] : [title];

  const chartData = {
    labels: chartItems.map(item => item.label),
    datasets: [
      {
        data: chartItems.map(item => item.value),
        backgroundColor: chartItems.map(item => item.color),
        borderWidth: 0,
        spacing: chartItems.length > 1 ? 2 : 0,
      },
    ],
  };

  const options = useMemo(
    () => ({
      plugins: {
        datalabels: { display: false },
        legend: { display: false },
        title: { display: false },
        subtitle: { display: false },
        tooltip: buildDonutTooltipOptions(displayTotal, darkMode),
        externalLabelGuides:
          chartItems.length > 0
            ? buildExternalLabelGuidesOptions(displayTotal, darkMode)
            : { display: false },
      },
      events: [],
      maintainAspectRatio: false,
      cutout: '50%',
      layout: { padding: CHART_PADDING },
    }),
    [displayTotal, darkMode, chartItems.length],
  );

  const pctChangeColor = percentageChange >= 0 ? 'var(--success)' : 'var(--danger)';

  return (
    <div className={clsx(styles.donutContainer, darkMode && styles.donutContainerDark)}>
      {/* Chart area — horizontally scrollable on narrow screens */}
      <div className={styles.donutScroller}>
        <div className={styles.donutChartArea}>
          <div className={styles.donutChart}>
            <Doughnut
              data={chartData}
              options={options}
              plugins={[ChartDataLabels, externalLabelGuidesPlugin]}
            />

            {/* Center label — sized in px so it always fits inside the hole */}
            <div className={styles.donutCenter}>
              <p className={clsx(styles.donutHeading, darkMode && styles.donutHeadingDark)}>
                {titleLines.map(line => (
                  <span key={line} className={styles.donutHeadingLine}>
                    {line}
                  </span>
                ))}
              </p>
              <p className={clsx(styles.donutCount, darkMode && styles.donutCountDark)}>
                {displayTotal}
              </p>
              {comparisonType && comparisonType !== 'No Comparison' && percentageChange !== 0 && (
                <p className={styles.donutComparisonPercent} style={{ color: pctChangeColor }}>
                  {percentageChange > 0
                    ? `+${(percentageChange * 100).toFixed(0)}%`
                    : `${(percentageChange * 100).toFixed(0)}%`}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <ul className={styles.donutLabels}>
        {legendItems.map(item => (
          <li
            key={item.label}
            className={clsx(styles.donutLabel, item.value === 0 && styles.donutLabelMuted)}
          >
            <span className={styles.donutColor} style={{ backgroundColor: item.color }} />
            <span className={styles.donutLabelText}>{formatLegendLabel(item, displayTotal)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

DonutChart.propTypes = {
  title: PropTypes.string.isRequired,
  totalCount: PropTypes.number.isRequired,
  percentageChange: PropTypes.number.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string.isRequired, value: PropTypes.number.isRequired }),
  ).isRequired,
  colors: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  comparisonType: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
};

DonutChart.defaultProps = { darkMode: false };

export default DonutChart;
