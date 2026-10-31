const DAY = 86400000;

export const validEventDate = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
};

export const timelineMarkers = (events, range, projects) => {
  const selected = new Set(projects.map(project => project.value));
  const dates = new Map();
  events.forEach(event => {
    if (!validEventDate(event.date) || event.date < range.start || event.date > range.end) return;
    if (event.project && selected.size && !selected.has(event.project)) return;
    if (!dates.has(event.date)) dates.set(event.date, []);
    dates.get(event.date).push(event);
  });
  return [...dates.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, items], index) => ({
      date,
      time: Date.parse(`${date}T00:00:00Z`),
      events: items,
      label: `E${index + 1}`,
    }));
};

// Injury points represent whole buckets; event lines use their exact date.
export const bucketTime = (bucket, start, end, interval) => {
  if (!bucket.key || !validEventDate(start) || !validEventDate(end)) return undefined;
  const first = Date.parse(`${bucket.key}-01T00:00:00Z`);
  if (!Number.isFinite(first)) return undefined;
  const date = new Date(first);
  const next = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth() + (interval === 'quarterly' ? 3 : 1),
    1,
  );
  const lower = Math.max(first, Date.parse(`${start}T00:00:00Z`));
  const upper = Math.min(next, Date.parse(`${end}T00:00:00Z`) + DAY);
  return (lower + upper) / 2;
};

export const timelineDomain = range =>
  validEventDate(range.start) && validEventDate(range.end)
    ? [Date.parse(`${range.start}T00:00:00Z`), Date.parse(`${range.end}T00:00:00Z`) + DAY - 1]
    : [0, 1];

export const timelineLabel = (time, interval) => {
  if (!Number.isFinite(time)) return '';
  const date = new Date(time);
  return interval === 'quarterly'
    ? `Q${Math.floor(date.getUTCMonth() / 3) + 1} ${date.getUTCFullYear()}`
    : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
};
