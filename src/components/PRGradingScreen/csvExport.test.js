import { describe, expect, it } from 'vitest';
import { buildWeeklyPRGradingCsv, getWeeklyPRGradingFilename } from './csvExport';

describe('weekly PR grading CSV export', () => {
  it('exports reviewer totals, PR numbers, and notes with CSV-safe escaping', () => {
    const csv = buildWeeklyPRGradingCsv([
      {
        reviewer: 'Doe, Jane',
        prsNeeded: 3,
        notes: 'Reviewed "carefully"',
        gradedPrs: [
          { prNumbers: '123', grade: 'Okay' },
          { prNumbers: '456 + 789', grade: 'Exceptional' },
        ],
      },
      {
        reviewer: '=HYPERLINK("bad")',
        prsNeeded: 1,
        gradedPrs: [{ prNumbers: '321', grade: 'Okay', note: 'Follow up' }],
      },
    ]);

    expect(csv).toContain('"Doe, Jane","2","3","123; 456 + 789","Reviewed ""carefully"""');
    expect(csv).toContain('"\'=HYPERLINK(""bad"")","1","1","321","Follow up"');
  });

  it('creates a clear filename from the visible week date range', () => {
    expect(getWeeklyPRGradingFilename({ start: 'Sep 21, 2026', end: 'Sep 27, 2026' })).toBe(
      'weekly-pr-grading-sep-21-2026-to-sep-27-2026.csv',
    );
  });
});
