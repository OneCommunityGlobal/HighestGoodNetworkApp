import { endOfWeek, startOfWeek } from 'date-fns';

export function parseDurationToMin(value) {
  if (value === null || value === undefined || value === '') return 0;

  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }

  if (typeof value !== 'string') return 0;

  const hours = value.match(/(\d+)\s*h\b/i);
  const minutes = value.match(/(\d+)\s*m\b/i);

  return Number(hours?.[1] || 0) * 60 + Number(minutes?.[1] || 0);
}

export function formatDuration(totalMinutes) {
  const safeMinutes = Math.max(0, Number(totalMinutes) || 0);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export function getCurrentWeekRange(referenceDate = new Date()) {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const end = endOfWeek(referenceDate, { weekStartsOn: 1 });

  return { start, end };
}
