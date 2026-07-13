import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js';
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
        borderWidth: 0,
        // Explicit gap between every slice via canvas clipping, rather than
        // relying on adjacent fill paths to butt up against each other
        // cleanly — thin adjacent wedges were leaving an anti-aliasing seam
        // at their shared edge without this.
        spacing: 2,
      },
    ],
  };

  const options = {
    plugins: {
      datalabels: {
        display: false, // chartjs-plugin-datalabels is registered globally by other
        // components (RatingDistribution, PRQualityGraph); explicitly disabling it
        // here prevents their global registration from drawing default labels on
        // this chart, since values/percentages are already shown in the legend below.
      },
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    maintainAspectRatio: false,
    cutout: '55%',
  };

  const percentageChangeColor = percentageChange >= 0 ? 'var(--success)' : 'var(--danger)';

  return (
    <div className={styles.donutContainer}>
      <div className={styles.donutScrollable}>
        <div className={styles.donutChart}>
          <Doughnut data={chartData} options={options} />
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
          {data.map((item, index) => {
            const percentage = totalCount ? ((item.value / totalCount) * 100).toFixed(0) : 0;
            return (
              <div key={item.label} className={styles.donutLabel}>
                <span
                  className={styles.donutColor}
                  style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
                />
                {item.label}: {item.value} ({percentage}%)
              </div>
            );
          })}
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
