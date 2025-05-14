import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';

export default function TinyBarChart(props) {
  const { chartData, maxY, tickInterval, renderCustomizedLabel, darkMode } = props;

  // Guard tick count
  const safeTickCount =
    tickInterval && Number.isFinite(maxY / tickInterval)
      ? Math.floor(maxY / tickInterval) + 1
      : 5;

  return (
    <ResponsiveContainer maxWidth={600} maxHeight={600} minWidth={180} minHeight={320}>
      <BarChart
        data={chartData}
        margin={{
          top: 30,
          bottom: 20
        }}
      >
        <XAxis dataKey="name" stroke={darkMode ? 'white' : 'gray'} />
        <YAxis
          stroke={darkMode ? 'white' : 'gray'}
          domain={[0, Number.isFinite(maxY) ? maxY : 1]}
          axisLine={false}
          tickLine={false}
          tickCount={safeTickCount}
          interval={0}
        />
        <Tooltip cursor={{ fill: 'transparent' }} />
        <Bar dataKey="amount" fill="#8884d8">
          {chartData.map((entry) => (
            <Cell key={`cell-${entry.name}`} fill={entry.color || '#8884d8'} />
          ))}
          <LabelList dataKey="amount" content={renderCustomizedLabel} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

