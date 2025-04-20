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

export default function TinyBarChart(props) {
  const { chartData, maxY, tickInterval, renderCustomizedLabel, darkMode } = props;
  return (
    <ResponsiveContainer maxWidth={600} maxHeight={600} minWidth={180} minHeight={320}>
      <BarChart
        data={chartData}
        margin={{
          top: 30,
          bottom: 20,
        }}
      >
        <XAxis dataKey="name" stroke={darkMode ? 'white' : 'gray'} />
        <YAxis
          stroke={darkMode ? 'white' : 'gray'}
          domain={[0, maxY]}
          axisLine={false}
          tickLine={false}
          tickCount={Math.floor(maxY / tickInterval) + 1}
          interval={0}
        />
        <Tooltip cursor={{ fill: 'transparent' }} />
        <Bar dataKey="amount" fill="#8884d8">
          {chartData.map((entry, index) => (
            /* eslint-disable react/no-array-index-key */
            <Cell key={`cell-${index}`} fill={entry.color[index]} />
          ))}
          <LabelList dataKey="amount" content={renderCustomizedLabel} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
