import { useSelector } from 'react-redux';

function TeamStatsBarLabel({ x, y, width, height, value, change, percentage }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  let changeColor;
  if (change >= 0) {
    changeColor = darkMode ? 'lightgreen' : 'green';
  } else {
    changeColor = 'red';
  }
  return (
    <g>
      <text
        x={x + width + 30}
        y={y + height / 2 - 20}
        fill={darkMode ? 'white' : '#000'}
        fontSize="12"
        textAnchor="start"
        dominantBaseline="middle"
        className="team-stats-value"
      >
        {value}
      </text>
      <text
        x={x + width + 20}
        y={y + height / 2}
        fill={darkMode ? 'white' : '#666'}
        fontSize="12"
        textAnchor="start"
        dominantBaseline="middle"
        className="team-stats-value"
      >
        {`(${percentage}%)`}
      </text>
      <text
        x={x + width + 10}
        y={y + height / 2 + 20}
        fill={changeColor}
        fontSize="12"
        textAnchor="start"
        dominantBaseline="middle"
        className="team-stats-value"
      >
        {change >= 0 ? `+${change} volunteers` : `-${change} volunteers`}
      </text>
    </g>
  );
}

export default TeamStatsBarLabel;
