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
import {
  getItemColors,
  createChartOptions,
  createDatasets,
  getChartTitle,
} from '../../../../utils/lbDashboard/chartsUtils';

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

const PropertyDemandChart = ({ data, metric, chartLabel, darkMode }) => {
  const months = data.length > 0 ? data[0].data.map(d => d.month) : [];
  const propertyNames = data.map(p => p.name);
  const propertyColors = getItemColors(propertyNames);
  const datasets = createDatasets(data, propertyColors);

  const chartData = { labels: months, datasets };
  const options = createChartOptions(metric, darkMode);
  const chartTitleText = getChartTitle(chartLabel, metric, 'Property');

  return (
    <div className={`${styles.chartCard} ${darkMode ? styles.darkChartCard : ''}`}>
      <div className={darkMode ? styles.darkChartTitle : styles.chartTitle}>{chartTitleText}</div>
      <div className={styles.chart} style={{ height: 350 }}>
        <Line data={chartData} options={options} plugins={[ChartDataLabels]} />
      </div>
    </div>
  );
};

PropertyDemandChart.propTypes = {
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

export default PropertyDemandChart;
