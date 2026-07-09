/**
 * Reusable filter for event lists based on date ranges.
 * @param {Array} events - Array of event objects containing an 'eventDate' property.
 * @param {string} filterType - 'Today', 'This Week', 'This Month',
 *   'Last 3 Months', 'Last 6 Months', 'Last 12 Months', or 'All Time'.
 * @returns {Array} - The filtered subset of events.
 */
export const filterEventsByDate = (events, filterType) => {
  if (!events || !Array.isArray(events)) return [];

  const today = new Date();
  // Normalize today to midnight for consistent range comparisons
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const newEvents = events.toSorted(
    (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime(),
  );

  return newEvents.filter(event => {
    // Ensure we have a valid date object to compare
    const eventDate = new Date(event.eventDate);
    if (Number.isNaN(eventDate.getTime())) return false;

    switch (filterType) {
      case 'Today':
        return eventDate.toDateString() === today.toDateString();

      case 'This Week': {
        // Find Sunday of the current week
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfToday.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        // Find Saturday of the current week
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return eventDate >= startOfWeek && eventDate <= endOfWeek;
      }

      case 'This Month':
        return (
          eventDate.getMonth() === today.getMonth() &&
          eventDate.getFullYear() === today.getFullYear()
        );

      case 'Last 3 Months':
      case 'Last 6 Months':
      case 'Last 12 Months': {
        // End range at the last moment of today
        const endOfToday = new Date(startOfToday);
        endOfToday.setHours(23, 59, 59, 999);

        // Step back the matching number of months from the start of today
        const monthsBack = { 'Last 3 Months': 3, 'Last 6 Months': 6, 'Last 12 Months': 12 }[
          filterType
        ];
        const startDate = new Date(startOfToday);
        startDate.setMonth(startOfToday.getMonth() - monthsBack);

        return eventDate >= startDate && eventDate <= endOfToday;
      }

      case 'All Time':
      default:
        return true;
    }
  });
};
