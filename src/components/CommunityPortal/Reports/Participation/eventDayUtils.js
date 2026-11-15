import { filterEventsByDate } from './FilterByDate';

// Shared day logic for the Upcoming Events Calendar, Card and List views, so all three
// agree on which events belong to a day (including multi-day and past-midnight events).

const MAX_EVENT_SPAN_DAYS = 31;

export const startOfDay = date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const endOfDay = date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

// Event start/end as Dates. A missing or invalid end falls back to the start.
export const getEventRange = event => {
  const start = new Date(event?.startTime || event?.eventDate);
  if (Number.isNaN(start.getTime())) return null;
  const rawEnd = event?.endTime ? new Date(event.endTime) : null;
  const end = rawEnd && !Number.isNaN(rawEnd.getTime()) && rawEnd >= start ? rawEnd : start;
  return { start, end };
};

// True when any part of the event falls on the given day.
export const eventOccursOn = (event, day) => {
  const range = getEventRange(event);
  if (!range || !day) return false;
  return range.start <= endOfDay(day) && range.end >= startOfDay(day);
};

// toDateString() keys for every day the event covers, capped so a bad end date
// cannot flood the calendar.
export const getEventDayKeys = event => {
  const range = getEventRange(event);
  if (!range) return [];
  const keys = [];
  const first = startOfDay(range.start);
  const last = startOfDay(range.end);
  for (let i = 0; i < MAX_EVENT_SPAN_DAYS; i += 1) {
    const day = new Date(first.getFullYear(), first.getMonth(), first.getDate() + i);
    if (day > last) break;
    keys.push(day.toDateString());
  }
  return keys;
};

export const formatDayLabel = date =>
  date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

// The calendar shows today until a day is picked
export const getCalendarDay = selectedDate => selectedDate || new Date();

// Empty state for the Card and List views
export const getEmptyMessage = (selectedDate, filter) => {
  if (selectedDate) return `No events on ${formatDayLabel(selectedDate)}.`;
  if (filter && filter !== 'All Time') return `No upcoming events for ${filter.toLowerCase()}.`;
  return 'No upcoming events.';
};

const byStart = (a, b) => getEventRange(a).start - getEventRange(b).start;

// Events for the Card and List views: the selected day when one is picked,
// otherwise upcoming events (still running today or later) in the dropdown range.
export const getVisibleEvents = (events, { filter, selectedDate, now = new Date() }) => {
  const valid = (events || []).filter(event => getEventRange(event));

  if (selectedDate) {
    return valid.filter(event => eventOccursOn(event, selectedDate)).sort(byStart);
  }

  let inRange = valid;
  if (filter === 'Today') {
    inRange = valid.filter(event => eventOccursOn(event, now));
  } else if (filter && filter !== 'All Time') {
    // filterEventsByDate reads eventDate; fall back to startTime when it is missing
    const inFilter = new Set(
      filterEventsByDate(
        valid.map(event => ({ ...event, eventDate: event.eventDate || event.startTime })),
        filter,
      ).map(event => event.id),
    );
    inRange = valid.filter(event => inFilter.has(event.id));
  }

  const todayStart = startOfDay(now);
  return inRange.filter(event => getEventRange(event).end >= todayStart).sort(byStart);
};
