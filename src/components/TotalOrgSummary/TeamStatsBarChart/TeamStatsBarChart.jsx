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

const TeamStatsBarChart = ({ data, yAxisLabel }) => {
  return (
    <div className="team-stats-bar-chart">
      <h2 className="team-stats-title">Team Stats</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 20, right: 100, left: 20, bottom: 20 }}
        >
          <XAxis type="number" />
          <YAxis type="category" dataKey={yAxisLabel} />
          <Tooltip />
          <Bar dataKey="value" fill="#1B6DDF">
            <Cell fill="#1B6DDF" />
            <LabelList
              dataKey="value"
              position="right"
              content={props => {
                const { x, y, width, value, index } = props;
                const entry = data[index];
                return (
                  <g>
                    <text
                      x={x + width + 10}
                      y={y + 10}
                      fill="#000"
                      fontSize="12"
                      textAnchor="start"
                      className="team-stats-value"
                    >
                      {entry.value}
                    </text>
                    <text
                      x={x + width + 10}
                      y={y + 25}
                      fill="#666"
                      fontSize="12"
                      textAnchor="start"
                      className="team-stats-value"
                    >
                      {'('}
                      {(
                        (entry.value / data.reduce((acc, item) => acc + item.value, 0)) *
                        100
                      ).toFixed(2)}
                      %{')'}
                    </text>
                    <text
                      x={x + width + 10}
                      y={y + 40}
                      fill={entry.change >= 0 ? 'green' : 'red'}
                      fontSize="12"
                      textAnchor="start"
                      className="team-stats-value"
                    >
                      {entry.change >= 0
                        ? `+${entry.change} volunteers`
                        : `${entry.change} volunteers`}
                    </text>
                  </g>
                );
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

TeamStatsBarChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      change: PropTypes.number.isRequired,
    }),
  ).isRequired,
  yAxisLabel: PropTypes.string.isRequired,
};

export default TeamStatsBarChart;
