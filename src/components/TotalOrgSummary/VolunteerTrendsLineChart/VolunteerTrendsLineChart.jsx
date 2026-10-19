import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { ENDPOINTS } from '~/utils/URL';
import Loading from '~/components/common/Loading';
import styles from './VolunteerTrendsStyles.module.css';
import 'react-datepicker/dist/react-datepicker.css';

const MONTH_NAMES = {
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

const TIMEFRAME_OPTIONS = [
  { value: 'years1', label: 'This year' },
  { value: 'years2', label: 'Last 2 years' },
  { value: 'years3', label: 'Last 3 years' },
  { value: 'years5', label: 'Last 5 years' },
  { value: 'years10', label: 'Last 10 years' },
  { value: 'years0', label: 'All-time' },
  { value: 'yearsCustom', label: 'Choose Date Range' },
];

const formatChartData = rawData => {
  if (!Array.isArray(rawData) || rawData.length === 0) return [];

  // Sort chronologically by year, then month/week
  const sorted = [...rawData].sort((a, b) => {
    const yearDiff = (a._id?.year || 0) - (b._id?.year || 0);
    if (yearDiff !== 0) return yearDiff;
    const timeA = a._id?.month ?? a._id?.week ?? 0;
    const timeB = b._id?.month ?? b._id?.week ?? 0;
    return timeA - timeB;
  });

  const isMonthly = sorted[0]?._id?.month !== undefined;

  return sorted.map((item, index) => {
    const year = item._id?.year;

    if (isMonthly) {
      const monthStr = MONTH_NAMES[item._id?.month] || `M${item._id?.month}`;
      return {
        id: `${year}-${item._id?.month}-${index}`,
        xLabel: monthStr,
        totalHours: Number(item.totalHours) || 0,
        year,
        interval: 'month',
      };
    }

    const weekNum = Number(item._id?.week) || 0;
    return {
      id: `${year}-W${weekNum}-${index}`,
      xLabel: `W${weekNum}`,
      totalHours: Number(item.totalHours) || 0,
      year,
      interval: 'week',
    };
  });
};

const dateToYYYYMMDD = date => {
  return date.toISOString().split('T')[0];
};

const formatNumber = number => {
  if (number === null || number === undefined) return '0';
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Descriptive x-axis label, e.g. "Weekly for year 2026" or "Monthly from 2024 to 2026"
const getXAxisLabel = (data, requestOffset) => {
  if (!data?.length) return '';
  const years = [...new Set(data.map(d => d.year))].filter(Boolean);
  if (years.length === 0) return '';
  const period = requestOffset === 'week' ? 'Weekly' : 'Monthly';
  if (years.length === 1) return `${period} for year ${years[0]}`;
  return `${period} from ${years[0]} to ${years.at(-1)}`;
};

const buildTrendsUrl = (timeFrame, offset, dateRange) => {
  if (dateRange.every(Boolean)) {
    const [startDate, endDate] = dateRange.map(dateToYYYYMMDD);
    return ENDPOINTS.VOLUNTEER_TRENDS(timeFrame, offset, startDate, endDate);
  }
  return ENDPOINTS.VOLUNTEER_TRENDS(timeFrame, offset);
};

const getChartSize = viewportWidth => {
  if (viewportWidth < 650) return { width: 380, height: 250 };
  if (viewportWidth < 1200) return { width: 500, height: 350 };
  return { width: 600, height: 350 };
};

const getSelectStyles = darkMode => {
  const background = darkMode ? '#111827' : '#ffffff';
  const color = darkMode ? '#f8fafc' : '#111827';
  return {
    select: {
      backgroundColor: background,
      color,
      border: darkMode ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid #ccc',
      borderRadius: 4,
      padding: '2px 8px',
    },
    option: { backgroundColor: background, color },
  };
};

// Returns a recharts `dot` renderer that only draws the final point
const createDotRenderer = (darkMode, pointCount) =>
  function renderCustomDot({ cx, cy, index, value }) {
    if (index !== pointCount - 1) return null;

    const color = darkMode ? 'white' : 'black';
    return (
      <g key={`last-dot-${index}`}>
        <circle cx={cx} cy={cy} r={24} opacity="0.1" fill={color} />
        <circle cx={cx} cy={cy} r={6} fill={color} />
        <text x={cx} y={cy - 30} fill={color} textAnchor="middle" fontWeight={600} fontSize={16}>
          {formatNumber(value)}
        </text>
      </g>
    );
  };

function CustomTooltip({ active, payload, label, darkMode }) {
  if (!active || !payload?.length) return null;

  const { year, interval } = payload[0].payload;
  const bgColor = darkMode ? '#222' : 'white';
  const textColor = darkMode ? '#fff' : '#222';
  const labelColor = darkMode ? '#90cdf4' : '#222';

  // label is e.g. "W40" -> "Week 40"; months are shown as-is (e.g. "Oct")
  const formattedLabel = interval === 'week' ? String(label).replace(/^W/, 'Week ') : label;

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
        {formattedLabel}
        {year ? `, ${year}` : ''}
      </h6>
      <h6 style={{ color: darkMode ? '#90ee90' : '#328D1B' }}>
        {formatNumber(payload[0].value)} hours
      </h6>
    </div>
  );
}

export default function VolunteerTrendsLineChart({ darkMode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  const [chartSize, setChartSize] = useState({ width: 600, height: 350 });
  const [requestTimeFrame, setRequestTimeFrame] = useState(1);
  const [requestOffset, setRequestOffset] = useState('week');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState([null, null]);
  const [customStartDate = new Date(), customEndDate = new Date()] = customDateRange;

  const { select: selectStyle, option: optionStyle } = getSelectStyles(darkMode);
  const axisColor = darkMode ? '#ccc' : undefined;
  const hasCustomRange = customDateRange.every(Boolean);

  useEffect(() => {
    const getData = async () => {
      try {
        const url = buildTrendsUrl(requestTimeFrame, requestOffset, customDateRange);
        const response = await axios.get(url);
        setData(formatChartData(response.data));
      } catch (err) {
        setFetchError(err);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [requestTimeFrame, requestOffset, customDateRange]);

  useEffect(() => {
    const updateChartSize = () => setChartSize(getChartSize(window.innerWidth));
    updateChartSize();
    window.addEventListener('resize', updateChartSize);
    return () => {
      window.removeEventListener('resize', updateChartSize);
    };
  }, []);

  const xAxisLabel = getXAxisLabel(data, requestOffset);

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
          {TIMEFRAME_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value} style={optionStyle}>
              {label}
            </option>
          ))}
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
      {hasCustomRange && (
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
          margin={{ right: 50, top: 50, left: 90, bottom: 30 }}
        >
          <CartesianGrid stroke="#ccc" vertical={false} />

          <XAxis
            dataKey="xLabel"
            type="category"
            interval="preserveStartEnd"
            minTickGap={25}
            axisLine={false}
            tickLine={false}
            tick={{ fill: axisColor, fontSize: 11 }}
            label={{
              value: xAxisLabel,
              position: 'insideBottom',
              offset: -20,
              style: { fontSize: 14, fill: axisColor, textAnchor: 'middle' },
            }}
          />

          <YAxis
            width={75}
            tickFormatter={formatNumber}
            axisLine={false}
            tickLine={false}
            tick={{ fill: axisColor }}
            label={{
              value: 'Total Hours',
              angle: -90,
              position: 'insideLeft',
              dy: 50,
              dx: -65,
              style: { fontSize: 18, fill: axisColor, textAnchor: 'middle' },
            }}
          />

          <Line
            type="linear"
            dataKey="totalHours"
            stroke="#328D1B"
            strokeWidth={4}
            dot={createDotRenderer(darkMode, data.length)}
            strokeLinecap="round"
          />
          <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
        </LineChart>
      )}
    </div>
  );
}
