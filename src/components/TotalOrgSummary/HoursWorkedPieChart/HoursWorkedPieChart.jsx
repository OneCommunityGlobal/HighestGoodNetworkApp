import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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
  comparisonPercentage,
  comparisonType,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.4;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const percentage = Math.round(comparisonPercentage);
  const fillColor = comparisonPercentage > 1 ? 'green' : 'red';

  const textContent =
    comparisonType !== 'No Comparison' ? `${percentage}% ${comparisonType.toLowerCase()}` : '';
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
        fill="black"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontWeight="bold"
      >
        {value > 0 && value.toFixed(0)}
      </text>
      <text
        x={x}
        y={y + 18}
        fill="black"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {percent > 0 && `(${(percent * 100).toFixed(0)}%)`}
      </text>
      <text x={cx} y={cy} dy={-15} textAnchor="middle" fill="#696969">
        {title}
      </text>
      <text x={cx} y={cy} dy={14} textAnchor="middle" fill="#696969" fontSize="25">
        {totalHours.toFixed(0)}
      </text>
      {comparisonType !== 'No Comparison' && (
        <text x={cx} y={cy} dy={35} textAnchor="middle" fill={fillColor} fontSize="12">
          {adjustedText}
        </text>
      )}
    </>
  );
};

import CustomTooltip from '../../CustomTooltip';

export default function HoursWorkedPieChart({ userData, windowSize, comparisonType, colors }) {
  let innerRadius = 80;
  let outerRadius = 160;
  if (windowSize.width <= 650) {
    innerRadius = 65;
    outerRadius = 130;
  }
  return (
    <div>
      <ResponsiveContainer maxWidth={600} maxHeight={600} minWidth={320} minHeight={320}>
        <PieChart>
          <Pie
            data={userData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={props => renderCustomizedLabel({ ...props, comparisonType })}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey="value"
          >
            {Array.isArray(userData) &&
              userData.length > 0 &&
              userData.map((entry, index) => (
                <Cell key={`cell-${entry.value}`} fill={colors[index % colors.length]} />
              ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
