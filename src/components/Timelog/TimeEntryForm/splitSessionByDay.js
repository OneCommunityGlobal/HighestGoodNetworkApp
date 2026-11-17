import moment from 'moment-timezone';

export const TIMER_TIME_ZONE = 'America/Los_Angeles';

const DATE_FORMAT = 'YYYY-MM-DD';

// Milliseconds the timer ran on each calendar day (in the timer's time zone).
const msPerDay = (runs, now, openRunLimitMs, timeZone) => {
  const perDay = new Map();

  runs.forEach(run => {
    const start = moment(run.startedAt).valueOf();
    let end = run.endedAt ? moment(run.endedAt).valueOf() : now;
    if (run.open) {
      // The run is still counting, so it ends now, or when the time on the timer runs out.
      const limit = Number.isFinite(openRunLimitMs) ? openRunLimitMs : Infinity;
      end = Math.min(now, start + limit);
    }

    let cursor = moment.tz(start, timeZone);
    while (cursor.valueOf() < end) {
      const nextMidnight = cursor
        .clone()
        .startOf('day')
        .add(1, 'day')
        .valueOf();
      const sliceEnd = Math.min(nextMidnight, end);
      const date = cursor.format(DATE_FORMAT);
      perDay.set(date, (perDay.get(date) || 0) + (sliceEnd - cursor.valueOf()));
      cursor = moment.tz(sliceEnd, timeZone);
    }
  });

  return perDay;
};

// Whole minutes per day that add up to exactly the minutes being logged.
const shareMinutes = (perDay, totalMinutes) => {
  const totalMs = [...perDay.values()].reduce((sum, ms) => sum + ms, 0);
  const shares = [...perDay.entries()].map(([date, ms]) => {
    const exact = (totalMinutes * ms) / totalMs;
    return { date, minutes: Math.floor(exact), fraction: exact - Math.floor(exact) };
  });

  let leftover = totalMinutes - shares.reduce((sum, share) => sum + share.minutes, 0);
  [...shares]
    .sort((a, b) => b.fraction - a.fraction)
    .forEach(share => {
      if (leftover > 0) {
        // eslint-disable-next-line no-param-reassign
        share.minutes += 1;
        leftover -= 1;
      }
    });

  return shares;
};

/**
 * Splits the time logged from the timer into one entry per calendar day the timer actually ran
 * on, so a session that starts at 10 PM and ends at 3 AM is logged against both days.
 *
 * `runs` are the stretches the timer counted down for ({ startedAt, endedAt, open }). The
 * logged hours and minutes are shared out in proportion to them, so the entries always add up
 * to what is being logged. Returns null when there is nothing to split by (no runs, or nothing
 * to log), in which case the caller logs a single entry as usual.
 */
export const splitSessionByDay = ({
  runs,
  hours,
  minutes,
  now = Date.now(),
  openRunLimitMs,
  timeZone = TIMER_TIME_ZONE,
}) => {
  const totalMinutes = Number(hours || 0) * 60 + Number(minutes || 0);
  if (!Array.isArray(runs) || runs.length === 0 || totalMinutes <= 0) return null;

  const perDay = msPerDay(runs, now, openRunLimitMs, timeZone);
  const totalMs = [...perDay.values()].reduce((sum, ms) => sum + ms, 0);
  if (totalMs <= 0) return null;

  const entries = shareMinutes(perDay, totalMinutes)
    .filter(share => share.minutes > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(share => ({
      dateOfWork: share.date,
      hours: Math.floor(share.minutes / 60),
      minutes: share.minutes % 60,
    }));

  return entries.length > 0 ? entries : null;
};
