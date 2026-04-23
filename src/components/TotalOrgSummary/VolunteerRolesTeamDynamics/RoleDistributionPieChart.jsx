import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import Loading from '~/components/common/Loading';

const COLORS = [
  '#2F80ED', // blue
  '#56CCF2', // light blue
  '#27AE60', // green
  '#6FCF97', // light green
  '#F2994A', // orange
  '#F2C94C', // yellow
  '#E14848', // red
  '#9B51E0', // purple
  '#F765A3', // pink
  '#4F4F4F', // dark
  '#828282', // grey
];

// Explicit role-to-color mapping to keep key roles visually distinct and stable.
const ROLE_COLOR_MAP = {
  Volunteer: '#8ebfff',
  Manager: '#27AE60',
  Administrator: '#fb0505',
  'Core Team': '#8100fa',
  Owner: '#f68d42',
  Mentor: '#f2ff00',
};

import CustomTooltip from '../../CustomTooltip';

const RoleDistributionPieChart = ({ roleDistributionStats = [], isLoading, darkMode }) => {
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <div className="w-100vh">
          <Loading />
        </div>
      </div>
    );
  }

  roleDistributionStats.sort((a, b) => b.count - a.count);
  const data = roleDistributionStats.map((item, index) => ({
    name: item._id,
    value: item.count,
    // Use a stable role mapping first, otherwise fallback by index.
    color: ROLE_COLOR_MAP[item._id] || COLORS[index % COLORS.length],
  }));
  const totalValue = data.reduce((sum, entry) => sum + entry.value, 0);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <g>
        <text fill="black" textAnchor="middle" dominantBaseline="central">
          {percent > 0.01 && (
            <>
              <tspan x={x} y={y - 5} fontSize="0.7em" fontWeight="bold">
                {`${data[index].value}`}
              </tspan>
              <tspan x={x} y={y + 5} fontSize="0.5em" fontWeight="bold">
                {`(${(percent * 100).toFixed(0)}%)`}
              </tspan>
            </>
          )}
        </text>
        <text fill="blue" textAnchor="middle" dominantBaseline="central">
          <tspan x={cx} y={cy - 15} fontSize="1.2em" fill={darkMode ? 'white ' : 'grey'}>
            TOTAL ROLES
          </tspan>
          <tspan x={cx} y={cy + 15} fontSize="1.5em" fill={darkMode ? 'white ' : 'grey'}>
            {data.length}
          </tspan>
        </text>
      </g>
    );
  };

  const renderCustomLegend = props => {
    const { payload } = props; // payload is an array of legend items provided by Recharts

    return (
      <ul
        style={{
          listStyle: 'none', // Remove default bullet points
          margin: 0,
          paddingLeft: '20px', // Indent legend from the pie
          textAlign: 'left', // Align text to the left
          maxHeight: '400px', // Max height for the legend area
          overflowY: 'auto', // Make legend scrollable if it exceeds maxHeight
        }}
      >
        {payload.map(entry => {
          // 'entry.value' here corresponds to the 'nameKey' of the Pie (which we set to 'name')
          const itemName = entry.value;
          // Find the original data object to get the count and original color
          const itemData = data.find(d => d.name === itemName);

          // If for some reason data is not found, skip rendering this legend item
          if (!itemData) {
            return null;
          }

          const { value, color } = itemData; // 'value' is the count
          const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;

          return (
            <li
              key={`item-${itemName}`} // Use itemName for a stable key
              style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  backgroundColor: color, // Use the color from our mapped data
                  marginRight: '5px',
                  flexShrink: 0, // Prevent the color swatch from shrinking
                }}
              />
              <span style={{ color: darkMode ? 'white' : 'grey', fontSize: '12px' }}>
                {`${itemName}: ${value} (${percentage.toFixed(1)}%)`}
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div style={{ margin: '15px 10px 10px 10px', overflowX: 'auto' }}>
      <div style={{ minWidth: 500 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={400} minHeight={430}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="50%"
              outerRadius="100%"
              legendType="square"
              labelLine={false}
              label={renderCustomizedLabel}
              startAngle={-270}
              endAngle={90}
              stroke="none"
              dataKey="value"
            >
              {data.map(entry => (
                <Cell key={`cell-${entry.name}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              content={renderCustomLegend}
            />
            <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RoleDistributionPieChart;
