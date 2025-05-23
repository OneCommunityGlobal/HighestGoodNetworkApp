import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  Label,
} from 'recharts';
import './TeamStatsBarChart.css';
import { useSelector } from 'react-redux';
import TeamStatsBarLabel from './TeamStatsBarLabel';

function TeamStatsBarChart({ data, yAxisLabel }) {
  const darkMode = useSelector(state => state.theme.darkMode);
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
        change={entry.change || 0}
        percentage={percentage}
      />
    );
  };

  return (
    <div className="team-stats-bar-chart">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 20, right: 150, left: 20, bottom: 20 }}
        >
          <XAxis type="number" tick={{ fill: darkMode ? 'white' : '#666' }}>
            <Label
              value="Total Volunteers"
              position="insideBottom"
              offset={-10}
              style={{
                fontWeight: 'bold',
                fill: darkMode ? 'white' : '#666',
                color: darkMode ? 'white' : '#666',
              }}
            />
          </XAxis>
          <YAxis
            type="category"
            dataKey={yAxisLabel}
            className="team-stats-y-axis"
            tick={{ fill: darkMode ? 'white' : '#666' }}
          />
          <Tooltip />
          <Bar dataKey="value" fill="#1B6DDF">
            {data.map((_, index) => (
              <Cell key={`cell-${data[index].value}`} fill={data[index].color} />
            ))}
            <LabelList dataKey="value" position="right" content={renderCustomLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TeamStatsBarChart;
