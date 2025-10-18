import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart, ArcElement } from 'chart.js';
import './VolunteerStatusPieChart.css';

Chart.register(ArcElement);

function VolunteerStatusPieChart({
  data: { totalVolunteers, percentageChange, data: volunteerData },
  comparisonType,
}) {
  // Debug: Log the data used for the chart
  // console.log('VolunteerStatusPieChart data:', { volunteerData, totalVolunteers });
  const chartData = {
    labels: volunteerData.map(item => item.label),
    datasets: [
      {
        data: volunteerData.map(item => item.value),
        backgroundColor: ['#4C4AF5', '#2CCCF8', '#FF00C3'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      datalabels: {
        color: '#000',
        font: {
          size: 20,
          weight: 'bolder',
          lineHeight: 1.8,
        },
        formatter: function(value, context) {
          const percentage = ((value / totalVolunteers) * 100).toFixed(0);
          // Show value and percent as two lines for clarity
          return [`${value}`, `(${percentage}%)`];
        },
        display: true,
        offset: 0,
        align: 'center',
        anchor: 'center',
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
          {comparisonType !== 'No Comparison' && (
            <p
              className="percentage-change"
              style={{ color: percentageChangeColor }}
              aria-label={`Percentage change: ${percentageChange}% ${comparisonType.toLowerCase()}`}
            >
              {percentageChange >= 0
                ? `+${percentageChange}% ${comparisonType.toUpperCase()}`
                : `${percentageChange}% ${comparisonType.toUpperCase()}`}
            </p>
          )}
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
  comparisonType: PropTypes.string.isRequired,
};

export default VolunteerStatusPieChart;
