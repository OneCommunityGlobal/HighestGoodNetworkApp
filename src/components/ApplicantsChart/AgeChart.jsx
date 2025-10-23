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
import { useSelector } from 'react-redux';
import styles from './ApplicationChart.module.css';

function AgeChart({ data, compareLabel }) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const axisColor = darkMode ? '#f3f4f6' : '#111827';
  const axisLineColor = darkMode ? '#d1d5db' : '#374151';
  const gridColor = darkMode ? '#9ca3af' : '#d1d5db';
  const tickFontSize = 14;

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

  return (
    <div className={`${styles.AgeChart} ${darkMode ? 'darkMode' : ''}`}>
      <h2 style={{ color: axisColor }}>Applicants grouped by Age</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }} barSize={80}>
          <CartesianGrid stroke={gridColor} strokeDasharray="3 3" strokeWidth={1.5} />
          <XAxis
            dataKey="ageGroup"
            stroke={axisLineColor}
            tick={{ fill: axisColor, fontSize: tickFontSize, fontWeight: 'bold' }}
            label={{
              value: 'Age Group',
              position: 'insideBottom',
              offset: -10,
              fill: axisColor,
              fontWeight: 'bold',
            }}
          />
          <YAxis
            stroke={axisLineColor}
            tick={{ fill: axisColor, fontSize: tickFontSize, fontWeight: 'bold' }}
            label={{
              value: 'Applicants',
              angle: -90,
              position: 'insideLeft',
              fill: axisColor,
              fontWeight: 'bold',
            }}
          />
          <Tooltip
            formatter={formatTooltip}
            contentStyle={{
              backgroundColor: darkMode ? '#1f2937' : '#ffffff',
              fontWeight: 'bold',
            }}
            labelStyle={{
              color: darkMode ? '#f3f4f6' : '#111827',
              fontWeight: 'bold',
            }}
          />
          <Bar dataKey="applicants" fill="#3b82f6">
            <LabelList dataKey="applicants" position="top" fill={axisColor} fontWeight="bold" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AgeChart;
