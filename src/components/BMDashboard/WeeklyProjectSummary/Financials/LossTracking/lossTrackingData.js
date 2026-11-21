export const LOSS_CATEGORIES = ['Materials', 'Labor', 'Equipment', 'Waste'];

export const SAMPLE_PROJECTS = [
  'Building 1',
  'Building 2',
  'Building 3',
  'Commercial Test - Project',
  'Residential Test - Project',
];

const CATEGORY_BASE_COST = { Materials: 420, Labor: 260, Equipment: 180, Waste: 140 };

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Deterministic sample records: one per project, category and month of 2024.
 * Replace with real data from the API once a loss-tracking endpoint exists.
 */
export const SAMPLE_LOSS_RECORDS = SAMPLE_PROJECTS.flatMap((project, projectIndex) =>
  LOSS_CATEGORIES.flatMap((category, categoryIndex) =>
    MONTH_LABELS.map((_, monthIndex) => {
      const seasonal = 1 + 0.25 * Math.sin((monthIndex + projectIndex) / 2);
      // Each project has its own category mix, so the donut changes per project.
      const mix = 1 + 0.45 * Math.sin(projectIndex * 1.7 + categoryIndex * 2.3);
      const cost = Math.round(
        CATEGORY_BASE_COST[category] * (1 + projectIndex * 0.15) * seasonal * mix,
      );
      return {
        date: `2024-${String(monthIndex + 1).padStart(2, '0')}`,
        project,
        category,
        cost,
      };
    }),
  ),
);

const toMonth = value => (value ? String(value).slice(0, 7) : '');

/** Keep records for the selected project and month range ('YYYY-MM'). */
export function filterLossRecords(records, filters = {}) {
  const project = filters.project || 'All';
  const start = toMonth(filters.startMonth);
  const end = toMonth(filters.endMonth);
  return records.filter(record => {
    const projectMatches = project === 'All' || record.project === project;
    const afterStart = start === '' || record.date >= start;
    const beforeEnd = end === '' || record.date <= end;
    return projectMatches && afterStart && beforeEnd;
  });
}

export function totalLoss(records) {
  return records.reduce((sum, record) => sum + record.cost, 0);
}

function sumBy(records, getKey) {
  const totals = new Map();
  records.forEach(record => {
    const key = getKey(record);
    totals.set(key, (totals.get(key) || 0) + record.cost);
  });
  return totals;
}

// "share" is the percentage of the total (named share, not percent, so it
// doesn't clash with the percent field Recharts adds to pie slices).
function withShare(entries, total) {
  return entries.map(([name, value]) => ({
    name,
    value,
    share: total > 0 ? Math.round((value / total) * 1000) / 10 : 0,
  }));
}

export function lossByCategory(records) {
  const totals = sumBy(records, record => record.category);
  const ordered = LOSS_CATEGORIES.filter(category => totals.has(category)).map(category => [
    category,
    totals.get(category),
  ]);
  return withShare(ordered, totalLoss(records));
}

export function lossByProject(records) {
  const totals = sumBy(records, record => record.project);
  return withShare([...totals.entries()], totalLoss(records)).sort((a, b) => b.value - a.value);
}

export function formatMonthLabel(month) {
  const [year, monthNumber] = month.split('-');
  return `${MONTH_LABELS[Number(monthNumber) - 1]} ${year.slice(2)}`;
}

export function lossByMonth(records) {
  const totals = sumBy(records, record => record.date);
  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({ month, label: formatMonthLabel(month), value }));
}

export function formatCurrency(value) {
  return `$${Math.round(value).toLocaleString('en-US')}`;
}
