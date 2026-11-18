import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import KIPieChartCard, { KITCHENS } from '../KIPieChartCard/KIPieChartCard';
import styles from './FoodCategoriesPieChart.module.css';

const CATEGORIES = [
  { key: 'produce', name: 'Fresh Produce', color: '#6b8e23', labelColor: '#ffffff' },
  { key: 'grains', name: 'Grains', color: '#c4a35a', labelColor: '#ffffff' },
  { key: 'proteins', name: 'Proteins', color: '#a0522d', labelColor: '#ffffff' },
  { key: 'dairy', name: 'Dairy', color: '#d5c4b0', labelColor: '#3d3d3d' },
];

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
const DATE_MAX = `${MONTHS.at(-1)}-31`;

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

  const metricFilter = (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>Metric</span>
      <select className={styles.control} value={metric} onChange={e => setMetric(e.target.value)}>
        {Object.entries(METRICS).map(([key, m]) => (
          <option key={key} value={key}>
            {m.label}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <KIPieChartCard
      title={metricConfig.title}
      darkMode={darkMode}
      chartData={chartData}
      formatTooltip={metricConfig.format}
      extraFilters={metricFilter}
      kitchen={kitchen}
      onKitchenChange={setKitchen}
      startDate={startDate}
      onStartDateChange={setStartDate}
      endDate={endDate}
      onEndDateChange={setEndDate}
      dateMin={DATE_MIN}
      dateMax={DATE_MAX}
      onReset={handleReset}
      isDefaultFilters={isDefaultFilters}
    />
  );
}
