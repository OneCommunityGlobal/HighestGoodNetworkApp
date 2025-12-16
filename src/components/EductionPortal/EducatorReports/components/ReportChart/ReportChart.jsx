import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import styles from './ReportChart.module.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

const ReportChart = ({
  type = 'bar',
  data,
  title,
  height = 300,
  showLegend = true,
  backgroundColor,
  borderColor,
  gradient = false,
}) => {
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  // Default color schemes
  const defaultColors = {
    light: {
      primary: '#4f46e5',
      secondary: '#06b6d4',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#8b5cf6',
    },
    dark: {
      primary: '#818cf8',
      secondary: '#67e8f9',
      success: '#34d399',
      warning: '#fbbf24',
      danger: '#f87171',
      info: '#a78bfa',
    },
  };

  const colors = darkMode ? defaultColors.dark : defaultColors.light;

  // Common chart options
  const getBaseOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
        labels: {
          color: darkMode ? '#d1d5db' : '#374151',
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
      },
      title: {
        display: !!title,
        text: title,
        color: darkMode ? '#f9fafb' : '#111827',
        font: {
          size: 16,
          weight: '600',
          family: "'Inter', sans-serif",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        titleColor: darkMode ? '#f9fafb' : '#111827',
        bodyColor: darkMode ? '#d1d5db' : '#374151',
        borderColor: darkMode ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales:
      type !== 'pie'
        ? {
            x: {
              ticks: {
                color: darkMode ? '#9ca3af' : '#6b7280',
                font: {
                  size: 11,
                },
              },
              grid: {
                color: darkMode ? '#374151' : '#f3f4f6',
                borderColor: darkMode ? '#4b5563' : '#d1d5db',
              },
            },
            y: {
              ticks: {
                color: darkMode ? '#9ca3af' : '#6b7280',
                font: {
                  size: 11,
                },
              },
              grid: {
                color: darkMode ? '#374151' : '#f3f4f6',
                borderColor: darkMode ? '#4b5563' : '#d1d5db',
              },
            },
          }
        : {},
  });

  // Process data based on chart type
  const processChartData = () => {
    if (!data) return null;

    const processedData = { ...data };

    // Apply default colors if not provided
    if (data.datasets) {
      processedData.datasets = data.datasets.map((dataset, index) => {
        const colorKeys = Object.keys(colors);
        const colorKey = colorKeys[index % colorKeys.length];
        const baseColor = colors[colorKey];

        const processedDataset = {
          ...dataset,
          backgroundColor:
            backgroundColor ||
            dataset.backgroundColor ||
            (type === 'pie'
              ? Object.values(colors)
              : gradient
              ? `linear-gradient(45deg, ${baseColor}, ${baseColor}99)`
              : `${baseColor}20`),
          borderColor: borderColor || dataset.borderColor || baseColor,
          borderWidth: dataset.borderWidth || (type === 'line' ? 3 : 2),
        };

        // Additional styling for line charts
        if (type === 'line') {
          processedDataset.fill = dataset.fill !== undefined ? dataset.fill : true;
          processedDataset.tension = dataset.tension || 0.4;
          processedDataset.pointBackgroundColor = baseColor;
          processedDataset.pointBorderColor = '#ffffff';
          processedDataset.pointBorderWidth = 2;
          processedDataset.pointRadius = 4;
          processedDataset.pointHoverRadius = 6;
        }

        // Additional styling for bar charts
        if (type === 'bar') {
          processedDataset.borderRadius = 4;
          processedDataset.borderSkipped = false;
        }

        return processedDataset;
      });
    }

    return processedData;
  };

  const chartData = processChartData();
  const options = getBaseOptions();

  if (!chartData) {
    return (
      <div className={`${styles.chartContainer} ${darkMode ? styles.darkMode : ''}`}>
        <div className={styles.noData}>
          <i className="fa fa-chart-bar" aria-hidden="true" />
          <p>No data available</p>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'pie':
        return <Pie data={chartData} options={options} />;
      case 'bar':
      default:
        return <Bar data={chartData} options={options} />;
    }
  };

  return (
    <div className={`${styles.chartContainer} ${darkMode ? styles.darkMode : ''}`}>
      <div className={styles.chartWrapper} style={{ height: `${height}px` }}>
        {renderChart()}
      </div>
    </div>
  );
};

export default ReportChart;
