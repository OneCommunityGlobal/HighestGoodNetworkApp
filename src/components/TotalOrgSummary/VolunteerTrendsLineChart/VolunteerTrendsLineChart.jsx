import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import './styles.css';
import { useEffect, useState } from 'react';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import Loading from 'components/common/Loading';

const formatChartData = rawData => {
  const integerToMonths = {
    1: 'Jan',
    2: 'Feb',
    3: 'Mar',
    4: 'Apr',
    5: 'May',
    6: 'Jun',
    7: 'Jul',
    8: 'Aug',
    9: 'Sep',
    10: 'Oct',
    11: 'Nov',
    12: 'Dec',
  };

  return rawData.map(data => {
    return {
      xLabel: integerToMonths[data._id.month],
      totalHours: data.totalHours,
      year: data._id.year,
    };
  });
};

export default function VolunteerTrendsLineChart(props) {
  const { darkMode } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [fetchError, setFetchError] = useState(false);
  const latestNumberOfHours = data?.[data.length - 1].totalHours || 0;
  const [chartSize, setChartSize] = useState({ width: null, height: null });

  useEffect(() => {
    // Gets backend data
    const getData = async () => {
      try {
        const url = ENDPOINTS.VOLUNTEER_TRENDS(5, 'month');
        // TODO: NEED TO ABSTRACT THIS TO ITS OWN REDUX REDUCER
        const response = await axios.get(url);
        const rawData = formatChartData(response.data);
        setData(rawData);
      } catch (err) {
        setFetchError(err);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, []);

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
      } else if (window.innerWidth < 1200) {
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
    const isLastPoint = index === data.length - 1;
    const formattedNumber = formatNumber(latestNumberOfHours);
    if (isLastPoint) {
      return (
        <g key={index}>
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
        </g>
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
          <h6 style={{ color: 'black' }}>
            {label} {payload[0].payload.year}
          </h6>
          <h6 style={{ color: '#328D1B' }}>{payload[0].value} hours</h6>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <div className="w-100vh">
          <Loading />
        </div>
      </div>
    );
  }

  if (fetchError) {
    return <div>Error fetching data!</div>;
  }

  return (
    <div className="chart-container">
      <LineChart
        width={chartSize.width}
        height={chartSize.height}
        data={data}
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
            style: { fontSize: 18, fill: darkMode ? '#ccc' : undefined },
          }}
        />
        <Line
          type="linear"
          dataKey="totalHours"
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
