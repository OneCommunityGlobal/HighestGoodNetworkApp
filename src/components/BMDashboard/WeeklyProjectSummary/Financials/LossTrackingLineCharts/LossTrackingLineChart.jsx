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
import MonthPicker from './MonthPicker';
import styles from './LossTrackingLineChart.module.css';

// Each year keeps its own color family (teal 2022, pink 2023, yellow 2024) and each material
// gets a clearly different shade plus its own line style, so every line can be told apart.
// Light mode uses darker shades and dark mode lighter ones, so all lines stay visible.
const YEAR_SHADES = {
  light: {
    2022: { Metal: '#004d40', Plastic: '#00897b', Glass: '#4db6ac' },
    2023: { Metal: '#880e4f', Plastic: '#d81b60', Glass: '#f06292' },
    2024: { Metal: '#8d6e00', Plastic: '#c79100', Glass: '#f2b705' },
  },
  dark: {
    2022: { Metal: '#1fa394', Plastic: '#4fd1c1', Glass: '#9ae8de' },
    2023: { Metal: '#e04a83', Plastic: '#f27aa8', Glass: '#f9b3cf' },
    2024: { Metal: '#f0a500', Plastic: '#ffc933', Glass: '#ffe680' },
  },
};

export const MATERIAL_DASH = { Metal: '', Plastic: '8 4', Glass: '2 4' };

const FALLBACK_COLOR = { light: '#6c757d', dark: '#adb5bd' };

export function getSeriesStyle(year, material, darkMode) {
  const theme = darkMode ? 'dark' : 'light';
  return {
    color: YEAR_SHADES[theme][year]?.[material] ?? FALLBACK_COLOR[theme],
    dash: MATERIAL_DASH[material] ?? '',
  };
}

// Small line sample used in the legend and tooltip, so they show the same color and style as the chart
function LineSample({ color, dash, testId, label }) {
  return (
    <svg
      className={styles.lineSample}
      width="28"
      height="10"
      viewBox="0 0 28 10"
      aria-hidden="true"
      data-testid={testId}
      data-label={label}
      data-color={color}
      data-dash={dash}
    >
      <line
        x1="1"
        y1="5"
        x2="27"
        y2="5"
        stroke={color}
        strokeWidth="3"
        strokeDasharray={dash || undefined}
        strokeLinecap="round"
      />
    </svg>
  );
}

// Custom tooltip: each row shows the line's color and style, text in the theme's text color so
// every row is readable in light and dark mode; rows sorted from highest to lowest loss.
function LossTooltip({ active, payload, label, darkMode }) {
  if (!active || !payload?.length) return null;
  const rows = payload
    .filter(item => Number.isFinite(item.value))
    .sort((a, b) => b.value - a.value);

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTitle}>{label}</div>
      {rows.map(item => {
        const [lineYear, lineMaterial] = String(item.dataKey).split('-');
        const { color, dash } = getSeriesStyle(lineYear, lineMaterial, darkMode);
        return (
          <div key={item.dataKey} className={styles.tooltipRow}>
            <LineSample color={color} dash={dash} />
            <span className={styles.tooltipLabel}>{item.name}</span>
            <span className={styles.tooltipValue}>{item.value}%</span>
          </div>
        );
      })}
    </div>
  );
}

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

// Selectable date bounds, derived from the data itself
const allDates = rawData.flatMap(l => l.data.map(d => d.date)).sort((a, b) => a.localeCompare(b));
const MIN_DATE = allDates[0]; // e.g. '2022-01'
const MAX_DATE = allDates.at(-1); // e.g. '2024-06'

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

  // The pickers already prevent an invalid range; kept as a safety net.
  const isDateRangeValid = !startDate || !endDate || startDate <= endDate;

  const legendItems = useMemo(
    () =>
      filteredLines.map(line => ({
        key: `${line.year}-${line.material}`,
        label: `${line.year} - ${line.material}`,
        ...getSeriesStyle(line.year, line.material, darkMode),
      })),
    [filteredLines, darkMode],
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

          <div className={styles.field}>
            <span>Start Date</span>
            <MonthPicker
              ariaLabel="Start date"
              value={startDate}
              onChange={setStartDate}
              min={MIN_DATE}
              max={endDate || MAX_DATE}
            />
          </div>

          <div className={styles.field}>
            <span>End Date</span>
            <MonthPicker
              ariaLabel="End date"
              value={endDate}
              onChange={setEndDate}
              min={startDate || MIN_DATE}
              max={MAX_DATE}
            />
          </div>

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
              <div className={styles.chartArea}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 44 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                      dataKey="displayLabel"
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
                      content={<LossTooltip darkMode={darkMode} />}
                      cursor={{ stroke: gridColor, strokeWidth: 2 }}
                    />
                    {filteredLines.map(line => {
                      const { color, dash } = getSeriesStyle(line.year, line.material, darkMode);
                      return (
                        <Line
                          key={`${line.year}-${line.material}`}
                          type="monotone"
                          dataKey={`${line.year}-${line.material}`}
                          stroke={color}
                          strokeDasharray={dash || undefined}
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: color, strokeDasharray: '' }}
                          activeDot={{ r: 5 }}
                          name={`${line.year} - ${line.material}`}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className={styles.customLegend}>
                {legendItems.map(item => (
                  <span key={item.key} className={styles.legendItem}>
                    <LineSample
                      color={item.color}
                      dash={item.dash}
                      testId="legend-line-sample"
                      label={item.label}
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
