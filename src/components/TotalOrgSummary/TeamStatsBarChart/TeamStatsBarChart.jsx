import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import './TeamStatsBarChart.css';
import TeamStatsBarLabel from './TeamStatsBarLabel';

function TeamStatsBarChart({ data, yAxisLabel, overallTeamStats }) {
  const totalValue = data.reduce((acc, item) => acc + item.value, 0);
  const renderCustomLabel = props => {
    const { x, y, width, height, index } = props;
    const entry = data[index];
    const percentage = ((entry.value / totalValue) * 100).toFixed(2);

    return (
      <TeamStatsBarLabel
        x={x}
        y={y}
        width={width}
        height={height}
        value={entry.value}
        change={entry.change}
        percentage={percentage}
      />
    );
  };

  return (
    <div className="team-stats-bar-chart">
      <h2 className="team-stats-title">Team Stats</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 20, right: 150, left: 20, bottom: 20 }}
        >
          <XAxis type="number" />
          <YAxis type="category" dataKey={yAxisLabel} />
          <Tooltip />
          <Bar dataKey="value" fill="#1B6DDF">
            {data.map((_, index) => (
              <Cell key={`cell-${data[index].value}`} fill={data[index].color} />
            ))}
            <LabelList dataKey="value" position="right" content={renderCustomLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="team-stats-bar-chart-summary">
        <span>
          {overallTeamStats.totalTeams} teams with {overallTeamStats.totalMembers}+ members
        </span>
      </div>
    </div>
  );
}

TeamStatsBarChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      change: PropTypes.number.isRequired,
      color: PropTypes.string.isRequired,
    }),
  ).isRequired,
  yAxisLabel: PropTypes.string.isRequired,
  overallTeamStats: PropTypes.shape({
    totalTeams: PropTypes.number.isRequired,
    totalMembers: PropTypes.number.isRequired,
  }),
};

export default TeamStatsBarChart;
