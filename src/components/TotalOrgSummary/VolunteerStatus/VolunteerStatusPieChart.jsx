import PropTypes from 'prop-types';
import StatusPieChart from './StatusPieChart';

const VOLUNTEER_COLORS = ['#4C4AF5', '#2CCCF8', '#FF00C3'];

function VolunteerStatusPieChart({
  data: { totalVolunteers, percentageChange, data: volunteerData },
  comparisonType,
  darkMode = false,
}) {
  return (
    <StatusPieChart
      ariaLabel="Volunteer Status Overview"
      chartAriaLabel="Volunteer Status Pie Chart"
      chartDataAttr="volunteer-status"
      titleLines={['TOTAL', 'VOLUNTEERS*']}
      totalCount={totalVolunteers}
      percentageChange={percentageChange}
      comparisonType={comparisonType}
      sliceData={volunteerData}
      colors={VOLUNTEER_COLORS}
      darkMode={darkMode}
    />
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
