import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { FaRegCalendarAlt } from 'react-icons/fa';
import styles from './FoodCategoriesPieChart.module.css';

const CATEGORIES = [
  { key: 'produce', name: 'Fresh Produce', color: '#6b8e23', labelColor: '#ffffff' },
  { key: 'grains', name: 'Grains', color: '#c4a35a', labelColor: '#ffffff' },
  { key: 'proteins', name: 'Proteins', color: '#a0522d', labelColor: '#ffffff' },
  { key: 'dairy', name: 'Dairy', color: '#d5c4b0', labelColor: '#3d3d3d' },
];

const KITCHENS = ['Kitchen 1', 'Kitchen 2', 'Kitchen 3'];

const METRICS = {
  inventory: {
    label: 'Current Inventory',
    title: 'Food Categories by Current Inventory',
    unit: 'kg',
    format: v => `${v.toLocaleString()} kg`,
  },
  spent: {
    label: 'Money Spent',
    title: 'Food Categories by Money Spent',
    unit: '$',
    format: v => `$${v.toLocaleString()}`,
  },
};

const DEFAULTS = { metric: 'inventory', kitchen: 'All', startDate: '', endDate: '' };

const MONTHS = Array.from({ length: 12 }, (_, i) => `2024-${String(i + 1).padStart(2, '0')}`);
const DATE_MIN = `${MONTHS[0]}-01`;
const DATE_MAX = `${MONTHS[MONTHS.length - 1]}-31`;

// Mock data: base kg per kitchen/category, price per kg per category
const BASE_KG = {
  'Kitchen 1': { produce: 350, grains: 250, proteins: 200, dairy: 120 },
  'Kitchen 2': { produce: 300, grains: 280, proteins: 180, dairy: 140 },
  'Kitchen 3': { produce: 400, grains: 220, proteins: 230, dairy: 100 },
};
const PRICE_PER_KG = { produce: 3, grains: 2, proteins: 9, dairy: 4 };

const mockRecords = KITCHENS.flatMap(kitchen =>
  MONTHS.flatMap((month, mi) =>
    CATEGORIES.map((cat, ci) => {
      const inventory = Math.round(BASE_KG[kitchen][cat.key] * (1 + 0.05 * ((mi + ci) % 4)));
      return {
        kitchen,
        month,
        category: cat.key,
        inventory,
        spent: inventory * PRICE_PER_KG[cat.key],
      };
    }),
  ),
);

const RADIAN = Math.PI / 180;

const renderSliceLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, payload }) => {
  if (percent < 0.03) return null;
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
      {`${Math.round(percent * 100)}%`}
    </text>
  );
};

export default function FoodCategoriesPieChart() {
  const darkMode = useSelector(state => state.theme.darkMode);

  const [metric, setMetric] = useState(DEFAULTS.metric);
  const [kitchen, setKitchen] = useState(DEFAULTS.kitchen);
  const [startDate, setStartDate] = useState(DEFAULTS.startDate);
  const [endDate, setEndDate] = useState(DEFAULTS.endDate);

  const isDateRangeValid = !startDate || !endDate || startDate <= endDate;
  const isDefaultFilters =
    metric === DEFAULTS.metric &&
    kitchen === DEFAULTS.kitchen &&
    startDate === DEFAULTS.startDate &&
    endDate === DEFAULTS.endDate;

  const metricConfig = METRICS[metric];

  const chartData = useMemo(() => {
    if (!isDateRangeValid) return [];

    const from = startDate ? startDate.substring(0, 7) : '';
    const to = endDate ? endDate.substring(0, 7) : '';

    const totals = {};
    mockRecords.forEach(r => {
      const kitchenMatch = kitchen === 'All' || r.kitchen === kitchen;
      const dateMatch = (!from || r.month >= from) && (!to || r.month <= to);
      if (kitchenMatch && dateMatch) {
        totals[r.category] = (totals[r.category] || 0) + r[metric];
      }
    });

    const sum = Object.values(totals).reduce((a, b) => a + b, 0);
    if (sum === 0) return [];

    return CATEGORIES.map(cat => ({
      name: cat.name,
      value: totals[cat.key] || 0,
      percent: Math.round(((totals[cat.key] || 0) / sum) * 100),
      color: cat.color,
      labelColor: cat.labelColor,
    }));
  }, [metric, kitchen, startDate, endDate, isDateRangeValid]);

  const handleReset = () => {
    setMetric(DEFAULTS.metric);
    setKitchen(DEFAULTS.kitchen);
    setStartDate(DEFAULTS.startDate);
    setEndDate(DEFAULTS.endDate);
  };

  return (
    <div className={[styles.container, darkMode ? styles.darkMode : ''].join(' ')}>
      <div className={styles.filters}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Metric</span>
          <select
            className={styles.control}
            value={metric}
            onChange={e => setMetric(e.target.value)}
          >
            {Object.entries(METRICS).map(([key, m]) => (
              <option key={key} value={key}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

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
              min={DATE_MIN}
              max={endDate || DATE_MAX}
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
              min={startDate || DATE_MIN}
              max={DATE_MAX}
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

      <h2 className={styles.chartTitle}>{metricConfig.title}</h2>

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
                    formatter={(value, name) => [metricConfig.format(value), name]}
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
