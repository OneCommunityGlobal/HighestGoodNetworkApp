// Version 1.0.0
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
import { buildLossSeries } from './lossTrackingData';
import styles from './LossTrackingLineChart.module.css';

const palette = ['#008080', '#d45087', '#996b00', '#6657c5', '#2580c3', '#cd5a24'];

// Custom tooltip: line colors shown as swatches, text in the theme's text color so every
// row is readable in light and dark mode; rows sorted from highest to lowest loss.
function LossTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const rows = payload
    .filter(item => Number.isFinite(item.value))
    .sort((a, b) => b.value - a.value);

  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipTitle}>{label}</div>
      {rows.map(item => (
        <div key={item.dataKey} className={styles.tooltipRow}>
          <span
            className={styles.tooltipSwatch}
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          <span className={styles.tooltipLabel}>{item.name}</span>
          <span className={styles.tooltipValue}>{item.value}%</span>
        </div>
      ))}
    </div>
  );
}

const DEFAULTS = { material: 'All', year: 'All', startDate: '', endDate: '' };

export default function LossTrackingLineChart() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const hostRef = useRef(null);
  const records = useSelector(state => state.materials.materialslist);
  const rawData = useMemo(() => buildLossSeries(records), [records]);
  const currentYear = new Date().getFullYear();
  const colors = useMemo(
    () =>
      Object.fromEntries(
        rawData.map((line, index) => [
          `${line.year}-${line.materialId}`,
          palette[index % palette.length],
        ]),
      ),
    [rawData],
  );

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
    () =>
      Array.from(
        new Map(
          records
            .filter(d => d.itemType?._id)
            .map(d => [d.itemType._id, { id: d.itemType._id, name: d.itemType.name }]),
        ).values(),
      ),
    [records],
  );
  const years = useMemo(
    () => [
      'All',
      ...Array.from(new Set([String(currentYear), ...rawData.map(d => String(d.year))])).sort(),
    ],
    [rawData, currentYear],
  );

  const minDate = `${years[1]}-01`;
  const maxDate = `${years[years.length - 1]}-12`;

  const filteredLines = useMemo(() => {
    const filterStart = startDate ? startDate.substring(0, 7) : '';
    const filterEnd = endDate ? endDate.substring(0, 7) : '';

    return rawData.filter(line => {
      const materialMatch = material === 'All' || line.materialId === material;
      let yearMatch = year === 'All' || String(line.year) === year;

      // Filter lines dynamically if they sit entirely outside the selected calendar period
      if (filterStart && `${line.year}-12` < filterStart) yearMatch = false; // Checks through end of year
      if (filterEnd && `${line.year}-01` > filterEnd) yearMatch = false; // Checks from start of year

      return yearMatch && materialMatch;
    });
  }, [rawData, material, year, startDate, endDate]);

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
          merged[date][`${line.year}-${line.materialId}`] = value;
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
        key: `${line.year}-${line.materialId}`,
        label: `${line.year} - ${line.material}`,
        color: colors[`${line.year}-${line.materialId}`],
      })),
    [filteredLines, colors],
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
              <option value="All">All</option>
              {materials.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}
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
              min={minDate}
              max={endDate || maxDate}
            />
          </div>

          <div className={styles.field}>
            <span>End Date</span>
            <MonthPicker
              ariaLabel="End date"
              value={endDate}
              onChange={setEndDate}
              min={startDate || minDate}
              max={maxDate}
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

        <p>
          Monthly loss = wasted / approved purchases x 100. Months without purchases have no
          percentage.
        </p>
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
                      content={<LossTooltip />}
                      cursor={{ stroke: gridColor, strokeWidth: 2 }}
                    />
                    {filteredLines.map(line => (
                      <Line
                        key={`${line.year}-${line.materialId}`}
                        type="monotone"
                        dataKey={`${line.year}-${line.materialId}`}
                        stroke={colors[`${line.year}-${line.materialId}`]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        name={`${line.year} - ${line.material}`}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
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
