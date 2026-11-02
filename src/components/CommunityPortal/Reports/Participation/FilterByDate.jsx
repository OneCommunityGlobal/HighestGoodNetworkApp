const parseLocalDate = value => {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
};

export const getEventInterval = event => {
  const start = new Date(event?.startTime ?? event?.eventStartTime ?? event?.eventDate);
  if (Number.isNaN(start.getTime())) return null;

  const parsedEnd = new Date(event?.endTime ?? event?.eventEndTime ?? start);
  const end = Number.isNaN(parsedEnd.getTime()) || parsedEnd < start ? start : parsedEnd;

  return { start, end };
};

const overlaps = (interval, rangeStart, rangeEnd) =>
  interval.start <= rangeEnd && interval.end >= rangeStart;

/**
 * Filters events by a local date range and includes events that overlap the range,
 * including multi-day events and events that span midnight.
 */
export const filterEventsByDate = (events, filterType, selectedDate) => {
  if (!events || !Array.isArray(events)) return [];

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const newEvents = events
    .map(event => ({ event, interval: getEventInterval(event) }))
    .filter(({ interval }) => interval)
    .toSorted((a, b) => a.interval.start.getTime() - b.interval.start.getTime());

  return newEvents
    .filter(({ interval }) => {
      switch (filterType) {
        case 'Today': {
          const endOfToday = new Date(startOfToday);
          endOfToday.setHours(23, 59, 59, 999);
          return overlaps(interval, startOfToday, endOfToday);
        }

        case 'Specific Date': {
          const selected = parseLocalDate(selectedDate);
          if (!selected) return false;
          const endOfSelectedDate = new Date(selected);
          endOfSelectedDate.setHours(23, 59, 59, 999);
          return overlaps(interval, selected, endOfSelectedDate);
        }

        case 'This Week': {
          const startOfWeek = new Date(startOfToday);
          startOfWeek.setDate(startOfToday.getDate() - today.getDay());

          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);

          return overlaps(interval, startOfWeek, endOfWeek);
        }

        case 'This Month': {
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          const endOfMonth = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0,
            23,
            59,
            59,
            999,
          );
          return overlaps(interval, startOfMonth, endOfMonth);
        }

        case 'Last 3 Months':
        case 'Last 6 Months':
        case 'Last 12 Months': {
          const endOfToday = new Date(startOfToday);
          endOfToday.setHours(23, 59, 59, 999);

          const monthsBack = { 'Last 3 Months': 3, 'Last 6 Months': 6, 'Last 12 Months': 12 }[
            filterType
          ];
          const startDate = new Date(startOfToday);
          startDate.setMonth(startOfToday.getMonth() - monthsBack);

          return overlaps(interval, startDate, endOfToday);
        }

        case 'All Time':
        default:
          return true;
      }
    })
    .map(({ event }) => event);
};
