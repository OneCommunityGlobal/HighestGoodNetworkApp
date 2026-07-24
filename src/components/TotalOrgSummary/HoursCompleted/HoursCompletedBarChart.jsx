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
  // --- Item G: Tasks/Projects hour distribution (sums to 100% dynamically) ---
  const taskHoursCount = Number(taskHours.count) || 0;
  const projectHoursCount = Number(projectHours.count) || 0;
  const totalCompletedHours = taskHoursCount + projectHoursCount;
  // Guard against divide-by-zero when no hours were submitted at all.
  const taskSharePercent =
    totalCompletedHours > 0 ? (taskHoursCount / totalCompletedHours) * 100 : 0;
  // Derive the project share from 100 - taskSharePercent (rather than computing it
  // independently) so the two values always sum to exactly 100%, even with
  // floating point rounding.
  const projectSharePercent = totalCompletedHours > 0 ? 100 - taskSharePercent : 0;
  const distributionLabel = `Hours Completed Split — ${taskSharePercent.toFixed(
    1,
  )}% Tasks (${taskHoursCount.toFixed(2)}) | ${projectSharePercent.toFixed(
    1,
  )}% Projects (${projectHoursCount.toFixed(2)}) (Total = 100%)`;

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
      {/*
        The old floating "Projects" summary box (positioned via fixed
        top/right percentages) has been removed. It duplicated the amount,
        percentage, and change already rendered directly above the Project
        bar via renderCustomizedLabel, and its fixed-percentage positioning
        caused it to visually collide with that in-chart label whenever the
        bar was tall (e.g. short date ranges with small maxY). The in-chart
        label is now the single source of truth for the Project bar's stats.
      */}

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
            return `${formatted} of Committed Hours Submitted (Tasks)`;
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

      {/*
        Previously TinyBarChart was rendered TWICE here (both instances
        filtering chartData down to just 'Tasks'), which produced the
        second, empty-looking "Hours" axis stacked below the first one in
        the screenshot — and meant Project hours were never actually
        plotted as a bar, only shown in the floating Projects box above.
        This is now a single chart render, including both Tasks and
        Project bars with their labels.
      */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <TinyBarChart
          chartData={chartData}
          maxY={maxY}
          tickInterval={tickInterval}
          renderCustomizedLabel={renderCustomizedLabel}
          darkMode={darkMode}
          yAxisLabel="Hours"
        />
      </div>

      {/*
        Item G: single combined label below the chart showing the
        Tasks/Projects hour distribution, e.g. "34.5% Tasks (12.34) | 65.5%
        Projects (23.45) (Total = 100%)". Percentages are derived so they
        always sum to exactly 100%, unlike the independent
        submittedToCommittedHoursPercentage values shown above/in the
        Projects box, which measure something different (submitted vs.
        committed hours per category) and do not sum to 100%.
      */}
      <div
        style={{
          textAlign: 'center',
          marginTop: 8,
          fontSize: '13px',
          fontWeight: 500,
          color: darkMode ? 'white' : '#222',
        }}
      >
        {distributionLabel}
      </div>
    </div>
  );
}
