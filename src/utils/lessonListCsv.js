// Spreadsheet applications may evaluate formulas even when a CSV cell is quoted.
export function escapeLessonCSV(value) {
  if (value === null || value === undefined || value === '') return '';
  let text = String(value).replace(/\r\n|\r|\n/g, ' ');
  // Preserve numeric counters. User-controlled text must remain text, including
  // formula prefixes hidden behind whitespace, control characters or format marks.
  if (typeof value === 'string' && /^[\s\p{Cc}\p{Cf}]*[=+\-@]/u.test(text)) text = `'${text}`;
  if (/[",]/.test(text) || text.trim() !== text) return `"${text.replace(/"/g, '""')}"`;
  return text;
}
