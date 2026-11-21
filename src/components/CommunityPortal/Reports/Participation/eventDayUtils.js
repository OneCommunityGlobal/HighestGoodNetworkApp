// Shared day logic for the Upcoming Events Calendar, Card and List views, so all three
// agree on which events belong to a day or a dropdown range (including multi-day and
// past-midnight events).

// Longest span an event can cover. Applied in getEventRange so the calendar dots, day
// matching and range filtering all see the same end, and a bad end date cannot flood the
// calendar.
export const MAX_EVENT_SPAN_DAYS = 31;

const ALL_TIME = 'All Time';

export const startOfDay = date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const endOfDay = date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

// Event start/end as Dates. A missing or invalid end falls back to the start; an end more
// than MAX_EVENT_SPAN_DAYS calendar days out is clamped to the last of those days.
export const getEventRange = event => {
  const start = new Date(event?.startTime || event?.eventDate);
  if (Number.isNaN(start.getTime())) return null;
  const rawEnd = event?.endTime ? new Date(event.endTime) : null;
  const end = rawEnd && !Number.isNaN(rawEnd.getTime()) && rawEnd >= start ? rawEnd : start;
  const maxEnd = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate() + MAX_EVENT_SPAN_DAYS - 1,
    23,
    59,
    59,
    999,
  );
  return { start, end: end > maxEnd ? maxEnd : end };
};

// True when any part of the event falls inside the { start, end } range.
export const eventOverlaps = (event, range) => {
  const eventRange = getEventRange(event);
  if (!eventRange || !range) return false;
  return eventRange.start <= range.end && eventRange.end >= range.start;
};

// True when any part of the event falls on the given day.
export const eventOccursOn = (event, day) =>
  Boolean(day) && eventOverlaps(event, { start: startOfDay(day), end: endOfDay(day) });

// { start, end } for a dropdown value, or null for All Time (no limit).
// This Week runs Sunday to Saturday, matching FilterByDate.
export const getFilterRange = (filter, now = new Date()) => {
  switch (filter) {
    case 'Today':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'This Week': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const end = endOfDay(new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6));
      return { start, end };
    }
    case 'This Month':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
      };
    default:
      return null;
  }
};

// True when the day falls inside the dropdown range (always true for All Time).
export const isDayInFilter = (day, filter, now = new Date()) => {
  const range = getFilterRange(filter, now);
  if (!range) return true;
  return day >= startOfDay(range.start) && day <= range.end;
};

// Midnight of every day the event covers.
const getEventDays = event => {
  const range = getEventRange(event);
  if (!range) return [];
  const days = [];
  const first = startOfDay(range.start);
  const last = startOfDay(range.end);
  for (let i = 0; i < MAX_EVENT_SPAN_DAYS; i += 1) {
    const day = new Date(first.getFullYear(), first.getMonth(), first.getDate() + i);
    if (day > last) break;
    days.push(day);
  }
  return days;
};

// toDateString() keys for every day the event covers.
export const getEventDayKeys = event => getEventDays(event).map(day => day.toDateString());

// Calendar keys for the event, limited to days inside the dropdown range, so a multi-day
// event does not put dots outside the selected week or month.
export const getCalendarDayKeys = (event, filter, now = new Date()) =>
  getEventDays(event)
    .filter(day => isDayInFilter(day, filter, now))
    .map(day => day.toDateString());

export const formatDayLabel = date =>
  date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

// The calendar shows today until a day is picked
export const getCalendarDay = selectedDate => selectedDate || new Date();

// Empty state for the Card and List views
export const getEmptyMessage = (selectedDate, filter) => {
  const hasRange = Boolean(filter) && filter !== ALL_TIME;
  if (selectedDate && hasRange) {
    return `No events on ${formatDayLabel(selectedDate)} within ${filter.toLowerCase()}.`;
  }
  if (selectedDate) return `No events on ${formatDayLabel(selectedDate)}.`;
  if (hasRange) return `No upcoming events for ${filter.toLowerCase()}.`;
  return 'No upcoming events.';
};

const byStart = (a, b) => getEventRange(a).start - getEventRange(b).start;

// Valid events that overlap the dropdown range. The calendar shows these, so its dots and
// day panel follow the same filter as the Card and List views.
export const getRangeEvents = (events, { filter, now = new Date() }) => {
  const range = getFilterRange(filter, now);
  return (events || []).filter(event =>
    range ? eventOverlaps(event, range) : Boolean(getEventRange(event)),
  );
};

// Events for the Card and List views, always within the dropdown range: every event on the
// picked day when one is picked (none if the day is outside the range), otherwise events
// that have not ended yet.
export const getVisibleEvents = (events, { filter, selectedDate, now = new Date() }) => {
  const inRange = getRangeEvents(events, { filter, now });

  if (selectedDate) {
    if (!isDayInFilter(selectedDate, filter, now)) return [];
    return inRange.filter(event => eventOccursOn(event, selectedDate)).sort(byStart);
  }

  return inRange.filter(event => getEventRange(event).end >= now).sort(byStart);
};
