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
  // Guard against invalid data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return null;
  }

  // Validate data structure
  const validData = data.filter(
    item => item && item.ageGroup && typeof item.applicants === 'number' && !isNaN(item.applicants),
  );

  if (validData.length === 0) {
    return null;
  }

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

  return (
    <div
      className={darkMode ? 'bg-oxford-blue text-light' : 'bg-white text-black'}
      style={{
        width: '100%',
        maxWidth: '100%',
        margin: '0 auto',
        padding: 'clamp(10px, 2vw, 20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '60vh',
          minHeight: '350px',
          maxWidth: '100%',
          position: 'relative',
        }}
      >
        <ResponsiveContainer width="100%" height="100%" debounce={1}>
          <BarChart
            data={validData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 40,
            }}
            barSize={60}
          >
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
              domain={[0, 'auto']}
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
