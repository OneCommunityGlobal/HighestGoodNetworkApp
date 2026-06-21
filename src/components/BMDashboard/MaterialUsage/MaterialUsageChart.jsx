import { Modal, ModalHeader, ModalBody, Spinner } from 'reactstrap';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import styles from './MaterialUsageChart.module.css';

const COLORS = ['#A74C4C', '#4C4C4C', '#C9B28A'];

export default function MaterialUsageChart({ projectId, toggle, darkMode = false }) {
  const [chartData, setChartData] = useState([]);
  const [increase, setIncrease] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const chartDataWithPercentages = useMemo(() => {
    if (!chartData.length) return [];
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return chartData.map(item => ({ ...item, percentage: '0.00' }));
    return chartData.map(item => ({
      ...item,
      percentage: total > 0 ? ((item.value / total) * 100).toFixed(2) : '0.00',
    }));
  }, [chartData]);

  const formatIncrease = value => (value >= 0 ? `+${value}%` : `${value}%`);
  const isEmptyData = useMemo(() => chartData.every(item => item.value === 0), [chartData]);

  const CenterLabel = ({ increase }) => (
    <div
      className={`${styles.centerLabel} ${
        darkMode ? styles.centerLabelDark : styles.centerLabelLight
      }`}
    >
      <strong
        className={`${styles.centerLabelValue} ${darkMode ? styles.textDark : styles.textLight}`}
      >
        {formatIncrease(increase)}
      </strong>
      <div
        className={`${styles.centerLabelSubtitle} ${
          darkMode ? styles.subTextDark : styles.subTextLight
        }`}
      >
        week over week
      </div>
    </div>
  );

  const ChartLegend = ({ data }) => (
    <div
      className={`${styles.chartLegend} ${
        darkMode ? styles.legendAreaDark : styles.legendAreaLight
      }`}
    >
      {data.map((entry, index) => (
        <div
          key={entry.name}
          className={`${styles.legendItem} ${
            darkMode ? styles.legendItemDark : styles.legendItemLight
          }`}
        >
          <div className={styles.legendColor} style={{ backgroundColor: COLORS[index] }} />
          <span className={styles.legendText}>
            {entry.name}: {entry.percentage}
          </span>
        </div>
      ))}
    </div>
  );

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percentage,
    name,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Explicit Recharts SVG colors
    const labelColor = darkMode ? '#e2e8f0' : '#495057';
    return (
      <g>
        <text
          x={x}
          y={y}
          fill={labelColor}
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
          fontSize={12}
          fontWeight="600"
        >
          {`${name}: ${percentage}%`}
        </text>
        <line
          x1={cx + (outerRadius + 5) * Math.cos(-midAngle * RADIAN)}
          y1={cy + (outerRadius + 5) * Math.sin(-midAngle * RADIAN)}
          x2={cx + (outerRadius + 25) * Math.cos(-midAngle * RADIAN)}
          y2={cy + (outerRadius + 25) * Math.sin(-midAngle * RADIAN)}
          stroke={labelColor}
          strokeWidth={1}
        />
      </g>
    );
  };

  useEffect(() => {
    if (!projectId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await axios.get(`${ENDPOINTS.BM_MATERIALS}/${projectId}`, {
          timeout: 10000,
        });
        const {
          availableMaterials = 0,
          usedMaterials = 0,
          wastedMaterials = 0,
          increaseOverLastWeek = 0,
        } = data;
        setChartData([
          { name: 'Available', value: availableMaterials },
          { name: 'Used', value: usedMaterials },
          { name: 'Wasted', value: wastedMaterials },
        ]);
        setIncrease(increaseOverLastWeek);
      } catch (err) {
        setError('Failed to fetch chart data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  const retryFetch = () => {
    setError('');
    setLoading(true);
  };

  // Matches the wrapper background to hide the pie gaps cleanly
  const pieStrokeColor = darkMode ? '#2d3748' : '#fff';

  return (
    <Modal
      isOpen={true}
      toggle={toggle}
      size="lg"
      centered
      className={styles.materialChartModal}
      // Target the Reactstrap Modal-Content specifically
      contentClassName={darkMode ? styles.modalContentDark : styles.modalContentLight}
    >
      <ModalHeader
        toggle={toggle}
        className={`${styles.materialChartHeader} ${
          darkMode ? styles.headerDark : styles.headerLight
        }`}
      >
        Material Usage Proportion
      </ModalHeader>

      <ModalBody
        className={`${styles.materialChartBody} ${darkMode ? styles.bodyDark : styles.bodyLight}`}
      >
        {loading ? (
          <div className={styles.statusContainer}>
            <Spinner color="primary" />
            <div className={darkMode ? styles.subTextDark : styles.subTextLight}>
              Loading material data...
            </div>
          </div>
        ) : error ? (
          <div className={styles.statusContainer}>
            <p className={darkMode ? styles.errorTextDark : styles.errorTextLight}>{error}</p>
            <button
              className={`${styles.chartRetryButton} ${
                darkMode ? styles.btnDark : styles.btnLight
              }`}
              onClick={retryFetch}
            >
              Retry
            </button>
          </div>
        ) : isEmptyData ? (
          <div className={styles.statusContainer}>
            <p className={darkMode ? styles.subTextDark : styles.subTextLight}>
              No material data available
            </p>
          </div>
        ) : (
          <div className={styles.chartMainContainer}>
            <div
              className={`${styles.pieChartWrapper} ${
                darkMode ? styles.wrapperDark : styles.wrapperLight
              }`}
            >
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={chartDataWithPercentages}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="40%"
                    outerRadius="70%"
                    paddingAngle={1}
                    label={renderCustomizedLabel}
                    labelLine={false}
                  >
                    {chartDataWithPercentages.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index]}
                        stroke={pieStrokeColor}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <CenterLabel increase={increase} />
            </div>
            <ChartLegend data={chartDataWithPercentages} />
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}

MaterialUsageChart.propTypes = {
  projectId: PropTypes.string.isRequired,
  toggle: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
};
