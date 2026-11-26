const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const plural = (count, unit) => `${count} ${unit}${count === 1 ? '' : 's'} ago`;

/**
 * Relative time label for a past timestamp, e.g. "just now", "5 min ago",
 * "1 hour ago", "3 days ago". Older than a week shows the date.
 * @param {number} timestamp - milliseconds since epoch
 * @param {number} now - current time in milliseconds (defaults to Date.now())
 */
export function formatRelativeTime(timestamp, now = Date.now()) {
  const diff = Math.max(0, now - timestamp);
  if (diff < MINUTE) return 'just now';
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} min ago`;
  if (diff < DAY) return plural(Math.floor(diff / HOUR), 'hour');
  if (diff < WEEK) return plural(Math.floor(diff / DAY), 'day');
  return new Date(timestamp).toLocaleDateString();
}

export default formatRelativeTime;
