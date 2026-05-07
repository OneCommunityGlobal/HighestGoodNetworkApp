import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import styles from './DonutChart.module.css';

Chart.register(ArcElement, Tooltip, Legend);

function DonutChart(props) {
  const { title, totalCount, percentageChange, data, colors, comparisonType, darkMode } = props;

  const filtered = data
    .map((item, i) => ({ item, color: colors[i] }))
    .filter(({ item }) => (item.value / totalCount) * 100 >= 0.05);
  const filteredData = filtered.map(({ item }) => item);
  const filteredColors = filtered.map(({ color }) => color);

  const effectiveTotal = filteredData.reduce((sum, item) => sum + item.value, 0) || totalCount || 0;

  if (!filteredData.length) {
    return (
      <div className={styles.donutContainer}>
        <div className={styles.donutNoData}>
          <h5 className="donut-heading" style={{ color: darkMode ? '#F7FAFC' : '#1A202C' }}>
            {title}
          </h5>
          <div className={styles.noDataText}>No data available yet</div>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: filteredData.map(item => item.label),
    datasets: [
      {
        data: filteredData.map(item => item.value),
        backgroundColor: filteredColors,
        borderWidth: 1,
        hoverOffset: 8,
      },
    ],
  };

  const labelColor = darkMode ? '#F7FAFC' : '#1A202C';

  const options = {
    plugins: {
      datalabels: {
        color: labelColor,
        font: { size: 12, weight: '500' },
        formatter: value => {
          if (!effectiveTotal || value <= 0) return '';
          const pct = (value / effectiveTotal) * 100;
          return `${value}\n(${pct.toFixed(0)}%)`;
        },
        anchor: 'end',
        align: 'end',
        offset: 6,
        clamp: false,
        display: 'auto',
        textStrokeColor: darkMode ? '#1A202C' : '#FFFFFF',
        textStrokeWidth: 3,
      },
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: ctx => {
            const label = ctx.label || '';
            const value = ctx.parsed;
            const pct = effectiveTotal ? ((value / effectiveTotal) * 100).toFixed(0) : 0;
            return `${label}: ${value} (${pct}%)`;
          },
        },
      },
    },
    maintainAspectRatio: false,
    cutout: '55%',
    layout: {
      padding: 40,
    },
    onHover: (event, elements) => {
      const target = event?.native?.target;
      if (!target) return;
      target.style.cursor = elements && elements.length ? 'pointer' : 'default';
    },
  };

  const percentageChangeColor = percentageChange >= 0 ? 'var(--success)' : 'var(--danger)';

  return (
    <div className={styles.donutContainer}>
      <div className={styles.donutScrollable}>
        <div className={styles.donutChart}>
          <Doughnut data={chartData} options={options} plugins={[ChartDataLabels]} />
          <div className={styles.donutCenter}>
            <h5 className="donut-heading" style={{ color: darkMode ? '#F7FAFC' : '#1A202C' }}>
              {title}
            </h5>
            <h4 className="donut-count" style={{ color: darkMode ? '#F7FAFC' : '#1A202C' }}>
              {totalCount}
            </h4>
            {comparisonType !== 'No Comparison' && (
              <h6
                className={styles.donutComparisonPercent}
                style={{ color: percentageChangeColor }}
              >
                {percentageChange >= 0
                  ? `+${(percentageChange * 100).toFixed(0)}% ${comparisonType.toUpperCase()}`
                  : `${(percentageChange * 100).toFixed(0)}% ${comparisonType.toUpperCase()}`}
              </h6>
            )}
          </div>
        </div>

        <div className={styles.donutLabels}>
          {filteredData.map((item, index) => (
            <div key={item.label} className={styles.donutLabel}>
              <span
                className={styles.donutColor}
                style={{ backgroundColor: filteredColors[index] }}
              />
              <span style={{ color: darkMode ? '#F7FAFC' : '#1A202C' }}>{item.label}</span>
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
  comparisonType: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
};

DonutChart.defaultProps = {
  darkMode: false,
};

export default DonutChart;
