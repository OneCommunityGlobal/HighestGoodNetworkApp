import { CHART_COLORS, METRIC_LABELS, METRIC_CATEGORIES } from '../../constants/lbDashboard/chartsConstants';

const CURRENCY_METRICS = new Set(['averageBid', 'finalPrice']);

export function getMetricFormatter(metric) {
  if (CURRENCY_METRICS.has(metric)) return v => `₹${Number(v).toLocaleString()}`;
  if (metric === 'occupancyRate') return v => `${v}%`;
  if (metric === 'averageDuration') return v => `${v} days`;
  if (metric === 'averageRating') return v => Number(v).toFixed(1);
  return v => v;
}

export function getItemColors(items) {
  const colorMap = {};
  items.forEach((item, idx) => {
    colorMap[item] = CHART_COLORS[idx % CHART_COLORS.length];
  });
  return colorMap;
}

export function createChartOptions(metric, darkMode) {
  const fmt = getMetricFormatter(metric);
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
        formatter: fmt,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${fmt(context.parsed.y)}`;
          },
        },
      },
    },
    layout: {
      padding: { top: 50, right: 60, bottom: 30, left: 10 },
    },
    scales: {
      x: {
        title: { display: true, text: 'Month', color: darkMode ? '#fff' : '#222' },
        offset: true,
        grid: { color: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' },
        border: { color: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 8,
          maxRotation: 45,
          minRotation: 0,
          font: { size: 11 },
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
        // Room above the max point so datalabels (align: top) are not clipped at the chart edge
        grace: '12%',
        grid: { color: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)' },
        border: { color: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)' },
        ticks: {
          font: { size: 12 },
          color: darkMode ? '#fff' : '#222',
          callback: fmt,
        },
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