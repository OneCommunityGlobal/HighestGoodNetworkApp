import TinyBarChart from '../TinyBarChart';

export default function HoursCompletedBarChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div style={{ height: '383px' }}>
        <h3 style={{ color: 'black' }}>Hours Completed</h3>
        <p>Loading... </p>
      </div>
    );
  }
  const { taskHours, projectHours, lastTaskHours, lastProjectHours } = data;
  console.log("data", data)
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
    Math.max(data.taskHours, data.projectHours) +
    Math.floor(Math.max(data.taskHours, data.projectHours) / 10);
  const tickInterval = Math.floor(maxY / 10);

  const chartData = stats.map(item => ({
    name: item.name,
    amount: item.amount,
    percentage: `${(item.percentage * 100).toFixed(2)}%`,
    change:
      item.change > 0
        ? `+${(item.change * 100).toFixed(0)}%`
        : `${(item.change * 100).toFixed(0)}%`,
    fontcolor: item.change >= 0 ? 'green' : 'red',
    color: ['rgba(76,75,245,255)', 'rgba(0,175,244,255)'],
  }));
  const renderCustomizedLabel = props => {
    const { x, y, width, value, index } = props;
    const { percentage } = chartData[index];
    const { change } = chartData[index];
    return (
      <g>
        <text
          x={x + width / 2}
          y={y - 40}
          style={{ fontSize: '1em', fontWeight: 'bold' }}
          fill="black"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {value}
        </text>
        <text
          x={x + width / 2}
          y={y - 25}
          style={{ fontSize: '0.8em', fontWeight: 'bold' }}
          fill="black"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {`(${percentage})`}
        </text>
        <text
          x={x + width / 2}
          y={y - 10}
          style={{ fontSize: '0.8em', fontWeight: 'bold' }}
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
    <div style={{ height: '383px' }}>
      <h3 style={{ color: 'black' }}>Hours Completed</h3>
      <TinyBarChart
        chartData={chartData}
        maxY={maxY}
        tickInterval={tickInterval}
        renderCustomizedLabel={renderCustomizedLabel}
      />
    </div>
  );
}
