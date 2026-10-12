import moment from 'moment-timezone';

const TZ = 'America/Los_Angeles';

// Returns the user's time-off request (if any) that overlaps the week being viewed
// (weekIndex: 0 = This Week, 1 = Last Week, ...), so the notice moves across the
// tabs as weeks pass. `now` is only passed in tests.
export default function getActiveTimeOffRequest(timeOffRequests, userId, weekIndex, now) {
  const userRequests = (timeOffRequests || {})[userId] || [];
  const viewedWeek = moment(now)
    .tz(TZ)
    .subtract(weekIndex, 'week');
  const weekStart = viewedWeek.clone().startOf('week');
  const weekEnd = viewedWeek.clone().endOf('week');

  return userRequests.find(request => {
    if (!request?.startingDate) return false;
    const start = moment(request.startingDate);
    const end = request.endingDate ? moment(request.endingDate) : start;
    return weekStart.isSameOrBefore(end) && weekEnd.isSameOrAfter(start);
  });
}
