import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

const COLORS = {
  equipmentIssues: '#4F81BD', // blue
  laborIssues: '#C0504D', // red
  materialIssues: '#F3C13A', // yellow
};

function legendFormatter(value) {
  if (value === 'equipmentIssues')
    return <span style={{ color: COLORS.equipmentIssues }}>Equipment Issues</span>;
  if (value === 'laborIssues')
    return <span style={{ color: COLORS.laborIssues }}>Labor Issues</span>;
  if (value === 'materialIssues')
    return <span style={{ color: COLORS.materialIssues }}>Materials Issues</span>;
  return value;
}

const mockData = [
  { projectName: 'Project 1', equipmentIssues: 10, laborIssues: 12, materialIssues: 14 },
  { projectName: 'Project 2', equipmentIssues: 14, laborIssues: 15, materialIssues: 20 },
  { projectName: 'Project 3', equipmentIssues: 4, laborIssues: 5, materialIssues: 7 },
];

export default function IssuesBreakdownChart({ data }) {
  const chartData = data && data.length ? data : mockData;
  return (
    <div style={{ width: '100%', height: 350, background: '#fff', borderRadius: 8, padding: 16 }}>
      <h3 style={{ textAlign: 'center', marginBottom: 0 }}>Issues breakdown by Type</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={chartData} margin={{ top: 30, right: 30, left: 0, bottom: 30 }} barGap={8}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="projectName" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend verticalAlign="top" align="right" iconType="rect" formatter={legendFormatter} />
          <Bar dataKey="equipmentIssues" name="Equipment Issues" fill={COLORS.equipmentIssues}>
            <LabelList dataKey="equipmentIssues" position="top" />
          </Bar>
          <Bar dataKey="laborIssues" name="Labor Issues" fill={COLORS.laborIssues}>
            <LabelList dataKey="laborIssues" position="top" />
          </Bar>
          <Bar dataKey="materialIssues" name="Materials Issues" fill={COLORS.materialIssues}>
            <LabelList dataKey="materialIssues" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}