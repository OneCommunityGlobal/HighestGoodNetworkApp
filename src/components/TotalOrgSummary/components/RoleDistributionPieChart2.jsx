import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { ROLE_DISTRIBUTION_DATA } from './chart_test_data';

Chart.register(ArcElement, Tooltip, Legend);

function processRoleDistributionData(rawData) {
  const sum = rawData.map(item => item.count).reduce((prev, curr) => prev + curr, 0);
  const chartData = rawData.map(item => ({
    label: item._id,
    value: item.count,
    percentage: ((item.count / sum) * 100).toFixed(0),
  }));
  return chartData;
}

export default function RoleDistributionPieChart2(){
  const colors = ['#F285BB', '#77A9EE', '#F2AB53', '#1B6DDF', '#C92929', '#1BC590', '#7ff0f0', '#6e33cc', '#cc2fa7', '#f78693', '#86ebcc'];

  const data = ROLE_DISTRIBUTION_DATA.map(user => user.count);
  const labels = ROLE_DISTRIBUTION_DATA.map(user => user._id);

  const chartData = {
    labels: { labels },
    // datasets is an array of objects where each object represents a set of data to display corresponding to the labels above. for brevity, we'll keep it at one object
    datasets: [
      {
        label: 'role',
        data: { data },
        borderWidth: 1,
        backgroundColor: colors,
      },
    ],
  }

  return (
    <div>
      <p>Role Distribution Pie Chart</p>
      <div>
        <Doughnut
          data={chartData}
          options={{
            plugins: {
              title: {
                display: true,
                text: 'Role Distribution Pie Chart',
              },
            },
          }}
        />
      </div>
    </div>
  );
}
