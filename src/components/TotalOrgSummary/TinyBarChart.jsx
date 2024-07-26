import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

export default function TinyBarChart(props) {
  const {chartData, maxY, tickInterval,renderCustomizedLabel} = props;
  return (
    <ResponsiveContainer width="100%" height="100%">
    <BarChart
      data={chartData}
      margin={{
        top: 30, right: 30, left: 20, bottom: 30,
      }}
    >
      <XAxis dataKey="name" />
      <YAxis domain={[0, maxY]} axisLine={false} tickLine={false} tickCount={Math.floor(maxY / tickInterval) + 1} interval={0} />
      <Tooltip />
      <Bar dataKey="amount" fill="#8884d8">
        {
          chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color[index]} />
          ))
        }
        <LabelList dataKey="amount" content={renderCustomizedLabel} />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
  );
}
