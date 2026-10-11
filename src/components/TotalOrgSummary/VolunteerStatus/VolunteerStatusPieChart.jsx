import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js';
import styles from './VolunteerStatusPieChart.module.css';
import externalLabelGuidesPlugin from './externalLabelGuidesPlugin';

Chart.register(ArcElement);

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
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    layout: {
      padding: {
        top: 36,
        bottom: 36,
        left: 48,
        right: 48,
      },
    },
    plugins: {
      datalabels: {
        display: false,
      },
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
      externalLabelGuides: {
        offset: 16,
        horizontalSpread: 28,
        horizontalSpreadMap: { 0: 28, 1: 36, 2: 8 },
        verticalOffsetMap: { 0: 30, 1: -20, 2: -40 },
        sideMap: { 0: 1, 1: -1, 2: 1 },
        total: totalVolunteers,
        formatter: ({ value, percentage }) => [`${value}`, `(${percentage}%)`],
      },
    },
  };

  const percentageChangeColor = percentageChange >= 0 ? 'green' : 'red';

  return (
    <section className={styles.volunteerStatusContainer} aria-label="Volunteer Status Overview">
      <div
        className={styles.volunteerStatusChart}
        data-chart="volunteer-status"
        role="img"
        aria-label="Volunteer Status Pie Chart"
      >
        <Doughnut data={chartData} options={options} plugins={[externalLabelGuidesPlugin]} />
        <div className={styles.volunteerStatusCenter}>
          <span className={styles.volunteerStatusHeading}>TOTAL VOLUNTEERS*</span>
          <span className={styles.volunteerCount}>{totalVolunteers}</span>
          {comparisonType && comparisonType !== 'No Comparison' && (
            <span
              className={styles.comparisonText}
              style={{ color: percentageChangeColor }}
              aria-label={`Percentage change: ${percentageChange}% ${comparisonType.toLowerCase()}`}
            >
              {percentageChange >= 0
                ? `+${percentageChange}% ${comparisonType.toUpperCase()}`
                : `${percentageChange}% ${comparisonType.toUpperCase()}`}
            </span>
          )}
        </div>
      </div>

      <div className={styles.volunteerStatusLabels}>
        {volunteerData.map((item, index) => (
          <div key={item.label} className={styles.volunteerStatusLabel}>
            <span
              className={styles.volunteerStatusColor}
              style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
              aria-hidden="true"
            />
            <span>{item.label}</span>
          </div>
        ))}
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
