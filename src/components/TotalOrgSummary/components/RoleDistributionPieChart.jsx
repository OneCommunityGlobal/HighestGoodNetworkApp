import * as React from 'react';
import { useState } from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import './chart.css';

export default function RoleDistributionPieChart({ volunteerstats, totalOrgSummary, allUserProfiles }) {
  // const {volunteerstats} = props;
  console.log("6", volunteerstats, totalOrgSummary, allUserProfiles);

  const originalRoleDistributionStats = [
    {
      _id: 'TestRole',
      count: 9,
    },
    {
      _id: 'Manager',
      count: 153,
    },
    {
      _id: 'Tester',
      count: 2,
    },
    {
      _id: 'Administrator',
      count: 259,
    },
    {
      _id: 'Mentor',
      count: 78,
    },
    {
      _id: 'Assistant Manager',
      count: 15,
    },
    {
      _id: 'RoleTest',
      count: 1,
    },
    {
      _id: 'Core Team',
      count: 72,
    },
    {
      _id: 'Volunteer',
      count: 686,
    },
    {
      _id: 'Owner',
      count: 213,
    },
    {
      _id: 'New Role',
      count: 1,
    }
  ];

  const [roleDistributionStats, setRoleDistributionStats] = useState(originalRoleDistributionStats);
  if (volunteerstats !== undefined) {
    setRoleDistributionStats(volunteerstats.roleDistributionStats);
    console.log("update using backend data");
  }

  const sum = roleDistributionStats.map(item => item.count).reduce((prev, curr) => prev + curr, 0);
  const chartData = roleDistributionStats.map(item => ({
    label: item._id,
    value: item.count,
    percentage: ((item.count / sum) * 100).toFixed(0),
  }));
  const colors = ['#F285BB', '#77A9EE', '#F2AB53', '#1B6DDF', '#C92929', '#1BC590'];

  return (
    <div>
      <h3 className="roleChartTitle">Role Distribution</h3>
      <PieChart
        colors={colors}
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
            cx: '40%',
            cy: '45%',
          },
        ]}
        sx={{
          [`& .${pieArcLabelClasses.root}`]: {
            fontWeight: 'bold',
            fontSize: 10,
          },
        }}
        slotProps={{
          legend: {
            direction: 'column',
            position: { vertical: 'middle', horizontal: 'right' },
            padding: 10,
            itemMarkWidth: 10,
            itemMarkHeight: 10,
            markGap: 4,
            itemGap: 4,
            fontSize: 10,
          },
        }}
        width={500}
        height={300}
      />
    </div>
  );
}
