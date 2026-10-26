const COMPARISON_TYPES = ['Week Over Week', 'Month Over Month', 'Year Over Year', 'No Comparison'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value) {
  if (!DATE_PATTERN.test(value || '')) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

/**
 * Reads the report period from the URL so the scheduled Total Org Summary email can render
 * an exact period: ?comparison=Week Over Week&from=2026-10-18&to=2026-10-24
 * &compareFrom=2026-10-11&compareTo=2026-10-17. Returns null unless from and to are valid
 * dates, so a normal visit to the page is unaffected. compareFrom and compareTo are optional
 * and replace the default comparison range when both are valid.
 */
export function parseReportParams(search) {
  const params = new URLSearchParams(search);
  const from = params.get('from');
  const to = params.get('to');
  if (!isValidDate(from) || !isValidDate(to) || from > to) return null;

  const requested = params.get('comparison');
  const comparison = COMPARISON_TYPES.includes(requested) ? requested : 'No Comparison';

  const compareFrom = params.get('compareFrom');
  const compareTo = params.get('compareTo');
  const hasCompareRange =
    comparison !== 'No Comparison' &&
    isValidDate(compareFrom) &&
    isValidDate(compareTo) &&
    compareFrom <= compareTo;

  return {
    from,
    to,
    comparison,
    comparisonRange: hasCompareRange ? { start: compareFrom, end: compareTo } : null,
  };
}

export function formatReportRangeLabel(from, to) {
  return `${from} - ${to}`;
}
