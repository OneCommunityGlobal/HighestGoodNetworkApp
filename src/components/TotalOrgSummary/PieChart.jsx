import * as React from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';

const data = [
  { id: 0, label: 'Administrator', value: 6, color: '#fb0505' },
  { id: 1, label: 'Volunteer', value: 4, color: '#8ebfff' },
  { id: 2, label: 'Owner', value: 3, color: '#f68d42' },
  { id: 3, label: 'Mentor', value: 1, color: '#f2ff00' },
];

const TOTAL = data.reduce((sum, item) => sum + item.value, 0);

const getArcLabel = params => {
  const percent = params.value / TOTAL;
  return `${params.value}\n(${(percent * 100).toFixed(0)}%)`;
};

export default function RoleDistributionPieChart() {
  return (
    <PieChart
      series={[
        {
          data,
          innerRadius: 70,
          outerRadius: 145,
          arcLabel: getArcLabel,
          arcLabelMinAngle: 10,
          arcLabelRadius: 105,
          cornerRadius: 0,
          paddingAngle: 0,
        },
      ]}
      width={520}
      height={430}
      slotProps={{
        legend: {
          hidden: false,
        },
      }}
      sx={{
        [`& .${pieArcLabelClasses.root}`]: {
          fill: '#ffffff',
          fontSize: 14,
          fontWeight: 700,
        },
        [`& .${pieArcLabelClasses.root}`]: {
          whiteSpace: 'pre',
        },
      }}
    />
  );
}
