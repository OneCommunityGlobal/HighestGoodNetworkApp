import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js';
import styles from './MentorStatusPieChart.module.css';
import externalLabelGuidesPlugin from './externalLabelGuidesPlugin';

Chart.register(ArcElement);

function MentorStatusPieChart({
  data: { totalMentors, percentageChange, data: mentorData },
  comparisonType,
}) {
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
      },
    },
    maintainAspectRatio: false,
    cutout: '60%',
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
        <div className={styles.mentorStatusCenter}>
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
