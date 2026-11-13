import { escapeLessonCSV } from '../lessonListCsv';
const decode = cell => (cell.startsWith('"') ? cell.slice(1, -1).replace(/""/g, '"') : cell);
describe('spreadsheet-safe lesson CSV cells', () => {
  it.each([
    '=1+1',
    '+SUM(1,2)',
    '-1+2',
    '@SUM(A1)',
  ])('neutralizes formula-leading text %s before CSV quoting', value =>
    expect(decode(escapeLessonCSV(value))).toBe(`'${value}`),
  );
  it.each([
    ' ',
    '\t',
    '\r',
    '\n',
    '\r\n\t',
    '\u0000',
    '\u001b',
    '\u007f',
    '\u0085',
    '\u00a0',
    '\ufeff',
    '\u200b',
    '\u2060',
  ])('prevents leading whitespace/control bypass %j', prefix => {
    const value = prefix + '=1+1';
    expect(decode(escapeLessonCSV(value))).toBe("'" + value.replace(/\r\n|\r|\n/g, ' '));
  });
  it('preserves valid CSV escaping, harmless text, dates, Unicode, and numeric counters', () => {
    expect(escapeLessonCSV('A, "quoted" title')).toBe('"A, ""quoted"" title"');
    expect(escapeLessonCSV(' multi\nline ')).toBe('" multi line "');
    expect(escapeLessonCSV('Safety – 安全')).toBe('Safety – 安全');
    expect(escapeLessonCSV('11/13/2026')).toBe('11/13/2026');
    expect(escapeLessonCSV(0)).toBe('0');
    expect(escapeLessonCSV(-12)).toBe('-12');
    expect(escapeLessonCSV(null)).toBe('');
    expect(escapeLessonCSV("'=already text")).toBe("'=already text");
  });
});
