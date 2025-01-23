import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart, ArcElement } from 'chart.js';
import './DonutChart.css';

Chart.register(ArcElement);

function DonutChart(props) {
  const { title, totalCount, percentageChange, data, colors } = props;
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        data: data.map(item => item.value),
        backgroundColor: colors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      datalabels: {
        color: '#000000',
        font: {
          size: 16,
        },
        formatter: value => {
          const percentage = ((value / totalCount) * 100).toFixed(0);
          return `${value}\n(${percentage}%)`;
        },
      },
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    maintainAspectRatio: false,
    cutout: '55%',
  };

  const percentageChangeColor = percentageChange >= 0 ? 'green' : 'red';

  return (
    <div className="donut-container">
      <div className="donut-scrollable">
        <div className="donut-chart">
          <Doughnut data={chartData} options={options} plugins={[ChartDataLabels]} />
          <div className="donut-center">
            <h5 className="donut-heading">{title}</h5>
            <h4 className="donut-count">{totalCount}</h4>
            <h6 style={{ color: percentageChangeColor }}>
              {percentageChange >= 0
                ? `+${percentageChange}% WEEK OVER WEEK`
                : `${percentageChange}% WEEK OVER WEEK`}
            </h6>
          </div>
        </div>
        <div className="donut-labels">
          {data.map((item, index) => (
            <div key={item.label} className="donut-label">
              <span
                className="donut-color"
                style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
              />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

DonutChart.propTypes = {
  title: PropTypes.string.isRequired,
  totalCount: PropTypes.number.isRequired,
  percentageChange: PropTypes.number.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    }),
  ).isRequired,
  colors: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
};

export default DonutChart;
