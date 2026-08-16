import CustomTooltip from '../../CustomTooltip';
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
import styles from './TeamStatsBarChart.module.css';
import { useSelector } from 'react-redux';
import TeamStatsBarLabel from './TeamStatsBarLabel';

function renderTeamStatsBarLabel(data, totalValue) {
  function TeamStatsBarLabelContent(props) {
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
  }
  TeamStatsBarLabelContent.displayName = 'TeamStatsBarLabelContent';
  return TeamStatsBarLabelContent;
}

function createTeamStatsTooltipContent(yAxisLabel, darkMode) {
  function TeamStatsTooltipContent(props) {
    return <CustomTooltip {...props} yAxisLabel={yAxisLabel} darkMode={darkMode} />;
  }
  TeamStatsTooltipContent.displayName = 'TeamStatsTooltipContent';
  return TeamStatsTooltipContent;
}

function TeamStatsBarChart({ data, yAxisLabel }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const totalValue = data.reduce((acc, item) => acc + item.value, 0);
  // eslint-disable-next-line testing-library/render-result-naming-convention -- recharts LabelList content renderer
  const barLabelRenderer = renderTeamStatsBarLabel(data, totalValue);
  const tooltipContent = createTeamStatsTooltipContent(yAxisLabel, darkMode);

  return (
    <div className={styles.teamStatsBarChart}>
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
            className={styles.teamStatsYAxis}
            tick={{ fill: darkMode ? 'white' : '#666' }}
          />
          <Tooltip
            content={tooltipContent}
            cursor={{ fill: darkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)' }}
          />
          <Bar dataKey="value" fill="#1B6DDF">
            {data.map((_, index) => (
              <Cell key={`cell-${data[index].value}`} fill={data[index].color} />
            ))}
            <LabelList dataKey="value" position="right" content={barLabelRenderer} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TeamStatsBarChart;
