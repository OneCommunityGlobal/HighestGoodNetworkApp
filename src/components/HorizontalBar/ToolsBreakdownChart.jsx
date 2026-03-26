import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

const ToolsBreakdownChart = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 450 }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
        Tools Most Susceptible to Breakdown
      </h2>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 40, left: 80, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            domain={[0, 100]}
            label={{
              value: '% of requirement satisfied',
              position: 'insideBottom',
              offset: -10,
            }}
          />
          <YAxis
            type="category"
            dataKey="toolName"
            label={{
              value: 'Tool Name',
              angle: -90,
              position: 'insideLeft',
            }}
            width={140}
          />
          <Tooltip formatter={value => `${value}%`} />
          <Bar dataKey="requirementSatisfiedPercentage" radius={[0, 8, 8, 0]}>
            <LabelList
              dataKey="requirementSatisfiedPercentage"
              position="right"
              formatter={value => `${value}%`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ToolsBreakdownChart;
