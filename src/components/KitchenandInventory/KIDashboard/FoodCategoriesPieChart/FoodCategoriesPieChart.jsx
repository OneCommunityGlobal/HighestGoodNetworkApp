import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import KIPieChartCard from '../KIPieChartCard/KIPieChartCard';
import KIChartFilters, {
  KITCHENS,
  isDateRangeValid,
  useChartFilters,
} from '../KIChartFilters/KIChartFilters';

export const CATEGORIES = [
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

const METRIC_OPTIONS = Object.entries(METRICS).map(([value, m]) => ({ value, label: m.label }));

export default function FoodCategoriesPieChart() {
  const darkMode = useSelector(state => state.theme.darkMode);
  const { filters, setFilter, reset, isDefault } = useChartFilters(DEFAULTS);
  const { metric, kitchen, startDate, endDate } = filters;
  const metricConfig = METRICS[metric];

  const chartData = useMemo(() => {
    if (!isDateRangeValid(filters)) return [];

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
  }, [filters, metric, kitchen, startDate, endDate]);

  return (
    <KIPieChartCard
      title={metricConfig.title}
      darkMode={darkMode}
      chartData={chartData}
      formatTooltip={metricConfig.format}
      filterBar={
        <KIChartFilters
          filters={filters}
          onFilterChange={setFilter}
          onReset={reset}
          isDefault={isDefault}
          dateMin={DATE_MIN}
          dateMax={DATE_MAX}
          metricOptions={METRIC_OPTIONS}
        />
      }
    />
  );
}
