// ...existing code...
import CustomTooltip from '../CustomTooltip';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  ReferenceLine,
} from 'recharts';

export default function TinyBarChart(props) {
  const {
    chartData,
    maxY,
    tickInterval,
    renderCustomizedLabel,
    darkMode,
    projectBarInfo,
    yAxisLabel,
  } = props;

  return (
    <ResponsiveContainer width="100%" height="100%" maxHeight={400} minWidth={180} minHeight={340}>
      <BarChart
        data={chartData}
        margin={{
          top: 50,
          bottom: 40,
          left: 40,
          right: 20,
        }}
      >
        <XAxis dataKey="name" stroke={darkMode ? 'white' : 'gray'} />
        <YAxis
          stroke={darkMode ? 'white' : 'gray'}
          domain={[0, maxY]}
          axisLine
          tickLine
          tickCount={Math.floor(maxY / tickInterval) + 1}
          interval={0}
          label={{
            value: yAxisLabel,
            angle: -90,
            position: 'insideLeft',
            offset: 5,
            fill: darkMode ? 'white' : '#444',
            fontSize: 12,
            fontWeight: 'bold',
            style: { textAnchor: 'middle' },
          }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
        <Bar dataKey="amount" fill="#8884d8">
          {chartData.map((entry, index) => (
            <Cell key={`cell-${entry.name}-${entry.amount}`} fill={entry.color[index]} />
          ))}
          <LabelList dataKey="amount" content={renderCustomizedLabel} />
        </Bar>
        {projectBarInfo && (
          <ReferenceLine
            y={projectBarInfo.amount}
            stroke={darkMode ? 'lightgreen' : 'green'}
            strokeDasharray="6 6"
            ifOverflow="extendDomain"
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
