import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import styles from './ReportChart.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
);

const ReportChart = ({
  type = 'bar',
  data,
  height = 300,
  showLegend = true,
  horizontal = false,
  options: customOptions = {},
}) => {
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: horizontal ? 'y' : 'x',
      plugins: {
        legend: {
          display: showLegend,
          labels: {
            color: darkMode ? '#ffffff' : '#333333',
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
          titleColor: darkMode ? '#ffffff' : '#333333',
          bodyColor: darkMode ? '#ffffff' : '#666666',
          borderColor: darkMode ? '#444444' : '#dddddd',
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          grid: {
            color: darkMode ? '#333333' : '#e0e0e0',
          },
          ticks: {
            color: darkMode ? '#cccccc' : '#666666',
            font: {
              size: 11,
            },
          },
        },
        y: {
          grid: {
            color: darkMode ? '#333333' : '#e0e0e0',
          },
          ticks: {
            color: darkMode ? '#cccccc' : '#666666',
            font: {
              size: 11,
            },
          },
        },
      },
    };

    return { ...baseOptions, ...customOptions };
  };

  const renderChart = () => {
    const chartOptions = getChartOptions();

    switch (type) {
      case 'line':
        return <Line data={data} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={data} options={chartOptions} />;
      case 'bar':
      default:
        return <Bar data={data} options={chartOptions} />;
    }
  };

  return (
    <div
      className={`${styles.chartContainer} ${darkMode ? styles.darkMode : ''}`}
      style={{ height: `${height}px` }}
    >
      {renderChart()}
    </div>
  );
};

export default ReportChart;
