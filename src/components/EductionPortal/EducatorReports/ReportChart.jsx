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
import ChartDataLabels from 'chartjs-plugin-datalabels';
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
  ChartDataLabels,
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
        datalabels: { display: type !== 'line', color: '#ffffff' },
        legend: {
          display: showLegend,
          labels: {
            color: darkMode ? '#f1f5f9' : '#1e293b',
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          backgroundColor: darkMode ? '#0f172a' : '#ffffff',
          titleColor: darkMode ? '#f1f5f9' : '#0f172a',
          bodyColor: darkMode ? '#94a3b8' : '#475569',
          borderColor: darkMode ? '#334155' : '#e2e8f0',
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          grid: {
            color: darkMode ? '#334155' : '#cbd5e1',
          },
          ticks: {
            color: darkMode ? '#f1f5f9' : '#1e293b',
            font: {
              size: 11,
            },
          },
        },
        y: {
          grid: {
            color: darkMode ? '#334155' : '#cbd5e1',
          },
          ticks: {
            color: darkMode ? '#f1f5f9' : '#1e293b',
            font: {
              size: 11,
            },
          },
        },
      },
    };

    return {
      ...baseOptions,
      ...customOptions,
      plugins: {
        ...baseOptions.plugins,
        ...(customOptions.plugins || {}),
      },
    };
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
