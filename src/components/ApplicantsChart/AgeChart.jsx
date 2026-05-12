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
import styles from './ApplicantsChart.module.css';

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

  // Custom tooltip content component
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    const dataPoint = payload[0];
    if (!dataPoint) {
      return null;
    }

    // Try multiple ways to access the data - Recharts passes data in payload[0].payload
    const payloadData = dataPoint.payload || {};
    // Also check if label is passed directly (from XAxis)
    const ageGroup = label || payloadData.ageGroup || dataPoint.name || '';
    const applicants =
      dataPoint.value !== undefined && dataPoint.value !== null
        ? dataPoint.value
        : payloadData.applicants !== undefined
        ? payloadData.applicants
        : 0;
    const change = payloadData.change;

    // Debug: log to see what we're getting (remove in production)
    // console.log('Tooltip data:', { active, payload, label, dataPoint, payloadData, ageGroup, applicants, change });

    let changeText = '';
    if (compareLabel && change !== undefined && change !== null) {
      if (change > 0) {
        changeText = `(${change}% more than ${compareLabel})`;
      } else if (change < 0) {
        changeText = `(${Math.abs(change)}% less than ${compareLabel})`;
      } else {
        changeText = `(No change from ${compareLabel})`;
      }
    }

    // Ensure we always render content, even if some values are missing
    const displayAgeGroup = ageGroup || 'N/A';
    const displayApplicants = applicants !== undefined && applicants !== null ? applicants : 0;

    return (
      <div
        className={styles.customTooltip}
        style={{
          backgroundColor: '#ffffff',
          border: `1px solid ${darkMode ? '#555' : '#ccc'}`,
          borderRadius: '4px',
          padding: '8px 12px',
          boxShadow: darkMode ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          minWidth: '150px',
          position: 'relative',
        }}
      >
        <div
          className={styles.tooltipAgeGroup}
          style={{
            fontWeight: '600',
            color: '#000000',
            marginBottom: '4px',
            fontSize: '14px',
            display: 'block',
          }}
        >
          {displayAgeGroup}
        </div>
        <div
          className={styles.tooltipApplicants}
          style={{
            color: '#000000',
            marginBottom: changeText ? '2px' : '0',
            fontSize: '13px',
            display: 'block',
          }}
        >
          Applicants :{' '}
          <strong style={{ color: '#000000', fontWeight: '700' }}>{displayApplicants}</strong>
        </div>
        {changeText && (
          <div
            className={styles.tooltipChange}
            style={{
              color: '#000000',
              fontSize: '12px',
              marginTop: '2px',
              display: 'block',
            }}
          >
            {changeText}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={darkMode ? 'bg-oxford-blue text-light' : 'bg-white text-black'}
      style={{
        width: '100%',
        maxWidth: '100%',
        margin: '0 auto',
        padding: 'clamp(10px, 2vw, 20px) clamp(10px, 2vw, 20px) 0 clamp(10px, 2vw, 20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          height: 'calc(100vh - 150px)',
          minHeight: '600px',
          maxWidth: '100%',
          position: 'relative',
          backgroundColor: darkMode ? '#1b2a41' : '#fff',
        }}
      >
        <ResponsiveContainer width="100%" height="100%" debounce={1}>
          <BarChart
            data={validData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
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
              content={CustomTooltip}
              wrapperStyle={{ zIndex: 1000, pointerEvents: 'none' }}
              cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
              allowEscapeViewBox={{ x: false, y: false }}
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
