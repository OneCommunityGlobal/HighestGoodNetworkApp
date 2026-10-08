const CSV_HEADERS = ['Reviewer Name', 'PR Reviewed Count', 'PRs Needed', 'PR Numbers', 'Notes'];

const protectSpreadsheetValue = value => {
  const text = String(value ?? '');
  return /^[\t\r ]*[=+\-@]/.test(text) ? `'${text}` : text;
};

const escapeCsvValue = value => `"${protectSpreadsheetValue(value).replace(/"/g, '""')}"`;

const getNotes = reviewer => {
  const reviewerNotes = reviewer.notes ?? reviewer.note;
  if (reviewerNotes) return reviewerNotes;

  return reviewer.gradedPrs
    .map(pr => pr.notes ?? pr.note)
    .filter(Boolean)
    .join('; ');
};

export const buildWeeklyPRGradingCsv = reviewers => {
  const rows = reviewers.map(reviewer => [
    reviewer.reviewer,
    reviewer.gradedPrs.length,
    reviewer.prsNeeded ?? '',
    reviewer.gradedPrs.map(pr => pr.prNumbers).join('; '),
    getNotes(reviewer),
  ]);

  return [CSV_HEADERS, ...rows].map(row => row.map(escapeCsvValue).join(',')).join('\r\n');
};

const filenamePart = value =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const getWeeklyPRGradingFilename = dateRange => {
  const start = filenamePart(dateRange.start);
  const end = filenamePart(dateRange.end);
  return `weekly-pr-grading-${start}-to-${end}.csv`;
};

export const downloadWeeklyPRGradingCsv = (reviewers, dateRange) => {
  const csv = buildWeeklyPRGradingCsv(reviewers);
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = getWeeklyPRGradingFilename(dateRange);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
