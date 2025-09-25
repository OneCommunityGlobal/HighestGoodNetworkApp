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

  // Enhanced styling to avoid merge conflicts
  const chartContainerStyle = {
    width: '100%',
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: darkMode ? '#2d3748' : '#f8f9fa',
    borderRadius: '12px',
    boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
  };

  return (
    <div
      className={darkMode ? 'bg-oxford-blue text-light' : 'bg-white text-black'}
      style={chartContainerStyle}
    >
      <h2 style={{ color: darkMode ? '#fff' : '#000', textAlign: 'center' }}>
        Applicants Grouped by Age
      </h2>
      <div style={{ width: '100%', height: '60vh', minHeight: '350px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }} barSize={60}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#555' : '#ccc'} />
            <XAxis
              dataKey="ageGroup"
              label={{
                value: 'Age Group',
                position: 'insideBottom',
                offset: -5,
                fill: darkMode ? '#fff' : '#000',
              }}
              tick={{ fill: darkMode ? '#fff' : '#000' }}
            />
            <YAxis
              label={{
                value: 'Number of Applicants',
                angle: -90,
                position: 'insideLeft',
                offset: -5,
                fill: darkMode ? '#fff' : '#000',
              }}
              tick={{ fill: darkMode ? '#fff' : '#000' }}
            />
            <Tooltip
              formatter={formatTooltip}
              contentStyle={{
                backgroundColor: darkMode ? '#fff' : '#fff',
                color: darkMode ? '#000' : '#000',
                border: `1px solid ${darkMode ? '#555' : '#ccc'}`,
              }}
            />
            <Bar dataKey="applicants" fill={darkMode ? '#60a5fa' : '#3b82f6'}>
              <LabelList dataKey="applicants" position="top" fill={darkMode ? '#fff' : '#000'} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AgeChart;
