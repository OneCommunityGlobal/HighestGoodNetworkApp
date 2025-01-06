import { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar, Cell } from 'recharts';

const COLORS = [
  '#14b32b',
  '#f2b93d',
  '#1356ad',
  '#f06813',
  '#eb34b4',
  '#47c4ed',
  '#59f0cf',
  '#f0ec18',
];

function CustomizedLabel(props) {
  const { x, y, value, sum, width } = props;
  const percentage = ((value / sum) * 100).toFixed(2);
  const centerX = x + width / 2;

  return (
    <g>
      <text x={centerX} y={y - 10} textAnchor="middle">
        <tspan x={centerX} dy="-10" fontSize="0.7em" fontWeight="bold" fill="grey">
          {value}
        </tspan>
        <tspan x={centerX} dy="10" fontSize="0.5em" fontWeight="bold" fill="grey">
          {`(${percentage}%)`}
        </tspan>
      </text>
    </g>
  );
}

export default function WorkDistributionBarChart({ workDistributionStats }) {
  const [workDistributionData, setWorkDistributionData] = useState([]);

  useEffect(() => {
    if (workDistributionStats) {
      setWorkDistributionData(
        workDistributionStats.map(item => {
          return {
            ...item,
            totalHours: parseFloat(item.totalHours.toFixed(2)),
          };
        }),
      );
    }
  }, [workDistributionStats]);

  if (!workDistributionData || workDistributionData.length === 0) {
    return <p>Loading...</p>;
  }

  workDistributionData.sort((a, b) => a._id.localeCompare(b._id));
  const value = workDistributionData.map(item => item.totalHours);
  const sum = value.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={400} minHeight={430}>
      <BarChart
        data={workDistributionData}
        barCategoryGap="20%"
        margin={{ top: 40, right: 20, left: 10, bottom: 20 }}
      >
        <XAxis dataKey="_id" tick={{ fontSize: 12, color: 'grey' }} />
        <YAxis tick={{ fontSize: 12, color: 'grey' }} />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="totalHours"
          fill="#8884d8"
          legendType="none"
          label={<CustomizedLabel sum={sum} />}
        >
          {workDistributionData.map((entry, index) => (
            <Cell key={`cell-${entry._id}`} fill={COLORS[index % 20]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
