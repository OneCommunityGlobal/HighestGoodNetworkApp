import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import PropTypes from 'prop-types';

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
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.4;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // no comparison data; simply show count and percentage of slice
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
    </>
  );
};

import CustomTooltip from '../../CustomTooltip';

export default function HoursWorkedPieChart({ userData, windowSize, colors, totalHours = 0 }) {
  let innerRadius = 80;
  let outerRadius = 160;
  if (windowSize.width <= 650) {
    innerRadius = 65;
    outerRadius = 130;
  }
  // We'll display totalHours in centre
  const displayTotalHours = totalHours || 0;
  return (
    <div>
      <ResponsiveContainer maxWidth={600} maxHeight={600} minWidth={320} minHeight={320}>
        <PieChart>
          <Pie
            data={userData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={props =>
              renderCustomizedLabel({
                ...props,
                totalHours: displayTotalHours,
                title: 'TOTAL HOURS WORKED',
              })
            }
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey="value"
          >
            {Array.isArray(userData) &&
              userData.length > 0 &&
              userData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
          </Pie>
          <Tooltip content={<CustomTooltip tooltipType="hoursDistribution" />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

HoursWorkedPieChart.propTypes = {
  userData: PropTypes.array.isRequired,
  windowSize: PropTypes.shape({ width: PropTypes.number, height: PropTypes.number }).isRequired,
  colors: PropTypes.array,
  totalHours: PropTypes.number,
};
