import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { ENDPOINTS } from '~/utils/URL';
import Loading from '~/components/common/Loading';
import styles from './VolunteerTrendsStyles.module.css';
import 'react-datepicker/dist/react-datepicker.css';

const formatChartData = rawData => {
  if (!Array.isArray(rawData) || rawData.length === 0) return [];

  // Safe check for monthly format vs weekly format
  if (rawData[0]?._id?.month !== undefined) {
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

    return rawData.map(data => ({
      xLabel: integerToMonths[data._id.month] || `M${data._id.month}`,
      totalHours: Number(data.totalHours) || 0,
      year: data._id.year,
      interval: 'month',
    }));
  }

  // Weekly interval format - numeric value for axis calculations
  return rawData.map(data => ({
    xLabel: Number(data._id.week) || 0,
    totalHours: Number(data.totalHours) || 0,
    year: data._id.year,
    interval: 'week',
  }));
};

const dateToYYYYMMDD = date => {
  return date.toISOString().split('T')[0];
};

export default function VolunteerTrendsLineChart({ darkMode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  const latestNumberOfHours = data && data.length > 0 ? data[data.length - 1].totalHours : 0;

  const [chartSize, setChartSize] = useState({ width: 600, height: 350 });
  const [requestTimeFrame, setRequestTimeFrame] = useState(1);
  const [requestOffset, setRequestOffset] = useState('week');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState([null, null]);
  const [customStartDate = new Date(), customEndDate = new Date()] = customDateRange;

  const selectStyle = {
    backgroundColor: darkMode ? '#111827' : '#ffffff',
    color: darkMode ? '#f8fafc' : '#111827',
    border: darkMode ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid #ccc',
    borderRadius: 4,
    padding: '2px 8px',
  };

  const optionStyle = {
    backgroundColor: darkMode ? '#111827' : '#ffffff',
    color: darkMode ? '#f8fafc' : '#111827',
  };

  useEffect(() => {
    const getData = async () => {
      let url;
      if (customDateRange.every(date => date)) {
        const formattedDateRange = customDateRange.map(date => dateToYYYYMMDD(date));
        url = ENDPOINTS.VOLUNTEER_TRENDS(
          requestTimeFrame,
          requestOffset,
          formattedDateRange[0],
          formattedDateRange[1],
        );
      } else {
        url = ENDPOINTS.VOLUNTEER_TRENDS(requestTimeFrame, requestOffset);
      }

      try {
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
  }, [requestTimeFrame, requestOffset, customDateRange]);

  useEffect(() => {
    const updateChartSize = () => {
      let width = 600;
      let height = 350;
      if (window.innerWidth < 650) {
        width = 380;
        height = 250;
      } else if (window.innerWidth < 1200) {
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
    if (number === null || number === undefined) return '0';
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const renderCustomDot = ({ cx, cy, index }) => {
    if (!data || data.length === 0) return null;
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
      const bgColor = darkMode ? '#222' : 'white';
      const textColor = darkMode ? '#fff' : '#222';
      const labelColor = darkMode ? '#90cdf4' : '#222';
      
      const formattedLabel = interval === 'week' ? `Week ${label}` : label;

      return (
        <div
          style={{
            backgroundColor: bgColor,
            color: textColor,
            border: '1px solid #ccc',
            minWidth: '180px',
            padding: '10px',
          }}
        >
          <h6 style={{ color: labelColor }}>
            {formattedLabel}, {year}
          </h6>
          <h6 style={{ color: darkMode ? '#90ee90' : '#328D1B' }}>{payload[0].value} hours</h6>
        </div>
      );
    }
    return null;
  };

  const setTimeframeFilter = e => {
    if (e.target.value === 'yearsCustom') {
      return setShowDatePicker(true);
    }

    setCustomDateRange([null, null]);
    setShowDatePicker(false);
    const numberOfYears = e.target.value.substring(5);
    setIsLoading(true);
    setRequestTimeFrame(numberOfYears);
  };

  const setOffsetFilter = e => {
    const offset = e.target.value;
    setIsLoading(true);
    setRequestOffset(offset);
  };

  const handleCustomDateRange = updatedDateRange => {
    setCustomDateRange(updatedDateRange);
    if (updatedDateRange[1]) {
      setShowDatePicker(false);
      setIsLoading(true);
    }
  };

  if (fetchError) {
    return <div>Error fetching data!</div>;
  }

  // Dynamic axis calculations depending on active interval
  const isWeekly = requestOffset === 'week';
  const maxWeek = data.length > 0 && isWeekly ? Math.max(...data.map(d => d.xLabel)) : 32;
  const evenTicks = isWeekly
    ? Array.from({ length: Math.floor(maxWeek / 2) + 1 }, (_, i) => i * 2)
    : undefined;

  return (
    <div className={styles.chartContainer}>
      {/* DATE FILTERS */}
      <div className={styles.dateFilterContainer}>
        <select
          name="timeframe-filter"
          id="timeframe-filter"
          onChange={setTimeframeFilter}
          style={selectStyle}
        >
          <option value="years1" style={optionStyle}>
            This year
          </option>
          <option value="years2" style={optionStyle}>
            Last 2 years
          </option>
          <option value="years3" style={optionStyle}>
            Last 3 years
          </option>
          <option value="years5" style={optionStyle}>
            Last 5 years
          </option>
          <option value="years10" style={optionStyle}>
            Last 10 years
          </option>
          <option value="years0" style={optionStyle}>
            All-time
          </option>
          <option value="yearsCustom" style={optionStyle}>
            Choose Date Range
          </option>
        </select>
        {' by '}
        <select
          name="offset-filter"
          id="offset-filter"
          onChange={setOffsetFilter}
          style={selectStyle}
        >
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>
      </div>

      {/* DATE PICKER */}
      <div className={styles.datePickerContainer}>
        <div className={styles.datePickerPostion}>
          {showDatePicker && (
            <DatePicker
              selected={customStartDate}
              onChange={handleCustomDateRange}
              startDate={customStartDate}
              endDate={customEndDate}
              selectsRange
              inline
              dateFormat="MM-dd-yyyy"
              className={darkMode ? styles.darkCalendar : styles.lightCalendar}
            />
          )}
        </div>
      </div>

      {/* CUSTOM DATE RANGE */}
      {customDateRange.every(date => date) && (
        <div className={styles.customDateRange}>
          <span>{dateToYYYYMMDD(customDateRange[0])}</span>
          <span> to </span>
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
          margin={{ right: 50, top: 50, left: 70 }}
        >
          <CartesianGrid stroke="#ccc" vertical={false} />
          
          {/* Conditional props render depending on weekly vs monthly view */}
          <XAxis
            dataKey="xLabel"
            type={isWeekly ? 'number' : 'category'}
            ticks={isWeekly ? evenTicks : undefined}
            domain={isWeekly ? [0, maxWeek] : undefined}
            interval={isWeekly ? undefined : 'preserveStartEnd'}
            axisLine={false}
            tickLine={false}
            tick={{ fill: darkMode ? '#ccc' : undefined, fontSize: 12 }}
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