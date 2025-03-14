import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import './styles.css';
import { useEffect, useState } from 'react';

const testData = [
  { xLabel: 'Jan', totalVolunteers: 100 },
  { xLabel: 'Feb', totalVolunteers: 500 },
  { xLabel: 'Mar', totalVolunteers: 300 },
  { xLabel: 'Apr', totalVolunteers: 1000 },
];

export default function VolunteerTrendsLineChart(props) {
  const { darkMode } = props;
  const latestNumberOfVolunteers = testData[testData.length - 1].totalVolunteers;
  const [chartSize, setChartSize] = useState({ width: null, height: null });

  useEffect(() => {
    // Add event listener to set chart width on window resize
    const updateChartSize = () => {
      // Default sizes
      let width = 600;
      let height = 350;
      if (window.innerWidth < 650) {
        // Mobile
        width = 400;
        height = 250;
      } else if (window.innerWidth < 1100) {
        // Tablet
        width = 500;
      }
      setChartSize({ width, height });
    };
    updateChartSize();
    window.addEventListener('resize', updateChartSize);
    return () => {
      window.removeEventListener('resize', updateChartSize);
    };
  }, []);

  const formatNumber = number => {
    // Add comma every third digit (e.g. makes 1000 a 1,000)
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const renderCustomDot = ({ cx, cy, index }) => {
    // Highlight and show value of last dot on the line
    const isLastPoint = index === testData.length - 1;
    const formattedNumber = formatNumber(latestNumberOfVolunteers);
    if (isLastPoint) {
      return (
        <>
          <circle cx={cx} cy={cy} r={24} opacity="0.1" fill={darkMode ? 'white' : 'black'} />
          <circle cx={cx} cy={cy} r={6} fill={darkMode ? 'white' : 'black'} />
          <text
            x={cx}
            y={cy - 30}
            fill={darkMode ? 'white' : 'black'}
            textAnchor="middle"
            fontWeight={600}
            fontSize={16}
          >
            {formattedNumber}
          </text>
        </>
      );
    }
    return null;
  };

  const renderCustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid #ccc',
            minWidth: '180px',
            padding: '10px',
          }}
        >
          <h6 style={{ color: 'black' }}>{label}</h6>
          <h6 style={{ color: '#328D1B' }}>{payload[0].value} volunteers</h6>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <LineChart
        width={chartSize.width}
        height={chartSize.height}
        data={testData}
        margin={{ right: 50, top: 50, left: 20 }}
      >
        <CartesianGrid stroke="#ccc" vertical={false} />
        <XAxis
          dataKey="xLabel"
          axisLine={false}
          tickLine={false}
          tick={{ fill: darkMode ? '#ccc' : undefined }}
        />
        <YAxis
          tickFormatter={formatNumber}
          axisLine={false}
          tickLine={false}
          tick={{ fill: darkMode ? '#ccc' : undefined }}
          label={{
            value: 'Total Hours',
            angle: -90,
            position: 'insideLeft',
            dy: 20,
            dx: -10,
            style: { fontSize: 18 },
          }}
        />
        <Line
          type="linear"
          dataKey="totalVolunteers"
          stroke="#328D1B"
          strokeWidth={4}
          dot={renderCustomDot}
          strokeLinecap="round"
        />
        <Tooltip content={renderCustomTooltip} />
      </LineChart>
    </div>
  );
}
