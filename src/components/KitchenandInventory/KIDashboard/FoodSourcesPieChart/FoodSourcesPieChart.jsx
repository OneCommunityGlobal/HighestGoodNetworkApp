import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import KIPieChartCard, { KITCHENS } from '../KIPieChartCard/KIPieChartCard';

export const SOURCES = [
  { key: 'grown', name: 'Freshly Grown', color: '#5b8c5a', labelColor: '#ffffff' },
  { key: 'purchased', name: 'Purchased', color: '#d4a373', labelColor: '#3d3d3d' },
  { key: 'preserved', name: 'Preserved', color: '#8b6b47', labelColor: '#ffffff' },
];

const DEFAULTS = { kitchen: 'All', startDate: '', endDate: '' };

// The last 12 months up to this month, as 'YYYY-MM'
export const getRecentMonths = (today = new Date()) =>
  Array.from({ length: 12 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - 11 + i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

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

// Adds up the kg per source for the chosen kitchen and months; [] when nothing matches.
// startDate and endDate are whole months ('YYYY-MM'), or '' for no limit.
export const buildSourceData = (
  records,
  { kitchen = 'All', startDate = '', endDate = '' } = {},
) => {
  if (startDate && endDate && startDate > endDate) return [];

  const totals = {};
  records.forEach(r => {
    const kitchenMatch = kitchen === 'All' || r.kitchen === kitchen;
    const dateMatch = (!startDate || r.month >= startDate) && (!endDate || r.month <= endDate);
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

const formatTooltip = (value, item) => `${value.toLocaleString()} kg (${item.percent}%)`;

export default function FoodSourcesPieChart() {
  const darkMode = useSelector(state => state.theme.darkMode);

  const months = useMemo(() => getRecentMonths(), []);
  const records = useMemo(() => buildMockRecords(months), [months]);

  const [kitchen, setKitchen] = useState(DEFAULTS.kitchen);
  const [startDate, setStartDate] = useState(DEFAULTS.startDate);
  const [endDate, setEndDate] = useState(DEFAULTS.endDate);

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

  return (
    <KIPieChartCard
      title="Food Sources"
      darkMode={darkMode}
      chartData={chartData}
      formatTooltip={formatTooltip}
      kitchen={kitchen}
      onKitchenChange={setKitchen}
      startDate={startDate}
      onStartDateChange={setStartDate}
      endDate={endDate}
      onEndDateChange={setEndDate}
      months={months}
      onReset={handleReset}
      isDefaultFilters={
        kitchen === DEFAULTS.kitchen &&
        startDate === DEFAULTS.startDate &&
        endDate === DEFAULTS.endDate
      }
    />
  );
}
