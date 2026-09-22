import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const wrapper = host.closest('.weekly-project-summary-card.financial-big');
    if (!wrapper) return;

    const prev = {
      gridColumn: wrapper.style.gridColumn,
      flex: wrapper.style.flex,
      width: wrapper.style.width,
      maxWidth: wrapper.style.maxWidth,
      minWidth: wrapper.style.minWidth,
    };

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
    const filterStart = startDate ? startDate.substring(0, 7) : '';
    const filterEnd = endDate ? endDate.substring(0, 7) : '';

    return rawData.filter(line => {
      const materialMatch = material === 'All' || line.material === material;
      let yearMatch = year === 'All' || String(line.year) === year;

      // Filter lines dynamically if they sit entirely outside the selected calendar period
      if (filterStart && `${line.year}-12` < filterStart) yearMatch = false; // Checks through end of year
      if (filterEnd && `${line.year}-01` > filterEnd) yearMatch = false; // Checks from start of year

      return yearMatch && materialMatch;
    });
  }, [material, year, startDate, endDate]);

  // Enforces valid boundary limitations on HTML pickers dynamically
  const dateBounds = useMemo(() => {
    if (year === 'All') return { min: '2022-01-01', max: '2024-12-31' };
    return { min: `${year}-01-01`, max: `${year}-12-31` };
  }, [year]);

  // Clears date pickers gracefully if they don't belong to the newly active year selection
  const handleYearChange = newYear => {
    setYear(newYear);
    if (newYear !== 'All') {
      if (startDate && !startDate.startsWith(newYear)) setStartDate('');
      if (endDate && !endDate.startsWith(newYear)) setEndDate('');
    }
  };

  // Groups and explicitly sorts keys chronologically to handle continuous year-over-year transitions smoothly
  const chartData = useMemo(() => {
    const merged = {};
    const filterStart = startDate ? startDate.substring(0, 7) : '';
    const filterEnd = endDate ? endDate.substring(0, 7) : '';

    filteredLines.forEach(line => {
      line.data.forEach(({ date, month, value }) => {
        const withinRange =
          (!filterStart || date >= filterStart) && (!filterEnd || date <= filterEnd);

        if (withinRange) {
          if (!merged[date]) {
            merged[date] = {
              date,
              displayLabel: year === 'All' ? `${month} ${String(line.year).substring(2)}` : month,
            };
          }
          merged[date][`${line.year}-${line.material}`] = value;
        }
      });
    });

    return Object.keys(merged)
      .sort((a, b) => a.localeCompare(b))
      .map(key => merged[key]);
  }, [filteredLines, startDate, endDate, year]);

  const isDefaultFilters =
    material === DEFAULTS.material &&
    year === DEFAULTS.year &&
    startDate === DEFAULTS.startDate &&
    endDate === DEFAULTS.endDate;

  const isDateRangeValid = !startDate || !endDate || startDate <= endDate;
  const legendItems = useMemo(
    () =>
      filteredLines.map(line => ({
        key: `${line.year}-${line.material}`,
        label: `${line.year} - ${line.material}`,
        color: colors[`${line.year}-${line.material}`],
      })),
    [filteredLines],
  );

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
            <select value={year} onChange={e => handleYearChange(e.target.value)}>
              {years.map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Start Date</span>
            <div className={styles.monthInputWrapper}>
              <input
                className={styles.monthInput}
                type="date"
                value={startDate}
                min={dateBounds.min} // Locks the lower bounds dynamically
                max={dateBounds.max} // Locks the upper bounds dynamically
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
          </label>
          <label>
            <span>End Date</span>
            <div className={styles.monthInputWrapper}>
              <input
                className={styles.monthInput}
                type="date"
                value={endDate}
                min={dateBounds.min} // Locks the lower bounds dynamically
                max={dateBounds.max} // Locks the upper bounds dynamically
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </label>
          ...
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
            <>
              {}
              <div className={styles.responsiveChartBox}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 44 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                      dataKey="month"
                      height={72}
                      tick={{ fill: textColor }}
                      axisLine={{ stroke: textColor }}
                      tickLine={{ stroke: textColor }}
                      label={{
                        value: 'Time (months)',
                        position: 'bottom',
                        offset: 18,
                        fill: textColor,
                      }}
                    />
                    <YAxis
                      tick={{ fill: textColor }}
                      axisLine={{ stroke: textColor }}
                      tickLine={{ stroke: textColor }}
                      label={{
                        value: 'Loss (%)',
                        angle: -90,
                        position: 'insideLeft',
                        fill: textColor,
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg)',
                        color: 'var(--text-color)',
                        border: `1px solid var(--border-color)`,
                      }}
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
              </div>

              {}
              <div className={styles.customLegend}>
                {legendItems.map(item => (
                  <span key={item.key} className={styles.legendItem}>
                    <span
                      className={styles.legendSwatch}
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
