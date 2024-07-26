import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';


// import { ChartContainer } from '@mui/x-charts/ChartContainer';
// import { BarPlot } from '@mui/x-charts/BarChart';

// const uData = [4000, 3000, 2000, 2780, 1890, 2390, 3490];
// const xLabels = ['Page A', 'Page B', 'Page C', 'Page D', 'Page E', 'Page F', 'Page G'];

export default function TinyBarChart(chartData, maxY, tickInterval,renderCustomizedLabel) {
  return (
    <ResponsiveContainer width="100%" height="100%">
    <BarChart
      data={chartData}
      margin={{
        top: 20, right: 30, left: 20, bottom: 5,
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
