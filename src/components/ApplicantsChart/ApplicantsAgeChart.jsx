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

const data = [
  { ageGroup: '18 - 21', applicants: 25, change: 10 },
  { ageGroup: '21 - 24', applicants: 60, change: -5 },
  { ageGroup: '24 - 27', applicants: 45, change: 15 },
  { ageGroup: '27 - 30', applicants: 7, change: -3 },
  { ageGroup: '30 - 33', applicants: 10, change: 0 },
];

function ApplicantsChartPage() {
  const formatTooltip = (value, props) => {
    const { change } = props.payload;
    let changeText = '';
    if (change > 0) {
      changeText = `${change}% more than last week`;
    } else if (change < 0) {
      changeText = `${Math.abs(change)}% less than last week`;
    } else {
      changeText = `No change from last week`;
    }
    return [`${value} (${changeText})`, 'Applicants'];
  };

  return (
    <div className={`${styles.ApplicantsChartPage}`}>
      <h2>Applicants grouped by Age</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }} barSize={80}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="ageGroup"
            label={{ value: 'Age Group', position: 'insideBottom', offset: -10 }}
          />
          <YAxis label={{ value: 'Applicants', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={formatTooltip} />
          <Bar dataKey="applicants" fill="#3b82f6">
            <LabelList dataKey="applicants" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ApplicantsChartPage;
