import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#800080'];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  value,
  totalHoursCalculated,
  title,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <>
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {value.toFixed(0)}
      </text>
      <text
        x={x}
        y={y + 18}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="10"
      >
        {`(${(percent * 100).toFixed(0)}%)`}
      </text>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#696969">
        {title}
      </text>
      <text x={cx} y={cy} dy={35} textAnchor="middle" fill="#696969" fontSize="25">
        {totalHoursCalculated.toFixed(0)}
      </text>
    </>
  );
};

export default function HoursWorkedPieChart({ userData, darkMode, windowSize }) {
  let circleSize = 30;
  if (windowSize.width <= 650) {
    circleSize = -(windowSize.width / 10) * 0.25;
  }

  return (
    <div className={darkMode ? 'text-light' : ''}>
      <ResponsiveContainer maxWidth={640} maxHeight={640} minWidth={350} minHeight={350}>
        <PieChart>
          <Pie
            data={userData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            innerRadius={50 + circleSize}
            outerRadius={130 + circleSize}
            fill="#8884d8"
            dataKey="value"
          >
            {Array.isArray(userData) &&
              userData.length > 0 &&
              userData.map((entry, index) => (
                <Cell key={`cell-${entry.value}`} fill={COLORS[index % COLORS.length]} />
              ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
