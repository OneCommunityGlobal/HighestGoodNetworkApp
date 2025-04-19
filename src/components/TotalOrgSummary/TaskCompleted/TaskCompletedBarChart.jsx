import { useEffect, useState } from 'react';
import TinyBarChart from '../TinyBarChart';
import Loading from '../../common/Loading';

export default function TaskCompletedBarChart({ isLoading, data, darkMode }) {
  const initialCardSize = () => {
    if (window.innerWidth <= 680) return { height: '300px' };
    if (window.innerWidth <= 1418) return { height: '548px' };
    return { height: '347px' };
  };

  const [cardSize, setCardSize] = useState(initialCardSize);

  useEffect(() => {
    const updateCardSize = () => setCardSize(initialCardSize());
    window.addEventListener('resize', updateCardSize);
    updateCardSize();
    return () => window.removeEventListener('resize', updateCardSize);
  }, []);

  const active = data?.active || {};
  const complete = data?.complete || {};

  const stats = [
    {
      name: 'Task Assigned',
      amount: active.current || 0,
      change: active.percentage || 0,
    },
    {
      name: 'Task Completed',
      amount: complete.current || 0,
      change: complete.percentage || 0,
    },
  ];
  const total = stats.reduce((sum, item) => sum + item.amount, 0);
  const chartData = stats.map(item => {
    let fontcolor = 'red';
    if (item.change >= 0) {
      fontcolor = darkMode ? 'lightgreen' : 'green';
    }
    return {
      name: item.name,
      amount: item.amount,
      percentage: total > 0 ? `${((item.amount / total) * 100).toFixed(2)}%` : '0%',
      change: `${item.change >= 0 ? '+' : ''}${item.change}%`,
      fontcolor,
      color: ['#8e44ad', '#3498db'], // Purple and Blue
    };
  });

  const maxY =
    Math.ceil(Math.max(...stats.map(s => s.amount))) +
    Math.floor(Math.max(...stats.map(s => s.amount)) / 10);
  const tickInterval = Math.floor(maxY / 10) || 1;

  const renderCustomizedLabel = props => {
    const { x, y, width, value, index } = props;
    const { percentage, change, fontcolor } = chartData[index];
    return (
      <g>
        <text x={x + width / 2} y={y - 40} fontWeight="bold" textAnchor="middle">
          {value}
        </text>
        <text x={x + width / 2} y={y - 25} fontSize="0.8em" textAnchor="middle">
          ({percentage})
        </text>
        <text x={x + width / 2} y={y - 10} fill={fontcolor} fontSize="0.8em" textAnchor="middle">
          {change}
        </text>
      </g>
    );
  };

  return (
    <div style={{ height: cardSize.height }}>
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center">
          <div className="w-100vh">
            <Loading />
          </div>
        </div>
      ) : (
        <TinyBarChart
          chartData={chartData}
          maxY={maxY}
          tickInterval={tickInterval}
          renderCustomizedLabel={renderCustomizedLabel}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}
