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

function AgeChart({ data, compareLabel }) {
  const formatTooltip = (value, name, props) => {
    const { change } = props?.payload ?? {};
    if (compareLabel != null && typeof change === 'number') {
      const changeText =
        change > 0
          ? `${change}% more than ${compareLabel}`
          : change < 0
          ? `${Math.abs(change)}% less than ${compareLabel}`
          : `No change from ${compareLabel}`;
      return [`${value} (${changeText})`, 'Applicants'];
    }
    return [`${value}`, 'Applicants'];
  };

  // IMPORTANT: give the component a real block with height:100%
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ textAlign: 'center', margin: '0 0 8px' }}>
        Applicants Grouped by Age
      </h2>

      {/* This wrapper gives ResponsiveContainer a real height */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }} barSize={80}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="ageGroup"
              tick={{ fill: '#333', fontWeight: 500 }}
              label={{ value: 'Age Group', position: 'insideBottom', offset: -5, fill: '#333', fontWeight: 600 }}
            />
            <YAxis
              tick={{ fill: '#333', fontWeight: 500 }}
              label={{
                value: 'Number of Applicants',
                angle: -90,
                position: 'insideLeft',
                offset: -5,
                fill: '#333',
                fontWeight: 600,
              }}
            />
            <Tooltip formatter={formatTooltip} />
            <Bar dataKey="applicants" fill="#3b82f6">
              <LabelList dataKey="applicants" position="top" fill="#222" fontWeight="600" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AgeChart;
