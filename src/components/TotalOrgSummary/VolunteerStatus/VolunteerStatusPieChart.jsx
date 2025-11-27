import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart, ArcElement } from 'chart.js';
import styles from './VolunteerStatusPieChart.module.css';

Chart.register(ArcElement, ChartDataLabels);

function VolunteerStatusPieChart({
  data: { totalVolunteers, percentageChange, data: volunteerData },
  comparisonType,
}) {
  const chartData = {
    labels: volunteerData.map(item => item.label),
    datasets: [
      {
        data: volunteerData.map(item => item.value),
        backgroundColor: ['#4C4AF5', '#2CCCF8', '#FF00C3'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      datalabels: {
        color: '#000',
        font: {
          size: 16,
          weight: 'bold',
          lineHeight: 1.4,
        },
        formatter(value) {
          const percentage = (value / totalVolunteers) * 100;
          // Only show labels for slices >= 10%
          if (percentage < 10) return '';
          return `${value} (${percentage.toFixed(0)}%)`;
        },
        display: true,
        anchor: 'center',
        align: 'center',
        offset: 0,
        clamp: true,
      },
      legend: { display: false },
      tooltip: { enabled: false },
    },
    maintainAspectRatio: false,
    cutout: '65%',
  };

  const percentageChangeColor = percentageChange >= 0 ? 'green' : 'red';

  return (
    <section className={styles.volunteerStatusContainer} aria-label="Volunteer Status Overview">
      <div
        className={styles.volunteerStatusChart}
        role="img"
        aria-label="Volunteer Status Pie Chart"
      >
        <Doughnut data={chartData} options={options} />
        <div className={styles.volunteerStatusCenter}>
          <h2 className={styles.volunteerStatusHeading}>TOTAL VOLUNTEERS</h2>
          <p className={styles.volunteerCount}>{totalVolunteers}</p>
          {comparisonType !== 'No Comparison' && (
            <p
              className={styles.percentageChange}
              style={{ color: percentageChangeColor }}
              aria-label={`Percentage change: ${percentageChange}% ${comparisonType.toLowerCase()}`}
            >
              {percentageChange >= 0
                ? `+${percentageChange}% ${comparisonType.toUpperCase()}`
                : `${percentageChange}% ${comparisonType.toUpperCase()}`}
            </p>
          )}
        </div>
      </div>

      <div className={styles.volunteerStatusLabels}>
        {volunteerData.map((item, index) => {
          const percentage = ((item.value / totalVolunteers) * 100).toFixed(1);
          return (
            <div key={item.label} className={styles.volunteerStatusLabel}>
              <span
                className={styles.volunteerStatusColor}
                style={{
                  backgroundColor: chartData.datasets[0].backgroundColor[index],
                }}
                aria-hidden="true"
              />
              <span>{item.label}</span>
              <span className={styles.volunteerStatusValue}>
                {item.value} ({percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

VolunteerStatusPieChart.propTypes = {
  data: PropTypes.shape({
    totalVolunteers: PropTypes.number.isRequired,
    percentageChange: PropTypes.number.isRequired,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
      }),
    ).isRequired,
  }).isRequired,
  comparisonType: PropTypes.string.isRequired,
};

export default VolunteerStatusPieChart;
