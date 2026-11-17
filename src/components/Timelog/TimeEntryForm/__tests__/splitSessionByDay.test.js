import { splitSessionByDay } from '../splitSessionByDay';

const run = (startedAt, endedAt, open = false) => ({ startedAt, endedAt, open });

describe('splitSessionByDay', () => {
  it('logs a session inside one day against that day', () => {
    const runs = [run('2026-10-27T18:00:00Z', '2026-10-27T23:00:00Z')];

    expect(splitSessionByDay({ runs, hours: 5, minutes: 0 })).toEqual([
      { dateOfWork: '2026-10-27', hours: 5, minutes: 0 },
    ]);
  });

  it('dates a session by when it ran, not by when it is logged', () => {
    const runs = [run('2026-10-27T18:00:00Z', '2026-10-27T23:00:00Z')];

    const [entry] = splitSessionByDay({
      runs,
      hours: 5,
      minutes: 0,
      now: new Date('2026-10-29T17:00:00Z').getTime(),
    });
    expect(entry.dateOfWork).toBe('2026-10-27');
  });

  it('splits a session that runs from 10:42 PM to 3:42 AM across both days', () => {
    // 10:42 PM PDT on Oct 26 to 3:42 AM PDT on Oct 27
    const runs = [run('2026-10-27T05:42:00Z', '2026-10-27T10:42:00Z')];

    expect(splitSessionByDay({ runs, hours: 5, minutes: 0 })).toEqual([
      { dateOfWork: '2026-10-26', hours: 1, minutes: 18 },
      { dateOfWork: '2026-10-27', hours: 3, minutes: 42 },
    ]);
  });

  it('adds up the runs of a session that was paused and resumed', () => {
    const runs = [
      run('2026-10-27T05:00:00Z', '2026-10-27T06:00:00Z'), // 10 PM to 11 PM on Oct 26
      run('2026-10-27T08:00:00Z', '2026-10-27T10:00:00Z'), // 1 AM to 3 AM on Oct 27
    ];

    expect(splitSessionByDay({ runs, hours: 3, minutes: 0 })).toEqual([
      { dateOfWork: '2026-10-26', hours: 1, minutes: 0 },
      { dateOfWork: '2026-10-27', hours: 2, minutes: 0 },
    ]);
  });

  it('shares the logged time in proportion when it differs from the runs', () => {
    // runs add up to 5 h, 1 h 18 min before midnight, but 4 h 59 min is being logged
    const runs = [run('2026-10-27T05:42:00Z', '2026-10-27T10:42:00Z')];

    const entries = splitSessionByDay({ runs, hours: 4, minutes: 59 });

    expect(entries.map(entry => entry.dateOfWork)).toEqual(['2026-10-26', '2026-10-27']);
    const minutes = entries.reduce((sum, entry) => sum + entry.hours * 60 + entry.minutes, 0);
    expect(minutes).toBe(299);
  });

  it('always adds up to exactly the logged time', () => {
    const runs = [
      run('2026-10-27T06:00:00Z', '2026-10-27T06:20:00Z'),
      run('2026-10-27T07:30:00Z', '2026-10-27T09:07:00Z'),
    ];

    const entries = splitSessionByDay({ runs, hours: 1, minutes: 53 });
    const minutes = entries.reduce((sum, entry) => sum + entry.hours * 60 + entry.minutes, 0);
    expect(minutes).toBe(113);
  });

  it('ends a run that is still counting at the current time', () => {
    const runs = [run('2026-10-27T06:30:00Z', '2026-10-27T06:30:00Z', true)];

    expect(
      splitSessionByDay({
        runs,
        hours: 2,
        minutes: 0,
        now: new Date('2026-10-27T08:30:00Z').getTime(),
        openRunLimitMs: 5 * 60 * 60 * 1000,
      }),
    ).toEqual([
      { dateOfWork: '2026-10-26', hours: 0, minutes: 30 },
      { dateOfWork: '2026-10-27', hours: 1, minutes: 30 },
    ]);
  });

  it('stops a run that is still counting once the time on the timer ran out', () => {
    const runs = [run('2026-10-27T05:42:00Z', '2026-10-27T05:42:00Z', true)];

    const entries = splitSessionByDay({
      runs,
      hours: 5,
      minutes: 0,
      now: new Date('2026-10-27T17:00:00Z').getTime(),
      openRunLimitMs: 5 * 60 * 60 * 1000,
    });
    expect(entries).toEqual([
      { dateOfWork: '2026-10-26', hours: 1, minutes: 18 },
      { dateOfWork: '2026-10-27', hours: 3, minutes: 42 },
    ]);
  });

  it('drops a day that rounds to zero minutes', () => {
    // 10 seconds before midnight, the rest after
    const runs = [run('2026-10-27T06:59:50Z', '2026-10-27T10:00:00Z')];

    expect(splitSessionByDay({ runs, hours: 3, minutes: 0 })).toEqual([
      { dateOfWork: '2026-10-27', hours: 3, minutes: 0 },
    ]);
  });

  it('keeps one entry per day when the clocks go back during the session', () => {
    // 12:30 AM PDT to 3:30 AM PST on Nov 1, which includes the repeated hour
    const runs = [run('2026-11-01T07:30:00Z', '2026-11-01T11:30:00Z')];

    expect(splitSessionByDay({ runs, hours: 4, minutes: 0 })).toEqual([
      { dateOfWork: '2026-11-01', hours: 4, minutes: 0 },
    ]);
  });

  it('returns null when there is nothing to split by', () => {
    expect(splitSessionByDay({ runs: undefined, hours: 1, minutes: 0 })).toBeNull();
    expect(splitSessionByDay({ runs: [], hours: 1, minutes: 0 })).toBeNull();
    expect(
      splitSessionByDay({
        runs: [run('2026-10-27T18:00:00Z', '2026-10-27T19:00:00Z')],
        hours: 0,
        minutes: 0,
      }),
    ).toBeNull();
  });
});
