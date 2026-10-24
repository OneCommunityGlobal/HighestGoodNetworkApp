import moment from 'moment-timezone';
import getActiveTimeOffRequest from '../getActiveTimeOffRequest';

const TZ = 'America/Los_Angeles';
// A fixed Wednesday, so "This Week" is Sun Oct 11 - Sat Oct 17, 2026 (Pacific).
const NOW = moment.tz('2026-10-14T12:00:00', TZ).toDate();

// Mirrors how the backend stores a request: starts on a Sunday (Pacific) and
// ends on the Saturday of its last week.
const request = (startDay, weeks, reason = 'Vacation') => {
  const start = moment.tz(startDay, TZ).startOf('day');
  return {
    _id: `${startDay}-${weeks}`,
    reason,
    startingDate: start.toISOString(),
    endingDate: start
      .clone()
      .add(weeks, 'weeks')
      .subtract(1, 'day')
      .toISOString(),
  };
};

describe('getActiveTimeOffRequest', () => {
  it('returns the request on the week it covers', () => {
    const req = request('2026-10-11', 1);
    const requests = { u1: [req] };
    expect(getActiveTimeOffRequest(requests, 'u1', 0, NOW)).toBe(req);
    expect(getActiveTimeOffRequest(requests, 'u1', 1, NOW)).toBeUndefined();
  });

  it('moves to Last Week as time passes', () => {
    const req = request('2026-10-04', 1);
    const requests = { u1: [req] };
    expect(getActiveTimeOffRequest(requests, 'u1', 0, NOW)).toBeUndefined();
    expect(getActiveTimeOffRequest(requests, 'u1', 1, NOW)).toBe(req);
    expect(getActiveTimeOffRequest(requests, 'u1', 2, NOW)).toBeUndefined();
  });

  it('shows a multi-week request on every week it overlaps', () => {
    const req = request('2026-10-04', 2);
    const requests = { u1: [req] };
    expect(getActiveTimeOffRequest(requests, 'u1', 0, NOW)).toBe(req);
    expect(getActiveTimeOffRequest(requests, 'u1', 1, NOW)).toBe(req);
    expect(getActiveTimeOffRequest(requests, 'u1', 2, NOW)).toBeUndefined();
  });

  it('does not show a request that starts next week', () => {
    const requests = { u1: [request('2026-10-18', 1)] };
    expect(getActiveTimeOffRequest(requests, 'u1', 0, NOW)).toBeUndefined();
  });

  it('only matches the given user', () => {
    const requests = { u1: [request('2026-10-11', 1)] };
    expect(getActiveTimeOffRequest(requests, 'u2', 0, NOW)).toBeUndefined();
  });

  it('handles missing data', () => {
    expect(getActiveTimeOffRequest(undefined, 'u1', 0, NOW)).toBeUndefined();
    expect(getActiveTimeOffRequest({ u1: [{ reason: 'x' }] }, 'u1', 0, NOW)).toBeUndefined();
  });
});
