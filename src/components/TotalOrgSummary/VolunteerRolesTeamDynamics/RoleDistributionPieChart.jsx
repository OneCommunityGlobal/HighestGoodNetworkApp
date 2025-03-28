import Loading from 'components/common/Loading';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = [
  '#F285BB',
  '#77A9EE',
  '#F2AB53',
  '#1B6DDF',
  '#C92929',
  '#1BC590',
  '#7ff0f0',
  '#6e33cc',
  '#cc2fa7',
  '#EE9322',
  '#86ebcc',
  '#bafc03',
  '#cf583a',
  '#46d130',
];

export default function RoleDistributionPieChart({ isLoading, roleDistributionStats }) {
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
    color: COLORS[index],
  }));

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
          <tspan x={cx} y={cy - 15} fontSize="1.2em" fill="grey">
            TOTAL ROLES
          </tspan>
          <tspan x={cx} y={cy + 15} fontSize="1.5em" fill="grey">
            {data.length}
          </tspan>
        </text>
      </g>
    );
  };

  const renderCustomLegend = props => {
    const { payload } = props;
    return (
      <ul>
        {payload.map(entry => (
          <li
            key={`item-${entry.value}`}
            style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                backgroundColor: entry.color,
                marginRight: '3px',
              }}
            />
            <span style={{ color: 'grey', fontSize: '12px' }}>{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <ResponsiveContainer width="100%" height="100%" minWidth={400} minHeight={430}>
        <PieChart className="test2">
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
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
