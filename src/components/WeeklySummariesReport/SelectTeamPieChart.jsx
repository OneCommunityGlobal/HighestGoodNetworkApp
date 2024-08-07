import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function SelectTeamPieChart(props) {
  const { chartData, COLORS,total } = props;
  console.log("props", props)
return (
        <ResponsiveContainer width="100%" height={500}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    fill="#8884d8"
                    label={({ name, value }) => `${name}:(${Math.round((value / total) * 100)}%)`}
                  >
                    {chartData.map((entry, index) => (
                      
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      /> 
                    ))}
                  </Pie>
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                    Total: {total}
                  </text>
                </PieChart>
              </ResponsiveContainer>
)};