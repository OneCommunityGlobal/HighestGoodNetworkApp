import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js';
import styles from './VolunteerStatusPieChart.module.css';
import externalLabelGuidesPlugin from './externalLabelGuidesPlugin';

Chart.register(ArcElement);

function VolunteerStatusPieChart({
  data: { totalVolunteers, percentageChange, data: volunteerData },
  comparisonType,
  darkMode = false,
}) {
  // Debug: Log the data used for the chart
  // console.log('VolunteerStatusPieChart data:', { volunteerData, totalVolunteers });
  const labelTextColor = darkMode ? '#ffffff' : '#4f4f4f';
  const labelBoxBackground = darkMode ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.95)';
  const labelBoxBorder = darkMode ? 'rgba(255, 255, 255, 0.45)' : '#d0d0d0';

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
      centerText: false,
      datalabels: {
        // Hide in-slice labels because values are already shown with external guides.
        display: false,
      },
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
      externalLabelGuides: {
        placement: 'outside',
        outsideGap: 10,
        minimumLabelSpacing: 6,
        connectorRadialOffset: 6,
        containmentPadding: 4,
        fontSize: 12,
        lineHeight: 14,
        padding: { x: 6, y: 4 },
        lineColor: labelTextColor,
        backgroundColor: labelBoxBackground,
        borderColor: labelBoxBorder,
        total: totalVolunteers,
        formatter: ({ value, percentage }) => [`${value}`, `(${percentage}%)`],
      },
    },
    maintainAspectRatio: false,
    cutout: '62%',
    layout: {
      padding: {
        top: 22,
        right: 58,
        bottom: 22,
        left: 58,
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
          <h2 className={styles.volunteerStatusHeading}>
            <span className={styles.volunteerStatusHeadingLine}>TOTAL</span>
            <span className={styles.volunteerStatusHeadingLine}>VOLUNTEERS*</span>
          </h2>
          <p className={styles.volunteerCount}>{totalVolunteers}</p>
          {comparisonType !== 'No Comparison' && (
            <p
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
  darkMode: PropTypes.bool,
};

export default VolunteerStatusPieChart;
