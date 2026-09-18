import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js';
import styles from './StatusPieChart.module.css';
import externalLabelGuidesPlugin from './externalLabelGuidesPlugin';
import { buildStatusPieChartOptions, formatStatusPercentageChange } from './statusPieChartConfig';

Chart.register(ArcElement);

function StatusPieChart({
  ariaLabel,
  chartAriaLabel,
  chartDataAttr,
  titleLines,
  totalCount,
  percentageChange,
  comparisonType,
  sliceData,
  colors,
  darkMode = false,
  comparisonAriaPrefix = 'Percentage change',
}) {
  const chartData = {
    labels: sliceData.map(item => item.label),
    datasets: [
      {
        data: sliceData.map(item => item.value),
        backgroundColor: colors,
        borderWidth: 1,
      },
    ],
  };

  const options = buildStatusPieChartOptions(totalCount, darkMode);
  const percentageChangeColor = percentageChange >= 0 ? 'green' : 'red';

  return (
    <section className={styles.container} aria-label={ariaLabel}>
      <div
        className={styles.chart}
        data-chart={chartDataAttr}
        role="img"
        aria-label={chartAriaLabel}
      >
        <Doughnut data={chartData} options={options} plugins={[externalLabelGuidesPlugin]} />
        <div className={styles.center}>
          <h2 className={styles.heading}>
            {titleLines.map(line => (
              <span key={line} className={styles.headingLine}>
                {line}
              </span>
            ))}
          </h2>
          <p className={styles.count}>{totalCount}</p>
          {comparisonType !== 'No Comparison' && (
            <p
              style={{ color: percentageChangeColor }}
              aria-label={`${comparisonAriaPrefix}: ${percentageChange}% ${comparisonType.toLowerCase()}`}
            >
              {formatStatusPercentageChange(percentageChange, comparisonType)}
            </p>
          )}
        </div>
      </div>

      <div className={styles.labels}>
        {sliceData.map((item, index) => (
          <div key={item.label} className={styles.label}>
            <span
              className={styles.colorSwatch}
              style={{ backgroundColor: colors[index] }}
              aria-hidden="true"
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

StatusPieChart.propTypes = {
  ariaLabel: PropTypes.string.isRequired,
  chartAriaLabel: PropTypes.string.isRequired,
  chartDataAttr: PropTypes.string.isRequired,
  titleLines: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  totalCount: PropTypes.number.isRequired,
  percentageChange: PropTypes.number.isRequired,
  comparisonType: PropTypes.string.isRequired,
  sliceData: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    }),
  ).isRequired,
  colors: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  darkMode: PropTypes.bool,
  comparisonAriaPrefix: PropTypes.string,
};

export default StatusPieChart;
