import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Label,
} from 'recharts';

function AgeChart({ data, compareLabel, darkMode }) {
  const formatTooltip = (value, name, props) => {
    const { change } = props.payload;
    let changeText = '';
    if (compareLabel && change !== undefined) {
      if (change > 0) {
        changeText = `${change}% more than ${compareLabel}`;
      } else if (change < 0) {
        changeText = `${Math.abs(change)}% less than ${compareLabel}`;
      } else {
        changeText = `No change from ${compareLabel}`;
      }
      return [`${value} (${changeText})`, 'Applicants'];
    }
    return [`${value}`, 'Applicants'];
  };

  // Use ReportPage dark mode reference
  const chartBg = darkMode ? '#222e3c' : '#fff';
  const chartText = darkMode ? '#fff' : '#222';
  const barColor = darkMode ? '#60a5fa' : '#3b82f6';

  return (
    <div
      style={{
        width: '800px',
        height: 500,
        margin: '0 auto',
        padding: '20px',
        background: chartBg,
        borderRadius: '16px',
        color: chartText,
        boxShadow: darkMode ? '0 2px 16px rgba(30,40,60,0.32)' : '0 2px 8px rgba(0,0,0,0.08)',
        border: darkMode ? '1px solid #2c3a4e' : '1px solid #e0e0e0',
        transition: 'background 0.3s, color 0.3s',
      }}
    >
      <h2 style={{ color: chartText }}>Applicants grouped by Age</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }} barSize={80}>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#ccc'} />
          <XAxis dataKey="ageGroup" stroke={chartText} tick={{ fill: chartText }}>
            <Label value="Age Groups" offset={0} position="bottom" style={{ fill: chartText }} />
          </XAxis>
          <YAxis stroke={chartText} tick={{ fill: chartText }}>
            <Label
              value="Number of Applicants"
              angle={-90}
              position="insideLeft"
              style={{ textAnchor: 'middle', fill: chartText }}
            />
          </YAxis>
          <Tooltip
            formatter={formatTooltip}
            wrapperStyle={{
              background: chartBg,
              color: chartText,
              border: darkMode ? '1px solid #2c3a4e' : '1px solid #e0e0e0',
            }}
            labelStyle={{ color: chartText }}
            itemStyle={{ color: chartText }}
          />
          <Bar dataKey="applicants" fill={barColor} radius={[8, 8, 0, 0]}>
            <LabelList dataKey="applicants" position="top" style={{ fill: chartText }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AgeChart;
