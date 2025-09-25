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

function AgeChart({ data, compareLabel, darkMode }) {
  const formatTooltip = (value, name, props) => {
    const { change } = props.payload;
    if (compareLabel && change !== undefined) {
      let changeText = '';
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
  const chartBg = darkMode ? '#222e3c' : '#fff';
  const chartText = darkMode ? '#fff' : '#000';
  const barColor = darkMode ? '#60a5fa' : '#3b82f6';
  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1000px',
        height: '60vh',
        minHeight: '350px',
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
      {/* Dark mode tooltip override */}
      {darkMode && (
        <style>{`
          .default-tooltip {
            background: #222e3c !important;
            color: #fff !important;
            border: 1px solid #2c3a4e !important;
            box-shadow: 0 2px 16px rgba(30,40,60,0.32) !important;
          }
          .recharts-tooltip-label {
            color: #60a5fa !important;
          }
        `}</style>
      )}

      <h2 style={{ color: chartText, textAlign: 'center' }}>Applicants Grouped by Age</h2>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          barSize={65} // compromise between 60 and 70
        >
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#444' : '#ccc'} />
          <XAxis
            dataKey="ageGroup"
            tick={{ fill: chartText }}
            label={{
              value: 'Age Groups',
              position: 'insideBottom',
              offset: -5,
              fill: chartText,
            }}
          />
          <YAxis
            tick={{ fill: chartText }}
            label={{
              value: 'Number of Applicants',
              angle: -90,
              position: 'insideLeft',
              fill: chartText,
              offset: -5,
            }}
          />
          <Tooltip formatter={formatTooltip} />
          <Bar dataKey="applicants" fill={barColor}>
            <LabelList dataKey="applicants" position="top" fill={chartText} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
export default AgeChart;
