import moment from 'moment';

export const COMPARISON_OPTIONS = [
  'No Comparison',
  'Week Over Week',
  'Month Over Month',
  'Year Over Year',
];

export function shiftComparisonDate(date, diffDays, type) {
  if (type === 'Week Over Week') return new Date(date.setUTCDate(date.getUTCDate() - diffDays));
  if (type === 'Month Over Month')
    return moment
      .utc(date)
      .subtract(1, 'month')
      .toDate();
  if (type === 'Year Over Year')
    return moment
      .utc(date)
      .subtract(1, 'year')
      .toDate();
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
  const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
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
    const parsed = moment(value, 'MMM DD, YY');
    return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null;
  };

  return {
    startDate: normalizeDateText(startText),
    endDate: normalizeDateText(endText),
  };
}
