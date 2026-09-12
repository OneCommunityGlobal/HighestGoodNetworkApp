export const COMPARISON_OPTIONS = [
  'No Comparison',
  'Week Over Week',
  'Month Over Month',
  'Year Over Year',
];

export function shiftComparisonDate(date, diffDays, type) {
  if (type === 'Week Over Week') return new Date(date.setDate(date.getDate() - diffDays));
  if (type === 'Month Over Month') return new Date(date.setMonth(date.getMonth() - 1));
  if (type === 'Year Over Year') return new Date(date.setFullYear(date.getFullYear() - 1));
  return null;
}

export function calculateComparisonDates(comparisonType, fromDate, toDate) {
  if (comparisonType === 'No Comparison' || !fromDate || !toDate) {
    return {
      comparisonStartDate: null,
      comparisonEndDate: null,
    };
  }

  const start = new Date(fromDate);
  const end = new Date(toDate);
  const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
  const shiftedStart = shiftComparisonDate(start, diffDays, comparisonType);
  const shiftedEnd = shiftComparisonDate(end, diffDays, comparisonType);

  return {
    comparisonStartDate: shiftedStart ? shiftedStart.toISOString().split('T')[0] : null,
    comparisonEndDate: shiftedEnd ? shiftedEnd.toISOString().split('T')[0] : null,
  };
}

export function parseWeeklySummaryDateRange(dateRange) {
  if (!dateRange || typeof dateRange !== 'string') return { startDate: null, endDate: null };

  const [startText, endText] = dateRange.split(' - ');
  if (!startText || !endText) return { startDate: null, endDate: null };

  const normalizeDateText = value => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().split('T')[0];
  };

  return {
    startDate: normalizeDateText(startText),
    endDate: normalizeDateText(endText),
  };
}
