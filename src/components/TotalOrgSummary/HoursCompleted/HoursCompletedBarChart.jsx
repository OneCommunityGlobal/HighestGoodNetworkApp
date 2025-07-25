import { useEffect, useState } from 'react';
import TinyBarChart from '../TinyBarChart';
import Loading from '../../common/Loading';

export default function HoursCompletedBarChart({ isLoading, data, darkMode }) {
  const initialCardSize = () => {
    if (window.innerWidth <= 680) {
      return { height: '240px' };
    }
    if (window.innerWidth <= 1418) {
      return { height: '320px' };
    }
    return { height: '320px' };
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

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <div className="w-100vh">
          <Loading />
        </div>
      </div>
    );
  }

  const { taskHours, projectHours } = data;

  const taskPercentage = taskHours.submittedToCommittedHoursPercentage;
  const projectPercentage = projectHours.submittedToCommittedHoursPercentage;
  const taskChangePercentage = taskHours.comparisonPercentage;
  const projectChangePercentage = projectHours.comparisonPercentage;
  const stats = [
    {
      name: 'Tasks',
      amount: taskHours.count,
      percentage: taskPercentage,
      change: taskChangePercentage,
    },
    {
      name: 'Project',
      amount: projectHours.count,
      percentage: projectPercentage,
      change: projectChangePercentage,
    },
  ];

  const maxY = Math.ceil(Math.max(taskHours.count, projectHours.count) * 1.2) + 1;

  const tickInterval = Math.floor(maxY / 10) === 0 ? 1 : Math.floor(maxY / 10);
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
  const projectBarInfo = {
    amount: projectHours.count,
    percentage: `${(projectPercentage * 100).toFixed(2)}%`,
    change:
      projectChangePercentage > 0
        ? `+${(projectChangePercentage * 100).toFixed(0)}%`
        : `${(projectChangePercentage * 100).toFixed(0)}%`,
    fontcolor: projectChangePercentage >= 0 ? greenColor : 'red',
  };
  const renderCustomizedLabel = props => {
    const { x, y, width, value, index } = props;
    if (typeof y !== 'number' || Number.isNaN(y)) {
      return null;
    }
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
    <div
      style={{
        height: '548px',
        minHeight: '548px',
        maxHeight: '548px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 0 }}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: darkMode ? 'white' : '#222',
            display: 'grid',
            justifyItems: 'center',
          }}
        >
          <span style={{ maxWidth: 200 }}>
            {`${data.hoursSubmittedToTasksPercentage *
              100}% of Total Tangible Hours Submitted to Tasks`}
          </span>
          {(() => {
            const isPositive = data.hoursSubmittedToTasksComparisonPercentage >= 0;
            let color;
            if (isPositive) {
              color = darkMode ? 'lightgreen' : 'green';
            } else {
              color = 'red';
            }
            const value = isPositive
              ? `+${(data.hoursSubmittedToTasksComparisonPercentage * 100).toFixed(0)}%`
              : `${(data.hoursSubmittedToTasksComparisonPercentage * 100).toFixed(0)}%`;
            return <span style={{ color, marginLeft: 8, fontSize: '12px' }}>{value}</span>;
          })()}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <TinyBarChart
          chartData={chartData.filter(item => item.name === 'Tasks')}
          maxY={maxY}
          tickInterval={tickInterval}
          renderCustomizedLabel={renderCustomizedLabel}
          darkMode={darkMode}
          projectBarInfo={projectBarInfo}
          yAxisLabel="Hours"
        />
      </div>
    </div>
  );
}
