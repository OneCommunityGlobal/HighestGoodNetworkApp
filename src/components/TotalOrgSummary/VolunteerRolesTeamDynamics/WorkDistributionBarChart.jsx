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

  // TODO: workDistributionStats should not require a filter. Backend api needs a fix to not return a null _id field.
  const data = workDistributionStats
    .filter(item => item._id)
    .sort((a, b) => a._id.localeCompare(b._id))
    .map(item => {
      return { ...item, totalHours: Number(item.totalHours.toFixed(2)) };
    });
  const value = data.map(item => Number(item.totalHours.toFixed(2)));
  const sum = value.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={400} minHeight={430}>
      <BarChart
        data={data}
        barCategoryGap="20%"
        margin={{ top: 40, right: 20, left: 10, bottom: 20 }}
      >
        <XAxis dataKey="_id" tick={{ fontSize: 12, color: 'grey' }} />
        <YAxis tick={{ fontSize: 12, color: 'grey' }} />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="totalHours"
          fill="#8884d8"
          legendType="none"
          label={<CustomizedLabel sum={sum} />}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${entry._id}`} fill={COLORS[index % 20]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
