import { isFinalWeekOnTab, shouldShowSummaryOnTab } from '../weeklySummariesFinalWeek';

describe('weeklySummariesFinalWeek', () => {
  const deactivatedLastWeek = { isActive: false, finalWeekIndex: 1 };
  const activeWithScheduledEnd = {
    isActive: true,
    endDate: '2026-10-10T06:59:59.999Z',
    finalWeekIndex: null,
  };
  const inactiveOutsideWindow = { isActive: false, finalWeekIndex: null };

  describe('shouldShowSummaryOnTab', () => {
    it('shows a user deactivated last week only on the Last Week tab', () => {
      expect([0, 1, 2, 3].map(tab => shouldShowSummaryOnTab(deactivatedLastWeek, tab))).toEqual([
        false,
        true,
        false,
        false,
      ]);
    });

    it('shows an active user with a scheduled end date on every tab', () => {
      expect([0, 1, 2, 3].every(tab => shouldShowSummaryOnTab(activeWithScheduledEnd, tab))).toBe(
        true,
      );
    });

    it('hides an inactive user who has no final week in the window', () => {
      expect([0, 1, 2, 3].some(tab => shouldShowSummaryOnTab(inactiveOutsideWindow, tab))).toBe(
        false,
      );
    });

    it('treats a summary without isActive as active', () => {
      expect(shouldShowSummaryOnTab({}, 2)).toBe(true);
    });
  });

  describe('isFinalWeekOnTab', () => {
    it('is true only on the tab matching the final week of an inactive user', () => {
      expect(isFinalWeekOnTab(deactivatedLastWeek, 1)).toBe(true);
      expect(isFinalWeekOnTab(deactivatedLastWeek, 0)).toBe(false);
    });

    it('is never true for an active user, even with a matching index', () => {
      expect(isFinalWeekOnTab({ isActive: true, finalWeekIndex: 1 }, 1)).toBe(false);
    });

    it('is false for missing or non-numeric indexes', () => {
      expect(isFinalWeekOnTab({ isActive: false }, 0)).toBe(false);
      expect(isFinalWeekOnTab({ isActive: false, finalWeekIndex: '1' }, 1)).toBe(false);
      expect(isFinalWeekOnTab(null, 0)).toBe(false);
    });
  });
});
