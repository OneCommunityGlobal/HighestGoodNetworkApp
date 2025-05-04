import Loading from 'components/common/Loading';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, Bar, Cell } from 'recharts';

const COLORS = [
  '#14b32b',
  '#f2b93d',
  '#1356ad',
  '#f06813',
  '#eb34b4',
  '#47c4ed',
  '#59f0cf',
  '#f0ec18',
];

function CustomizedLabel(props) {
  const { x, y, value, sum, width } = props;

  if (!sum || isNaN(sum) || !isFinite(sum) || !isFinite(value)) return null;

  const percentage = ((value / sum) * 100).toFixed(2);
  const centerX = x + width / 2;

  return (
    <g>
      <text x={centerX} y={y - 10} textAnchor="middle">
        <tspan x={centerX} dy="-10" fontSize="0.7em" fontWeight="bold" fill="grey">
          {value}
        </tspan>
        <tspan x={centerX} dy="10" fontSize="0.5em" fontWeight="bold" fill="grey">
          {`(${percentage}%)`}
        </tspan>
      </text>
    </g>
  );
}

export default function WorkDistributionBarChart({ isLoading, workDistributionStats }) {
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <div className="w-100vh">
          <Loading />
        </div>
      </div>
    );
  }

  // Prepare and sanitize data
  const filteredStats = (workDistributionStats || []).filter(
    item => item._id && isFinite(item.totalHours)
  );

  const data = filteredStats.map(item => ({
    ...item,
    totalHours: Number(item.totalHours.toFixed(2)),
  }));

  const totalValues = data.map(item => item.totalHours);
  const sum = totalValues.reduce((acc, val) => acc + val, 0);

  // Debug logs
  console.log('Raw stats:', workDistributionStats);
  console.log('Processed data:', data);
  console.log('Sum of totalHours:', sum);

  const isDarkMode =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (!data.length || !isFinite(sum) || sum === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <h5>No work distribution data available</h5>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={400} minHeight={430}>
      <BarChart
        data={data}
        barCategoryGap="20%"
        margin={{ top: 40, right: 20, left: 10, bottom: 20 }}
      >
        <XAxis
          dataKey="_id"
          tick={{ fontSize: 10, fill: isDarkMode ? '#FFFFFF' : '#333333' }}
          interval={0}
          angle={-30}
          textAnchor="end"
        />
       <YAxis
  tick={{ fontSize: 12, fill: isDarkMode ? '#FFFFFF' : '#333333' }}
  label={{
    value: 'Total Hours',
    angle: -90,
    position: 'insideLeft',
    fill: isDarkMode ? '#FFFFFF' : '#333333',
    fontSize: 14,
  }}
/>

        <Tooltip />
        <Legend />
        <Bar
          dataKey="totalHours"
          fill="#8884d8"
          legendType="none"
          label={<CustomizedLabel sum={sum} />}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${entry._id}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
