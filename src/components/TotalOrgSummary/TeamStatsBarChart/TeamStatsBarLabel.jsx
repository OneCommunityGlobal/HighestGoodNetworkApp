function TeamStatsBarLabel({ x, y, width, height, value, change, percentage }) {
  return (
    <g>
      <text
        x={x + width + 30}
        y={y + height / 2 - 20}
        fill="#000"
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
        fill="#666"
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
        fill={change >= 0 ? 'green' : 'red'}
        fontSize="12"
        textAnchor="start"
        dominantBaseline="middle"
        className="team-stats-value"
      >
        {change >= 0 ? `+${change} volunteers` : `${change} volunteers`}
      </text>
    </g>
  );
}

export default TeamStatsBarLabel;
