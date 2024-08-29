import { useEffect, useState } from 'react';
import TinyBarChart from '../TinyBarChart';
import Loading from '../../common/Loading';

export default function HoursCompletedBarChart({ data, darkMode }) {
  const initialCardSize = () => {
    if (window.innerWidth <= 680) {
      return { height: '300px' };
    }
    if (window.innerWidth <= 1418) {
      return { height: '548px' };
    }
    return { height: '347px' };
  };
  const [cardSize, setCardSize] = useState(initialCardSize);
  const updateCardSize = () => {
    if (window.innerWidth <= 680) {
      setCardSize({ height: '300px' });
    } else if (window.innerWidth <= 1418) {
      setCardSize({ height: '548px' });
    } else {
      setCardSize({ height: '347px' });
    }
  };
  useEffect(() => {
    window.addEventListener('resize', updateCardSize);
    updateCardSize();
    return () => {
      window.removeEventListener('resize', updateCardSize);
    };
  }, []);
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <div className="w-100vh">
          <Loading />
        </div>
      </div>
    );
  }

  const { taskHours, projectHours, lastTaskHours, lastProjectHours } = data;
  const taskPercentage = parseFloat(taskHours) / (parseFloat(taskHours) + parseFloat(projectHours));
  const taskChangePercentage = parseFloat(taskHours - lastTaskHours) / parseFloat(lastTaskHours);
  const projectChangePercentage =
    parseFloat(projectHours - lastProjectHours) / parseFloat(lastProjectHours);
  const stats = [
    { name: 'Task', amount: taskHours, percentage: taskPercentage, change: taskChangePercentage },
    {
      name: 'Project',
      amount: projectHours,
      percentage: 1.0 - taskPercentage,
      change: projectChangePercentage,
    },
  ];

  const maxY =
    Math.ceil(Math.max(data.taskHours, data.projectHours)) +
    Math.floor(Math.max(data.taskHours, data.projectHours) / 10);
  const tickInterval = Math.floor(maxY / 10);
  const greenColor = darkMode ? 'lightgreen' : 'green';
  const chartData = stats.map(item => ({
    name: item.name,
    amount: item.amount,
    percentage: `${(item.percentage * 100).toFixed(2)}%`,
    change:
      item.change > 0
        ? `+${(item.change * 100).toFixed(0)}%`
        : `${(item.change * 100).toFixed(0)}%`,
    fontcolor: item.change >= 0 ? greenColor : 'red',
    color: ['rgba(76,75,245,255)', 'rgba(0,175,244,255)'],
  }));
  const renderCustomizedLabel = props => {
    const { x, y, width, value, index } = props;
    const { percentage } = chartData[index];
    const { change } = chartData[index];
    const perFontSize = cardSize.height === '548px' ? '0.6em' : '0.8em';
    const numFontSize = cardSize.height === '548px' ? '0.8em' : '1em';
    return (
      <g>
        <text
          x={x + width / 2}
          y={y - 40}
          style={{ fontSize: numFontSize, fontWeight: 'bold' }}
          fill={darkMode ? 'white' : 'dark'}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {value}
        </text>
        <text
          x={x + width / 2}
          y={y - 25}
          style={{ fontSize: perFontSize, fontWeight: 'bold' }}
          fill={darkMode ? 'white' : 'dark'}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {`(${percentage})`}
        </text>
        <text
          x={x + width / 2}
          y={y - 10}
          style={{ fontSize: perFontSize, fontWeight: 'bold' }}
          fill={chartData[index].fontcolor}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {change}
        </text>
      </g>
    );
  };

  return (
    <div style={{ height: cardSize.height }}>
      <h6 className={`${darkMode ? 'text-light' : 'text-dark'} fw-bold text-center`}>
        {' '}
        Hours Completed{' '}
      </h6>
      <TinyBarChart
        chartData={chartData}
        maxY={maxY}
        tickInterval={tickInterval}
        renderCustomizedLabel={renderCustomizedLabel}
      />
    </div>
  );
}
