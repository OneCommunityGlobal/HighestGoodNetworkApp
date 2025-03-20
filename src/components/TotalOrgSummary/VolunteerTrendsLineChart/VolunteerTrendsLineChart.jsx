import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import './styles.css';
import { useEffect, useState } from 'react';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import Loading from 'components/common/Loading';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const formatChartData = rawData => {
  if (rawData[0]._id.month) {
    // for monthly intervals
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
        interval: 'month',
      };
    });
  }

  // for weekly intervals
  return rawData.map(data => {
    return {
      xLabel: data._id.week,
      totalHours: data.totalHours,
      year: data._id.year,
      interval: 'week',
    };
  });
};

const dateToYYYYMMDD = date => {
  return date.toISOString().split('T')[0];
};

export default function VolunteerTrendsLineChart(props) {
  const { darkMode } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [fetchError, setFetchError] = useState(false);
  const latestNumberOfHours = data?.[data.length - 1].totalHours || 0;
  const [chartSize, setChartSize] = useState({ width: null, height: null });
  const [requestTimeFrame, setRequestTimeFrame] = useState(1);
  const [requestOffset, setRequestOffset] = useState('week');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [customDateRange, setCustomDateRange] = useState([null, null]);
  const [startDate = new Date(), endDate = new Date()] = customDateRange;

  useEffect(() => {
    // Gets backend data
    const getData = async () => {
      try {
        // TODO: NEED TO ABSTRACT THIS TO ITS OWN REDUX REDUCER
        const url = ENDPOINTS.VOLUNTEER_TRENDS(requestTimeFrame, requestOffset);
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
  }, [requestTimeFrame, requestOffset]);

  useEffect(() => {
    // Gets backend data using custom date ranges
    const getData = async () => {
      try {
        // TODO: NEED TO ABSTRACT THIS TO ITS OWN REDUX REDUCER
        const formattedDateRange = customDateRange.map(date => dateToYYYYMMDD(date));
        const url = ENDPOINTS.VOLUNTEER_TRENDS(
          requestTimeFrame,
          requestOffset,
          formattedDateRange[0],
          formattedDateRange[1],
        );
        const response = await axios.get(url);
        const rawData = formatChartData(response.data);
        setData(rawData);
      } catch (err) {
        setFetchError(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (customDateRange.every(date => date)) getData();
  }, [customDateRange]);

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
      const { year, interval } = payload[0].payload;
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
            {interval === 'week' ? 'Week ' : ''}
            {label}, {year}
          </h6>
          <h6 style={{ color: '#328D1B' }}>{payload[0].value} hours</h6>
        </div>
      );
    }
    return null;
  };

  const setDateFilter = e => {
    if (e.target.value === 'custom-date') {
      return setShowDatePicker(true);
    }

    setCustomDateRange([null, null]);
    setShowDatePicker(false);
    const [years, offset] = e.target.value.split('-');
    const numberOfYears = years.substring(5);
    setIsLoading(true);
    setRequestTimeFrame(numberOfYears);
    setRequestOffset(offset);
    return undefined;
  };

  const handleCustomDateRange = updatedDateRange => {
    console.log(updatedDateRange);
    setCustomDateRange(updatedDateRange);
    if (updatedDateRange[1]) {
      setShowDatePicker(false);
      setIsLoading(true);
    }
  };

  if (fetchError) {
    return <div>Error fetching data!</div>;
  }

  return (
    <div className="chart-container">
      {/* DATE FILTER */}
      <select name="date-filter" id="date-filter" onChange={setDateFilter}>
        <option value="years1-week">This year by week</option>
        <option value="years1-month">This year by month</option>
        <option value="years2-month">Last 2 years by month</option>
        <option value="years3-month">Last 3 years by month</option>
        <option value="years5-month">Last 5 years by month</option>
        <option value="years10-month">Last 10 years by month</option>
        <option value="years0-month">All-time</option>
        <option value="custom-date">Choose Date Range</option>
      </select>

      {/* DATE PICKER */}
      <div className="date-picker-container">
        {showDatePicker && (
          <DatePicker
            selected={startDate}
            onChange={handleCustomDateRange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            inline
            dateFormat="MM-dd-yyyy"
            className="date-picker"
          />
        )}
      </div>

      {/* CUSTOM DATE RANGE */}
      {customDateRange.every(date => date) && (
        <div className="custom-date-range">
          <span>{dateToYYYYMMDD(customDateRange[0])}</span> to{' '}
          <span>{dateToYYYYMMDD(customDateRange[1])}</span>
        </div>
      )}

      {/* LINE CHART */}
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center">
          <div className="w-100vh">
            <Loading />
          </div>
        </div>
      ) : (
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
              dx: -15,
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
      )}
    </div>
  );
}
