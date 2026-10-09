import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { clsx } from 'clsx';
import externalLabelGuidesPlugin from '../VolunteerStatus/externalLabelGuidesPlugin';
import styles from './DonutChart.module.css';

Chart.register(ArcElement, Tooltip, Legend);

const calculatePercentage = (value, totalCount) =>
  Number.isFinite(totalCount) && totalCount > 0 ? (value / totalCount) * 100 : 0;

// One format for slice labels, legend and tooltip so they never disagree
// (a label used to round 8 of 2,573 to "0%" while the legend said "0.3%").
export const formatPercent = (value, totalCount) => {
  const pct = calculatePercentage(value, totalCount);
  // e.g. 1 of 2,708 is 0.04%: show "<0.1%" rather than a misleading "0.0%"
  if (value > 0 && pct < 0.05) return '<0.1%';
  return `${pct.toFixed(1)}%`;
};

// "1 volunteer", "2 volunteers"
const withUnit = (value, unitLabel) => {
  if (!unitLabel) return `${value}`;
  return `${value} ${value === 1 ? unitLabel.replace(/s$/, '') : unitLabel}`;
};

export const formatLegendLabel = ({ label, value }, totalCount, unitLabel = '') =>
  `${label}: ${withUnit(value, unitLabel)} (${formatPercent(value, totalCount)})`;

// The backend sends "No Comparison Data" (a string) when the previous period was 0.
export const formatComparison = (percentageChange, comparisonType) => {
  const type = comparisonType.toUpperCase();
  const change = Number(percentageChange);
  if (percentageChange === null || percentageChange === '' || !Number.isFinite(change)) {
    return `N/A ${type}`;
  }
  const pct = (change * 100).toFixed(0);
  return `${change >= 0 ? '+' : ''}${pct}% ${type}`;
};

// Publishes the doughnut's real hole diameter as --donut-hole on the chart wrapper,
// so the centre text can size itself to fit instead of spilling under the ring
// when the chart is narrow (e.g. Volunteers and Mentors side by side at ~1470px).
// Read after the update, from the controller: during layout (and while an arc is
// animating in) the radius is still 0, which collapsed the centre to one
// character per line.
export const holeSizePlugin = {
  id: 'donutHoleSize',
  afterUpdate(chart) {
    const innerRadius = chart.getDatasetMeta(0)?.controller?.innerRadius;
    const wrapper = chart.canvas?.parentNode;
    if (!wrapper || !(innerRadius > 0)) return;
    wrapper.style.setProperty('--donut-hole', `${innerRadius * 2}px`);
  },
};

export const buildDonutTooltipOptions = (totalCount, darkMode, unitLabel = '') => ({
  enabled: true,
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
    label: context => {
      const count = Number.isFinite(context.raw) ? context.raw : 0;
      return [
        `Count: ${withUnit(count, unitLabel)}`,
        `Percentage: ${formatPercent(count, totalCount)}`,
      ];
    },
  },
});

function DonutChart(props) {
  const {
    title,
    totalCount,
    percentageChange,
    data,
    colors,
    comparisonType,
    darkMode,
    minLabelPercent,
    centerCount,
    unitLabel,
    emptyMessage,
  } = props;
  const labelTextColor = darkMode ? '#e2e8f0' : '#334155';
  const labelBoxBackground = darkMode ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.96)';
  const labelBoxBorder = darkMode ? 'rgba(148, 163, 184, 0.35)' : '#d0d0d0';
  const titleLines = title.startsWith('TOTAL ') ? ['TOTAL', title.slice(6)] : [title];

  const withColors = data.map((item, i) => ({ item, color: colors[i] }));
  // Slivers under 0.05% are not drawn, but every non-zero item stays in the legend.
  const legendItems = withColors.filter(({ item }) => item.value > 0);
  const filtered = withColors.filter(({ item }) => (item.value / totalCount) * 100 >= 0.05);
  const filteredData = filtered.map(({ item }) => item);
  const filteredColors = filtered.map(({ color }) => color);

  if (!filteredData.length) {
    return (
      <div className={styles.donutContainer}>
        <div className={styles.donutNoData}>
          <div className={styles.noDataText}>{emptyMessage}</div>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: filteredData.map(item => item.label),
    datasets: [
      {
        data: filteredData.map(item => item.value),
        backgroundColor: filteredColors,
        borderWidth: 0,
        spacing: 2,
      },
    ],
  };

  const options = {
    plugins: {
      datalabels: { display: false },
      legend: { display: false },
      tooltip: buildDonutTooltipOptions(totalCount, darkMode, unitLabel),
      externalLabelGuides: {
        placement: 'outside',
        outsideGap: 12,
        minimumLabelSpacing: 8,
        connectorRadialOffset: 8,
        containmentPadding: 4,
        fontSize: 14,
        lineHeight: 16,
        padding: { x: 8, y: 5 },
        total: totalCount,
        lineColor: labelTextColor,
        backgroundColor: labelBoxBackground,
        borderColor: labelBoxBorder,
        formatter: ({ value }) =>
          calculatePercentage(value, totalCount) < minLabelPercent
            ? null
            : [`${value}`, `(${formatPercent(value, totalCount)})`],
      },
    },
    interaction: {
      mode: 'nearest',
      intersect: true,
    },
    maintainAspectRatio: false,
    cutout: comparisonType !== 'No Comparison' ? '70%' : '62%',
    layout: {
      padding: {
        top: 28,
        right: 80,
        bottom: 28,
        left: 80,
      },
    },
    onHover: (event, elements) => {
      const target = event?.native?.target;
      if (!target) return;
      target.style.cursor = elements && elements.length ? 'pointer' : 'default';
    },
  };

  const comparisonText =
    comparisonType !== 'No Comparison' ? formatComparison(percentageChange, comparisonType) : null;
  let percentageChangeColor = 'var(--success)';
  if (comparisonText?.startsWith('N/A')) percentageChangeColor = undefined;
  else if (Number(percentageChange) < 0) percentageChangeColor = 'var(--danger)';

  return (
    <div className={clsx(styles.donutContainer, darkMode && styles.donutContainerDark)}>
      <div className={styles.donutScrollable}>
        <div className={styles.donutChart}>
          <Doughnut
            data={chartData}
            options={options}
            plugins={[externalLabelGuidesPlugin, holeSizePlugin]}
          />
          <div className={styles.donutCenter}>
            <h5
              className={clsx(
                'donut-heading',
                styles.donutHeading,
                darkMode && styles.donutHeadingDark,
              )}
            >
              {titleLines.map(line => (
                <span key={line} className={styles.donutHeadingLine}>
                  {line}
                </span>
              ))}
            </h5>
            <h4
              className={clsx('donut-count', styles.donutCount, darkMode && styles.donutCountDark)}
            >
              {centerCount ?? totalCount}
            </h4>
            {comparisonText && (
              <h6
                className={styles.donutComparisonPercent}
                style={{ color: percentageChangeColor }}
              >
                {comparisonText}
              </h6>
            )}
          </div>
        </div>

        <div className={styles.donutLabels}>
          {legendItems.map(({ item, color }) => (
            <div key={item.label} className={styles.donutLabel}>
              <span className={styles.donutColor} style={{ backgroundColor: color }} />
              <span>{formatLegendLabel(item, totalCount, unitLabel)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

DonutChart.propTypes = {
  title: PropTypes.string.isRequired,
  totalCount: PropTypes.number.isRequired,
  // number, or the backend's "No Comparison Data" string (shown as N/A)
  percentageChange: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    }),
  ).isRequired,
  colors: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  comparisonType: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
  minLabelPercent: PropTypes.number,
  // number shown in the centre when it differs from the slice total (e.g. total hours)
  centerCount: PropTypes.number,
  // unit appended to legend/tooltip counts, e.g. "volunteers"
  unitLabel: PropTypes.string,
  emptyMessage: PropTypes.string,
};

DonutChart.defaultProps = {
  darkMode: false,
  percentageChange: null,
  minLabelPercent: 0,
  centerCount: undefined,
  unitLabel: '',
  emptyMessage: 'No data available yet',
};

export default DonutChart;
