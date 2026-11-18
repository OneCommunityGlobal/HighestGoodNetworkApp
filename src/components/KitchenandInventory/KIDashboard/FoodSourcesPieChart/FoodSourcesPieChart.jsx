import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { FaRegCalendarAlt } from 'react-icons/fa';
// Same card, filter and legend styles as the Food Categories chart next to it
import styles from '../FoodCategoriesPieChart/FoodCategoriesPieChart.module.css';

export const SOURCES = [
  { key: 'grown', name: 'Freshly Grown', color: '#5b8c5a', labelColor: '#ffffff' },
  { key: 'purchased', name: 'Purchased', color: '#d4a373', labelColor: '#3d3d3d' },
  { key: 'preserved', name: 'Preserved', color: '#8b6b47', labelColor: '#ffffff' },
];

export const KITCHENS = ['Kitchen 1', 'Kitchen 2', 'Kitchen 3'];

const DEFAULTS = { kitchen: 'All', startDate: '', endDate: '' };

// The last 12 months up to this month, as 'YYYY-MM'
export const getRecentMonths = (today = new Date()) =>
  Array.from({ length: 12 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - 11 + i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

const lastDayOfMonth = month => {
  const [year, m] = month.split('-').map(Number);
  return `${month}-${String(new Date(year, m, 0).getDate()).padStart(2, '0')}`;
};

// Mock data: kg of food each kitchen got from each source per month
const BASE_KG = {
  'Kitchen 1': { grown: 450, purchased: 350, preserved: 200 },
  'Kitchen 2': { grown: 380, purchased: 420, preserved: 180 },
  'Kitchen 3': { grown: 520, purchased: 300, preserved: 240 },
};

export const buildMockRecords = months =>
  KITCHENS.flatMap(kitchen =>
    months.flatMap((month, mi) =>
      SOURCES.map((source, si) => ({
        kitchen,
        month,
        source: source.key,
        kg: Math.round(BASE_KG[kitchen][source.key] * (1 + 0.05 * ((mi + si) % 4))),
      })),
    ),
  );

// Whole-number percentages that always add up to 100: round down, then give the
// leftover points to the values with the biggest remainders
export const toWholePercents = (values, sum) => {
  const exact = values.map(v => (v / sum) * 100);
  const floors = exact.map(Math.floor);
  let left = 100 - floors.reduce((a, b) => a + b, 0);
  const order = exact.map((e, i) => [e - floors[i], i]).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) {
    if (left <= 0) break;
    floors[i] += 1;
    left -= 1;
  }
  return floors;
};

// Adds up the kg per source for the chosen kitchen and dates; [] when nothing matches
export const buildSourceData = (
  records,
  { kitchen = 'All', startDate = '', endDate = '' } = {},
) => {
  if (startDate && endDate && startDate > endDate) return [];
  const from = startDate.substring(0, 7);
  const to = endDate.substring(0, 7);

  const totals = {};
  records.forEach(r => {
    const kitchenMatch = kitchen === 'All' || r.kitchen === kitchen;
    const dateMatch = (!from || r.month >= from) && (!to || r.month <= to);
    if (kitchenMatch && dateMatch) totals[r.source] = (totals[r.source] || 0) + r.kg;
  });

  const sum = Object.values(totals).reduce((a, b) => a + b, 0);
  if (sum === 0) return [];

  const values = SOURCES.map(source => totals[source.key] || 0);
  const percents = toWholePercents(values, sum);
  return SOURCES.map((source, i) => ({
    name: source.name,
    value: values[i],
    percent: percents[i],
    color: source.color,
    labelColor: source.labelColor,
  }));
};

const RADIAN = Math.PI / 180;

// Shows the slice's whole percentage from the data, so the labels match the legend;
// slices under 3% are too small for a label
const renderSliceLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, payload }) => {
  if (payload.percent < 3) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill={payload.labelColor}
      textAnchor="middle"
      dominantBaseline="central"
      fontWeight={700}
      fontSize={16}
    >
      {`${payload.percent}%`}
    </text>
  );
};

export default function FoodSourcesPieChart() {
  const darkMode = useSelector(state => state.theme.darkMode);

  const months = useMemo(() => getRecentMonths(), []);
  const records = useMemo(() => buildMockRecords(months), [months]);
  const dateMin = `${months[0]}-01`;
  const dateMax = lastDayOfMonth(months.at(-1));

  const [kitchen, setKitchen] = useState(DEFAULTS.kitchen);
  const [startDate, setStartDate] = useState(DEFAULTS.startDate);
  const [endDate, setEndDate] = useState(DEFAULTS.endDate);

  const isDateRangeValid = !startDate || !endDate || startDate <= endDate;
  const isDefaultFilters =
    kitchen === DEFAULTS.kitchen &&
    startDate === DEFAULTS.startDate &&
    endDate === DEFAULTS.endDate;

  const chartData = useMemo(() => buildSourceData(records, { kitchen, startDate, endDate }), [
    records,
    kitchen,
    startDate,
    endDate,
  ]);

  const handleReset = () => {
    setKitchen(DEFAULTS.kitchen);
    setStartDate(DEFAULTS.startDate);
    setEndDate(DEFAULTS.endDate);
  };

  const handleDateClick = e => {
    try {
      e.currentTarget.showPicker?.();
    } catch {
      // Some browsers do not support showPicker; the native input still works
    }
  };

  return (
    <div className={[styles.container, darkMode ? styles.darkMode : ''].join(' ')}>
      <div className={styles.filters}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Kitchen</span>
          <select
            className={styles.control}
            value={kitchen}
            onChange={e => setKitchen(e.target.value)}
          >
            <option value="All">All</option>
            {KITCHENS.map(k => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>From</span>
          <div className={styles.dateWrapper}>
            <input
              className={`${styles.control} ${styles.dateInput}`}
              type="date"
              value={startDate}
              min={dateMin}
              max={endDate || dateMax}
              onClick={handleDateClick}
              onChange={e => setStartDate(e.target.value)}
            />
            <FaRegCalendarAlt className={styles.dateIcon} aria-hidden="true" />
          </div>
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>To</span>
          <div className={styles.dateWrapper}>
            <input
              className={`${styles.control} ${styles.dateInput}`}
              type="date"
              value={endDate}
              min={startDate || dateMin}
              max={dateMax}
              onClick={handleDateClick}
              onChange={e => setEndDate(e.target.value)}
            />
            <FaRegCalendarAlt className={styles.dateIcon} aria-hidden="true" />
          </div>
        </label>

        <div className={styles.buttonCell}>
          <button
            type="button"
            className={styles.resetBtn}
            onClick={handleReset}
            disabled={isDefaultFilters}
          >
            Reset Filters
          </button>
        </div>

        {!isDateRangeValid && (
          <span className={styles.dateRangeError}>
            From date must be before or equal to To date.
          </span>
        )}
      </div>

      <h2 className={styles.chartTitle}>Food Sources</h2>

      <div className={styles.chartWrapper}>
        {chartData.length === 0 ? (
          <div className={styles.noDataMessage}>No data available for the selected filters.</div>
        ) : (
          <>
            <div className={styles.pieBox}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="90%"
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={1}
                    stroke={darkMode ? '#0f1522' : '#ffffff'}
                    strokeWidth={3}
                    label={renderSliceLabel}
                    labelLine={false}
                    isAnimationActive={false}
                  >
                    {chartData.map(entry => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, item) => [
                      `${value.toLocaleString()} kg (${item.payload.percent}%)`,
                      name,
                    ]}
                    contentStyle={{
                      backgroundColor: 'var(--tooltip-bg)',
                      color: 'var(--text-color)',
                      border: '1px solid var(--border-color)',
                    }}
                    itemStyle={{ color: 'var(--text-color)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className={styles.legend}>
              {chartData.map(item => (
                <span key={item.name} className={styles.legendItem}>
                  <span
                    className={styles.legendSwatch}
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span>{`${item.name} (${item.percent}%)`}</span>
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
