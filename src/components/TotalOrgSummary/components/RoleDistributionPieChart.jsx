import * as React from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';

export default function RoleDistributionPieChart(props) {
  const {data: rawData} = props;
//   console.log('raw data:', rawData);
  let chartData = [
    { id: 0, value: 145, label: 'Owner' },
    { id: 1, value: 789, label: 'Manager' },
    { id: 2, value: 879, label: 'Admin' },
    { id: 3, value: 2314, label: 'Volunteer' },
    { id: 4, value: 5, label: 'CoreTeam' },
    { id: 5, value: 546, label: 'Mentor' },
  ];

  const sum = chartData.map(item => item.value).reduce((prev, curr) => prev + curr, 0);
  chartData = chartData.map(item => ({
    ...item,
    percentage: (item.value / sum * 100).toFixed(0),
  }));
  console.log(chartData);

  return (
    <PieChart
      colors={['#F285BB', '#77A9EE', '#F2AB53', '#1B6DDF', '#C92929', '#1BC590']}
      series={[
        {
          arcLabel: item => `${item.value} (${item.percentage})`,
          data: chartData,
          innerRadius: '40%',
          outerRadius: '80%',
          paddingAngle: 0,
          cornerRadius: 0,
          startAngle: 0,
          endAngle: 360,
          cx: 250,
          cy: 250,
        },
      ]}
      sx={{
        [`& .${pieArcLabelClasses.root}`]: {
          fontWeight: 'bold',
        },
      }}
      width={600}
      height={500}
    />
  );
}
