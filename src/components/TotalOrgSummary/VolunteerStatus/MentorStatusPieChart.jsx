import PropTypes from 'prop-types';
import StatusPieChart from './StatusPieChart';

const MENTOR_COLORS = ['#287D5A', '#2D9DA6', '#F26B38'];

function MentorStatusPieChart({
  data: { totalMentors, percentageChange, data: mentorData },
  comparisonType,
  darkMode = false,
}) {
  return (
    <StatusPieChart
      ariaLabel="Mentor Status Overview"
      chartAriaLabel="Mentor Status Pie Chart"
      chartDataAttr="mentor-status"
      titleLines={['TOTAL', 'MENTORS']}
      totalCount={totalMentors}
      percentageChange={percentageChange}
      comparisonType={comparisonType}
      sliceData={mentorData}
      colors={MENTOR_COLORS}
      darkMode={darkMode}
      comparisonAriaPrefix="Mentor percentage change"
    />
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
