import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js';
import { useSelector } from 'react-redux';
import styles from './MentorStatusPieChart.module.css';
import externalLabelGuidesPlugin from './externalLabelGuidesPlugin';

Chart.register(ArcElement);

function MentorStatusPieChart({
  data: { totalMentors, percentageChange, data: mentorData },
  comparisonType,
}) {
  const darkMode = useSelector(state => state?.theme?.darkMode);
  const chartData = {
    labels: mentorData.map(item => item.label),
    datasets: [
      {
        data: mentorData.map(item => item.value),
        backgroundColor: ['#287D5A', '#2D9DA6', '#F26B38'],
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
      // Value + percentage are already shown permanently via externalLabelGuides;
      // the native hover tooltip only duplicates them and renders on top, overlapping.
      tooltip: {
        enabled: false,
      },
      externalLabelGuides: {
        offset: 20,
        horizontalSpread: 32,
        horizontalSpreadMap: { 0: 32, 1: 46, 2: 5 },
        verticalOffsetMap: { 0: 34, 1: -20, 2: -46 },
        sideMap: { 0: 1, 1: -1, 2: 1 },
        total: totalMentors,
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
    cutout: comparisonType !== 'No Comparison' ? '70%' : '60%',
    layout: {
      padding: 20,
    },
  };

  const percentageChangeColor = percentageChange >= 0 ? 'green' : 'red';

  return (
    <section className={styles.mentorStatusContainer} aria-label="Mentor Status Overview">
      <div
        className={styles.mentorStatusChart}
        data-chart="mentor-status"
        role="img"
        aria-label="Mentor Status Pie Chart"
      >
        <Doughnut data={chartData} options={options} plugins={[externalLabelGuidesPlugin]} />
        <div
          className={`${styles.mentorStatusCenter} ${
            comparisonType !== 'No Comparison' ? styles.hasComparison : ''
          }`}
        >
          <h2 className={styles.mentorStatusHeading}>TOTAL MENTORS</h2>
          <p className={styles.mentorCount}>{totalMentors}</p>
          {comparisonType !== 'No Comparison' && (
            <p
              className={styles.mentorPercentageChange}
              style={{ color: percentageChangeColor }}
              aria-label={`Mentor percentage change: ${percentageChange}% ${comparisonType.toLowerCase()}`}
            >
              {percentageChange >= 0
                ? `+${percentageChange}% ${comparisonType.toUpperCase()}`
                : `${percentageChange}% ${comparisonType.toUpperCase()}`}
            </p>
          )}
        </div>
      </div>
      <div className={styles.mentorStatusLabels}>
        {mentorData.map((item, index) => (
          <div key={item.label} className={styles.mentorStatusLabel}>
            <span
              className={styles.mentorStatusColor}
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

MentorStatusPieChart.propTypes = {
  data: PropTypes.shape({
    totalMentors: PropTypes.number.isRequired,
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

export default MentorStatusPieChart;
