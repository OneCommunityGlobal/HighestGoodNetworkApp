function formatDateForApi(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getWeekBounds(baseDate = new Date()) {
  const normalizedDate = new Date(baseDate);
  normalizedDate.setHours(0, 0, 0, 0);

  const weekStart = new Date(normalizedDate);
  weekStart.setDate(normalizedDate.getDate() - normalizedDate.getDay());

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return { start: weekStart, end: weekEnd };
}

export function getCurrentWeekDates(baseDate = new Date()) {
  const { start, end } = getWeekBounds(baseDate);
  return {
    start: formatDateForApi(start),
    end: formatDateForApi(end),
  };
}

export function getPreviousWeekDates(baseDate = new Date()) {
  const { start, end } = getWeekBounds(baseDate);

  const previousWeekStart = new Date(start);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);

  const previousWeekEnd = new Date(end);
  previousWeekEnd.setDate(previousWeekEnd.getDate() - 7);

  return {
    start: formatDateForApi(previousWeekStart),
    end: formatDateForApi(previousWeekEnd),
  };
}

export function formatLocalDateForApi(date) {
  return formatDateForApi(date);
}
