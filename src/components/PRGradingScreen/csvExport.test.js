import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildWeeklyPRGradingCsv,
  downloadWeeklyPRGradingCsv,
  getWeeklyPRGradingFilename,
} from './csvExport';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('weekly PR grading CSV export', () => {
  it('exports reviewer totals, PR numbers, aligned grades, and notes with CSV-safe escaping', () => {
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

    expect(csv).toContain(
      '"Reviewer Name","PR Reviewed Count","PRs Needed","PR Numbers","Grades","Notes"',
    );
    expect(csv).toContain(
      '"Doe, Jane","2","3","123; 456 + 789","Okay; Exceptional","Reviewed ""carefully"""',
    );
    expect(csv).toContain('"\'=HYPERLINK(""bad"")","1","1","321","Okay","Follow up"');
  });

  it('keeps a blank grade position aligned with its PR number', () => {
    const csv = buildWeeklyPRGradingCsv([
      {
        reviewer: 'Abi',
        prsNeeded: 3,
        gradedPrs: [
          { prNumbers: '1000', grade: 'Exceptional' },
          { prNumbers: '2000' },
          { prNumbers: '3000', grade: 'Unsatisfactory' },
        ],
      },
    ]);

    expect(csv).toContain('"1000; 2000; 3000","Exceptional; ; Unsatisfactory"');
  });

  it('can export the dashboard count exactly as displayed, even with fewer listed PRs', () => {
    const reviewers = [
      {
        reviewer: 'Alice',
        prsReviewed: 7,
        prsNeeded: 10,
        gradedPrs: [{ prNumbers: '1070 + 1256', grade: 'Exceptional' }],
      },
    ];

    expect(buildWeeklyPRGradingCsv(reviewers, { useStoredCount: true })).toContain(
      '"Alice","7","10","1070 + 1256","Exceptional",""',
    );
    expect(buildWeeklyPRGradingCsv(reviewers)).toContain(
      '"Alice","1","10","1070 + 1256","Exceptional",""',
    );
  });

  it('creates a clear filename from the visible week date range', () => {
    expect(getWeeklyPRGradingFilename({ start: 'Sep 21, 2026', end: 'Sep 27, 2026' })).toBe(
      'weekly-pr-grading-sep-21-2026-to-sep-27-2026.csv',
    );
  });

  it('releases the temporary download URL after the click, not in the same tick', () => {
    vi.useFakeTimers();
    const createObjectURL = vi.fn(() => 'blob:weekly-grading');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    downloadWeeklyPRGradingCsv([], { start: '5/18/2025', end: '5/25/2025' });

    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:weekly-grading');
  });
});
