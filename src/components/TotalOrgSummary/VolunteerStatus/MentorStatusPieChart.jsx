import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js';
import styles from './MentorStatusPieChart.module.css';
import externalLabelGuidesPlugin from './externalLabelGuidesPlugin';

Chart.register(ArcElement);

function MentorStatusPieChart({
  data: { totalMentors, percentageChange, data: mentorData },
  comparisonType,
  darkMode = false,
}) {
  const labelTextColor = darkMode ? '#ffffff' : '#4f4f4f';
  const labelBoxBackground = darkMode ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.95)';
  const labelBoxBorder = darkMode ? 'rgba(255, 255, 255, 0.45)' : '#d0d0d0';

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
      centerText: false,
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
        total: totalMentors,
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
    <section className={styles.mentorStatusContainer} aria-label="Mentor Status Overview">
      <div
        className={styles.mentorStatusChart}
        data-chart="mentor-status"
        role="img"
        aria-label="Mentor Status Pie Chart"
      >
        <Doughnut data={chartData} options={options} plugins={[externalLabelGuidesPlugin]} />
        <div className={styles.mentorStatusCenter}>
          <h2 className={styles.mentorStatusHeading}>
            <span className={styles.mentorStatusHeadingLine}>TOTAL</span>
            <span className={styles.mentorStatusHeadingLine}>MENTORS</span>
          </h2>
          <p className={styles.mentorCount}>{totalMentors}</p>
          {comparisonType !== 'No Comparison' && (
            <p
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
  darkMode: PropTypes.bool,
};

export default MentorStatusPieChart;
