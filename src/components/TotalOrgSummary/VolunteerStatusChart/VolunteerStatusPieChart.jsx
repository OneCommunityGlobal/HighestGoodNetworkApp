import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart, ArcElement } from 'chart.js';
import './VolunteerStatusPieChart.css';

Chart.register(ArcElement);

function VolunteerStatusPieChart(props) {
  const { totalVolunteers, percentageChange, data: volunteerData } = props.data;

  const chartData = {
    labels: volunteerData.map(item => item.label),
    datasets: [
      {
        data: volunteerData.map(item => item.value),
        backgroundColor: ['#5355C9', '#3EA0CB', '#EC4899'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      datalabels: {
        color: '#fff',
        font: {
          size: 16,
        },
        formatter: value => {
          const percentage = ((value / totalVolunteers) * 100).toFixed(2);
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
    <section className="volunteer-status-container" aria-label="Volunteer Status Overview">
      <div className="volunteer-status-chart" role="img" aria-label="Volunteer Status Pie Chart">
        <Doughnut data={chartData} options={options} plugins={[ChartDataLabels]} />
        <div className="volunteer-status-center">
          <h2 className="volunteer-status-heading">TOTAL VOLUNTEERS</h2>
          <p className="volunteer-count">{totalVolunteers}</p>
          <p
            style={{ color: percentageChangeColor }}
            aria-label={`Percentage change: ${percentageChange}% week over week`}
          >
            {percentageChange >= 0
              ? `+${percentageChange}% WEEK OVER WEEK`
              : `${percentageChange}% WEEK OVER WEEK`}
          </p>
        </div>
      </div>
      <div className="volunteer-status-labels">
        {volunteerData.map((item, index) => (
          <div key={item.label} className="volunteer-status-label">
            <span
              className="volunteer-status-color"
              style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
              aria-hidden="true"
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

VolunteerStatusPieChart.propTypes = {
  data: PropTypes.shape({
    totalVolunteers: PropTypes.number.isRequired,
    percentageChange: PropTypes.number.isRequired,
    data: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
      }),
    ).isRequired,
  }).isRequired,
};

export default VolunteerStatusPieChart;
