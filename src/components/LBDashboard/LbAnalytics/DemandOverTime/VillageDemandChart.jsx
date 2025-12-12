import React from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import styles from './DemandOverTime.module.css';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Legend,
  Tooltip,
  Title as ChartTitle,
} from 'chart.js';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Legend,
  Tooltip,
  ChartTitle,
  ChartDataLabels,
);

const metricLabels = {
  pageVisits: 'Page Visits',
  numberOfBids: 'Number of Bids',
  averageRating: 'Average Rating',
  averageBid: 'Average Bid',
  finalPrice: 'Final Price/Income',
  occupancyRate: 'Occupancy Rate (%)',
  averageDuration: 'Average Duration of Stay (days)',
};

const metricCategories = {
  pageVisits: 'Demand',
  numberOfBids: 'Demand',
  averageRating: 'Demand',
  averageBid: 'Revenue',
  finalPrice: 'Revenue',
  occupancyRate: 'Vacancy',
  averageDuration: 'Vacancy',
};

function getVillageColors(villages) {
  const colors = [
    '#FF6B6B',
    '#4ECDC4',
    '#FFD93D',
    '#1A535C',
    '#FF9F1C',
    '#2EC4B6',
    '#E71D36',
    '#3A86FF',
  ];
  const colorMap = {};
  let idx = 0;
  villages.forEach(v => {
    if (!colorMap[v]) {
      colorMap[v] = colors[idx % colors.length];
      idx++;
    }
  });
  return colorMap;
}

const VillageDemandChart = ({ data, metric, chartLabel, darkMode }) => {
  const months = data.length > 0 ? data[0].data.map(d => d.month) : [];

  const villageNames = data.map(v => v.name);
  const villageColors = getVillageColors(villageNames);

  const datasets = data.map(village => ({
    label: village.name,
    data: village.data.map(point => point.value),
    borderColor: villageColors[village.name],
    backgroundColor: villageColors[village.name],
    fill: false,
    tension: 0.4,
    pointRadius: 5,
    pointHoverRadius: 7,
  }));

  const chartData = {
    labels: months,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 13 }, color: darkMode ? '#fff' : '#222' },
      },
      title: { display: false },
      datalabels: {
        color: darkMode ? '#fff' : '#333',
        font: { weight: 'bold', size: 11 },
        align: 'top',
        anchor: 'end',
        offset: 4,
        clip: false,
        display: 'auto',
        formatter: value => value,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          },
        },
      },
    },
    layout: {
      padding: 20,
    },
    scales: {
      x: {
        title: { display: true, text: 'Month', color: darkMode ? '#fff' : '#222' },
        offset: true,
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 30,
          font: { size: 12 },
          color: darkMode ? '#fff' : '#222',
        },
      },
      y: {
        title: {
          display: true,
          text: metricLabels[metric] || metric,
          color: darkMode ? '#fff' : '#222',
        },
        beginAtZero: true,
        ticks: { font: { size: 12 }, color: darkMode ? '#fff' : '#222' },
      },
    },
  };

  const chartTitleText =
    chartLabel ||
    `${metricCategories[metric] || 'Metric'}: ${metricLabels[metric] || metric} by Village`;

  return (
    <div className={`${styles.chartCard} ${darkMode ? styles.darkChartCard : ''}`}>
      <div
        className={darkMode ? styles.darkChartTitle : ''}
        style={{ fontSize: 22, fontWeight: 600, margin: '16px 0' }}
      >
        {chartTitleText}
      </div>
      <div className={styles.chart} style={{ height: 350 }}>
        <Line data={chartData} options={options} plugins={[ChartDataLabels]} />
      </div>
    </div>
  );
};

VillageDemandChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      data: PropTypes.arrayOf(
        PropTypes.shape({
          month: PropTypes.string.isRequired,
          value: PropTypes.number.isRequired,
        }),
      ).isRequired,
    }),
  ).isRequired,
  metric: PropTypes.string.isRequired,
  chartLabel: PropTypes.string,
  darkMode: PropTypes.bool,
};

export default VillageDemandChart;
