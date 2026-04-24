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

  if (!data || !data.taskHours || !data.projectHours) {
    return (
      <div className="d-flex justify-content-center align-items-center">No data available</div>
    );
  }

  const { taskHours, projectHours } = data;

  const normalizePercentage = value => {
    const raw = value ?? 0;
    return raw > 1 ? raw : raw * 100;
  };

  const taskPercentage = normalizePercentage(taskHours.submittedToCommittedHoursPercentage);
  const projectPercentage = normalizePercentage(projectHours.submittedToCommittedHoursPercentage);
  const taskChangePercentage = normalizePercentage(taskHours.comparisonPercentage);
  const projectChangePercentage = normalizePercentage(projectHours.comparisonPercentage);
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
    percentage: `${item.percentage.toFixed(2)}%`,
    change: item.change > 0 ? `+${item.change.toFixed(0)}%` : `${item.change.toFixed(0)}%`,
    fontcolor: item.change >= 0 ? greenColor : 'red',
    color: ['rgba(76,75,245,255)', 'rgba(0,175,244,255)'],
  }));
  const projectBarInfo = {
    ifcompare: projectChangePercentage !== undefined && projectChangePercentage !== null,
    amount: projectHours.count,
    percentage: `${projectPercentage.toFixed(2)}%`,
    change:
      projectChangePercentage > 0
        ? `+${projectChangePercentage.toFixed(0)}%`
        : `${projectChangePercentage.toFixed(0)}%`,
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
          fill={darkMode ? 'white' : '#333'}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {value}
        </text>
        <text
          x={x + width / 2}
          y={y - 25}
          style={{ fontSize: perFontSize, fontWeight: 'bold' }}
          fill={darkMode ? 'white' : '#444'}
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
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          height: '380px',
          minHeight: '300px',
          maxHeight: '548px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Projects box positioned in the right side middle area */}
        <div
          style={{
            position: 'absolute',
            top: '40%',
            left: '65%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            background: 'white',
            borderRadius: 4,
            padding: 8,
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            border: '1px solid #eee',
            minWidth: 130,
            minHeight: 65,
            display: 'grid',
            justifyItems: 'center',
            gap: 2,
          }}
        >
          <div style={{ color: '#444', fontWeight: 'bold', fontSize: 15 }}>Projects</div>
          <div style={{ color: '#222', fontWeight: 'bold', fontSize: 14 }}>
            {projectBarInfo.amount}
          </div>
          <div style={{ color: '#666', fontSize: 10 }}>({projectBarInfo.percentage})</div>
          {projectBarInfo.ifcompare && (
            <div style={{ color: projectBarInfo.fontcolor, fontSize: 10, fontWeight: 'bold' }}>
              {projectBarInfo.change}
            </div>
          )}
        </div>

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
            {(() => {
              const raw = data.hoursSubmittedToTasksPercentage ?? 0;
              const normalized = raw > 1 ? raw : raw * 100;
              const formatted = `${normalized.toFixed(1)}%`;
              return `${formatted} of Total Tangible Hours Submitted to Tasks`;
            })()}
            {(() => {
              const raw = data.hoursSubmittedToTasksComparisonPercentage;
              if (raw === undefined || raw === null) {
                // No comparison → hide metrics
                return null;
              }
              const normalized = raw > 1 ? raw : raw * 100;
              const isPositive = normalized >= 0;
              let color;
              if (isPositive) {
                color = darkMode ? 'lightgreen' : 'green';
              } else {
                color = 'red';
              }
              const formatted = isPositive
                ? `+${normalized.toFixed(0)}%`
                : `${normalized.toFixed(0)}%`;
              return <span style={{ color, marginLeft: 8, fontSize: '12px' }}>{formatted}</span>;
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
            yAxisLabel="Hours"
          />
        </div>
      </div>

      {/* Distribution Label — outside the fixed-height area so it never gets clipped */}
      <div style={{ textAlign: 'center', padding: '8px 12px 4px' }}>
        {(() => {
          const taskCount = taskHours.count || 0;
          const projectCount = projectHours.count || 0;
          const totalCount = taskCount + projectCount;

          if (totalCount === 0) {
            return (
              <div style={{ fontSize: '12px', color: darkMode ? '#ffffff' : '#555' }}>
                No data available
              </div>
            );
          }

          const taskPercent = ((taskCount / totalCount) * 100).toFixed(1);
          const projectPercent = ((projectCount / totalCount) * 100).toFixed(1);

          return (
            <>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: darkMode ? '#ffffff' : '#333',
                  letterSpacing: '0.3px',
                }}
              >
                {taskPercent}% Tasks ({taskCount}) | {projectPercent}% Projects ({projectCount})
              </div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  color: darkMode ? '#cccccc' : '#555',
                }}
              >
                (Total = 100%)
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
