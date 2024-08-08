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
  totalHours,
  title,
  totalOverTimeHours,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.4;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const percentage = Math.round((totalHours / totalOverTimeHours - 1) * 100);
  const fillColor = totalHours / totalOverTimeHours > 1 ? 'green' : 'red';

  const textContent = `${percentage}% week over week`;
  const fontSize = 10;
  const maxTextLength = Math.floor((innerRadius / fontSize) * 4);

  let adjustedText = textContent;
  if (textContent.length > maxTextLength) {
    adjustedText = `${textContent.substring(0, maxTextLength - 3)}...`;
  }

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
        fontSize="8"
      >
        {`(${(percent * 100).toFixed(0)}%)`}
      </text>
      <text x={cx} y={cy} dy={-7} textAnchor="middle" fill="#696969">
        {title}
      </text>
      <text x={cx} y={cy} dy={14} textAnchor="middle" fill="#696969" fontSize="25">
        {totalHours.toFixed(0)}
      </text>
      <text x={cx} y={cy} dy={24} textAnchor="middle" fill={fillColor} fontSize="10">
        {adjustedText}
      </text>
    </>
  );
};

export default function HoursWorkedPieChart({ userData, darkMode, windowSize }) {
  let innerRadius = 80;
  let outerRadius = 160;
  if (windowSize.width <= 650) {
    innerRadius = 65;
    outerRadius = 130;
  }
  return (
    <div className={darkMode ? 'text-light' : ''}>
      <ResponsiveContainer maxWidth={600} maxHeight={600} minWidth={320} minHeight={320}>
        <PieChart>
          <Pie
            data={userData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
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
