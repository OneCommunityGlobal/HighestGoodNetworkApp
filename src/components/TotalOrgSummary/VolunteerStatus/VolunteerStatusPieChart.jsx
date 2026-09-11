import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js';
import { useSelector } from 'react-redux';
import styles from './VolunteerStatusPieChart.module.css';
import externalLabelGuidesPlugin from './externalLabelGuidesPlugin';

Chart.register(ArcElement);

function VolunteerStatusPieChart({
  data: { totalVolunteers, percentageChange, data: volunteerData },
  comparisonType,
}) {
  const darkMode = useSelector(state => state?.theme?.darkMode);
  // Debug: Log the data used for the chart
  // console.log('VolunteerStatusPieChart data:', { volunteerData, totalVolunteers });
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
        // Hide in-slice labels because values are already shown with external guides.
        display: false,
      },
      legend: {
        display: false,
      },
      // Value + percentage are already shown permanently via externalLabelGuides;
      // the native hover tooltip only duplicates them and renders on top, overlapping.
      tooltip: {
        enabled: false,
      },
      externalLabelGuides: {
        offset: 20,
        horizontalSpread: 34,
        horizontalSpreadMap: { 0: 34, 1: 48, 2: 5 },
        verticalOffsetMap: { 0: 38, 1: -22, 2: -50 },
        sideMap: { 0: 1, 1: -1, 2: 1 },
        total: totalVolunteers,
        formatter: ({ value, percentage }) => [`${value}`, `(${percentage}%)`],
        // Callout boxes are canvas-drawn, so they don't pick up the page's dark-mode
        // CSS automatically — the plugin's own white-box default was low-contrast/
        // visually inconsistent against the dark theme.
        backgroundColor: darkMode ? 'rgba(35,35,40,0.95)' : 'rgba(255, 255, 255, 0.95)',
        lineColor: darkMode ? '#e6e6e6' : '#4f4f4f',
        borderColor: darkMode ? '#5a5a5a' : '#d0d0d0',
      },
    },
    maintainAspectRatio: false,
    // The comparison line adds a 3rd row of center text; shrinking fonts alone
    // couldn't reliably fit that inside a fixed-size hole, so widen the hole
    // itself when it's showing instead.
    cutout: comparisonType !== 'No Comparison' ? '65%' : '55%',
    layout: {
      padding: 24,
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
        <div
          className={`${styles.volunteerStatusCenter} ${
            comparisonType !== 'No Comparison' ? styles.hasComparison : ''
          }`}
        >
          <h2 className={styles.volunteerStatusHeading}>TOTAL VOLUNTEERS*</h2>
          <p className={styles.volunteerCount}>{totalVolunteers}</p>
          {comparisonType !== 'No Comparison' && (
            <p
              className={styles.volunteerPercentageChange}
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
};

export default VolunteerStatusPieChart;
