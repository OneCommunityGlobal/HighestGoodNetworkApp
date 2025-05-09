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
import React from 'react';

const ProjectLabel = ({ viewBox, info }) => {
  return (
    <foreignObject
      x={viewBox.x + 60}
      y={viewBox.y + 10}
      width={140}
      height={70}
      style={{ overflow: 'visible' }}
    >
      <div
        style={{
          textAlign: 'left',
          color: info.fontcolor,
          fontSize: 14,
          background: 'white',
          borderRadius: 4,
          padding: 6,
          boxShadow: '0 1px 4px #ccc',
          lineHeight: 1.2,
          border: '1px solid #eee',
          minWidth: 120,
          minHeight: 60,
          pointerEvents: 'none',
        }}
      >
        <div style={{ color: '#444', fontWeight: 'bold', fontSize: 15 }}>Projects</div>
        <div style={{ color: '#222', fontWeight: 'bold', fontSize: 15 }}>{info.amount}</div>
        <div style={{ color: '#666', fontSize: 13 }}>{info.percentage}</div>
        <div style={{ color: info.fontcolor, fontSize: 13 }}>{info.change}</div>
      </div>
    </foreignObject>
  );
};

export default function TinyBarChart(props) {
  const {
    chartData,
    maxY,
    tickInterval,
    renderCustomizedLabel,
    darkMode,
    projectBarInfo,
    showYAxisLabel = true,
  } = props;

  return (
    <ResponsiveContainer maxWidth={600} maxHeight={340} minWidth={180} minHeight={340}>
      <BarChart
        data={chartData}
        margin={{
          top: 50,
          bottom: 40,
        }}
      >
        <XAxis dataKey="name" stroke={darkMode ? 'white' : 'gray'} />
        <YAxis
          stroke={darkMode ? 'white' : 'gray'}
          domain={[0, maxY]}
          axisLine={true}
          tickLine={true}
          tickCount={Math.floor(maxY / tickInterval) + 1}
          interval={0}
          label={
            showYAxisLabel
              ? {
                  value: 'Hours',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 20,
                  fill: darkMode ? 'white' : '#444',
                  fontSize: 14,
                  fontWeight: 'bold',
                }
              : undefined
          }
        />
        <Tooltip cursor={{ fill: 'transparent' }} />
        <Bar dataKey="amount" fill="#8884d8">
          {chartData.map((entry, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Cell key={`cell-${index}`} fill={entry.color[index]} />
          ))}
          <LabelList dataKey="amount" content={renderCustomizedLabel} />
        </Bar>
        {projectBarInfo && (
          <ReferenceLine
            y={projectBarInfo.amount}
            stroke={darkMode ? 'lightgreen' : 'green'}
            strokeDasharray="6 6"
            ifOverflow="extendDomain"
            label={<ProjectLabel info={projectBarInfo} />}
          />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
