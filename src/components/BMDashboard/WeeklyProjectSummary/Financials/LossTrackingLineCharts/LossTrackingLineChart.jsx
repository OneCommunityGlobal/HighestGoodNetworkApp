// LossTrackingLineChart.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import styles from './LossTrackingLineChart.module.css';

const colors = {
  '2022-Metal': '#008080',
  '2022-Plastic': '#20b2aa',
  '2022-Glass': '#48d1cc',
  '2023-Metal': '#ff69b4',
  '2023-Plastic': '#ff1493',
  '2023-Glass': '#db7093',
  '2024-Metal': '#ffd700',
  '2024-Plastic': '#ffa500',
  '2024-Glass': '#ff8c00',
};

const rawData = [
  {
    year: 2022,
    material: 'Metal',
    data: [
      { date: '2022-01', month: 'Jan', value: 10 },
      { date: '2022-02', month: 'Feb', value: 15 },
      { date: '2022-03', month: 'Mar', value: 20 },
      { date: '2022-04', month: 'Apr', value: 18 },
      { date: '2022-05', month: 'May', value: 12 },
      { date: '2022-06', month: 'Jun', value: 9 },
    ],
  },
  {
    year: 2022,
    material: 'Plastic',
    data: [
      { date: '2022-01', month: 'Jan', value: 8 },
      { date: '2022-02', month: 'Feb', value: 11 },
      { date: '2022-03', month: 'Mar', value: 14 },
      { date: '2022-04', month: 'Apr', value: 13 },
      { date: '2022-05', month: 'May', value: 9 },
      { date: '2022-06', month: 'Jun', value: 7 },
    ],
  },
  {
    year: 2022,
    material: 'Glass',
    data: [
      { date: '2022-01', month: 'Jan', value: 6 },
      { date: '2022-02', month: 'Feb', value: 9 },
      { date: '2022-03', month: 'Mar', value: 12 },
      { date: '2022-04', month: 'Apr', value: 11 },
      { date: '2022-05', month: 'May', value: 8 },
      { date: '2022-06', month: 'Jun', value: 5 },
    ],
  },
  {
    year: 2023,
    material: 'Metal',
    data: [
      { date: '2023-01', month: 'Jan', value: 11 },
      { date: '2023-02', month: 'Feb', value: 14 },
      { date: '2023-03', month: 'Mar', value: 19 },
      { date: '2023-04', month: 'Apr', value: 17 },
      { date: '2023-05', month: 'May', value: 13 },
      { date: '2023-06', month: 'Jun', value: 8 },
    ],
  },
  {
    year: 2023,
    material: 'Plastic',
    data: [
      { date: '2023-01', month: 'Jan', value: 5 },
      { date: '2023-02', month: 'Feb', value: 8 },
      { date: '2023-03', month: 'Mar', value: 13 },
      { date: '2023-04', month: 'Apr', value: 14 },
      { date: '2023-05', month: 'May', value: 10 },
      { date: '2023-06', month: 'Jun', value: 6 },
    ],
  },
  {
    year: 2023,
    material: 'Glass',
    data: [
      { date: '2023-01', month: 'Jan', value: 7 },
      { date: '2023-02', month: 'Feb', value: 10 },
      { date: '2023-03', month: 'Mar', value: 15 },
      { date: '2023-04', month: 'Apr', value: 13 },
      { date: '2023-05', month: 'May', value: 11 },
      { date: '2023-06', month: 'Jun', value: 8 },
    ],
  },
  {
    year: 2024,
    material: 'Metal',
    data: [
      { date: '2024-01', month: 'Jan', value: 13 },
      { date: '2024-02', month: 'Feb', value: 17 },
      { date: '2024-03', month: 'Mar', value: 16 },
      { date: '2024-04', month: 'Apr', value: 15 },
      { date: '2024-05', month: 'May', value: 13 },
      { date: '2024-06', month: 'Jun', value: 10 },
    ],
  },
  {
    year: 2024,
    material: 'Plastic',
    data: [
      { date: '2024-01', month: 'Jan', value: 9 },
      { date: '2024-02', month: 'Feb', value: 13 },
      { date: '2024-03', month: 'Mar', value: 12 },
      { date: '2024-04', month: 'Apr', value: 11 },
      { date: '2024-05', month: 'May', value: 10 },
      { date: '2024-06', month: 'Jun', value: 8 },
    ],
  },
  {
    year: 2024,
    material: 'Glass',
    data: [
      { date: '2024-01', month: 'Jan', value: 12 },
      { date: '2024-02', month: 'Feb', value: 18 },
      { date: '2024-03', month: 'Mar', value: 17 },
      { date: '2024-04', month: 'Apr', value: 16 },
      { date: '2024-05', month: 'May', value: 14 },
      { date: '2024-06', month: 'Jun', value: 11 },
    ],
  },
];
const DEFAULTS = { material: 'All', year: 'All', startDate: '', endDate: '' };

export default function LossTrackingLineChart() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const hostRef = useRef(null);

  // --- Promote parent wrapper (no parent code changes needed) ---
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Find the wrapper the page uses around our component
    const wrapper = host.closest('.weekly-project-summary-card.financial-big');
    if (!wrapper) return;

    // Save previous inline styles to restore on unmount
    const prev = {
      gridColumn: wrapper.style.gridColumn,
      flex: wrapper.style.flex,
      width: wrapper.style.width,
      maxWidth: wrapper.style.maxWidth,
      minWidth: wrapper.style.minWidth,
    };

    // Make the wrapper span the full grid row & fill flex rows
    wrapper.style.gridColumn = '1 / -1';
    wrapper.style.flex = '1 1 100%';
    wrapper.style.width = '100%';
    wrapper.style.maxWidth = '100%';
    wrapper.style.minWidth = '0';

    return () => {
      wrapper.style.gridColumn = prev.gridColumn;
      wrapper.style.flex = prev.flex;
      wrapper.style.width = prev.width;
      wrapper.style.maxWidth = prev.maxWidth;
      wrapper.style.minWidth = prev.minWidth;
    };
  }, []);

  const [material, setMaterial] = useState(DEFAULTS.material);
  const [year, setYear] = useState(DEFAULTS.year);
  const [startDate, setStartDate] = useState(DEFAULTS.startDate);
  const [endDate, setEndDate] = useState(DEFAULTS.endDate);

  const textColor = darkMode ? '#ffffff' : '#1f1f1f';
  const gridColor = darkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';

  const materials = useMemo(
    () => ['All', ...Array.from(new Set(rawData.map(d => d.material)))],
    [],
  );
  const years = useMemo(
    () => ['All', ...Array.from(new Set(rawData.map(d => String(d.year))))],
    [],
  );

  const filteredLines = useMemo(() => {
    return rawData.filter(line => {
      const yearMatch = year === 'All' || String(line.year) === year;
      const materialMatch = material === 'All' || line.material === material;
      return yearMatch && materialMatch;
    });
  }, [material, year]);

  const chartData = useMemo(() => {
    const merged = {};
    filteredLines.forEach(line => {
      line.data.forEach(({ date, month, value }) => {
        const withinRange = (!startDate || date >= startDate) && (!endDate || date <= endDate);
        if (withinRange) {
          if (!merged[month]) merged[month] = { month };
          merged[month][`${line.year}-${line.material}`] = value;
        }
      });
    });
    return Object.values(merged);
  }, [filteredLines, startDate, endDate]);

  const isDefaultFilters =
    material === DEFAULTS.material &&
    year === DEFAULTS.year &&
    startDate === DEFAULTS.startDate &&
    endDate === DEFAULTS.endDate;

  const isDateRangeValid = !startDate || !endDate || startDate <= endDate;
  const handleReset = () => {
    setMaterial(DEFAULTS.material);
    setYear(DEFAULTS.year);
    setStartDate(DEFAULTS.startDate);
    setEndDate(DEFAULTS.endDate);
  };

  return (
    <div ref={hostRef} className={styles.host}>
      <div
        className={[styles.lossTrackingChartContainer, darkMode ? styles.darkMode : ''].join(' ')}
      >
        <h1 className={styles.chartTitle}>Loss Tracking Line Chart</h1>

        <div className={styles.lossTrackingChartFilters}>
          <label>
            <span>Material</span>
            <select value={material} onChange={e => setMaterial(e.target.value)}>
              {materials.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Year</span>
            <select value={year} onChange={e => setYear(e.target.value)}>
              {years.map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Start Date</span>
            <input type="month" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </label>

          <label>
            <span>End Date</span>
            <input type="month" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </label>

          <button className={styles.resetBtn} onClick={handleReset} disabled={isDefaultFilters}>
            Reset Filters
          </button>

          {!isDateRangeValid && (
            <span className={styles.dateRangeError}>
              Start date must be before or equal to end date.
            </span>
          )}
        </div>

        <div className={styles.chartWrapper}>
          {filteredLines.length === 0 || chartData.length === 0 ? (
            <div className={styles.noDataMessage}>No data available for the selected filters.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: textColor }}
                  axisLine={{ stroke: textColor }}
                  tickLine={{ stroke: textColor }}
                  label={{
                    value: 'Time (months)',
                    position: 'insideBottom',
                    offset: -5,
                    fill: textColor,
                  }}
                />
                <YAxis
                  tick={{ fill: textColor }}
                  axisLine={{ stroke: textColor }}
                  tickLine={{ stroke: textColor }}
                  label={{ value: 'Loss (%)', angle: -90, position: 'insideLeft', fill: textColor }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--tooltip-bg)',
                    color: 'var(--text-color)',
                    border: `1px solid var(--border-color)`,
                  }}
                />
                <Legend
                  wrapperStyle={{ color: textColor }}
                  formatter={value => <span style={{ color: textColor }}>{value}</span>}
                />
                {filteredLines.map(line => (
                  <Line
                    key={`${line.year}-${line.material}`}
                    type="monotone"
                    dataKey={`${line.year}-${line.material}`}
                    stroke={colors[`${line.year}-${line.material}`]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name={`${line.year} - ${line.material}`}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
