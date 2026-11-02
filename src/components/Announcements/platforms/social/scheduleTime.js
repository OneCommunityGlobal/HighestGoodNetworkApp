const pad = n => String(n).padStart(2, '0');

/**
 * Values for <input type="date"> and <input type="time"> in the viewer's
 * local time zone, so editing a scheduled post shows the same date and time
 * that was picked. (Date#toISOString is UTC and can shift the date by a day.)
 *
 * @param {Date|string} value A Date or ISO string.
 * @returns {{ date: string, time: string }} e.g. { date: '2026-09-28', time: '18:30' }
 */
export default function toScheduleInputValues(value) {
  const d = new Date(value);
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}
