import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js';
import { clsx } from 'clsx';
import externalLabelGuidesPlugin from '../VolunteerStatus/externalLabelGuidesPlugin';
import styles from './DonutChart.module.css';

Chart.register(ArcElement);

export const formatLegendLabel = ({ label, value }, totalCount) => {
  const percentage = Number.isFinite(totalCount) && totalCount > 0 ? (value / totalCount) * 100 : 0;
  return `${label}: ${value} (${percentage.toFixed(1)}%)`;
};

function DonutChart(props) {
  const { title, totalCount, percentageChange, data, colors, comparisonType, darkMode } = props;
  const labelTextColor = darkMode ? '#e2e8f0' : '#334155';
  const labelBoxBackground = darkMode ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.96)';
  const labelBoxBorder = darkMode ? 'rgba(148, 163, 184, 0.35)' : '#d0d0d0';
  const chartSliceBorder = darkMode ? '#1c2541' : '#ffffff';
  const titleLines = title === 'TOTAL BLUE SQUARES' ? ['TOTAL', 'BLUE SQUARES'] : [title];

  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: colors,
        borderColor: chartSliceBorder,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      datalabels: {
        display: false,
      },
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
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
        formatter: ({ value, percentage }) => [`${value}`, `(${percentage}%)`],
      },
    },
    maintainAspectRatio: false,
    cutout: '62%',
    layout: {
      padding: {
        top: 28,
        right: 80,
        bottom: 28,
        left: 80,
      },
    },
  };

  const percentageChangeColor = percentageChange >= 0 ? 'var(--success)' : 'var(--danger)';

  return (
    <div className={clsx(styles.donutContainer, darkMode && styles.donutContainerDark)}>
      <div className={styles.donutScrollable}>
        <div className={styles.donutChart}>
          <Doughnut data={chartData} options={options} plugins={[externalLabelGuidesPlugin]} />
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
              {totalCount}
            </h4>
            {comparisonType !== 'No Comparison' && (
              <h6
                className={styles.donutComparisonPercent}
                style={{ color: percentageChangeColor }}
              >
                {percentageChange >= 0
                  ? `+${(percentageChange * 100).toFixed(0)}% ${comparisonType.toUpperCase()}`
                  : `${(percentageChange * 100).toFixed(0)}% ${comparisonType.toUpperCase()}`}
              </h6>
            )}
          </div>
        </div>
        <div className={styles.donutLabels}>
          {data.map((item, index) => (
            <div key={item.label} className={styles.donutLabel}>
              <span
                className={styles.donutColor}
                style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
              />
              <span>{formatLegendLabel(item, totalCount)}</span>
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
  percentageChange: PropTypes.number.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    }),
  ).isRequired,
  colors: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  comparisonType: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
};

DonutChart.defaultProps = {
  darkMode: false,
};

export default DonutChart;
