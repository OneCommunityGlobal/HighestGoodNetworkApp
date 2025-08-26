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
import styles from './ApplicationChart.module.css';

function AgeChart({ data, compareLabel }) {
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
    <div className={`${styles.AgeChart}`}>
      <h2>Applicants grouped by Age</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }} barSize={80}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="ageGroup" />
          <YAxis />
          <Tooltip formatter={formatTooltip} />
          <Bar dataKey="applicants" fill="#3b82f6">
            <LabelList dataKey="applicants" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AgeChart;
