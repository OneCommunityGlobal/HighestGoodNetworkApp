import toScheduleInputValues from '../scheduleTime';

// Dates are built from local parts, so these tests hold in any time zone.
// In Pacific time, 6:30 PM is already the next day in UTC, which is the
// case the old toISOString-based code got wrong.
describe('toScheduleInputValues', () => {
  it('keeps an evening time on the same local date', () => {
    const evening = new Date(2026, 8, 28, 18, 30);
    expect(toScheduleInputValues(evening)).toEqual({ date: '2026-09-28', time: '18:30' });
  });

  it('formats single-digit months, days, hours, and minutes with leading zeros', () => {
    const morning = new Date(2026, 2, 2, 9, 5);
    expect(toScheduleInputValues(morning)).toEqual({ date: '2026-03-02', time: '09:05' });
  });

  it('accepts the ISO string stored by the backend', () => {
    const late = new Date(2026, 11, 31, 23, 59);
    expect(toScheduleInputValues(late.toISOString())).toEqual({
      date: '2026-12-31',
      time: '23:59',
    });
  });
});
