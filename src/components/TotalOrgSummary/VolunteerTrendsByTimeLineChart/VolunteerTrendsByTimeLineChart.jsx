import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const testData = [
  { xLabel: 'Jan', totalVolunteers: 100 },
  { xLabel: 'Feb', totalVolunteers: 500 },
  { xLabel: 'Mar', totalVolunteers: 300 },
  { xLabel: 'Apr', totalVolunteers: 1000 },
];

export default function VolunteerTrendsByTimeLineChart() {
  const latestNumberOfVolunteers = testData[testData.length - 1].totalVolunteers;

  const formatNumber = number => {
    // Add comma every third digit (e.g. makes 1000 a 1,000)
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const renderCustomDot = props => {
    // Highlight and show value of last dot on the line
    const { cx, cy, index } = props;
    const isLastPoint = index === testData.length - 1;
    const formattedNumber = formatNumber(latestNumberOfVolunteers);
    if (isLastPoint) {
      return (
        <>
          <circle cx={cx} cy={cy} r={24} fill="rgba(0, 0, 0, 0.1)" />
          <circle cx={cx} cy={cy} r={6} fill="black" />
          <text x={cx} y={cy - 30} fill="black" textAnchor="middle" fontWeight={600} fontSize={16}>
            {formattedNumber}
          </text>
        </>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'grid', justifyContent: 'center', textAlign: 'center' }}>
      <h5>Volunteer Trends by Time</h5>
      <LineChart width={600} height={350} data={testData} margin={{ right: 50, top: 50, left: 20 }}>
        <CartesianGrid stroke="#ccc" vertical={false} />
        <XAxis dataKey="xLabel" axisLine={false} tickLine={false} />
        <YAxis tickFormatter={formatNumber} axisLine={false} tickLine={false} />
        <Line
          type="linear"
          dataKey="totalVolunteers"
          stroke="#328D1B"
          strokeWidth={4}
          dot={renderCustomDot}
          strokeLinecap="round"
        />
        <Tooltip />
      </LineChart>
    </div>
  );
}
