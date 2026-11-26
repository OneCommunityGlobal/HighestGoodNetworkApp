// The material-costs API returns totals in thousands of dollars (totalCostK).

/** Thousands of dollars -> whole dollars (invalid values become 0). */
export function kToDollars(valueK) {
  const n = Number(valueK);
  return Number.isFinite(n) ? Math.round(n * 1000) : 0;
}

/** Exact currency, e.g. 133044 -> "$133,044". */
export function formatCurrency(dollars) {
  const n = Number.isFinite(dollars) ? dollars : 0;
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

const oneDecimal = n => String(Math.round(n * 10) / 10);

/** Compact currency for bar labels and axis ticks, e.g. 133044 -> "$133K". */
export function formatCompactCurrency(dollars) {
  const n = Number.isFinite(dollars) ? dollars : 0;
  const abs = Math.abs(n);
  if (abs >= 1000000) return `$${oneDecimal(n / 1000000)}M`;
  if (abs >= 1000) return `$${oneDecimal(n / 1000)}K`;
  return `$${Math.round(n)}`;
}

const ELLIPSIS = '…';

function endEllipsis(label, maxLength) {
  return label.length <= maxLength ? label : `${label.slice(0, maxLength - 1)}${ELLIPSIS}`;
}

// Keep a short start and a longer end, where names like
// "[Stock Risk QA 5709] Material Alpha" differ from each other.
function middleEllipsis(label, maxLength) {
  if (label.length <= maxLength) return label;
  const keepStart = Math.floor((maxLength - 1) / 3);
  const keepEnd = maxLength - 1 - keepStart;
  return `${label.slice(0, keepStart)}${ELLIPSIS}${label.slice(label.length - keepEnd)}`;
}

function countValues(values) {
  const counts = new Map();
  values.forEach(value => counts.set(value, (counts.get(value) || 0) + 1));
  return counts;
}

/**
 * Shorten axis labels so each one stays unique: cut at the end first; if that
 * makes names identical, keep their distinguishing end instead; if names are
 * still identical, number them.
 */
export function shortenLabels(labels, maxLength = 22) {
  const names = labels.map(label => String(label ?? ''));
  const first = names.map(name => endEllipsis(name, maxLength));
  const firstCounts = countValues(first);
  const second = names.map((name, i) =>
    firstCounts.get(first[i]) > 1 ? middleEllipsis(name, maxLength) : first[i],
  );
  const secondCounts = countValues(second);
  const seen = new Map();
  return second.map(label => {
    if (secondCounts.get(label) === 1) return label;
    const n = (seen.get(label) || 0) + 1;
    seen.set(label, n);
    return `${label} (${n})`;
  });
}

/** Projects with a cost above $0; falls back to all projects if none have a cost. */
export function getDefaultSelection(projects, costs) {
  const withCost = projects.filter(project => Number(costs?.[project.value]) > 0);
  return withCost.length ? withCost : projects;
}
