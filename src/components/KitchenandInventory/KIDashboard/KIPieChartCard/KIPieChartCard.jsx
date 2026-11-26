import PropTypes from 'prop-types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_TOOLTIP_STYLES } from '../KIChartFilters/KIChartFilters';
// The Food Categories and Food Sources charts share this card and its legend
import styles from '../FoodCategoriesPieChart/FoodCategoriesPieChart.module.css';

const RADIAN = Math.PI / 180;

// Shows the slice's whole percentage from the data, so the labels match the legend;
// slices under 3% are too small for a label
const renderSliceLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, payload }) => {
  if (payload.percent < 3) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill={payload.labelColor}
      textAnchor="middle"
      dominantBaseline="central"
      fontWeight={700}
      fontSize={16}
    >
      {`${payload.percent}%`}
    </text>
  );
};

// A pie chart card: the chart's filter bar, the title, the pie and a legend with percentages
export default function KIPieChartCard({
  title,
  darkMode = false,
  chartData,
  formatTooltip,
  filterBar,
  showChart = true,
}) {
  return (
    <div className={[styles.container, darkMode ? styles.darkMode : ''].join(' ')}>
      {filterBar}

      <h2 className={styles.chartTitle}>{title}</h2>

      <div className={styles.chartWrapper}>
        {!showChart || chartData.length === 0 ? (
          <div className={styles.noDataMessage}>No data available for the selected filters.</div>
        ) : (
          <>
            <div className={styles.pieBox}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="90%"
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={1}
                    stroke={darkMode ? '#0f1522' : '#ffffff'}
                    strokeWidth={3}
                    label={renderSliceLabel}
                    labelLine={false}
                    isAnimationActive={false}
                  >
                    {chartData.map(entry => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, item) => [formatTooltip(value, item.payload), name]}
                    {...CHART_TOOLTIP_STYLES}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.legend}>
              {chartData.map(item => (
                <span key={item.name} className={styles.legendItem}>
                  <span
                    className={styles.legendSwatch}
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span>{`${item.name} (${item.percent}%)`}</span>
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

KIPieChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
  chartData: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      percent: PropTypes.number.isRequired,
      color: PropTypes.string.isRequired,
      labelColor: PropTypes.string.isRequired,
    }),
  ).isRequired,
  formatTooltip: PropTypes.func.isRequired,
  filterBar: PropTypes.node.isRequired,
  showChart: PropTypes.bool,
};
