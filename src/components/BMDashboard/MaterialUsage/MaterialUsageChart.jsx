import { Modal, ModalHeader, ModalBody, Spinner } from 'reactstrap';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { ENDPOINTS } from '../../../utils/URL';
import './MaterialUsageChart.module.css';

// Constants
const COLORS = ['#A74C4C', '#4C4C4C', '#C9B28A'];

export default function MaterialUsageChart({ projectId, toggle, darkMode = false }) {
  const [chartData, setChartData] = useState([]);
  const [increase, setIncrease] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Calculate percentages for chart data
  const chartDataWithPercentages = useMemo(() => {
    if (!chartData.length) return [];

    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return chartData.map(item => ({ ...item, percentage: '0.00' }));

    return chartData.map(item => ({
      ...item,
      percentage: total > 0 ? ((item.value / total) * 100).toFixed(2) : '0.00',
    }));
  }, [chartData]);

  // Helper functions
  const formatIncrease = value => (value >= 0 ? `+${value}%` : `${value}%`);

  const isEmptyData = useMemo(() => chartData.every(item => item.value === 0), [chartData]);

  // Center label component
  const CenterLabel = ({ increase }) => (
    <div className="center-label">
      <strong className="center-label-value">{formatIncrease(increase)}</strong>
      <div className="center-label-subtitle">week over week</div>
    </div>
  );

  // Chart legend component
  const ChartLegend = ({ data }) => (
    <div className="chart-legend">
      {data.map((entry, index) => (
        <div key={entry.name} className="legend-item">
          <div className="legend-color" style={{ backgroundColor: COLORS[index] }} />
          <span className="legend-text">
            {entry.name}: {entry.percentage}%
          </span>
        </div>
      ))}
    </div>
  );

  // Custom label component to show percentages and labels outside the chart
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

    return (
      <g>
        <text
          x={x}
          y={y}
          fill="#495057"
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
          fontSize={12}
          fontWeight="600"
        >
          {`${name}: ${percentage}%`}
        </text>
        {/* Add a line connecting the segment to the label */}
        <line
          x1={cx + (outerRadius + 5) * Math.cos(-midAngle * RADIAN)}
          y1={cy + (outerRadius + 5) * Math.sin(-midAngle * RADIAN)}
          x2={cx + (outerRadius + 25) * Math.cos(-midAngle * RADIAN)}
          y2={cy + (outerRadius + 25) * Math.sin(-midAngle * RADIAN)}
          stroke="#495057"
          strokeWidth={1}
        />
      </g>
    );
  };

  // Data fetching
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
        console.error('Error fetching materials:', err);
        setError('Failed to fetch chart data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Retry function
  const retryFetch = () => {
    setError('');
    setLoading(true);
  };

  return (
    <Modal isOpen={true} toggle={toggle} size="lg" centered className="material-chart-modal">
      <ModalHeader toggle={toggle} className="material-chart-header">
        Material Usage Proportion
      </ModalHeader>

      <ModalBody className="material-chart-body">
        {loading ? (
          <div className="chart-loading-container">
            <Spinner color="primary" />
            <div className="chart-loading-text">Loading material data...</div>
          </div>
        ) : error ? (
          <div className="chart-error-container">
            <p className="chart-error-text">{error}</p>
            <button className="chart-retry-button" onClick={retryFetch}>
              Retry
            </button>
          </div>
        ) : isEmptyData ? (
          <div className="chart-empty-container">
            <p className="chart-empty-text">No material data available</p>
          </div>
        ) : (
          <div className="chart-main-container">
            <div className="pie-chart-wrapper">
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
                        stroke="#fff"
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
