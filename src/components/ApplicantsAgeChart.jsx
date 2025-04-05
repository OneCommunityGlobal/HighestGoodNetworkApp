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

const data = [
  { ageGroup: '18 - 21', applicants: 25 },
  { ageGroup: '21 - 24', applicants: 60 },
  { ageGroup: '24 - 27', applicants: 45 },
  { ageGroup: '27 - 30', applicants: 7 },
  { ageGroup: '30 - 33', applicants: 10 },
];

function ApplicantsChartPage() {
  return (
    <div style={{ width: '100%', height: 500, padding: '20px' }}>
      <h2>Applicants grouped by Age</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="ageGroup"
            label={{ value: 'Age Group', position: 'insideBottom', offset: -10 }}
          />
          <YAxis label={{ value: 'Applicants', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Bar dataKey="applicants" fill="#3b82f6">
            <LabelList dataKey="applicants" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ApplicantsChartPage;
