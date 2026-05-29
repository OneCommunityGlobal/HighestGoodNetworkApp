import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js';
import externalLabelGuidesPlugin from '../VolunteerStatus/externalLabelGuidesPlugin';
import styles from './DonutChart.module.css';

Chart.register(ArcElement);

function DonutChart(props) {
  const { title, totalCount, percentageChange, data, colors, comparisonType, darkMode } = props;

  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: colors,
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
        offset: 28,
        horizontalSpread: 44,
        horizontalSpreadMap: { 0: 44, 1: 52, 2: 60, 3: 52, 4: 44 },
        verticalOffsetMap: { 0: -58, 1: -28, 2: 6, 3: 40, 4: 70 },
        sideMap: { 0: -1, 1: -1, 2: -1, 3: -1, 4: -1 },
        allowSideMapOverride: true,
        total: totalCount,
        formatter: ({ value, percentage }) => [`${value}`, `(${percentage}%)`],
      },
    },
    maintainAspectRatio: false,
    cutout: '55%',
    layout: {
      padding: 56,
    },
  };

  const percentageChangeColor = percentageChange >= 0 ? 'var(--success)' : 'var(--danger)';

  return (
    <div className={styles.donutContainer}>
      <div className={styles.donutScrollable}>
        <div className={styles.donutChart}>
          <Doughnut data={chartData} options={options} plugins={[externalLabelGuidesPlugin]} />
          <div className={styles.donutCenter}>
            <h5 className="donut-heading" style={{ color: darkMode ? 'white' : 'black' }}>
              {title}
            </h5>
            <h4 className="donut-count">{totalCount}</h4>
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
              <span>{item.label}</span>
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
};

export default DonutChart;
