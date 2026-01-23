import { CHART_COLORS, METRIC_LABELS, METRIC_CATEGORIES } from '../../constants/lbDashboard/chartsConstants';

export function getItemColors(items) {
  const colorMap = {};
  items.forEach((item, idx) => {
    colorMap[item] = CHART_COLORS[idx % CHART_COLORS.length];
  });
  return colorMap;
}

export function createChartOptions(metric, darkMode) {
  return {
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
          text: METRIC_LABELS[metric] || metric,
          color: darkMode ? '#fff' : '#222',
        },
        beginAtZero: true,
        ticks: { font: { size: 12 }, color: darkMode ? '#fff' : '#222' },
      },
    },
  };
}

export function createDatasets(data, colorMap) {
  return data.map(item => ({
    label: item.name,
    data: item.data.map(point => point.value),
    borderColor: colorMap[item.name],
    backgroundColor: colorMap[item.name],
    fill: false,
    tension: 0.4,
    pointRadius: 5,
    pointHoverRadius: 7,
  }));
}

export function getChartTitle(chartLabel, metric, entityType) {
  if (chartLabel) return chartLabel;
  return `${METRIC_CATEGORIES[metric] || 'Metric'}: ${METRIC_LABELS[metric] || metric} by ${entityType}`;
}