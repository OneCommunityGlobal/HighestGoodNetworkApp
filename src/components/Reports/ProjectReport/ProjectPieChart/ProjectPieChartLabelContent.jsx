import PropTypes from 'prop-types';

function ProjectPieChartLabelContent({ cx, cy, value, index, viewBox, userData, darkMode }) {
  const entry = userData[index];
  const midAngle = (viewBox.startAngle + viewBox.endAngle) / 2;
  const RADIAN = Math.PI / 180;
  const x = cx + (viewBox.outerRadius + 90) * Math.cos(-RADIAN * midAngle);
  const y = cy + (viewBox.outerRadius + 10) * Math.sin(-RADIAN * midAngle);
  const percentLabel = (value * 100 / entry.totalHoursCalculated).toFixed(2);

  return (
    <text x={x} y={y} fill={darkMode ? 'white' : '#333'} textAnchor="middle">
      {`${entry.name.substring(0, 14)} ${entry.lastName.substring(0, 1)} ${value.toFixed(2)}Hrs (${percentLabel}%)`}
    </text>
  );
}

ProjectPieChartLabelContent.propTypes = {
  cx: PropTypes.number.isRequired,
  cy: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
  viewBox: PropTypes.shape({
    startAngle: PropTypes.number,
    endAngle: PropTypes.number,
    outerRadius: PropTypes.number,
  }).isRequired,
  userData: PropTypes.arrayOf(PropTypes.object).isRequired,
  darkMode: PropTypes.bool,
};

ProjectPieChartLabelContent.defaultProps = {
  darkMode: false,
};

export default ProjectPieChartLabelContent;
